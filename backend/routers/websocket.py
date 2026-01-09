from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from connection_manager import manager

router = APIRouter(tags=["websockets"])

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process if needed, for now mainly for broadcasting updates
            # await manager.send_personal_message(f"You wrote: {data}", websocket)
            pass 
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # await manager.broadcast(f"Client #{client_id} left the chat")
