from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import (admin, auth, bookings, companions, favorites, messaging,
                      notifications, safety)
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Pamoja API",
    description="Kenya's platonic travel companionship platform — strictly platonic, purely social.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(companions.router)
app.include_router(bookings.router)
app.include_router(messaging.router)
app.include_router(safety.router)
app.include_router(favorites.router)
app.include_router(notifications.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok", "app": "Pamoja API"}