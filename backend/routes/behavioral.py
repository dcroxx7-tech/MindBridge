from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from database import get_db
from routes.auth import get_current_user
from models.user import User
from models.behavioral import BehavioralSession

router = APIRouter(prefix="/api/behavioral", tags=["behavioral"])

class BehavioralSessionCreate(BaseModel):
    avg_hold_time_ms: float
    avg_flight_time_ms: float
    typing_speed_wpm: float
    backspace_rate: float
    pause_frequency: float
    session_duration_ms: float
    total_keystrokes: int

class BehavioralSessionResponse(BaseModel):
    id: int
    user_id: int
    avg_hold_time_ms: float
    avg_flight_time_ms: float
    typing_speed_wpm: float
    backspace_rate: float
    pause_frequency: float
    session_duration_ms: float
    total_keystrokes: int

    class Config:
        from_attributes = True

@router.post("/checkin", response_model=BehavioralSessionResponse)
def create_behavioral_session(
    session_data: BehavioralSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_session = BehavioralSession(
        user_id=current_user.id,
        avg_hold_time_ms=session_data.avg_hold_time_ms,
        avg_flight_time_ms=session_data.avg_flight_time_ms,
        typing_speed_wpm=session_data.typing_speed_wpm,
        backspace_rate=session_data.backspace_rate,
        pause_frequency=session_data.pause_frequency,
        session_duration_ms=session_data.session_duration_ms,
        total_keystrokes=session_data.total_keystrokes
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/baseline/{user_id}")
def get_user_baseline(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure users can only access their own data
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's data"
        )
    
    # Query all sessions sorted by timestamp ascending
    sessions = db.query(BehavioralSession).filter(
        BehavioralSession.user_id == user_id
    ).order_by(BehavioralSession.timestamp.asc()).all()
    
    n = len(sessions)
    if n < 3:
        return {
            "status": "learning",
            "total_sessions": n,
            "required_sessions": 3,
            "risk_score": 0,
            "warning": False,
            "level": "none",
            "deviations": {
                "speed_drop_pct": 0.0,
                "backspace_increase_pct": 0.0,
                "response_slowing_pct": 0.0
            },
            "recent_wpm": [s.typing_speed_wpm for s in sessions],
            "recent_backspace": [s.backspace_rate for s in sessions]
        }
    
    # Define baseline and recent groups
    # Baseline: up to the first 7 sessions, excluding the last 3.
    # If total <= 7, baseline is sessions before the last 3.
    # If total == 3, baseline is the first session, recent is the last 2.
    if n == 3:
        baseline_sessions = sessions[0:1]
        recent_sessions = sessions[1:3]
    else:
        baseline_sessions = sessions[:min(7, n - 3)]
        recent_sessions = sessions[-3:]
        
    def avg(lst, attr):
        vals = [getattr(x, attr) for x in lst]
        return sum(vals) / len(vals) if vals else 0.0

    # Calculate baselines
    base_speed = avg(baseline_sessions, "typing_speed_wpm")
    base_hold = avg(baseline_sessions, "avg_hold_time_ms")
    base_flight = avg(baseline_sessions, "avg_flight_time_ms")
    base_backspace = avg(baseline_sessions, "backspace_rate")
    base_pause = avg(baseline_sessions, "pause_frequency")

    # Calculate recents
    rec_speed = avg(recent_sessions, "typing_speed_wpm")
    rec_hold = avg(recent_sessions, "avg_hold_time_ms")
    rec_flight = avg(recent_sessions, "avg_flight_time_ms")
    rec_backspace = avg(recent_sessions, "backspace_rate")
    rec_pause = avg(recent_sessions, "pause_frequency")

    # Deviations
    speed_drop_pct = max(0.0, (base_speed - rec_speed) / base_speed * 100.0) if base_speed > 0 else 0.0
    backspace_increase_pct = max(0.0, (rec_backspace - base_backspace) / base_backspace * 100.0) if base_backspace > 0 else (rec_backspace * 100.0 if rec_backspace > 0 else 0.0)
    
    hold_increase_pct = max(0.0, (rec_hold - base_hold) / base_hold * 100.0) if base_hold > 0 else 0.0
    flight_increase_pct = max(0.0, (rec_flight - base_flight) / base_flight * 100.0) if base_flight > 0 else 0.0
    response_slowing_pct = max(hold_increase_pct, flight_increase_pct)

    # Compute risk score (0-100)
    # 1. Typing speed drop: speed dropping by 30%+ is significant. Weight: max 40 pts.
    speed_points = min(40.0, (speed_drop_pct / 30.0) * 40.0) if speed_drop_pct > 0 else 0.0
    # 2. Backspace increase: backspacing increasing by 50%+ is significant. Weight: max 30 pts.
    backspace_points = min(30.0, (backspace_increase_pct / 50.0) * 30.0) if backspace_increase_pct > 0 else 0.0
    # 3. Latency (slowing response): hold/flight times increasing by 40%+. Weight: max 30 pts.
    slowing_points = min(30.0, (response_slowing_pct / 40.0) * 30.0) if response_slowing_pct > 0 else 0.0

    risk_score = round(speed_points + backspace_points + slowing_points, 1)
    risk_score = min(100.0, max(0.0, risk_score))

    warning = risk_score >= 40.0
    level = "none"
    if risk_score >= 70.0:
        level = "high"
    elif risk_score >= 40.0:
        level = "medium"

    # For charts, return the history of WPM and backspace rate of recent sessions (up to last 10)
    recent_history = sessions[-10:]
    
    return {
        "status": "analyzed",
        "total_sessions": n,
        "risk_score": risk_score,
        "warning": warning,
        "level": level,
        "deviations": {
            "speed_drop_pct": round(speed_drop_pct, 1),
            "backspace_increase_pct": round(backspace_increase_pct, 1),
            "response_slowing_pct": round(response_slowing_pct, 1)
        },
        "recent_wpm": [round(s.typing_speed_wpm, 1) for s in recent_history],
        "recent_backspace": [round(s.backspace_rate * 100, 1) for s in recent_history],  # Convert to percent
        "timestamps": [s.timestamp.strftime("%Y-%m-%d %H:%M") for s in recent_history]
    }
