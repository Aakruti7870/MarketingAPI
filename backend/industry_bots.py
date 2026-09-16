"""Industry-specific Smart Automation AI agent bot templates and safe action plans."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import agentic_platform

router = APIRouter(prefix="/industry-bots", tags=["industry-bots"])
router.include_router(agentic_platform.router, prefix="", tags=["agentic-platform"])

BOTS = [
 {"id":"healthcare","name":"Healthcare Smart Agent","industries":["Hospital","Medical","Laboratory","Saloon","Spa"],"capabilities":["Book appointment","Schedule time","Payment"],"actions":["check_availability","book_appointment","reschedule_appointment","send_payment_link","confirm_payment"],"channels":["web","whatsapp"]},
 {"id":"infrastructure","name":"Infrastructure Sales Agent","industries":["Flat Sale","Real Estate","Infrastructure"],"capabilities":["Flat sale","Appointment","Flat visit","Price","Quotation"],"actions":["capture_requirement","schedule_visit","share_price","generate_quotation","follow_up"],"channels":["web","whatsapp"]},
 {"id":"b2b","name":"B2B Sales Agent","industries":["B2B","Wholesale","Distribution"],"capabilities":["Sales","Requirements","Availability","All enquiries"],"actions":["capture_requirement","check_availability","create_enquiry","assign_sales","follow_up"],"channels":["web","whatsapp"]},
 {"id":"small-business","name":"Small Business Order Agent","industries":["Kirana Shop","Retail","Small Business"],"capabilities":["Place material order","Accept","Reject","Payment","Rate card"],"actions":["show_rate_card","create_order","accept_order","reject_order","send_payment_link","confirm_payment"],"channels":["web","whatsapp"]},
 {"id":"social-growth","name":"Social Growth Agent","industries":["Digital Marketing","All Businesses"],"capabilities":["Social platform handling","Ads","Campaigns","Lead generation","Bulk messaging","Group creation","Bot allotment"],"actions":["create_campaign","create_ad","capture_leads","bulk_message","create_group","assign_bot"],"channels":["web","whatsapp"]},
]

class ActionRequest(BaseModel):
 action: str = Field(min_length=2, max_length=80)
 payload: dict = Field(default_factory=dict)

@router.get("")
async def list_bots():
 return {"bots": BOTS, "count": len(BOTS)}

@router.get("/{bot_id}")
async def get_bot(bot_id: str):
 for bot in BOTS:
  if bot["id"] == bot_id: return bot
 raise HTTPException(status_code=404, detail="Industry bot not found")

@router.post("/{bot_id}/action")
async def plan_action(bot_id: str, body: ActionRequest):
 bot = next((b for b in BOTS if b["id"] == bot_id), None)
 if not bot: raise HTTPException(status_code=404, detail="Industry bot not found")
 if body.action not in bot["actions"]: raise HTTPException(status_code=422, detail="Action is not supported by this bot")
 return {"bot_id":bot_id,"action":body.action,"status":"ready","payload":body.payload,"planned_at":datetime.now(timezone.utc).isoformat()}
