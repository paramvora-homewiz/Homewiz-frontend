-- Migration: Add new fields for RoomPoCForm
-- Date: 2024-12-02
-- Description: Adds columns to support the new room form with beds configuration,
--              amenities, maintenance tracking, and utilities

-- Add new columns to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS max_beds INTEGER DEFAULT 1;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS beds_configuration JSONB DEFAULT '[]'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_amenities JSONB DEFAULT '{}'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS custom_amenities TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_photos JSONB DEFAULT '[]'::jsonb;

-- Maintenance tracking fields
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_check_date DATE;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_maintenance_staff_id TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_renovation_date DATE;

-- Room condition fields
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_condition_score INTEGER CHECK (room_condition_score >= 1 AND room_condition_score <= 10);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS cleaning_frequency TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS utilities_meter_id TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_cleaning_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN rooms.max_beds IS 'Maximum number of beds in the room (1-6)';
COMMENT ON COLUMN rooms.beds_configuration IS 'JSON array of bed configurations with name, type, view, rent, occupancy, booking info';
COMMENT ON COLUMN rooms.room_amenities IS 'JSON object with room amenities: miniFridge, sink, beddingProvided, workDesk, etc.';
COMMENT ON COLUMN rooms.custom_amenities IS 'Additional custom amenities text';
COMMENT ON COLUMN rooms.room_photos IS 'JSON array of room photo URLs';
COMMENT ON COLUMN rooms.last_check_date IS 'Date of last room check/inspection';
COMMENT ON COLUMN rooms.last_maintenance_staff_id IS 'ID of staff who did the last maintenance';
COMMENT ON COLUMN rooms.last_renovation_date IS 'Date of last room renovation';
COMMENT ON COLUMN rooms.room_condition_score IS 'Overall condition rating 1-10 (10 being excellent)';
COMMENT ON COLUMN rooms.cleaning_frequency IS 'How often the room is professionally cleaned: Daily, Weekly, Bi-weekly, Monthly, As needed';
COMMENT ON COLUMN rooms.utilities_meter_id IS 'Unique identifier for utilities metering';
COMMENT ON COLUMN rooms.last_cleaning_date IS 'Date of last professional cleaning';

-- Create index for faster queries on new fields
CREATE INDEX IF NOT EXISTS idx_rooms_max_beds ON rooms(max_beds);
CREATE INDEX IF NOT EXISTS idx_rooms_room_condition_score ON rooms(room_condition_score);
CREATE INDEX IF NOT EXISTS idx_rooms_cleaning_frequency ON rooms(cleaning_frequency);
