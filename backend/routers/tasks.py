from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from connection_manager import manager
import auth as auth_utils
import datetime

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)

@router.get("/", response_model=List[schemas.Task])
def retrieve_user_tasks(
    skip: int = 0, 
    limit: int = 100, 
    db_session: Session = Depends(database.get_database_session), 
    active_user: models.User = Depends(auth_utils.retrieve_current_user)
):
    user_tasks = db_session.query(models.Task).filter(models.Task.user_id == active_user.id).offset(skip).limit(limit).all()
    return user_tasks

@router.post("/", response_model=schemas.Task)
async def add_new_task(
    task_data: schemas.TaskCreate, 
    db_session: Session = Depends(database.get_database_session), 
    active_user: models.User = Depends(auth_utils.retrieve_current_user)
):
    new_task_entry = models.Task(**task_data.model_dump(), user_id=active_user.id)
    db_session.add(new_task_entry)
    db_session.commit()
    db_session.refresh(new_task_entry)
    await manager.broadcast("task_update")
    return new_task_entry

@router.put("/{task_id}", response_model=schemas.Task)
async def modify_existing_task(
    task_id: int, 
    task_update: schemas.TaskUpdate, 
    db_session: Session = Depends(database.get_database_session), 
    active_user: models.User = Depends(auth_utils.retrieve_current_user)
):
    existing_task = db_session.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == active_user.id).first()
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_dict = task_update.model_dump(exclude_unset=True)
    
    if 'status' in update_dict:
        new_status_val = update_dict['status']
        previous_status = existing_task.status
        
        if previous_status == 'pending' and new_status_val == 'in_progress':
            existing_task.started_at = datetime.datetime.utcnow()
        
        if new_status_val == 'completed' and previous_status != 'completed':
            existing_task.completed_at = datetime.datetime.utcnow()
            if not existing_task.started_at:
                existing_task.started_at = existing_task.created_at
            
    for key, val in update_dict.items():
        setattr(existing_task, key, val)
    
    db_session.commit()
    db_session.refresh(existing_task)
    await manager.broadcast("task_update")
    return existing_task

@router.delete("/{task_id}")
async def remove_task(
    task_id: int, 
    db_session: Session = Depends(database.get_database_session), 
    active_user: models.User = Depends(auth_utils.retrieve_current_user)
):
    task_to_delete = db_session.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == active_user.id).first()
    if not task_to_delete:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_session.delete(task_to_delete)
    db_session.commit()
    await manager.broadcast("task_update")
    return {"detail": "Task deleted successfully"}
