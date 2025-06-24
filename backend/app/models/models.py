from sqlalchemy import Column, Integer, String, Boolean, Date, Float, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Operator(Base):
    __tablename__ = "operators"

    operator_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String)
    role = Column(String)
    active = Column(Boolean, default=True)
    date_joined = Column(Date)
    last_active = Column(Date)
    operator_type = Column(String, default="LEASING_AGENT")

class Building(Base):
    __tablename__ = "buildings"
    
    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(String, unique=True, nullable=False, index=True)
    building_name = Column(String, nullable=False)
    full_address = Column(String)
    operator_id = Column(Integer, ForeignKey("operators.operator_id"))
    street = Column(String)
    area = Column(String)
    city = Column(String)
    state = Column(String)
    zip = Column(String)
    floors = Column(Integer)
    total_rooms = Column(Integer)
    total_bathrooms = Column(Integer)
    wifi_included = Column(Boolean, default=True)
    laundry_onsite = Column(Boolean, default=True)
    
    # Relationship
    operator = relationship("Operator")
    rooms = relationship("Room", back_populates="building")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, unique=True, nullable=False, index=True)
    room_number = Column(String, nullable=False)
    building_id = Column(String, ForeignKey("buildings.building_id"))
    floor_number = Column(Integer)
    maximum_people_in_room = Column(Integer, default=1)
    private_room_rent = Column(Float)
    bathroom_type = Column(String)
    bed_size = Column(String)
    bed_type = Column(String)
    view = Column(String)
    sq_footage = Column(Integer)
    status = Column(String, default="AVAILABLE")
    
    # Relationship
    building = relationship("Building", back_populates="rooms")

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, unique=True, nullable=False, index=True)
    tenant_name = Column(String, nullable=False)
    room_id = Column(String, ForeignKey("rooms.room_id"))
    room_number = Column(String)
    lease_start_date = Column(Date)
    lease_end_date = Column(Date)
    operator_id = Column(Integer, ForeignKey("operators.operator_id"))
    booking_type = Column(String)
    tenant_nationality = Column(String)
    tenant_email = Column(String)
    phone = Column(String)
    building_id = Column(String)
    status = Column(String, default="ACTIVE")
    deposit_amount = Column(Float)
    payment_status = Column(String, default="CURRENT")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=False)
    status = Column(String, default="EXPLORING")
    interaction_count = Column(Integer, default=0)
    rooms_interested = Column(Text)  # JSON string
    selected_room_id = Column(String)
    showing_dates = Column(Text)  # JSON string
    planned_move_in = Column(String)
    planned_move_out = Column(String)
    visa_status = Column(String)
