from pathlib import Path
import pytesseract
from PIL import Image
import fitz

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_text_from_image(file_path: str) -> str:
    image = Image.open(file_path)

    text = pytesseract.image_to_string(image)

    return text.strip()


def extract_text_from_pdf(file_path: str) -> str:
    document = fitz.open(file_path)

    extracted_text = []

    # First try normal PDF text extraction
    for page in document:
        text = page.get_text()

        if text.strip():
            extracted_text.append(text)

    normal_text = "\n".join(extracted_text).strip()

    # If PDF already contains text, return it
    if normal_text:
        document.close()
        return normal_text

    # Otherwise, treat it as a scanned PDF
    ocr_text = []

    for page in document:
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2))

        image = Image.frombytes(
            "RGB",
            [pixmap.width, pixmap.height],
            pixmap.samples
        )

        text = pytesseract.image_to_string(image)

        if text.strip():
            ocr_text.append(text.strip())

    document.close()

    return "\n".join(ocr_text).strip()


def extract_text(file_path: str) -> str:
    extension = Path(file_path).suffix.lower()

    if extension in {".jpg", ".jpeg", ".png"}:
        return extract_text_from_image(file_path)

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)

    raise ValueError("Unsupported document format")