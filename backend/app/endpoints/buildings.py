from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.models.models import Building
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class BuildingCreate(BaseModel):
    building_id: str
    building_name: str
    full_address: Optional[str] = None
    operator_id: Optional[int] = None
    street: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    floors: Optional[int] = None
    total_rooms: Optional[int] = None
    total_bathrooms: Optional[int] = None
    wifi_included: Optional[bool] = True
    laundry_onsite: Optional[bool] = True

@router.get("/buildings", response_model=List[dict])
async def get_buildings(db: Session = Depends(get_db)):
    """Get all buildings"""
    try:
        buildings = db.query(Building).all()
        return [
            {
                "id": building.id,
                "building_id": building.building_id,
                "building_name": building.building_name,
                "full_address": building.full_address,
                "area": building.area,
                "city": building.city,
                "state": building.state,
                "zip": building.zip,
                "floors": building.floors,
                "total_rooms": building.total_rooms,
                "total_bathrooms": building.total_bathrooms,
                "wifi_included": building.wifi_included,
                "laundry_onsite": building.laundry_onsite,
            }
            for building in buildings
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/buildings/{building_id}")
async def get_building(building_id: str, db: Session = Depends(get_db)):
    """Get a specific building by ID"""
    building = db.query(Building).filter(Building.building_id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    return {
        "id": building.id,
        "building_id": building.building_id,
        "building_name": building.building_name,
        "full_address": building.full_address,
        "area": building.area,
        "city": building.city,
        "state": building.state,
        "zip": building.zip,
        "floors": building.floors,
        "total_rooms": building.total_rooms,
        "total_bathrooms": building.total_bathrooms,
        "wifi_included": building.wifi_included,
        "laundry_onsite": building.laundry_onsite,
    }

@router.post("/buildings")
async def create_building(building_data: BuildingCreate, db: Session = Depends(get_db)):
    """Create a new building"""
    try:
        # Check if building with same ID already exists
        existing_building = db.query(Building).filter(Building.building_id == building_data.building_id).first()
        if existing_building:
            raise HTTPException(status_code=400, detail="Building with this ID already exists")

        building = Building(**building_data.dict())
        db.add(building)
        db.commit()
        db.refresh(building)

        return {
            "success": True,
            "message": "Building created successfully",
            "building_id": building.building_id
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
