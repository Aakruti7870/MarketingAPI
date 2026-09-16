"""PHASE 7 — Analytics: delivery / reply / conversion + consent + autopilot."""
from fastapi import APIRouter, Depends
from core import db, get_current_user

router = APIRouter(prefix="/api")


@router.get("/analytics")
async def analytics(user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    msg = lambda **kw: db.messages.count_documents({"workspace_id": ws, **kw})

    outbound = await msg(direction="outbound")
    sent = await db.messages.count_documents({"workspace_id": ws, "direction": "outbound", "status": {"$in": ["sent", "delivered", "read"]}})
    delivered = await db.messages.count_documents({"workspace_id": ws, "direction": "outbound", "status": {"$in": ["delivered", "read"]}})
    read = await msg(direction="outbound", status="read")
    failed = await msg(direction="outbound", status="failed")
    blocked = await msg(direction="outbound", status="blocked")
    inbound = await msg(direction="inbound")

    total_leads = await db.leads.count_documents({"workspace_id": ws})
    opted_out = await db.leads.count_documents({"workspace_id": ws, "opted_out": True})
    won = await db.leads.count_documents({"workspace_id": ws, "stage": "WON"})

    # per-channel
    channels = {}
    for ch in ["WhatsApp", "Email", "SMS", "Instagram", "Facebook"]:
        c = await db.messages.count_documents({"workspace_id": ws, "direction": "outbound", "channel": ch})
        if c:
            channels[ch] = c

    # per-campaign performance
    camps = await db.campaigns.find({"workspace_id": ws}).sort("created_at", -1).to_list(50)
    campaign_perf = []
    for c in camps:
        c_sent = await db.messages.count_documents({"workspace_id": ws, "campaign_id": c["id"], "status": {"$in": ["sent", "delivered", "read"]}})
        c_replied = await db.messages.count_documents({"workspace_id": ws, "campaign_id": c["id"], "direction": "inbound"})
        c_blocked = await db.messages.count_documents({"workspace_id": ws, "campaign_id": c["id"], "status": "blocked"})
        campaign_perf.append({"name": c["name"], "status": c.get("status"), "sent": c_sent, "replied": c_replied, "blocked": c_blocked})

    autopilot = {}
    for st in ["scheduled", "sent", "stopped", "blocked"]:
        autopilot[st] = await db.followups.count_documents({"workspace_id": ws, "status": st})

    rate = lambda a, b: round((a / b * 100) if b else 0, 1)
    return {
        "funnel": {"sent": sent, "delivered": delivered, "read": read, "replied": inbound, "failed": failed, "blocked": blocked},
        "rates": {"delivery": rate(delivered, sent), "read": rate(read, delivered),
                  "reply": rate(inbound, delivered), "block": rate(blocked, outbound),
                  "opt_out": rate(opted_out, total_leads), "conversion": rate(won, total_leads)},
        "channels": channels, "campaign_performance": campaign_perf, "autopilot": autopilot,
        "totals": {"outbound": outbound, "inbound": inbound, "leads": total_leads, "won": won, "opted_out": opted_out},
    }
