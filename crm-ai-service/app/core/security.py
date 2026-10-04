import os
from fastapi import HTTPException, Request, status

API_KEY_ENV = "AI_SERVICE_API_KEY"
DEFAULT_API_KEY = "dev-crm-ai-key-2026"


def get_api_key() -> str:
    return os.environ.get(API_KEY_ENV, DEFAULT_API_KEY)


async def verify_api_key(request: Request):
    key = request.headers.get("X-API-Key")
    if key != get_api_key():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
        )
