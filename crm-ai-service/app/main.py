from fastapi import Depends, FastAPI
from app.api.routes.ocr import router as ocr_router
from app.core.security import verify_api_key

app = FastAPI(
    title="CRM AI Service",
    description="AI and document processing service for the Insurance CRM",
    version="1.0.0"
)

app.include_router(ocr_router, dependencies=[Depends(verify_api_key)])


@app.get("/")
def root():
    return {
        "service": "CRM AI Service",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }