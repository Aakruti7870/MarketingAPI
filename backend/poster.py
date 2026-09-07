"""PHASE 4 — AI Poster / Image generator (real GPT Image 1 via Emergent key) + brand profile."""
import base64
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional

from core import (db, oid, now_iso, clean, get_current_user, audit,
                  llm_text, parse_json_block, EMERGENT_LLM_KEY)

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
    aspect: str = "1:1"          # 1:1 | 9:16 | 16:9
    campaign_id: Optional[str] = None


ASPECT_SIZE = {"1:1": "1024x1024", "9:16": "1024x1536", "16:9": "1536x1024"}


@router.get("/brand")
async def get_brand(user: dict = Depends(get_current_user)):
    b = await db.brand_profiles.find_one({"workspace_id": user["workspace_id"]})
    return clean(b) if b else {}


@router.put("/brand")
async def set_brand(body: BrandIn, user: dict = Depends(get_current_user)):
    await db.brand_profiles.update_one({"workspace_id": user["workspace_id"]},
                                       {"$set": {"workspace_id": user["workspace_id"], **body.model_dump(), "updated_at": now_iso()}}, upsert=True)
    return {"ok": True}


async def _generate_image(prompt: str, aspect: str) -> Optional[str]:
    if not EMERGENT_LLM_KEY:
        return None
    try:
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        images = await gen.generate_images(prompt=prompt, model="gpt-image-1", number_of_images=1)
        if images:
            return base64.b64encode(images[0]).decode("utf-8")
    except Exception as e:
        print("Image gen error:", e)
    return None


@router.post("/ai/poster")
async def generate_poster(body: PosterIn, user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    brand = await db.brand_profiles.find_one({"workspace_id": ws}) or {}
    biz = brand.get("business_name", "our brand")

    # 1. AI copy
    system = ("You are a senior brand + performance-marketing creative. Return STRICT JSON: "
              "{\"headline\":str,\"caption\":str,\"cta\":str,\"hashtags\":[str],\"image_prompt\":str}. "
              "image_prompt must describe an original, professional marketing poster image (no text/words in the image).")
    copy = parse_json_block(await llm_text(system,
        f"Business: {biz} ({brand.get('industry','')}). Brief: {body.brief}. Tone: {body.tone}. "
        f"Brand color: {brand.get('primary_color','#D4AF37')}.")) or {}
    headline = copy.get("headline") or body.brief
    image_prompt = copy.get("image_prompt") or (
        f"Premium {body.tone.lower()} marketing poster background for {biz}, {body.brief}, "
        f"elegant, high-end product photography style, brand color {brand.get('primary_color','gold')}, no text")

    # 2. Real image
    image_b64 = await _generate_image(image_prompt, body.aspect)

    asset_id = oid()
    doc = {"id": asset_id, "workspace_id": ws, "campaign_id": body.campaign_id,
           "prompt": image_prompt, "brief": body.brief, "tone": body.tone, "aspect": body.aspect,
           "headline": headline, "caption": copy.get("caption", ""), "cta": copy.get("cta", "Learn More"),
           "hashtags": copy.get("hashtags", []),
           "image_base64": image_b64, "has_image": bool(image_b64),
           "created_at": now_iso()}
    await db.generated_assets.insert_one(dict(doc))
    await audit(ws, user["name"], "poster.generated", "asset", {"asset_id": asset_id, "has_image": bool(image_b64)})

    result = {k: v for k, v in doc.items() if k != "image_base64"}
    result["image_url"] = f"/api/assets/{asset_id}" if image_b64 else None
    return result


@router.get("/assets/{asset_id}")
async def serve_asset(asset_id: str):
    a = await db.generated_assets.find_one({"id": asset_id})
    if not a or not a.get("image_base64"):
        raise HTTPException(404, "Asset not found")
    return Response(content=base64.b64decode(a["image_base64"]), media_type="image/png")


@router.get("/assets")
async def list_assets(user: dict = Depends(get_current_user)):
    rows = await db.generated_assets.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(60)
    out = []
    for a in rows:
        out.append({"id": a["id"], "headline": a.get("headline"), "caption": a.get("caption"),
                    "cta": a.get("cta"), "hashtags": a.get("hashtags", []), "aspect": a.get("aspect"),
                    "image_url": f"/api/assets/{a['id']}" if a.get("has_image") else None,
                    "created_at": a.get("created_at")})
    return out
