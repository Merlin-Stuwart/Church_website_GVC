import uvicorn
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"✝ Grace Victory Church (GVC) API Server Starting on http://localhost:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
