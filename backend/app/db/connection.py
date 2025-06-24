from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for local development (fallback to PostgreSQL if configured)
DATABASE_URL = os.getenv("SUPABASE_DB_URL")
DATABASE_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")

if DATABASE_URL:
    # Use PostgreSQL/Supabase if configured
    engine = create_engine(DATABASE_URL)
else:
    # Fallback to SQLite for local development
    DATABASE_URL = "sqlite:///./homewiz_local.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    from app.models.models import Base
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    try:
        db_test = SessionLocal()
        db_test.execute(text("SELECT 1"))
        db_test.close()
        print("Database connection successful!")
    except Exception as e:
        print(f"Database connection failed: {e}")
