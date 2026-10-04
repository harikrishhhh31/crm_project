from fastapi import FastAPI
from app.api.routes.ocr import router as ocr_router

app = FastAPI(
    title="CRM AI Service",
    description="AI and document processing service for the Insurance CRM",
    version="1.0.0"
)

app.include_router(ocr_router)


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