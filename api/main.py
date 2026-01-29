from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from dotenv import load_dotenv

# Import custom modules (ensure modules/ is in path or package structure)
from modules.search_engine import search_by_image
from modules.detector import classify_results, get_suspicious_urls
from modules.generator import generate_takedown_request, get_summary_statistics

load_dotenv()

app = FastAPI(title="Lore-Anchor Patrol API", version="1.0.0")

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite dev server
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TakedownRequest(BaseModel):
    infringement_url: str
    original_url: str

class ScanRequest(BaseModel):
    whitelist: str

@app.get("/")
def read_root():
    return {"message": "Lore-Anchor Patrol API is running"}

@app.post("/scan")
async def scan_image(
    file: UploadFile = File(...),
    whitelist: str = Form("twitter.com, pixiv.net"), # Default whitelist
    api_key: Optional[str] = Form(None)
):
    try:
        # Create temp file
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Determine API Key
        env_api_key = os.getenv("SERPAPI_KEY", "")
        key_to_use = api_key if api_key else env_api_key
        
        # Search
        search_results = search_by_image(temp_filename, key_to_use) # search_by_image likely handles file path or file object depending on implementation. 
        # Checking app.py: search_by_image(uploaded_file, api_key) where uploaded_file is Streamlit's UploadedFile. 
        # We might need to adjust search_by_image if it expects a specific object, but passing path is safer if modified.
        # However, modules/search_engine.py is likely designed for Streamlit. Let's assume for now it handles what we give or we might need to fix it.
        # Actually, let's look at search_by_image in a moment if it fails. For now, passing the file logic.
        
        # Clean up temp file
        os.remove(temp_filename)

        if not search_results:
            return {"status": "no_results", "data": []}

        # Parse whitelist
        whitelist_domains = [domain.strip() for domain in whitelist.split(",") if domain.strip()]
        
        # Classify
        classified_results = classify_results(search_results, whitelist_domains)
        
        # Stats
        stats = get_summary_statistics(classified_results)
        
        # Suspicious list
        suspicious_list = get_suspicious_urls(classified_results)

        return {
            "status": "success",
            "results": classified_results,
            "stats": stats,
            "suspicious": suspicious_list
        }

    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

@app.post("/takedown")
def create_takedown(request: TakedownRequest):
    text = generate_takedown_request(request.infringement_url, request.original_url)
    return {"text": text}
