from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import db_engine, Base
from routers import auth, tasks, profile, analytics, websocket, chat
import os

Base.metadata.create_all(bind=db_engine)

app = FastAPI(title="Primetrade API")

os.makedirs("uploads/avatars", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(profile.router)
app.include_router(analytics.router)
app.include_router(websocket.router)
app.include_router(chat.router)

@app.get("/")
def api_status_check():
    return {"status": "ok", "service": "Primetrade API Running"}
