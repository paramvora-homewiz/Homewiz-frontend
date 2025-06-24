from datetime import datetime, timedelta
import random
import json
from sqlalchemy.orm import Session
from app.db.connection import SessionLocal, create_tables
from app.models.models import Operator, Building, Room, Tenant, Lead

def populate_operators(db: Session):
    operators = [
        {'name': 'John Manager', 'email': 'john.manager@homewiz.com', 'phone': '(415)555-0101', 'role': 'Property Manager', 'operator_type': 'BUILDING_MANAGER'},
        {'name': 'Sarah Admin', 'email': 'sarah.admin@homewiz.com', 'phone': '(415)555-0102', 'role': 'Assistant Manager', 'operator_type': 'ADMIN'},
        {'name': 'Mike Maintenance', 'email': 'mike.maintenance@homewiz.com', 'phone': '(415)555-0103', 'role': 'Maintenance', 'operator_type': 'MAINTENANCE'},
        {'name': 'Lisa Leasing', 'email': 'lisa.leasing@homewiz.com', 'phone': '(415)555-0104', 'role': 'Leasing Agent', 'operator_type': 'LEASING_AGENT'},
        {'name': 'Tom Support', 'email': 'tom.support@homewiz.com', 'phone': '(415)555-0105', 'role': 'Leasing Agent', 'operator_type': 'LEASING_AGENT'}
    ]
    for i, operator_data in enumerate(operators, 1):
        operator = Operator(
            operator_id=i,
            **operator_data,
            date_joined=datetime.now().date() - timedelta(days=180),
            last_active=datetime.now().date()
        )
        db.add(operator)
    db.commit()
    print("Operators populated.")

def populate_buildings(db: Session):
    buildings = [
        {
            'building_id': 'BLD_MARKET',
            'building_name': 'Market Street Residences',
            'full_address': '1000 Market St',
            'operator_id': 1,
            'street': 'Market St',
            'area': 'Downtown',
            'city': 'San Francisco',
            'state': 'CA',
            'zip': '94102',
            'floors': 8,
            'total_rooms': 20,
            'total_bathrooms': 16,
            'wifi_included': True,
            'laundry_onsite': True
        },
        {
            'building_id': 'BLD_SOMA',
            'building_name': 'SoMA Commons',
            'full_address': '500 Harrison St',
            'operator_id': 2,
            'street': 'Harrison St',
            'area': 'SoMA',
            'city': 'San Francisco',
            'state': 'CA',
            'zip': '94105',
            'floors': 6,
            'total_rooms': 15,
            'total_bathrooms': 12,
            'wifi_included': True,
            'laundry_onsite': True
        },
        {
            'building_id': 'BLD_MISSION',
            'building_name': 'Mission Heights',
            'full_address': '2500 Mission St',
            'operator_id': 3,
            'street': 'Mission St',
            'area': 'Mission',
            'city': 'San Francisco',
            'state': 'CA',
            'zip': '94110',
            'floors': 5,
            'total_rooms': 15,
            'total_bathrooms': 10,
            'wifi_included': True,
            'laundry_onsite': True
        }
    ]
    for building_data in buildings:
        building = Building(**building_data)
        db.add(building)
    db.commit()
    print("Buildings populated.")

def populate_rooms(db: Session):
    buildings = db.query(Building).all()
    room_features = {
        'Downtown': {'base_rent': 2200, 'premium': 1.3},
        'SoMA': {'base_rent': 1900, 'premium': 1.2},
        'Mission': {'base_rent': 1700, 'premium': 1.1}
    }
    
    for building in buildings:
        area = building.area
        floors = building.floors
        base_rent = room_features[area]['base_rent']
        premium = room_features[area]['premium']
        rooms_per_floor = building.total_rooms // floors
        
        for floor in range(1, floors + 1):
            for room_num in range(1, rooms_per_floor + 1):
                room_number = f"{floor}{str(room_num).zfill(2)}"
                room_id = f"{building.building_id}_R{room_number}"
                floor_premium = 1 + (floor - 1) * 0.05
                private_rent = base_rent * premium * floor_premium
                
                room = Room(
                    room_id=room_id,
                    room_number=room_number,
                    building_id=building.building_id,
                    floor_number=floor,
                    maximum_people_in_room=random.choice([1, 2]),
                    private_room_rent=private_rent,
                    bathroom_type=random.choice(['Private', 'En-Suite', 'Shared']),
                    bed_size=random.choice(['Twin', 'Full', 'Queen']),
                    bed_type=random.choice(['Single', 'Platform']),
                    view=random.choice(['Street', 'City', 'Bay', 'Garden']),
                    sq_footage=random.randint(200, 400),
                    status='AVAILABLE'
                )
                db.add(room)
    db.commit()
    print("Rooms populated.")

def populate_leads(db: Session):
    available_rooms = db.query(Room).filter(Room.status == 'AVAILABLE').limit(5).all()
    leads_data = [
        {
            'lead_id': 'LEAD_001',
            'email': 'sarah.smith@email.com',
            'status': 'EXPLORING',
            'interaction_count': 2,
            'rooms_interested': json.dumps([available_rooms[0].room_id if available_rooms else None]),
            'visa_status': 'US-CITIZEN'
        },
        {
            'lead_id': 'LEAD_002',
            'email': 'john.doe@email.com',
            'status': 'EXPLORING',
            'interaction_count': 5,
            'rooms_interested': json.dumps([r.room_id for r in available_rooms[0:3] if available_rooms]),
            'visa_status': 'F1-VISA'
        },
        {
            'lead_id': 'LEAD_003',
            'email': 'emily.wong@email.com',
            'status': 'SHOWING_SCHEDULED',
            'interaction_count': 8,
            'rooms_interested': json.dumps([r.room_id for r in available_rooms[1:3] if available_rooms]),
            'selected_room_id': available_rooms[1].room_id if len(available_rooms) > 1 else None,
            'showing_dates': json.dumps(['2024-12-20 14:00:00', '2024-12-21 11:00:00']),
            'planned_move_in': '2025-01-15',
            'planned_move_out': '2025-07-15',
            'visa_status': 'H1B-VISA'
        }
    ]
    
    for lead_data in leads_data:
        lead = Lead(**lead_data)
        db.add(lead)
    db.commit()
    print("Leads populated.")

if __name__ == "__main__":
    print("Creating database tables...")
    create_tables()
    
    print("Starting database seeding...")
    db = SessionLocal()
    try:
        populate_operators(db)
        populate_buildings(db)
        populate_rooms(db)
        populate_leads(db)
        print("Database seeding completed successfully!")
    finally:
        db.close()
