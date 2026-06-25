"""Extensions to Arak server: meetings, documents, messages, notifications, voice, calendar, themes."""
import os, base64, json
from datetime import datetime, timezone
from typing import Optional, List, Literal
from fastapi import HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy import text
from database_pg import AsyncSessionLocal

try:
    from .server import (
        api_router, db, get_current_user, require_roles, now_iso, new_id,
        DEV_SECTORS,
    )
except ImportError:  # Allows running from inside the backend directory.
    from server import (
        api_router, db, get_current_user, require_roles, now_iso, new_id,
        DEV_SECTORS,
    )

# ============== MEETINGS ==============
class MeetingInput(BaseModel):
    title: str
    description: Optional[str] = ""
    meeting_type: Literal["individual", "periodic", "emergency", "board"] = "individual"
    date: str  # ISO datetime
    duration_minutes: int = 60
    location: Optional[str] = ""
    meeting_link: Optional[str] = ""  # Zoom/Meet/Teams URL
    attendee_ids: List[str] = []
    is_remote: bool = False
    status: Literal["scheduled", "completed", "cancelled", "rescheduled"] = "scheduled"

@api_router.get("/meetings")
async def list_meetings(user=Depends(get_current_user)):
    q = {} if user["role"] in ("admin", "ceo", "tracker") else {"$or": [{"attendee_ids": user["id"]}, {"organizer_id": user["id"]}]}
    items = await db.meetings.find(q, {"_id": 0}).sort("date", -1).to_list(500)
    return items

@api_router.post("/meetings")
async def create_meeting(payload: MeetingInput, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["organizer_id"] = user["id"]
    doc["organizer_name"] = user.get("name")
    doc["created_at"] = now_iso()
    await db.meetings.insert_one(doc)
    # auto-notify attendees
    for uid in payload.attendee_ids:
        await db.notifications.insert_one({
            "id": new_id(), "user_id": uid, "type": "meeting",
            "title": f"اجتماع جديد: {payload.title}",
            "body": f"تمت دعوتك لاجتماع بتاريخ {payload.date}",
            "link": f"/meetings/{doc['id']}", "read": False, "created_at": now_iso()
        })
    doc.pop("_id", None)
    return doc

@api_router.patch("/meetings/{mid}")
async def update_meeting(mid: str, payload: dict, user=Depends(get_current_user)):
    payload["updated_at"] = now_iso()
    await db.meetings.update_one({"id": mid}, {"$set": payload})
    return await db.meetings.find_one({"id": mid}, {"_id": 0})

@api_router.delete("/meetings/{mid}")
async def delete_meeting(mid: str, user=Depends(get_current_user)):
    await db.meetings.delete_one({"id": mid})
    return {"ok": True}

# ============== MEETING REQUESTS ==============
class MeetingRequestInput(BaseModel):
    subject: str
    description: Optional[str] = ""
    proposed_date: str
    duration_minutes: int = 30
    urgency: Literal["low", "medium", "high"] = "medium"

@api_router.get("/meeting-requests")
async def list_meeting_requests(user=Depends(get_current_user)):
    # CEO/admin/tracker see all, others see their own
    q = {} if user["role"] in ("admin", "ceo", "tracker") else {"requester_id": user["id"]}
    items = await db.meeting_requests.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api_router.post("/meeting-requests")
async def create_meeting_request(payload: MeetingRequestInput, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["requester_id"] = user["id"]
    doc["requester_name"] = user.get("name")
    doc["requester_role"] = user.get("role")
    doc["status"] = "pending"
    doc["created_at"] = now_iso()
    await db.meeting_requests.insert_one(doc)
    # notify CEO
    ceo = await db.users.find_one({"role": "ceo"})
    if ceo:
        await db.notifications.insert_one({
            "id": new_id(), "user_id": ceo["id"], "type": "meeting_request",
            "title": f"طلب اجتماع جديد من {user.get('name')}",
            "body": payload.subject, "link": "/meeting-requests",
            "read": False, "created_at": now_iso()
        })
    doc.pop("_id", None)
    return doc

@api_router.post("/meeting-requests/{rid}/decision")
async def decide_request(rid: str, payload: dict, user=Depends(require_roles("ceo", "admin", "tracker"))):
    """payload: { decision: approved|rejected|rescheduled, note?, new_date? }"""
    decision = payload.get("decision")
    if decision not in ("approved", "rejected", "rescheduled"):
        raise HTTPException(400, "invalid decision")
    update = {"status": decision, "decision_note": payload.get("note", ""), "decided_by": user["id"], "decided_at": now_iso()}
    if decision == "rescheduled" and payload.get("new_date"):
        update["proposed_date"] = payload["new_date"]
        update["status"] = "rescheduled"
    await db.meeting_requests.update_one({"id": rid}, {"$set": update})
    req = await db.meeting_requests.find_one({"id": rid}, {"_id": 0})
    if req:
        await db.notifications.insert_one({
            "id": new_id(), "user_id": req["requester_id"], "type": "meeting_decision",
            "title": f"قرار على طلب اجتماعك: {decision}",
            "body": req.get("subject", ""), "link": "/meeting-requests",
            "read": False, "created_at": now_iso()
        })
    return req

# ============== DOCUMENTS ==============
class DocumentInput(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Literal["meeting_notes", "correspondence", "report", "memo", "presentation", "contract", "policy", "other"] = "other"
    url: str  # external URL or data URI
    file_type: Optional[str] = ""
    project_id: Optional[str] = None
    meeting_id: Optional[str] = None
    is_public: bool = True

@api_router.get("/documents")
async def list_documents(user=Depends(get_current_user), project_id: Optional[str] = None, meeting_id: Optional[str] = None):
    q = {}
    if project_id: q["project_id"] = project_id
    if meeting_id: q["meeting_id"] = meeting_id
    if user["role"] not in ("admin", "ceo", "tracker"):
        q["$or"] = [{"is_public": True}, {"uploaded_by": user["id"]}]
    items = await db.documents.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api_router.post("/documents")
async def create_document(payload: DocumentInput, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["uploaded_by"] = user["id"]
    doc["uploaded_by_name"] = user.get("name")
    doc["created_at"] = now_iso()
    await db.documents.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/documents/{did}")
async def delete_document(did: str, user=Depends(get_current_user)):
    await db.documents.delete_one({"id": did})
    return {"ok": True}
# ============== INTERNAL MESSAGES ==============
class MessageInput(BaseModel):
    recipient_id: str
    subject: Optional[str] = ""
    body: str


def norm_id(value):
    """Normalize Mongo/user IDs so string and numeric IDs match consistently."""
    return str(value or "").strip()


async def find_user_by_id(user_id: str):
    uid = norm_id(user_id)

    if not uid:
        return None

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                SELECT id, email, name, role, created_at
                FROM users
                WHERE id = :id
            """),
            {"id": int(uid)}
        )
        row = result.mappings().first()

    if not row:
        return None

    return {
        "id": str(row["id"]),
        "email": row["email"],
        "name": row["name"],
        "role": row["role"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


@api_router.get("/messages")
async def list_messages(user=Depends(get_current_user)):
    user_id = norm_id(user["id"])
    id_variants = [user_id]

    if user_id.isdigit():
        id_variants.append(int(user_id))

    items = await db.messages.find(
        {
            "$or": [
                {"sender_id": {"$in": id_variants}},
                {"recipient_id": {"$in": id_variants}},
            ]
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)

    return items


@api_router.post("/messages")
async def send_message(payload: MessageInput, user=Depends(get_current_user)):
    sender_id = norm_id(user["id"])
    recipient_id = norm_id(payload.recipient_id)

    if not recipient_id:
        raise HTTPException(status_code=400, detail="recipient_id is required")

    recipient = await find_user_by_id(recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="المستخدم المستقبل غير موجود")

    doc = {
        "id": new_id(),
        "sender_id": sender_id,
        "sender_name": user.get("name") or "—",
        "recipient_id": norm_id(recipient.get("id")),
        "recipient_name": recipient.get("name") or "—",
        "subject": payload.subject or "",
        "body": payload.body,
        "read": False,
        "created_at": now_iso(),
    }

    await db.messages.insert_one(doc.copy())

    await db.notifications.insert_one({
        "id": new_id(),
        "user_id": doc["recipient_id"],
        "type": "message",
        "title": f"تكليف جديد من {user.get('name')}",
        "body": payload.subject or payload.body[:80],
        "link": "/messages",
        "read": False,
        "created_at": now_iso()
    })

    return doc


@api_router.patch("/messages/{mid}/read")
async def mark_read(mid: str, user=Depends(get_current_user)):
    user_id = norm_id(user["id"])
    id_variants = [user_id]

    if user_id.isdigit():
        id_variants.append(int(user_id))

    result = await db.messages.update_one(
        {
            "id": mid,
            "recipient_id": {"$in": id_variants},
        },
        {"$set": {"read": True, "read_at": now_iso()}}
    )

    return {"ok": True, "modified": result.modified_count}


# ============== NOTIFICATIONS ==============
@api_router.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    user_id = norm_id(user["id"])
    id_variants = [user_id]

    if user_id.isdigit():
        id_variants.append(int(user_id))

    items = await db.notifications.find(
        {"user_id": {"$in": id_variants}},
        {"_id": 0}
    ).sort("created_at", -1).limit(100).to_list(100)

    return items


@api_router.post("/notifications/{nid}/read")
async def notif_read(nid: str, user=Depends(get_current_user)):
    user_id = norm_id(user["id"])
    id_variants = [user_id]

    if user_id.isdigit():
        id_variants.append(int(user_id))

    await db.notifications.update_one(
        {"id": nid, "user_id": {"$in": id_variants}},
        {"$set": {"read": True, "read_at": now_iso()}}
    )
    return {"ok": True}


@api_router.post("/notifications/read-all")
async def notif_read_all(user=Depends(get_current_user)):
    user_id = norm_id(user["id"])
    id_variants = [user_id]

    if user_id.isdigit():
        id_variants.append(int(user_id))

    await db.notifications.update_many(
        {"user_id": {"$in": id_variants}},
        {"$set": {"read": True, "read_at": now_iso()}}
    )
    return {"ok": True}

# Notification settings (admin manages global channels)
@api_router.get("/notification-settings")
async def get_notif_settings(user=Depends(get_current_user)):
    s = await db.notification_settings.find_one({"id": "global"}, {"_id": 0})
    if not s:
        s = {"id": "global", "email_enabled": False, "whatsapp_enabled": False, "in_app_enabled": True,
             "events": {"meeting": True, "meeting_request": True, "task": True, "project": True, "message": True}}
        await db.notification_settings.insert_one(s)
    return s

@api_router.put("/notification-settings")
async def set_notif_settings(payload: dict, user=Depends(require_roles("admin"))):
    payload["id"] = "global"
    payload["updated_at"] = now_iso()
    await db.notification_settings.update_one({"id": "global"}, {"$set": {k: v for k, v in payload.items() if k != "_id"}}, upsert=True)
    payload.pop("_id", None)
    return payload

# ============== THEME PREFERENCES ==============
@api_router.get("/theme")
async def get_theme(user=Depends(get_current_user)):
    s = await db.theme_settings.find_one({"id": "global"}, {"_id": 0})
    return s or {"id": "global", "active_theme": "luxury"}

@api_router.put("/theme")
async def set_theme(payload: dict, user=Depends(get_current_user)):
    payload["id"] = "global"
    payload["updated_by"] = user["id"]
    payload["updated_at"] = now_iso()
    await db.theme_settings.update_one({"id": "global"}, {"$set": {k: v for k, v in payload.items() if k != "_id"}}, upsert=True)
    payload.pop("_id", None)
    return payload

# ============== VOICE DIRECTIVES (AI) ==============
class VoiceTranscribeInput(BaseModel):
    audio_base64: str  # data URI or raw base64
    mime: str = "audio/webm"

@api_router.post("/voice/transcribe")
async def voice_transcribe(payload: VoiceTranscribeInput, user=Depends(get_current_user)):
    """Transcribe audio + extract tasks using OpenAI (Whisper) + Claude via emergentintegrations."""
    try:
        from emergentintegrations.llm.openai.speech_to_text import OpenAISpeechToText
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as e:
        raise HTTPException(500, f"Integration unavailable: {e}")

    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")

    # decode audio
    b64 = payload.audio_base64
    if "," in b64: b64 = b64.split(",", 1)[1]
    audio_bytes = base64.b64decode(b64)
    tmp_path = f"/tmp/voice_{new_id()}.webm"
    with open(tmp_path, "wb") as f:
        f.write(audio_bytes)

    try:
        stt = OpenAISpeechToText(api_key=key)
        result = await stt.transcribe(file=tmp_path, model="whisper-1", language="ar")
        transcript_text = result.text if hasattr(result, "text") else (result.get("text") if isinstance(result, dict) else str(result))
    except Exception as e:
        try: os.remove(tmp_path)
        except: pass
        raise HTTPException(500, f"Transcription failed: {e}")
    finally:
        try: os.remove(tmp_path)
        except: pass

    # Get users for assignment
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(50)
    users_info = "\n".join([f"- {u['name']} (id: {u['id']}, role: {u['role']})" for u in users])

    # Analyze with Claude
    system_msg = f"""أنت مساعد ذكاء اصطناعي لمكتب الرئيس التنفيذي لمجموعة أراك. مهمتك:
1. حلل النص الصوتي المكتوب
2. استخرج المهام والتوجيهات
3. حدد المسؤول عن كل مهمة من قائمة المستخدمين
4. حدد أولوية كل مهمة (low/medium/high/critical)
5. حدد القطاع المناسب (development/investment/arak_development/academy/digital/corporate)

المستخدمون المتاحون:
{users_info}

أعد النتيجة بصيغة JSON فقط بدون أي شرح، بهذا الشكل:
{{"summary": "ملخص قصير", "tasks": [{{"title": "...", "description": "...", "assignee_id": "...", "priority": "...", "sector": "..."}}]}}"""

    try:
        chat = LlmChat(api_key=key, session_id=new_id(), system_message=system_msg).with_model("anthropic", "claude-sonnet-4-5-20250929")
        resp = await chat.send_message(UserMessage(text=f"النص الصوتي:\n{transcript_text}"))
        resp_text = resp if isinstance(resp, str) else str(resp)
        # Extract JSON
        s = resp_text.find("{"); e = resp_text.rfind("}")
        analysis = json.loads(resp_text[s:e+1]) if s >= 0 and e > s else {"summary": resp_text, "tasks": []}
    except Exception as e:
        analysis = {"summary": "تعذر التحليل التلقائي", "tasks": [], "error": str(e)}

    # Save directive
    directive_id = new_id()
    directive = {
        "id": directive_id,
        "user_id": user["id"],
        "transcript": transcript_text,
        "summary": analysis.get("summary", ""),
        "suggested_tasks": analysis.get("tasks", []),
        "created_at": now_iso(),
        "applied": False,
    }
    await db.voice_directives.insert_one(directive)
    directive.pop("_id", None)
    return directive

class ApplyDirectiveInput(BaseModel):
    directive_id: str
    selected_tasks: List[dict]  # tasks to actually create

@api_router.post("/voice/apply")
async def apply_directive(payload: ApplyDirectiveInput, user=Depends(get_current_user)):
    created = []
    for t in payload.selected_tasks:
        task = {
            "id": new_id(),
            "title": t.get("title", ""),
            "description": t.get("description", ""),
            "assignee_id": t.get("assignee_id"),
            "priority": t.get("priority", "medium"),
            "sector": t.get("sector", "development"),
            "status": "pending",
            "progress": 0,
            "due_date": t.get("due_date"),
            "source": "voice_directive",
            "directive_id": payload.directive_id,
            "created_by": user["id"],
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        await db.tasks.insert_one(task)
        created.append(task["id"])
        # notify assignee
        if t.get("assignee_id"):
            await db.notifications.insert_one({
                "id": new_id(), "user_id": t["assignee_id"], "type": "task",
                "title": "مهمة جديدة من الرئيس التنفيذي",
                "body": t.get("title", ""), "link": "/tasks",
                "read": False, "created_at": now_iso()
            })
    await db.voice_directives.update_one({"id": payload.directive_id}, {"$set": {"applied": True, "applied_at": now_iso(), "created_task_ids": created}})
    return {"ok": True, "created": len(created)}

@api_router.get("/voice/directives")
async def list_directives(user=Depends(get_current_user)):
    items = await db.voice_directives.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

# ============== CALENDAR EVENTS ==============
class CalendarEventInput(BaseModel):
    title: str
    description: Optional[str] = ""
    start: str
    end: Optional[str] = None
    event_type: Literal["manual", "meeting", "task", "reminder"] = "manual"
    color: Optional[str] = ""
    all_day: bool = False
    reminder_minutes: int = 15
    active: bool = True

@api_router.get("/calendar")
async def calendar(user=Depends(get_current_user)):
    """Aggregate events from meetings, tasks (due_dates), manual calendar items."""
    events = []
    # manual events (show all, frontend dims inactive)
    async for e in db.calendar_events.find({"user_id": user["id"]}, {"_id": 0}):
        events.append(e)
    # meetings (user is attendee, organizer, or sees all)
    if user["role"] in ("admin", "ceo", "tracker"):
        mq = {}
    else:
        mq = {"$or": [{"attendee_ids": user["id"]}, {"organizer_id": user["id"]}]}
    async for m in db.meetings.find(mq, {"_id": 0}):
        events.append({
            "id": f"meet-{m['id']}", "title": f"اجتماع: {m['title']}",
            "start": m["date"], "event_type": "meeting", "color": "#D4AF37",
            "ref_id": m["id"], "description": m.get("description", ""),
        })
    # tasks with due_date (sector-filtered)
    try:
        from .server import role_sector_filter
    except ImportError:
        from server import role_sector_filter
    tq = role_sector_filter(user["role"]) or {}
    tq["due_date"] = {"$ne": None}
    async for t in db.tasks.find(tq, {"_id": 0}):
        if not t.get("due_date"): continue
        events.append({
            "id": f"task-{t['id']}", "title": f"مهمة: {t['title']}",
            "start": t["due_date"], "event_type": "task",
            "color": {"critical": "#fb7185", "high": "#fbbf24", "medium": "#60a5fa", "low": "#94a3b8"}.get(t.get("priority"), "#94a3b8"),
            "ref_id": t["id"], "description": t.get("description", ""),
        })
    return events

@api_router.post("/calendar")
async def create_event(payload: CalendarEventInput, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["user_id"] = user["id"]
    doc["active"] = doc.get("active", True) if "active" in doc else True
    doc["created_at"] = now_iso()
    await db.calendar_events.insert_one(doc)
    # In-app reminder notification
    await db.notifications.insert_one({
        "id": new_id(), "user_id": user["id"], "type": "calendar",
        "title": f"تم جدولة: {payload.title}",
        "body": f"الحدث في {payload.start}", "link": "/calendar",
        "read": False, "created_at": now_iso(),
    })
    doc.pop("_id", None)
    return doc

@api_router.patch("/calendar/{eid}")
async def update_event(eid: str, payload: dict, user=Depends(get_current_user)):
    payload.pop("_id", None)
    payload["updated_at"] = now_iso()
    await db.calendar_events.update_one({"id": eid, "user_id": user["id"]}, {"$set": payload})
    e = await db.calendar_events.find_one({"id": eid}, {"_id": 0})
    return e

@api_router.delete("/calendar/{eid}")
async def delete_event(eid: str, user=Depends(get_current_user)):
    await db.calendar_events.delete_one({"id": eid, "user_id": user["id"]})
    return {"ok": True}

# ============== DAILY EXECUTIVE REPORT ==============
@api_router.get("/reports/daily-executive")
async def daily_executive_report(user=Depends(get_current_user)):
    """Generate daily executive briefing using Claude."""
    try:
        from .server import role_sector_filter, calc_rag
    except ImportError:
        from server import role_sector_filter, calc_rag
    from datetime import datetime, timezone, timedelta

    flt = role_sector_filter(user["role"]) or {}
    projects = await db.projects.find(flt, {"_id": 0}).to_list(500)
    for p in projects: p["rag"] = calc_rag(p)

    tasks = await db.tasks.find(flt, {"_id": 0}).to_list(2000)
    now = datetime.now(timezone.utc)
    tomorrow = now + timedelta(days=1)

    # Today's meetings
    meetings = await db.meetings.find({}, {"_id": 0}).to_list(200)
    today_meetings = []
    for m in meetings:
        try:
            d = datetime.fromisoformat(m["date"].replace("Z", "+00:00"))
            if d.date() == now.date(): today_meetings.append(m)
        except: pass

    # Overdue tasks
    overdue = []
    for t in tasks:
        if t.get("status") in ("completed", "cancelled"): continue
        if t.get("due_date"):
            try:
                d = datetime.fromisoformat(t["due_date"].replace("Z", "+00:00"))
                if d < now: overdue.append(t)
            except: pass

    # Critical projects (red)
    critical = [p for p in projects if p.get("rag") == "red"]

    # Pending meeting requests
    pending_reqs = await db.meeting_requests.find({"status": "pending"}, {"_id": 0}).to_list(50)

    # Pending voice directives
    pending_voice = await db.voice_directives.find({"applied": False}, {"_id": 0}).sort("created_at", -1).to_list(20)

    # AI Summary via Claude
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        key = os.environ.get("EMERGENT_LLM_KEY")
        ctx = f"""بيانات اليوم {now.strftime('%Y-%m-%d')}:
- إجمالي المشاريع: {len(projects)} (نشط: {sum(1 for p in projects if p.get('status')=='active')})
- مشاريع حرجة (أحمر): {len(critical)} → {[p['name'] for p in critical[:5]]}
- مهام متأخرة: {len(overdue)}
- اجتماعات اليوم: {len(today_meetings)} → {[m['title'] for m in today_meetings]}
- طلبات لقاء معلقة: {len(pending_reqs)}
- توجيهات صوتية معلقة: {len(pending_voice)}
- متوسط إنجاز المشاريع: {round(sum(p.get('progress',0) for p in projects)/max(len(projects),1))}%"""
        chat = LlmChat(api_key=key, session_id=new_id(),
            system_message="أنت رئيس مكتب الرئيس التنفيذي. اكتب موجز تنفيذي احترافي مكثف (3-5 جمل) باللغة العربية يحدد أهم 3 إجراءات يجب أن يتخذها الرئيس التنفيذي اليوم."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        ai_resp = await chat.send_message(UserMessage(text=ctx))
        ai_summary = ai_resp if isinstance(ai_resp, str) else str(ai_resp)
    except Exception as e:
        ai_summary = "موجز يدوي: راجع البنود الحرجة والمهام المتأخرة وطلبات اللقاء المعلقة."

    return {
        "generated_at": now_iso(),
        "user": {"name": user.get("name"), "role": user.get("role")},
        "ai_summary": ai_summary,
        "metrics": {
            "total_projects": len(projects),
            "active_projects": sum(1 for p in projects if p.get('status')=='active'),
            "critical_projects": len(critical),
            "overdue_tasks": len(overdue),
            "today_meetings": len(today_meetings),
            "pending_requests": len(pending_reqs),
            "pending_voice_directives": len(pending_voice),
            "avg_progress": round(sum(p.get('progress',0) for p in projects)/max(len(projects),1)),
        },
        "critical_projects": critical[:10],
        "overdue_tasks": overdue[:15],
        "today_meetings": today_meetings,
        "pending_requests": pending_reqs[:10],
        "pending_voice_directives": pending_voice[:5],
    }
