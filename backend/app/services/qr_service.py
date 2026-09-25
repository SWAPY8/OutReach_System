import io
import base64
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from app.core.config import settings

def get_customer_url(qr_token: str, base_url: str = None) -> str:
    """Returns the full public customer review URL for a QR token."""
    base = base_url.rstrip("/") if base_url else settings.FRONTEND_BASE_URL.rstrip("/")
    return f"{base}/r/{qr_token}"

def generate_qr_base64(url: str) -> str:
    """Generates a high-quality QR code PNG encoded as a base64 data URI."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=10,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

def generate_qr_bytes(url: str) -> bytes:
    """Generates raw PNG bytes of a QR code."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=12,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()
