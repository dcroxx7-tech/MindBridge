import datetime
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel

from database import get_db
from routes.auth import get_current_user
from models.user import User
from models.checkin import CheckIn
from agents.sentinel import analyze_checkin, get_trend_analysis

router = APIRouter(prefix="/api/checkin", tags=["checkin"])

class CheckInCreate(BaseModel):
    mood_score: int
    sleep_hours: float
    social_score: int
    energy_level: int
    journal_text: Optional[str] = None

class CheckInResponse(BaseModel):
    id: int
    user_id: int
    mood_score: int
    sleep_hours: float
    social_score: int
    energy_level: int
    journal_text: Optional[str]
    warning_level: str
    warning_triggers: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=dict)
def create_checkin(
    checkin_data: CheckInCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # AGENTIC PIPELINE: Check-in → SentinelAI analysis → automatic warning detection → triggers CompanionAI if needed
    
    # 1. Create check-in entry
    db_checkin = CheckIn(
        user_id=current_user.id,
        mood_score=checkin_data.mood_score,
        sleep_hours=checkin_data.sleep_hours,
        social_score=checkin_data.social_score,
        energy_level=checkin_data.energy_level,
        journal_text=checkin_data.journal_text
    )
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)

    # 2. Run SentinelAI analysis
    analysis = analyze_checkin(db, current_user.id, db_checkin)
    
    # 3. Update warning flags on checkin
    db_checkin.warning_level = analysis["level"]
    db_checkin.warning_triggers = json.dumps(analysis["triggers"])
    db.commit()
    db.refresh(db_checkin)
    
    return {
        "checkin": {
            "id": db_checkin.id,
            "user_id": db_checkin.user_id,
            "mood_score": db_checkin.mood_score,
            "sleep_hours": db_checkin.sleep_hours,
            "social_score": db_checkin.social_score,
            "energy_level": db_checkin.energy_level,
            "journal_text": db_checkin.journal_text,
            "warning_level": db_checkin.warning_level,
            "warning_triggers": db_checkin.warning_triggers,
            "created_at": str(db_checkin.created_at)
        },
        "analysis": analysis
    }

@router.get("/today", response_model=dict)
def check_today_checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + datetime.timedelta(days=1)
    
    today_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.created_at >= today_start,
        CheckIn.created_at < today_end
    ).first()
    
    checkin_data = None
    if today_checkin:
        checkin_data = {
            "id": today_checkin.id,
            "mood_score": today_checkin.mood_score,
            "sleep_hours": today_checkin.sleep_hours,
            "social_score": today_checkin.social_score,
            "energy_level": today_checkin.energy_level,
            "warning_level": today_checkin.warning_level,
            "created_at": str(today_checkin.created_at)
        }
    
    return {
        "checked_in": today_checkin is not None,
        "checkin": checkin_data
    }

@router.get("/trends/{user_id}", response_model=dict)
def get_trends(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's trend data"
        )
        
    # Get last 30 checkins ordered by date ascending for charts
    checkins = db.query(CheckIn).filter(
        CheckIn.user_id == user_id
    ).order_by(CheckIn.created_at).limit(30).all()
    
    trend_stats = get_trend_analysis(db, user_id)
    
    # Parse triggers from JSON
    checkin_list = []
    for c in checkins:
        triggers = []
        if c.warning_triggers:
            try:
                triggers = json.loads(c.warning_triggers)
            except:
                pass
        checkin_list.append({
            "id": c.id,
            "mood_score": c.mood_score,
            "sleep_hours": c.sleep_hours,
            "social_score": c.social_score,
            "energy_level": c.energy_level,
            "journal_text": c.journal_text,
            "warning_level": c.warning_level,
            "warning_triggers": triggers,
            "created_at": str(c.created_at)
        })
        
    # Check if there is any active high warning in the latest check-in
    latest_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == user_id
    ).order_by(desc(CheckIn.created_at)).first()
    
    active_warning = False
    warning_details = None
    if latest_checkin and latest_checkin.warning_level in ["medium", "high"]:
        active_warning = True
        try:
            triggers = json.loads(latest_checkin.warning_triggers) if latest_checkin.warning_triggers else []
        except:
            triggers = []
        warning_details = {
            "level": latest_checkin.warning_level,
            "triggers": triggers,
            "created_at": str(latest_checkin.created_at)
        }
        
    return {
        "checkins": checkin_list,
        "stats": trend_stats,
        "active_warning": active_warning,
        "warning_details": warning_details
    }
