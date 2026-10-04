from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid

from app.services.ocr_service import extract_text

from app.services.extraction_service import (
    detect_document_type,
    extract_fields,
    validate_fields,
    calculate_confidence
)


router = APIRouter(
    prefix="/api/v1/kyc",
    tags=["KYC"]
)


# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# Allowed file types
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf"
}


# Maximum file size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload")
async def upload_kyc_document(
    file: UploadFile = File(...)
):

    # --------------------------------
    # 1. Validate file extension
    # --------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Use JPG, JPEG, PNG, or PDF."
            )
        )


    # --------------------------------
    # 2. Read uploaded file
    # --------------------------------

    content = await file.read()


    # --------------------------------
    # 3. Validate file size
    # --------------------------------

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10 MB."
        )


    # --------------------------------
    # 4. Generate unique file ID
    # --------------------------------

    file_id = str(uuid.uuid4())


    # --------------------------------
    # 5. Generate safe stored filename
    # --------------------------------

    saved_filename = f"{file_id}{extension}"

    file_path = UPLOAD_DIR / saved_filename


    # --------------------------------
    # 6. Save uploaded document
    # --------------------------------

    try:
        file_path.write_bytes(content)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )


    # --------------------------------
    # 7. Extract text using OCR
    # --------------------------------

    try:
        extracted_text = extract_text(
            str(file_path)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}"
        )


    # --------------------------------
    # 8. Check whether text was found
    # --------------------------------

    if not extracted_text:

        return {
            "success": True,
            "message": "Document uploaded but no text could be extracted.",
            "file_id": file_id,
            "filename": file.filename,
            "stored_as": saved_filename,
            "document_type": "UNKNOWN",
            "extracted_text": "",
            "fields": {},
            "validation": {
                "valid": False,
                "errors": [
                    "No readable text found in document."
                ]
            },
            "confidence": 0.0,
            "verification_status": "pending"
        }


    # --------------------------------
    # 9. Detect KYC document type
    # --------------------------------

    try:
        document_type = detect_document_type(
            extracted_text
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document type detection failed: {str(e)}"
        )


    # --------------------------------
    # 10. Extract KYC fields
    # --------------------------------

    try:
        fields = extract_fields(
            extracted_text,
            document_type
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Field extraction failed: {str(e)}"
        )


    # --------------------------------
    # 11. Validate extracted fields
    # --------------------------------

    try:
        validation = validate_fields(
            fields,
            document_type
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Field validation failed: {str(e)}"
        )


    # --------------------------------
    # 12. Calculate confidence
    # --------------------------------

    try:
        confidence = calculate_confidence(
            document_type,
            fields,
            validation
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Confidence calculation failed: {str(e)}"
        )


    # --------------------------------
    # 13. Determine verification status
    # --------------------------------

    if confidence >= 0.90 and validation["valid"]:
        verification_status = "verified"
    else:
        verification_status = "pending"


    # --------------------------------
    # 14. Return complete KYC result
    # --------------------------------

    return {
        "success": True,

        "message": "KYC document processed successfully",

        "file_id": file_id,

        "filename": file.filename,

        "stored_as": saved_filename,

        "document_type": document_type,

        "extracted_text": extracted_text,

        "fields": fields,

        "validation": validation,

        "confidence": confidence,

        "verification_status": verification_status
    }