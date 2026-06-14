import json
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.checkin import CheckIn
from models.behavioral import BehavioralSession

# SentinelAI: Early Warning Detector
# AGENTIC BEHAVIOR: SentinelAI runs autonomously on every check-in, 
# analyzing the user's longitudinal data, making an independent judgment 
# on warning levels, and flagging the system to trigger support.

NEGATIVE_KEYWORDS = [
    "lonely", "hopeless", "tired", "worthless", "can't go on", "cant go on",
    "empty", "numb", "no point", "give up", "hate myself", "burden",
    "alone", "meaningless", "exhausted", "overwhelmed", "lost", "sad", "depressed",
    "udaas", "thak gaya", "thak gayi", "koi nahi hai", "akele", "pareshaan"
]

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self harm", "hurt myself", 
    "don't want to live", "dont want to live", "khatam kar lun", 
    "jeena nahi chahta", "mar jaana chahta hun", "mar jana chahta", "die", "death"
]

def analyze_checkin(db: Session, user_id: int, current_checkin: CheckIn) -> dict:
    """
    Analyzes a user's recent check-ins to detect deterioration trends and patterns.
    Returns a dict with warning details.
    """
    # Fetch last 7 check-ins (including the current one) ordered by date desc
    history = db.query(CheckIn).filter(
        CheckIn.user_id == user_id
    ).order_by(desc(CheckIn.created_at)).limit(7).all()
    
    # We want chronological order for trend analysis (oldest first)
    history.reverse()
    
    warning = False
    warning_level = "none"
    triggers = []
    is_crisis = False
    
    if not history:
        return {
            "warning": False,
            "level": "none",
            "triggers": [],
            "is_crisis": False,
            "message": "First check-in completed. SentinelAI monitoring active."
        }
        
    # Latest values
    latest = history[-1]
    
    # 1. Crisis keyword detection in journal
    if latest.journal_text:
        journal_lower = latest.journal_text.lower()
        for kw in CRISIS_KEYWORDS:
            if kw in journal_lower:
                is_crisis = True
                warning = True
                warning_level = "high"
                triggers.append(f"Crisis keyword detected in journal: '{kw}'")
                break
                
        # 2. Negative keyword detection
        if not is_crisis:
            neg_found = []
            for kw in NEGATIVE_KEYWORDS:
                if kw in journal_lower:
                    neg_found.append(kw)
            if neg_found:
                warning = True
                warning_level = "medium"
                triggers.append(f"Negative emotion keywords in journal: {', '.join(neg_found)}")

    # 3. Mood Drop Analysis: Mood score dropping 3+ points over 3 days (or within 3 check-ins)
    if len(history) >= 3:
        # Check if there is a drop of 3+ points in any 3-day window
        for i in range(len(history) - 2):
            mood_start = history[i].mood_score
            mood_end = history[i+2].mood_score
            if mood_start - mood_end >= 3:
                warning = True
                warning_level = "medium" if warning_level != "high" else "high"
                triggers.append(f"Mood dropped by {mood_start - mood_end} points over 3 days")
                break

    # 4. Sleep Drop Analysis: Sleep dropping below 5 hours consistently (e.g. 3 consecutive check-ins)
    if len(history) >= 3:
        recent_sleep = [h.sleep_hours for h in history[-3:]]
        if all(s < 5 for s in recent_sleep):
            warning = True
            warning_level = "medium" if warning_level != "high" else "high"
            triggers.append("Sleep consistently below 5 hours (last 3 check-ins)")

    # 5. Social Score Drop Analysis: Social score below 2 for 3+ days
    if len(history) >= 3:
        recent_social = [h.social_score for h in history[-3:]]
        if all(s < 2 for s in recent_social):
            warning = True
            warning_level = "medium" if warning_level != "high" else "high"
            triggers.append("Social interaction score consistently below 2 (last 3 check-ins)")

    # 6. Energy Level Drop Analysis: Energy level below 2 for 3+ days
    if len(history) >= 3:
        recent_energy = [h.energy_level for h in history[-3:]]
        if all(e < 2 for e in recent_energy):
            warning = True
            warning_level = "medium" if warning_level != "high" else "high"
            triggers.append("Energy level consistently below 2 (last 3 check-ins)")

    # Adjust warning level based on trigger count if not already high
    if warning and warning_level == "none":
        warning_level = "low"
    if len(triggers) >= 3 and warning_level != "high":
        warning_level = "high"
    elif len(triggers) >= 2 and warning_level == "low":
        warning_level = "medium"
        
    message = "All parameters nominal."
    if is_crisis:
        message = "CRITICAL WARNING: Crisis indicators detected. Immediate intervention recommended."
    elif warning:
        message = f"Warning triggered (Level: {warning_level.upper()}). Patterns indicate potential deterioration."

    return {
        "warning": warning,
        "level": warning_level,
        "triggers": triggers,
        "is_crisis": is_crisis,
        "message": message
    }

def get_trend_analysis(db: Session, user_id: int) -> dict:
    """
    Calculates statistics for the user dashboard.
    """
    checkins = db.query(CheckIn).filter(
        CheckIn.user_id == user_id
    ).order_by(desc(CheckIn.created_at)).limit(30).all()
    
    if not checkins:
        return {
            "total_checkins": 0,
            "avg_mood": 0.0,
            "avg_sleep": 0.0,
            "avg_social": 0.0,
            "avg_energy": 0.0,
            "streak": 0
        }
        
    avg_mood = sum(c.mood_score for c in checkins) / len(checkins)
    avg_sleep = sum(c.sleep_hours for c in checkins) / len(checkins)
    avg_social = sum(c.social_score for c in checkins) / len(checkins)
    avg_energy = sum(c.energy_level for c in checkins) / len(checkins)
    
    # Calculate daily streak (consecutive days checked in)
    streak = 0
    # Simple streak calculation based on chronological order
    checkins_chrono = sorted(checkins, key=lambda x: x.created_at, reverse=True)
    import datetime
    today = datetime.date.today()
    last_date = None
    
    for i, c in enumerate(checkins_chrono):
        c_date = c.created_at.date()
        if i == 0:
            if c_date == today or c_date == today - datetime.timedelta(days=1):
                streak = 1
                last_date = c_date
            else:
                break
        else:
            if c_date == last_date - datetime.timedelta(days=1):
                streak += 1
                last_date = c_date
            elif c_date == last_date:
                continue
            else:
                break
                
    return {
        "total_checkins": len(checkins),
        "avg_mood": round(avg_mood, 1),
        "avg_sleep": round(avg_sleep, 1),
        "avg_social": round(avg_social, 1),
        "avg_energy": round(avg_energy, 1),
        "streak": streak
    }

def analyze_behavioral_risk(db: Session, user_id: int) -> dict:
    """
    Analyzes a user's recent keystroke dynamics metadata to detect behavioral deviations.
    """
    sessions = db.query(BehavioralSession).filter(
        BehavioralSession.user_id == user_id
    ).order_by(BehavioralSession.timestamp.asc()).all()
    
    n = len(sessions)
    if n < 3:
        return {
            "warning": False,
            "level": "none",
            "risk_score": 0.0,
            "deviations": {
                "speed_drop_pct": 0.0,
                "backspace_increase_pct": 0.0,
                "response_slowing_pct": 0.0
            }
        }
        
    if n == 3:
        baseline_sessions = sessions[0:1]
        recent_sessions = sessions[1:3]
    else:
        baseline_sessions = sessions[:min(7, n - 3)]
        recent_sessions = sessions[-3:]
        
    def avg(lst, attr):
        vals = [getattr(x, attr) for x in lst]
        return sum(vals) / len(vals) if vals else 0.0

    base_speed = avg(baseline_sessions, "typing_speed_wpm")
    base_hold = avg(baseline_sessions, "avg_hold_time_ms")
    base_flight = avg(baseline_sessions, "avg_flight_time_ms")
    base_backspace = avg(baseline_sessions, "backspace_rate")

    rec_speed = avg(recent_sessions, "typing_speed_wpm")
    rec_hold = avg(recent_sessions, "avg_hold_time_ms")
    rec_flight = avg(recent_sessions, "avg_flight_time_ms")
    rec_backspace = avg(recent_sessions, "backspace_rate")

    speed_drop_pct = max(0.0, (base_speed - rec_speed) / base_speed * 100.0) if base_speed > 0 else 0.0
    backspace_increase_pct = max(0.0, (rec_backspace - base_backspace) / base_backspace * 100.0) if base_backspace > 0 else (rec_backspace * 100.0 if rec_backspace > 0 else 0.0)
    
    hold_increase_pct = max(0.0, (rec_hold - base_hold) / base_hold * 100.0) if base_hold > 0 else 0.0
    flight_increase_pct = max(0.0, (rec_flight - base_flight) / base_flight * 100.0) if base_flight > 0 else 0.0
    response_slowing_pct = max(hold_increase_pct, flight_increase_pct)

    speed_points = min(40.0, (speed_drop_pct / 30.0) * 40.0) if speed_drop_pct > 0 else 0.0
    backspace_points = min(30.0, (backspace_increase_pct / 50.0) * 30.0) if backspace_increase_pct > 0 else 0.0
    slowing_points = min(30.0, (response_slowing_pct / 40.0) * 30.0) if response_slowing_pct > 0 else 0.0

    risk_score = round(speed_points + backspace_points + slowing_points, 1)
    risk_score = min(100.0, max(0.0, risk_score))

    warning = risk_score >= 40.0
    level = "none"
    if risk_score >= 70.0:
        level = "high"
    elif risk_score >= 40.0:
        level = "medium"
        
    return {
        "warning": warning,
        "level": level,
        "risk_score": risk_score,
        "deviations": {
            "speed_drop_pct": round(speed_drop_pct, 1),
            "backspace_increase_pct": round(backspace_increase_pct, 1),
            "response_slowing_pct": round(response_slowing_pct, 1)
        }
    }

def analyze_user_risk(db: Session, user_id: int) -> dict:
    """
    Combines Signal 1 (Manual Checkin) and Signal 2 (Keystroke Baseline) to form a dual-signal assessment.
    """
    latest_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == user_id
    ).order_by(desc(CheckIn.created_at)).first()
    
    if latest_checkin:
        signal1 = analyze_checkin(db, user_id, latest_checkin)
    else:
        signal1 = {
            "warning": False,
            "level": "none",
            "triggers": [],
            "is_crisis": False,
            "message": "No check-ins recorded yet."
        }
        
    signal2 = analyze_behavioral_risk(db, user_id)
    
    # Combined alert logic:
    # - If EITHER signal warns -> 'medium' alert
    # - If BOTH signals warn -> 'high' alert
    # - If crisis detected in Signal 1 -> always 'high' warning and is_crisis = True
    is_crisis = signal1.get("is_crisis", False)
    warning = signal1["warning"] or signal2["warning"]
    
    combined_level = "none"
    if is_crisis:
        combined_level = "high"
    elif signal1["warning"] and signal2["warning"]:
        combined_level = "high"
    elif signal1["warning"] or signal2["warning"]:
        combined_level = "medium"
        
    explanation = build_explanation(signal1, signal2)
    
    return {
        "warning": warning,
        "level": combined_level,
        "is_crisis": is_crisis,
        "signal1": signal1,
        "signal2": signal2,
        "explanation": explanation
    }

def build_explanation(signal1: dict, signal2: dict) -> str:
    """
    Builds a supportive, non-clinical summary of indicators detected by both signals.
    """
    reasons = []
    if signal1["warning"]:
        for trigger in signal1["triggers"]:
            reasons.append(trigger)
    if signal2["warning"]:
        devs = signal2["deviations"]
        if devs.get("speed_drop_pct", 0) >= 30:
            reasons.append(f"Typing speed decreased significantly ({devs['speed_drop_pct']}% drop from baseline)")
        if devs.get("backspace_increase_pct", 0) >= 50:
            reasons.append(f"Typing corrections increased significantly ({devs['backspace_increase_pct']}% more corrections)")
        if devs.get("response_slowing_pct", 0) >= 40:
            reasons.append(f"Response delay or typing pattern pause duration increased ({devs['response_slowing_pct']}% slower)")
            
    if not reasons:
        return "All parameters are within normal baseline ranges. We're keeping a supportive eye out for you."
        
    explanation_str = "We noticed: " + "; ".join(reasons) + "."
    return explanation_str

