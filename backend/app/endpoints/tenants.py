from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.models.models import Tenant
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

class TenantCreate(BaseModel):
    tenant_name: str
    room_id: str
    room_number: str
    lease_start_date: date
    lease_end_date: date
    operator_id: int
    booking_type: str
    tenant_nationality: str
    tenant_email: str
    phone: Optional[str] = None
    building_id: str
    deposit_amount: float

@router.get("/tenants", response_model=List[dict])
async def get_tenants(db: Session = Depends(get_db)):
    """Get all tenants"""
    try:
        tenants = db.query(Tenant).all()
        return [
            {
                "id": tenant.id,
                "tenant_id": tenant.tenant_id,
                "tenant_name": tenant.tenant_name,
                "room_id": tenant.room_id,
                "room_number": tenant.room_number,
                "lease_start_date": tenant.lease_start_date.isoformat() if tenant.lease_start_date else None,
                "lease_end_date": tenant.lease_end_date.isoformat() if tenant.lease_end_date else None,
                "operator_id": tenant.operator_id,
                "booking_type": tenant.booking_type,
                "tenant_nationality": tenant.tenant_nationality,
                "tenant_email": tenant.tenant_email,
                "phone": tenant.phone,
                "building_id": tenant.building_id,
                "status": tenant.status,
                "deposit_amount": tenant.deposit_amount,
                "payment_status": tenant.payment_status,
            }
            for tenant in tenants
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tenants")
async def create_tenant(tenant_data: TenantCreate, db: Session = Depends(get_db)):
    """Create a new tenant"""
    try:
        # Generate tenant ID
        tenant_count = db.query(Tenant).count()
        tenant_id = f"TNT_{str(tenant_count + 1).zfill(3)}"
        
        tenant = Tenant(
            tenant_id=tenant_id,
            **tenant_data.dict()
        )
        
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        return {
            "success": True,
            "message": "Tenant created successfully",
            "tenant_id": tenant.tenant_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
