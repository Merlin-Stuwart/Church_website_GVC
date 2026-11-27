import uvicorn
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    reload_enabled = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    print(f"✝ Grace Victory Church (GVC) API Server Starting on http://{host}:{port} (reload={reload_enabled}) ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload_enabled)
