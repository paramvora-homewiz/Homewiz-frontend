from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.endpoints import buildings, rooms, tenants, leads, operators
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="HomeWiz Backend API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(buildings.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(tenants.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(operators.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "HomeWiz Backend API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
