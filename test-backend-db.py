#!/usr/bin/env python3

"""
Test Backend Database Connection and Schema
This script tests if the FastAPI backend is using the same tables as Supabase
"""

import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()

# Use the same connection as the backend
DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

def test_backend_database():
    print("🔍 Testing Backend Database Connection and Schema...\n")
    
    try:
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Backend database connection successful!")
            
            # Check what tables exist
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"\n📊 Found {len(tables)} tables in database:")
            for table in sorted(tables):
                print(f"   - {table}")
            
            # Check if our expected tables exist
            expected_tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads']
            print(f"\n🔍 Checking for expected tables:")
            for table in expected_tables:
                if table in tables:
                    print(f"   ✅ {table} - EXISTS")
                    
                    # Get column info
                    columns = inspector.get_columns(table)
                    print(f"      Columns: {[col['name'] for col in columns[:5]]}{'...' if len(columns) > 5 else ''}")
                else:
                    print(f"   ❌ {table} - MISSING")
            
            # Test data in buildings table
            print(f"\n🏢 Testing buildings table data:")
            try:
                result = conn.execute(text("SELECT building_id, building_name FROM buildings LIMIT 3"))
                buildings = result.fetchall()
                print(f"   Found {len(buildings)} buildings:")
                for building in buildings:
                    print(f"   - {building[0]}: {building[1]}")
            except Exception as e:
                print(f"   ❌ Error querying buildings: {e}")
            
            # Test creating a new building via SQL
            print(f"\n🔧 Testing direct SQL insert:")
            try:
                # Insert a test building
                insert_sql = text("""
                    INSERT INTO buildings (building_id, building_name, full_address, operator_id, available, created_at, last_modified)
                    VALUES (:building_id, :building_name, :full_address, :operator_id, :available, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING building_id, building_name
                """)
                
                result = conn.execute(insert_sql, {
                    'building_id': 'TEST_BACKEND_001',
                    'building_name': 'Backend Test Building',
                    'full_address': '123 Backend Test St',
                    'operator_id': 1,
                    'available': True
                })
                
                new_building = result.fetchone()
                print(f"   ✅ Created test building: {new_building[0]} - {new_building[1]}")
                
                # Clean up - delete the test building
                conn.execute(text("DELETE FROM buildings WHERE building_id = 'TEST_BACKEND_001'"))
                conn.commit()
                print(f"   🧹 Cleaned up test building")
                
            except Exception as e:
                print(f"   ❌ Error with SQL insert: {e}")
                
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    test_backend_database()
