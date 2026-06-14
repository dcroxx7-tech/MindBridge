import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel

from database import get_db
from routes.auth import get_current_user
from models.user import User
from models.conversation import Conversation
from agents.companion import get_response

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    is_crisis: bool
    show_resources: bool
    session_id: str
    agent_analysis: Optional[Dict[str, Any]] = None

def analyze_message_for_distortions(message: str) -> dict:
    msg = message.lower()
    distortions = []
    
    # 1. Catastrophizing (exaggerating worst-case outcomes)
    catastrophizing_keywords = ["never", "always", "hopeless", "ruined", "forever", "worst", "doom", "fail", "nothing will change"]
    if any(k in msg for k in catastrophizing_keywords):
        distortions.append("Catastrophizing")
        
    # 2. Black-and-White (All-or-Nothing) Thinking
    bw_keywords = ["completely", "worthless", "perfect", "useless", "ruined", "everything", "nothing", "failure", "success"]
    if any(k in msg for k in bw_keywords) and "Catastrophizing" not in distortions:
        distortions.append("All-or-Nothing Thinking")
        
    # 3. Overgeneralization (applying one negative event to all events)
    generalization_keywords = ["everybody", "nobody", "always", "every time", "no one", "everyone"]
    if any(k in msg for k in generalization_keywords):
        distortions.append("Overgeneralization")
        
    # 4. Emotional Reasoning (assuming emotions reflect objective truth)
    emotional_keywords = ["feel like", "feels like", "i feel that", "mujhe lagta hai", "lag raha hai"]
    if any(k in msg for k in emotional_keywords):
        distortions.append("Emotional Reasoning")

    # Determine policy
    if "Catastrophizing" in distortions or "All-or-Nothing Thinking" in distortions:
        policy = "Cognitive Reframing (CBT)"
    elif "Emotional Reasoning" in distortions:
        policy = "Autonomic Grounding & Breath-Pacing"
    elif not distortions:
        policy = "Active Listening & Empathy Validation"
    else:
        policy = "Thought Testing Challenge"
        
    # Determine safety check
    safety_check = "PASSED"
    # Double check crisis keywords
    crisis_keywords = ["suicide", "kill myself", "end my life", "self harm", "hurt myself", "don't want to live", "dont want to live", "die"]
    if any(k in msg for k in crisis_keywords):
        safety_check = "CRISIS_ALERT"
        policy = "Emergency Helpline Routing"

    # Escalation score estimation
    escalation_score = 0.1
    if safety_check == "CRISIS_ALERT":
        escalation_score = 1.0
    else:
        if len(distortions) > 0:
            escalation_score += 0.25 * len(distortions)
        distress_keywords = ["lonely", "alone", "sad", "depressed", "tired", "worthless", "exhausted", "burden", "hopeless"]
        distress_count = sum(1 for k in distress_keywords if k in msg)
        escalation_score += 0.15 * distress_count
        escalation_score = min(0.95, escalation_score)

    return {
        "safety_check": safety_check,
        "cognitive_distortions": distortions,
        "selected_policy": policy,
        "escalation_score": round(escalation_score, 2)
    }

@router.post("/", response_model=ChatResponse)
async def chat_message(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # AGENTIC PIPELINE: User message → crisis check → CompanionAI response → escalation check → may trigger BridgeAI
    
    # 1. Retrieve chat history for the session
    db_history = db.query(Conversation).filter(
        Conversation.session_id == payload.session_id,
        Conversation.user_id == current_user.id
    ).order_by(Conversation.created_at).all()
    
    # Convert DB models to dict structure for the agent
    history = [{"role": msg.role, "content": msg.content} for msg in db_history]
    
    user_context = {
        "country": current_user.country,
        "language": current_user.language
    }
    
    # 2. Get CompanionAI response
    response_text, is_crisis, show_resources = await get_response(
        payload.message,
        history,
        user_context
    )
    
    # 3. Store User message in DB
    user_conv = Conversation(
        user_id=current_user.id,
        session_id=payload.session_id,
        role="user",
        content=payload.message,
        is_crisis=is_crisis
    )
    db.add(user_conv)
    
    # 4. Store Assistant response in DB
    assistant_conv = Conversation(
        user_id=current_user.id,
        session_id=payload.session_id,
        role="assistant",
        content=response_text,
        is_crisis=is_crisis
    )
    db.add(assistant_conv)
    db.commit()

    # 5. Generate Agent Telemetry Reasoning log
    agent_analysis = analyze_message_for_distortions(payload.message)
    
    return ChatResponse(
        response=response_text,
        is_crisis=is_crisis,
        show_resources=show_resources,
        session_id=payload.session_id,
        agent_analysis=agent_analysis
    )

@router.get("/history/{session_id}", response_model=list)
def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_history = db.query(Conversation).filter(
        Conversation.session_id == session_id,
        Conversation.user_id == current_user.id
    ).order_by(Conversation.created_at).all()
    
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "is_crisis": msg.is_crisis,
            "created_at": msg.created_at
        }
        for msg in db_history
    ]

@router.post("/start", response_model=dict)
def start_chat_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = str(uuid.uuid4())
    
    # Optional: Seed the conversation with a system prompt message if needed
    system_msg = Conversation(
        user_id=current_user.id,
        session_id=session_id,
        role="system",
        content="Session started. CompanionAI CBT agent activated."
    )
    db.add(system_msg)
    db.commit()
    
    return {"session_id": session_id}
