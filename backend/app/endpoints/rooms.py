from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.models.models import Room
from typing import List, Optional

router = APIRouter()

@router.get("/rooms", response_model=List[dict])
async def get_rooms(
    building_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all rooms, optionally filtered by building_id"""
    try:
        query = db.query(Room)
        if building_id:
            query = query.filter(Room.building_id == building_id)
        
        rooms = query.all()
        return [
            {
                "id": room.id,
                "room_id": room.room_id,
                "room_number": room.room_number,
                "building_id": room.building_id,
                "floor_number": room.floor_number,
                "maximum_people_in_room": room.maximum_people_in_room,
                "private_room_rent": room.private_room_rent,
                "bathroom_type": room.bathroom_type,
                "bed_size": room.bed_size,
                "bed_type": room.bed_type,
                "view": room.view,
                "sq_footage": room.sq_footage,
                "status": room.status,
            }
            for room in rooms
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rooms/{room_id}")
async def get_room(room_id: str, db: Session = Depends(get_db)):
    """Get a specific room by ID"""
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {
        "id": room.id,
        "room_id": room.room_id,
        "room_number": room.room_number,
        "building_id": room.building_id,
        "floor_number": room.floor_number,
        "maximum_people_in_room": room.maximum_people_in_room,
        "private_room_rent": room.private_room_rent,
        "bathroom_type": room.bathroom_type,
        "bed_size": room.bed_size,
        "bed_type": room.bed_type,
        "view": room.view,
        "sq_footage": room.sq_footage,
        "status": room.status,
    }
