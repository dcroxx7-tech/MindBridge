import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(String, nullable=False)
    is_crisis = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
