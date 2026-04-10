import io
import json
import os
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from extractor import extract_pdf
from analyzer import answer_question, extract_vocabulary, summarize, translate
from annotations import add_annotation, delete_annotation, get_annotations

app = FastAPI(title="CRT4M Backend")

# Allow the React dev server and Electron to reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Configuration ────────────────────────────────────────────────────────────────

import config as cfg

@app.get("/api/config")
async def get_config():
    return {
        "provider": cfg.PROVIDER,
        "model": cfg.get_model(),
        "default_model": cfg.MODELS[cfg.PROVIDER],
        "active_model": cfg.get_model(),
        "available_providers": list(cfg.MODELS.keys()),
        "available_models": cfg.MODELS,
        "runtime_model_overrides": cfg.RUNTIME_MODEL_OVERRIDES,
    }

class ProviderRequest(BaseModel):
    provider: str
    model: str | None = None  # Optional model override

@app.post("/api/config/provider")
async def set_provider(req: ProviderRequest):
    if req.provider not in cfg.MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown provider. Choose from: {list(cfg.MODELS.keys())}"
        )
    cfg.PROVIDER = req.provider
    # Set/clear runtime model overrides without mutating MODELS defaults.
    if req.model:
        cfg.RUNTIME_MODEL_OVERRIDES[req.provider] = req.model
    else:
        cfg.RUNTIME_MODEL_OVERRIDES.pop(req.provider, None)
    return {
        "provider": cfg.PROVIDER,
        "default_model": cfg.MODELS[cfg.PROVIDER],
        "active_model": cfg.get_model(),
    }


# ── Extraction ────────────────────────────────────────────────────────────────

@app.post("/api/extract")
async def extract(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    doc = extract_pdf(io.BytesIO(contents), file.filename or "document.pdf")

    return {
        "title": doc.title,
        "pages": doc.pages,
        "total_pages": doc.total_pages,
    }


# ── AI Analysis ───────────────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "English"

class SummarizeRequest(BaseModel):
    text: str

class VocabRequest(BaseModel):
    text: str

class QARequest(BaseModel):
    question: str
    context: str


@app.post("/api/analyze/translate")
async def analyze_translate(req: TranslateRequest):
    result = translate(req.text, req.target_language)
    return result

@app.post("/api/analyze/summarize")
async def analyze_summarize(req: SummarizeRequest):
    result = summarize(req.text)
    return result

@app.post("/api/analyze/vocabulary")
async def analyze_vocabulary(req: VocabRequest):
    result = extract_vocabulary(req.text)
    return result

@app.post("/api/analyze/qa")
async def analyze_qa(req: QARequest):
    result = answer_question(req.question, req.context)
    return result

# ── Annotations ───────────────────────────────────────────────────────────────

class AnnotationRequest(BaseModel):
    document_id: str
    page: int
    note: str
    selected_text: str = ""


@app.get("/api/annotations/{document_id}")
async def get(document_id: str):
    return get_annotations(document_id)

@app.post("/api/annotations")
async def create(req: AnnotationRequest):
    return add_annotation(req.document_id, req.page, req.note, req.selected_text)

@app.delete("/api/annotations/{document_id}/{annotation_id}")
async def delete(document_id: str, annotation_id: str):
    success = delete_annotation(document_id, annotation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Annotation not found.")
    return {"deleted": True}


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)