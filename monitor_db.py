#!/usr/bin/env python3
"""
Database Monitor Script for HomeWiz
Monitors database changes in real-time
"""

import psycopg2
import time
from datetime import datetime

def connect_to_db():
    """Connect to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="homewiz_local",
            user="kaushatrivedi",
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def get_table_counts(conn):
    """Get current count of records in each table"""
    cursor = conn.cursor()
    tables = ['buildings', 'rooms', 'operators', 'tenants', 'leads']
    counts = {}
    
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            counts[table] = cursor.fetchone()[0]
        except Exception as e:
            counts[table] = f"Error: {e}"
    
    cursor.close()
    return counts

def monitor_database():
    """Monitor database changes"""
    conn = connect_to_db()
    if not conn:
        return
    
    print("🔍 HomeWiz Database Monitor")
    print("=" * 50)
    print("Monitoring database changes... (Press Ctrl+C to stop)")
    print()
    
    previous_counts = None
    
    try:
        while True:
            current_counts = get_table_counts(conn)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Check for changes
            if previous_counts:
                changes_detected = False
                for table, count in current_counts.items():
                    if isinstance(count, int) and isinstance(previous_counts.get(table), int):
                        if count != previous_counts[table]:
                            change = count - previous_counts[table]
                            print(f"🔄 [{timestamp}] {table.upper()}: {previous_counts[table]} → {count} ({change:+d})")
                            changes_detected = True
                
                if not changes_detected:
                    print(f"✅ [{timestamp}] No changes detected")
            else:
                print(f"📊 [{timestamp}] Initial state:")
                for table, count in current_counts.items():
                    print(f"   {table.capitalize()}: {count}")
            
            previous_counts = current_counts.copy()
            time.sleep(5)  # Check every 5 seconds
            
    except KeyboardInterrupt:
        print("\n👋 Monitoring stopped")
    finally:
        conn.close()

if __name__ == "__main__":
    monitor_database()
