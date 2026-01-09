from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

from dotenv import load_dotenv

load_dotenv()

DB_CONNECTION_STRING = os.getenv("DATABASE_URL")
if not DB_CONNECTION_STRING:
    raise ValueError("DATABASE_URL is not set in environment variables")

print("-" * 30)
print(f"BOOTING DATABASE WITH: {DB_CONNECTION_STRING}")
print("-" * 30)

db_engine = create_engine(
    DB_CONNECTION_STRING, 
    pool_pre_ping=True,
    connect_args={"charset": "utf8mb4"}
)

LocalSession = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
Base = declarative_base()

def get_database_session():
    session = LocalSession()
    try:
        yield session
    finally:
        session.close()
