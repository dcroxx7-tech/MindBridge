from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel

from database import get_db
from routes.auth import get_current_user
from models.user import User
from models.saved_resource import SavedResource
from agents.bridge import get_resources, get_recommendations

router = APIRouter(prefix="/api/resources", tags=["resources"])

class SavedResourceCreate(BaseModel):
    resource_name: str
    resource_url: Optional[str] = None
    resource_phone: Optional[str] = None

class SavedResourceResponse(BaseModel):
    id: int
    user_id: int
    resource_name: str
    resource_url: Optional[str]
    resource_phone: Optional[str]

    class Config:
        from_attributes = True

@router.get("/")
def list_resources(
    country: Optional[str] = None,
    language: Optional[str] = None,
    crisis: Optional[bool] = None,
    cost: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # If no parameters, default to user's parameters
    filter_country = country or current_user.country
    filter_language = language or current_user.language
    
    return get_resources(
        country=filter_country,
        language=filter_language,
        is_crisis=crisis,
        cost=cost
    )

@router.get("/recommendations/{user_id}")
def get_user_recommendations(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access recommendations for another user"
        )
        
    user_context = {
        "country": current_user.country,
        "language": current_user.language,
        "is_crisis": False # default to false, agents/bridge will adjust based on db query if needed
    }
    
    # Check if user has active warnings
    from models.checkin import CheckIn
    from sqlalchemy import desc
    
    latest_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == user_id
    ).order_by(desc(CheckIn.created_at)).first()
    
    if latest_checkin and latest_checkin.warning_level in ["medium", "high"]:
        user_context["is_crisis"] = True
        
    return get_recommendations(user_context)

@router.post("/save", response_model=SavedResourceResponse)
def save_resource(
    resource: SavedResourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if already saved
    existing = db.query(SavedResource).filter(
        SavedResource.user_id == current_user.id,
        SavedResource.resource_name == resource.resource_name
    ).first()
    
    if existing:
        return existing
        
    db_saved = SavedResource(
        user_id=current_user.id,
        resource_name=resource.resource_name,
        resource_url=resource.resource_url,
        resource_phone=resource.resource_phone
    )
    db.add(db_saved)
    db.commit()
    db.refresh(db_saved)
    return db_saved

@router.get("/saved/{user_id}", response_model=List[SavedResourceResponse])
def get_saved_resources(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access saved resources of another user"
        )
        
    return db.query(SavedResource).filter(
        SavedResource.user_id == user_id
    ).order_by(desc(SavedResource.created_at)).all()

@router.delete("/saved/{resource_id}")
def unsave_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resource = db.query(SavedResource).filter(
        SavedResource.id == resource_id,
        SavedResource.user_id == current_user.id
    ).first()
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved resource not found"
        )
        
    db.delete(resource)
    db.commit()
    return {"detail": "Resource removed from saved list"}
