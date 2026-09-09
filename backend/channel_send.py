from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core import db, get_current_user
from multichannel import send_via_channel

router = APIRouter(prefix="/api/channels", tags=["channel-delivery"])


class ChannelTestSendIn(BaseModel):
    lead_id: str
    channel: str
    body: str


@router.post("/test-send")
async def test_send(body: ChannelTestSendIn, user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": body.lead_id, "workspace_id": user["workspace_id"]})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return await send_via_channel(
        user["workspace_id"], lead, body.channel, body.body, actor=user.get("name", "user")
    )
