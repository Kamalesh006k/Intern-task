from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import requests
import os
import auth as auth_utils
import models

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/ask")
def ask_assistant(
    request: ChatRequest,
    current_user: models.User = Depends(auth_utils.retrieve_current_user)
):
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_key:
        raise HTTPException(status_code=500, detail="Chat service not configured (API Key missing)")

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {openrouter_key}",
                "Content-Type": "application/json",
                # "HTTP-Referer": "http://localhost:5173", # Optional
                # "X-Title": "Primetrade Task Manager", # Optional
            },
            json={
                "model": "openai/gpt-3.5-turbo", # Use a cheap/standard model or allow config
                "messages": [
                    {"role": "system", "content": f"You are the AI assistant for Primetrade Task Manager. You must ONLY answer questions directly related to task management, productivity, or using this specific application. If the user asks about anything else (e.g. general knowledge, coding unrelated to the app, weather), politely refuse and guide them back to task management topics. The user is {current_user.username}."},
                    {"role": "user", "content": request.message}
                ]
            }
        )
        response.raise_for_status()
        data = response.json()
        return {"response": data['choices'][0]['message']['content']}
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get response from AI assistant")
