from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database import get_database_session
from auth import retrieve_current_user
from models import User
from schemas import UserProfile, UserProfileUpdate
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/profile", tags=["Profile"])

AVATAR_DIR = Path("uploads/avatars")
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/me", response_model=UserProfile)
def retrieve_profile_info(active_user: User = Depends(retrieve_current_user)):
    return active_user

@router.put("/me", response_model=UserProfile)
def modify_profile_info(
    profile_data: UserProfileUpdate,
    active_user: User = Depends(retrieve_current_user),
    db_session: Session = Depends(get_database_session)
):
    updates = profile_data.model_dump(exclude_unset=True)
    
    for key, val in updates.items():
        setattr(active_user, key, val)
    
    db_session.commit()
    db_session.refresh(active_user)
    
    return active_user

@router.post("/avatar", response_model=UserProfile)
async def process_avatar_upload(
    image_file: UploadFile = File(...),
    active_user: User = Depends(retrieve_current_user),
    db_session: Session = Depends(get_database_session)
):
    valid_formats = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if image_file.content_type not in valid_formats:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    size_counter = 0
    read_chunk = 1024 * 1024
    temp_filename = f"temp_{active_user.id}_{image_file.filename}"
    
    with open(temp_filename, "wb") as f_out:
        while data_chunk := await image_file.read(read_chunk):
            size_counter += len(data_chunk)
            if size_counter > 5 * 1024 * 1024:
                os.remove(temp_filename)
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
            f_out.write(data_chunk)
    
    ext = image_file.filename.split(".")[-1]
    final_name = f"user_{active_user.id}.{ext}"
    dest_path = AVATAR_DIR / final_name
    
    shutil.move(temp_filename, dest_path)
    
    active_user.avatar_url = f"/uploads/avatars/{final_name}"
    db_session.commit()
    db_session.refresh(active_user)
    
    return active_user
