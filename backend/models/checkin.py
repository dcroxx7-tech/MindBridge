import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from database import Base

class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood_score = Column(Integer, nullable=False)  # 1-10
    sleep_hours = Column(Float, nullable=False)
    social_score = Column(Integer, nullable=False)  # 1-5
    energy_level = Column(Integer, nullable=False)  # 1-5
    journal_text = Column(String, nullable=True)
    warning_level = Column(String, default="none")  # none, low, medium, high
    warning_triggers = Column(String, nullable=True)  # JSON string list of triggers
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
