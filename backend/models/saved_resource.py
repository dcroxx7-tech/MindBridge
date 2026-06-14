import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base

class SavedResource(Base):
    __tablename__ = "saved_resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_name = Column(String, nullable=False)
    resource_url = Column(String, nullable=True)
    resource_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
