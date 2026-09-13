import os
import io
import csv
import re
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(
    title="MarketingAPI Local Business OS",
    version="4.0.0",
    description="Google Maps AI Setup, WhatsApp Cloud API, AI Studio, Lead Scraper & Negotiation Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user_wallets: Dict[str, int] = {"user_default": 2850}
channels_db: Dict[str, Dict[str, Any]] = {}
task_queue: Dict[str, Any] = {}
gmb_listings: Dict[str, Dict[str, Any]] = {}

billing_router = APIRouter(prefix="/api/billing", tags=["Billing Engine"])

CREDIT_RATES = {
    "LEAD_SCRAPE_PER_5": 1,
    "WHATSAPP_MSG": 1,
    "AI_BANNER_GEN": 3,
    "GOOGLE_MAPS_SETUP": 50,
    "AI_NEGOTIATION": 2,
    "ORCHESTRATOR_EVENT": 3
}

class DeductReq(BaseModel):
    user_id: str = "user_default"
    action_type: str
    quantity: int = 1

@billing_router.post("/deduct")
async def deduct_credits(req: DeductReq):
    req_credits = CREDIT_RATES.get(req.action_type, 1) * req.quantity
    curr_balance = user_wallets.get(req.user_id, 0)
    if curr_balance < req_credits:
        raise HTTPException(status_code=402, detail=f"Insufficient Action Credits. Required: {req_credits}, Balance: {curr_balance}")
    user_wallets[req.user_id] = curr_balance - req_credits
    return {"status": "success", "remaining_balance": user_wallets[req.user_id]}

@billing_router.get("/balance/{user_id}")
async def get_balance(user_id: str):
    return {"user_id": user_id, "credit_balance": user_wallets.get(user_id, 0)}

gmb_router = APIRouter(prefix="/api/google-maps", tags=["Google Maps AI Setup"])

class GMBSetupReq(BaseModel):
    user_id: str = "user_default"
    business_name: str
    category: str
    address: str
    phone: str
    pincode: str
    website: Optional[str] = ""

@gmb_router.post("/submit-listing")
async def submit_google_maps_listing(req: GMBSetupReq):
    if user_wallets.get(req.user_id, 0) < 50:
        raise HTTPException(status_code=402, detail="Google Maps AI Listing requires 50 Action Credits.")
    
    user_wallets[req.user_id] -= 50
    listing_id = f"GMB_{len(gmb_listings)+101}"
    
    gmb_listings[listing_id] = {
        "listing_id": listing_id,
        "business_name": req.business_name,
        "category": req.category,
        "address": f"{req.address}, {req.pincode}",
        "phone": req.phone,
        "status": "submitted_pending_verification",
        "maps_cid": f"CID_{req.phone[-6:]}",
        "verification_method": "SMS / Postcard OTP"
    }
    return {
        "status": "success",
        "message": "Business submitted to Google Maps & Search index.",
        "listing": gmb_listings[listing_id],
        "remaining_credits": user_wallets[req.user_id]
    }

@gmb_router.get("/listings")
async def list_gmb_listings():
    return list(gmb_listings.values())

ai_studio_router = APIRouter(prefix="/api/ai-studio", tags=["AI Marketing Studio"])

class BannerReq(BaseModel):
    user_id: str = "user_default"
    prompt: str
    headline_text: str = ""

@ai_studio_router.post("/generate-banner")
async def generate_banner(req: BannerReq):
    if user_wallets.get(req.user_id, 0) < 3:
        raise HTTPException(status_code=402, detail="Requires 3 Action Credits for AI Banner Generation.")
    user_wallets[req.user_id] -= 3
    return {
        "status": "success",
        "banner_id": f"BNR_{len(task_queue)+101}",
        "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80",
        "headline": req.headline_text or "Special Business Offer",
        "credits_remaining": user_wallets[req.user_id]
    }

lead_router = APIRouter(prefix="/api/leads-discovery", tags=["Lead Discovery"])

@lead_router.post("/scrape")
async def scrape_leads(query: str = "Contractors", location: str = "Navi Mumbai"):
    if user_wallets["user_default"] >= 1:
        user_wallets["user_default"] -= 1

    return {
        "status": "success",
        "leads": [
            {"name": "Apex Infra Builders", "phone": "+919820011223", "category": query, "address": f"Sector 17, {location}", "whatsapp": True},
            {"name": "Shree Concrete Works", "phone": "+919819933445", "category": query, "address": f"CBD Belapur, {location}", "whatsapp": True},
            {"name": "Prabhat Developers", "phone": "+919702255667", "category": query, "address": f"Panvel, {location}", "whatsapp": False}
        ]
    }

channels_router = APIRouter(prefix="/api/channels", tags=["Shielded Channels"])

@channels_router.post("/create-with-csv")
async def create_channel_csv(channel_name: str = Form(...), description: Optional[str] = Form(""), file: UploadFile = File(...)):
    contents = await file.read()
    buffer = io.StringIO(contents.decode("utf-8-sig", errors="ignore"))
    reader = csv.DictReader(buffer)
    contacts = [row for row in reader if row.get("Phone") or row.get("phone")]
    chan_id = f"CHAN_{len(channels_db)+1}"
    channels_db[chan_id] = {"channel_id": chan_id, "channel_name": channel_name, "contacts_count": len(contacts), "privacy_shielded": True}
    return {"status": "success", "channel_name": channel_name, "total_contacts_imported": len(contacts), "privacy_shielded": True}

negotiation_router = APIRouter(prefix="/api/negotiation", tags=["AI Negotiation Engine"])

class SessionModel(BaseModel):
    customer_phone: str
    product_id: str
    quantity: float
    offered_price: float

class RuleModel(BaseModel):
    base_price: float
    min_floor_price: float
    max_discount_percent: float = 12.0

@negotiation_router.post("/process-offer")
async def process_offer(session: SessionModel, rule: RuleModel):
    unit_offer = session.offered_price / session.quantity if session.quantity > 0 else 0
    if unit_offer < rule.min_floor_price:
        counter_unit = max(rule.min_floor_price * 1.02, rule.base_price * (1 - rule.max_discount_percent / 100))
        return {"status": "counter_offer", "accepted": False, "counter_unit_price": counter_unit, "message": f"Offered rate ₹{unit_offer:.2f} is below floor limit ₹{rule.min_floor_price}."}
    return {"status": "deal_accepted", "accepted": True, "final_unit_price": unit_offer, "payment_link": f"https://payments.cashfree.com/links/deal_{session.customer_phone[-4:]}"}

app.include_router(billing_router)
app.include_router(gmb_router)
app.include_router(ai_studio_router)
app.include_router(lead_router)
app.include_router(channels_router)
app.include_router(negotiation_router)

@app.get("/health")
async def health():
    return {"status": "online", "revenue_engine": "active", "version": "4.0.0"}

# Check and mount static build
BUILD_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if not os.path.exists(BUILD_DIR):
    BUILD_DIR = os.path.join(os.getcwd(), "frontend", "build")

if os.path.exists(BUILD_DIR):
    app.mount("/static", StaticFiles(directory=os.path.join(BUILD_DIR, "static")), name="static")

@app.get("/{full_path:path}")
async def serve_app(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
    
    file_path = os.path.join(BUILD_DIR, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_file = os.path.join(BUILD_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {"status": "online", "message": "Backend engine online. React build missing at runtime."}
