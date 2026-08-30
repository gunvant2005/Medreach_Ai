import os
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db
from app.seed import seed_database
from app.routers import (
    auth,
    medicines,
    pharmacies,
    prescriptions,
    reservations,
    notifications,
    analytics
)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        with Session(bind=engine) as db_session:
            from app.models import User
            if db_session.query(User).count() == 0:
                seed_database(db_session)
    except Exception as err:
        print("Database initialization note:", err)

init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Medicine Availability & Pharmacy Network API with Prescriptions AI and Shortage Intelligence.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Next.js frontend or any client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded prescription images
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(medicines.router, prefix=settings.API_V1_STR)
app.include_router(pharmacies.router, prefix=settings.API_V1_STR)
app.include_router(prescriptions.router, prefix=settings.API_V1_STR)
app.include_router(reservations.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "tagline": "Find the right medicine. Find it nearby. Save valuable time.",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.post("/api/seed")
def trigger_seed(db: Session = Depends(get_db)):
    seed_database(db)
    return {"success": True, "message": "Database successfully re-seeded with demo records."}
