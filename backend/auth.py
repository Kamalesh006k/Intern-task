from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import schemas, database, models
import os
import bcrypt

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY_VAL = os.getenv("SECRET_KEY")
if not SECRET_KEY_VAL:
    raise ValueError("SECRET_KEY is not set in environment variables")
JWT_ALGO = "HS256"
TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_passwd(plain, hashed):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def hash_passwd(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    encode_data = data.copy()
    if expires_delta:
        expire_time = datetime.utcnow() + expires_delta
    else:
        expire_time = datetime.utcnow() + timedelta(minutes=15)
    encode_data.update({"exp": expire_time})
    jwt_token = jwt.encode(encode_data, SECRET_KEY_VAL, algorithm=JWT_ALGO)
    return jwt_token

def retrieve_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_database_session)):
    cred_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        decoded = jwt.decode(token, SECRET_KEY_VAL, algorithms=[JWT_ALGO])
        username: str = decoded.get("sub")
        if username is None:
            raise cred_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise cred_exception
    
    user_record = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user_record is None:
        raise cred_exception
    return user_record
