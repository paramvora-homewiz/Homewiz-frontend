from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.models.models import Lead
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class LeadCreate(BaseModel):
    email: str
    status: Optional[str] = "EXPLORING"
    rooms_interested: Optional[str] = None
    visa_status: Optional[str] = None

@router.get("/leads", response_model=List[dict])
async def get_leads(db: Session = Depends(get_db)):
    """Get all leads"""
    try:
        leads = db.query(Lead).all()
        return [
            {
                "id": lead.id,
                "lead_id": lead.lead_id,
                "email": lead.email,
                "status": lead.status,
                "interaction_count": lead.interaction_count,
                "rooms_interested": lead.rooms_interested,
                "selected_room_id": lead.selected_room_id,
                "showing_dates": lead.showing_dates,
                "planned_move_in": lead.planned_move_in,
                "planned_move_out": lead.planned_move_out,
                "visa_status": lead.visa_status,
            }
            for lead in leads
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leads")
async def create_lead(lead_data: LeadCreate, db: Session = Depends(get_db)):
    """Create a new lead"""
    try:
        # Check if lead with email already exists
        existing_lead = db.query(Lead).filter(Lead.email == lead_data.email).first()
        if existing_lead:
            return {
                "success": True,
                "message": "Lead already exists",
                "lead_id": existing_lead.lead_id
            }
        
        # Generate lead ID
        lead_count = db.query(Lead).count()
        lead_id = f"LEAD_{str(lead_count + 1).zfill(3)}"
        
        lead = Lead(
            lead_id=lead_id,
            **lead_data.dict()
        )
        
        db.add(lead)
        db.commit()
        db.refresh(lead)
        
        return {
            "success": True,
            "message": "Lead created successfully",
            "lead_id": lead.lead_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
