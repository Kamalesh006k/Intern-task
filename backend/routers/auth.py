from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
import models, schemas, database
import auth as auth_utils
import os

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register", response_model=schemas.User)
def create_user_account(user_data: schemas.UserCreate, db_session: Session = Depends(database.get_database_session)):
    existing_user = db_session.query(models.User).filter(
        (models.User.username == user_data.username) | (models.User.email == user_data.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Registration failed: User already exists")
    
    secure_password = auth_utils.hash_passwd(user_data.password)
    new_user_record = models.User(username=user_data.username, email=user_data.email, hashed_password=secure_password)
    db_session.add(new_user_record)
    db_session.commit()
    db_session.refresh(new_user_record)
    return new_user_record

@router.post("/login", response_model=schemas.Token)
def authenticate_user(login_data: OAuth2PasswordRequestForm = Depends(), db_session: Session = Depends(database.get_database_session)):
    user_record = db_session.query(models.User).filter(models.User.username == login_data.username).first()
    if not user_record or not auth_utils.verify_passwd(login_data.password, user_record.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_expiry = timedelta(minutes=auth_utils.TOKEN_EXPIRE_MINUTES)
    auth_token = auth_utils.generate_access_token(
        data={"sub": user_record.username}, expires_delta=token_expiry
    )
    return {"access_token": auth_token, "token_type": "bearer"}

@router.post("/google", response_model=schemas.Token)
def google_authentication(token_payload: dict, db_session: Session = Depends(database.get_database_session)):
    g_token = token_payload.get("token")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")

    try:
        id_info = id_token.verify_oauth2_token(g_token, requests.Request(), GOOGLE_CLIENT_ID)
        user_email = id_info['email']
        user_name = user_email.split('@')[0]
        
        user_record = db_session.query(models.User).filter(models.User.email == user_email).first()
        
        if not user_record:
            random_secret = os.urandom(24).hex()
            secure_pwd = auth_utils.hash_passwd(random_secret)
            user_record = models.User(username=user_name, email=user_email, hashed_password=secure_pwd)
            db_session.add(user_record)
            db_session.commit()
            db_session.refresh(user_record)
            
        token_expiry = timedelta(minutes=auth_utils.TOKEN_EXPIRE_MINUTES)
        auth_token = auth_utils.generate_access_token(
            data={"sub": user_record.username}, expires_delta=token_expiry
        )
        return {"access_token": auth_token, "token_type": "bearer", "username": user_record.username}
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
