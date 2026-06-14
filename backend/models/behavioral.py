import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from database import Base

class BehavioralSession(Base):
    __tablename__ = "behavioral_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    # Keystroke dynamics metrics (No text stored!)
    avg_hold_time_ms = Column(Float, nullable=False)
    avg_flight_time_ms = Column(Float, nullable=False)
    typing_speed_wpm = Column(Float, nullable=False)
    backspace_rate = Column(Float, nullable=False)
    pause_frequency = Column(Float, nullable=False)
    session_duration_ms = Column(Float, nullable=False)
    total_keystrokes = Column(Integer, nullable=False)
