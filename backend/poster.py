"""AI marketing poster generation and brand profile management."""
import base64
import hashlib
import os
import secrets
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel

from core import (
    OPENAI_API_KEY,
    OPENAI_BASE_URL,
    audit,
    clean,
    db,
    decrypt_str,
    encrypt_str,
    get_current_user,
    llm_text,
    now_iso,
    oid,
    parse_json_block,
)

router = APIRouter(prefix="/api")


class BrandIn(BaseModel):
    business_name: str = ""
    tagline: str = ""
    logo_url: str = ""
    primary_color: str = "#D4AF37"
    industry: str = ""
    details: str = ""


class PosterIn(BaseModel):
    brief: str
    tone: str = "Luxury"
    aspect: str = "1:1"
    campaign_id: Optional[str] = None


ASPECT_SIZE = {"1:1": "1024x1024", "9:16": "1024x1536", "16:9": "1536x1024"}
IMAGE_MODEL = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1.5")
IMAGE_QUALITY = os.environ.get("OPENAI_IMAGE_QUALITY", "medium")


@router.get("/brand")
async def get_brand(user: dict = Depends(get_current_user)):
    brand = await db.brand_profiles.find_one({"workspace_id": user["workspace_id"]})
    return clean(brand) if brand else {}


@router.put("/brand")
async def set_brand(body: BrandIn, user: dict = Depends(get_current_user)):
    await db.brand_profiles.update_one(
        {"workspace_id": user["workspace_id"]},
        {"$set": {"workspace_id": user["workspace_id"], **body.model_dump(), "updated_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True}


async def _generate_image(prompt: str, aspect: str) -> Optional[str]:
    if not OPENAI_API_KEY:
        return None
    payload = {
        "model": IMAGE_MODEL,
        "prompt": prompt,
        "size": ASPECT_SIZE.get(aspect, "1024x1024"),
        "quality": IMAGE_QUALITY,
    }
    try:
        # Firebase Hosting has a 60-second rewrite timeout; fail before that so
        # the client receives a controlled response instead of an edge 504.
        async with httpx.AsyncClient(timeout=50.0) as client:
            response = await client.post(
                f"{OPENAI_BASE_URL}/images/generations",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            data = response.json().get("data", [])
            if data and data[0].get("b64_json"):
                return data[0]["b64_json"]
    except Exception as exc:
        print(f"image generation error: {type(exc).__name__}")
    return None


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _asset_url(asset_id: str, encrypted_token: str) -> Optional[str]:
    token = decrypt_str(encrypted_token or "")
    if not token:
        return None
    return f"/api/assets/{asset_id}?token={token}"


@router.post("/ai/poster")
async def generate_poster(body: PosterIn, user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    brand = await db.brand_profiles.find_one({"workspace_id": ws}) or {}
    business = brand.get("business_name", "our brand")

    system = (
        "You are a senior brand and performance-marketing creative. Return STRICT JSON: "
        "{\"headline\":str,\"caption\":str,\"cta\":str,\"hashtags\":[str],\"image_prompt\":str}. "
        "image_prompt must describe an original professional marketing poster image without text or logos."
    )
    copy = parse_json_block(await llm_text(
        system,
        f"Business: {business} ({brand.get('industry','')}). Brief: {body.brief}. "
        f"Tone: {body.tone}. Brand color: {brand.get('primary_color','#D4AF37')}."
    )) or {}

    headline = copy.get("headline") or body.brief
    image_prompt = copy.get("image_prompt") or (
        f"Professional {body.tone.lower()} marketing visual for {business}, {body.brief}, "
        f"premium commercial photography, brand color {brand.get('primary_color','gold')}, no text, no logo"
    )
    image_b64 = await _generate_image(image_prompt, body.aspect)

    asset_id = oid()
    public_token = secrets.token_urlsafe(32) if image_b64 else ""
    doc = {
        "id": asset_id,
        "workspace_id": ws,
        "campaign_id": body.campaign_id,
        "prompt": image_prompt,
        "brief": body.brief,
        "tone": body.tone,
        "aspect": body.aspect,
        "headline": headline,
        "caption": copy.get("caption", ""),
        "cta": copy.get("cta", "Learn More"),
        "hashtags": copy.get("hashtags", []),
        "image_base64": image_b64,
        "has_image": bool(image_b64),
        "asset_token_hash": _token_hash(public_token) if public_token else "",
        "asset_token_enc": encrypt_str(public_token) if public_token else "",
        "created_at": now_iso(),
    }
    await db.generated_assets.insert_one(dict(doc))
    await audit(ws, user["name"], "poster.generated", "asset", {"asset_id": asset_id, "has_image": bool(image_b64)})

    result = {k: v for k, v in doc.items() if k not in {"image_base64", "asset_token_hash", "asset_token_enc"}}
    result["image_url"] = f"/api/assets/{asset_id}?token={public_token}" if image_b64 else None
    return result


@router.get("/assets/{asset_id}")
async def serve_asset(asset_id: str, token: str = Query(default="")):
    asset = await db.generated_assets.find_one({"id": asset_id})
    if not asset or not asset.get("image_base64"):
        raise HTTPException(404, "Asset not found")
    expected = asset.get("asset_token_hash", "")
    if not expected or not token or not secrets.compare_digest(expected, _token_hash(token)):
        raise HTTPException(403, "Invalid asset token")
    try:
        image = base64.b64decode(asset["image_base64"])
    except Exception:
        raise HTTPException(500, "Stored asset is invalid")
    return Response(
        content=image,
        media_type="image/png",
        headers={"Cache-Control": "private, max-age=3600"},
    )


@router.get("/assets")
async def list_assets(user: dict = Depends(get_current_user)):
    rows = await db.generated_assets.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(60)
    out = []
    for asset in rows:
        out.append({
            "id": asset["id"],
            "headline": asset.get("headline"),
            "caption": asset.get("caption"),
            "cta": asset.get("cta"),
            "hashtags": asset.get("hashtags", []),
            "aspect": asset.get("aspect"),
            "image_url": _asset_url(asset["id"], asset.get("asset_token_enc", "")) if asset.get("has_image") else None,
            "created_at": asset.get("created_at"),
        })
    return out
