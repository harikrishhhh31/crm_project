import re


def detect_document_type(text: str) -> str:
    text_upper = text.upper()

    if "INCOME TAX DEPARTMENT" in text_upper or re.search(
        r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text_upper
    ):
        return "PAN"

    if "AADHAAR" in text_upper or "UNIQUE IDENTIFICATION" in text_upper:
        return "AADHAAR"

    if "PASSPORT" in text_upper or "REPUBLIC OF INDIA" in text_upper:
        return "PASSPORT"

    if "DRIVING LICENCE" in text_upper or "DRIVING LICENSE" in text_upper:
        return "DRIVING_LICENCE"

    return "UNKNOWN"


def extract_pan_fields(text: str) -> dict:
    text_upper = text.upper()

    pan_match = re.search(
        r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
        text_upper
    )

    dob_match = re.search(
        r"\b\d{2}[/-]\d{2}[/-]\d{4}\b",
        text
    )

    return {
        "pan_number": pan_match.group(0) if pan_match else None,
        "date_of_birth": dob_match.group(0) if dob_match else None
    }


def extract_aadhaar_fields(text: str) -> dict:
    aadhaar_match = re.search(
        r"\b\d{4}\s?\d{4}\s?\d{4}\b",
        text
    )

    dob_match = re.search(
        r"\b\d{2}[/-]\d{2}[/-]\d{4}\b",
        text
    )

    return {
        "aadhaar_number": (
            aadhaar_match.group(0).replace(" ", "")
            if aadhaar_match else None
        ),
        "date_of_birth": dob_match.group(0) if dob_match else None
    }


def extract_fields(text: str, document_type: str) -> dict:

    if document_type == "PAN":
        return extract_pan_fields(text)

    if document_type == "AADHAAR":
        return extract_aadhaar_fields(text)

    return {}


def validate_fields(fields: dict, document_type: str) -> dict:
    errors = []

    if document_type == "PAN":
        pan = fields.get("pan_number")

        if pan and not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", pan):
            errors.append("Invalid PAN format")

    if document_type == "AADHAAR":
        aadhaar = fields.get("aadhaar_number")

        if aadhaar and not re.fullmatch(r"\d{12}", aadhaar):
            errors.append("Invalid Aadhaar format")

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }


def calculate_confidence(
    document_type: str,
    fields: dict,
    validation: dict
) -> float:

    if document_type == "UNKNOWN":
        return 0.20

    total_fields = len(fields)

    if total_fields == 0:
        return 0.30

    extracted_fields = sum(
        1 for value in fields.values()
        if value
    )

    confidence = extracted_fields / total_fields

    if not validation["valid"]:
        confidence *= 0.5

    return round(confidence, 2)