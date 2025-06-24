from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.models.models import Operator
from typing import List
from pydantic import BaseModel
from datetime import date

router = APIRouter()

class OperatorCreate(BaseModel):
    name: str
    email: str
    phone: str = None
    role: str = None
    operator_type: str = "LEASING_AGENT"
    active: bool = True

@router.post("/operators")
async def create_operator(operator_data: OperatorCreate, db: Session = Depends(get_db)):
    """Create a new operator"""
    try:
        # Check if operator with same email already exists
        existing_operator = db.query(Operator).filter(Operator.email == operator_data.email).first()
        if existing_operator:
            raise HTTPException(status_code=400, detail="Operator with this email already exists")

        # Create new operator
        operator = Operator(
            name=operator_data.name,
            email=operator_data.email,
            phone=operator_data.phone,
            role=operator_data.role,
            operator_type=operator_data.operator_type,
            active=operator_data.active,
            date_joined=date.today(),
            last_active=date.today()
        )

        db.add(operator)
        db.commit()
        db.refresh(operator)

        return {
            "success": True,
            "message": "Operator created successfully",
            "operator_id": operator.operator_id,
            "data": {
                "operator_id": operator.operator_id,
                "name": operator.name,
                "email": operator.email,
                "phone": operator.phone,
                "role": operator.role,
                "active": operator.active,
                "operator_type": operator.operator_type,
                "date_joined": operator.date_joined.isoformat() if operator.date_joined else None,
                "last_active": operator.last_active.isoformat() if operator.last_active else None,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/operators", response_model=List[dict])
async def get_operators(db: Session = Depends(get_db)):
    """Get all operators"""
    try:
        operators = db.query(Operator).all()
        return [
            {
                "operator_id": operator.operator_id,
                "name": operator.name,
                "email": operator.email,
                "phone": operator.phone,
                "role": operator.role,
                "active": operator.active,
                "operator_type": operator.operator_type,
                "date_joined": operator.date_joined.isoformat() if operator.date_joined else None,
                "last_active": operator.last_active.isoformat() if operator.last_active else None,
            }
            for operator in operators
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/operators/{operator_id}")
async def get_operator(operator_id: int, db: Session = Depends(get_db)):
    """Get a specific operator by ID"""
    operator = db.query(Operator).filter(Operator.operator_id == operator_id).first()
    if not operator:
        raise HTTPException(status_code=404, detail="Operator not found")
    
    return {
        "operator_id": operator.operator_id,
        "name": operator.name,
        "email": operator.email,
        "phone": operator.phone,
        "role": operator.role,
        "active": operator.active,
        "operator_type": operator.operator_type,
        "date_joined": operator.date_joined.isoformat() if operator.date_joined else None,
        "last_active": operator.last_active.isoformat() if operator.last_active else None,
    }
