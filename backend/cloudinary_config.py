import os
import cloudinary
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "")
)

def is_configured():
    """Check if Cloudinary is properly configured"""
    return bool(
        os.getenv("CLOUDINARY_CLOUD_NAME") and
        os.getenv("CLOUDINARY_API_KEY") and
        os.getenv("CLOUDINARY_API_SECRET")
    )

print("[Cloudinary] Configuration loaded")
if not is_configured():
    print("[Cloudinary] WARNING: Cloudinary credentials not set. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET environment variables.")
