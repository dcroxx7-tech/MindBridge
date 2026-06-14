import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Fallback to /tmp for serverless environments (like Vercel) which have read-only filesystems
default_db_path = "sqlite:////tmp/mindbridge.db" if os.getenv("VERCEL") else "sqlite:///./mindbridge.db"
DATABASE_URL = os.getenv("DATABASE_URL", default_db_path)

# connect_args={"check_same_thread": False} is required only for SQLite
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
