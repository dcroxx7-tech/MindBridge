import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Import database engine and base
from database import engine, Base

# Import models to register them on Base metadata for tables creation
from models.user import User
from models.checkin import CheckIn
from models.conversation import Conversation
from models.saved_resource import SavedResource
from models.behavioral import BehavioralSession

# Create database tables
Base.metadata.create_all(bind=engine)

# Import routes
from routes import auth, checkin, chat, resources, behavioral

app = FastAPI(
    title="MindBridge API",
    description="Agentic AI Mental Health Support System - FAR AWAY 2026 Hackathon",
    version="1.0.0"
)

# Configure CORS
# React Vite runs on http://localhost:5173 by default, and CRA runs on http://localhost:3000
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "*")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(checkin.router)
app.include_router(chat.router)
app.include_router(resources.router)
app.include_router(behavioral.router)

@app.get("/")
def read_root():
    return {
        "name": "MindBridge API",
        "description": "Agentic AI mental health support platform",
        "status": "healthy",
        "agents": {
            "Agent 1": "SentinelAI (Pattern Detection)",
            "Agent 2": "CompanionAI (CBT Support)",
            "Agent 3": "BridgeAI (Resource Connector)"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
