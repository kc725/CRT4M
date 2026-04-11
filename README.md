# CRT4M Reader

CRT4M is a reading assistant with:

- A **React + Vite + Electron** frontend for reading PDF/TXT documents.
- A **FastAPI** backend for AI analysis (translation, summary, vocabulary, Q&A) and annotations.

## Current Architecture

```
CRT4M/
├── backend/
│   ├── main.py             # FastAPI routes
│   ├── analyzer.py         # Provider dispatch + prompt templates
│   ├── extractor.py        # PDF text extraction (API endpoint)
│   ├── annotations.py      # Local JSON annotation persistence
│   ├── config.py           # Provider/model/env configuration
│   └── requirements.txt
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   │   ├── useDocumentUpload.ts   # Local PDF/TXT import and parsing (frontend)
│   │   └── useAnalysis.ts         # Calls backend /api/analyze/*
│   ├── constants/api.ts
│   └── types/
├── electron/
│   ├── main.js
│   └── preload.js
├── scripts/
│   └── test_backend_and_app.sh    # End-to-end smoke checks
└── package.json
```

## Important Notes

- The frontend currently imports PDFs **locally in the browser** using `pdfjs-dist` and renders page images.
- AI features call the backend at `http://localhost:8000` (see `src/constants/api.ts`).
- Backend CORS currently allows frontend origins on ports **3000** and **5173**.

## Prerequisites

- Node.js 18+
- Python 3.11+
- npm

For AI endpoints, set at least one provider API key.

## Setup

### 1) Frontend deps

```bash
npm install
```

### 2) Backend virtualenv + deps

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

## Configuration

Backend provider selection is environment-driven in `backend/config.py`.

Supported providers:

- `gemini` (`GEMINI_API_KEY`)
- `openai` (`OPENAI_API_KEY`)
- `anthropic` (`ANTHROPIC_API_KEY`)
- `openrouter` (`OPENROUTER_API_KEY`)
- `ollama` (no API key required)

Example:

```bash
export AI_PROVIDER=gemini
export GEMINI_API_KEY=your_key_here
```

## Run Locally

### One-command startup

```bash
npm run dev:full
```

This starts both the backend and the Vite frontend together.

If you want the Electron app too:

```bash
npm run electron:full
```

### Backend (Terminal 1)

```bash
cd backend
python main.py
```

Backend runs at `http://127.0.0.1:8000`.

### Frontend Web (Terminal 2)

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Electron (optional)

```bash
npm run electron:dev
```

## API Surface

### Config

- `GET /api/config`
- `POST /api/config/provider`

### AI Analysis

- `POST /api/analyze/translate`
- `POST /api/analyze/summarize`
- `POST /api/analyze/vocabulary`
- `POST /api/analyze/qa`

### Annotations

- `GET /api/annotations/{document_id}`
- `POST /api/annotations`
- `DELETE /api/annotations/{document_id}/{annotation_id}`

### Extraction

- `POST /api/extract` (PDF upload)

> Note: this endpoint is available in backend, but the current frontend import flow is local and does not call it.

## Testing

### Fast smoke test for backend + app

```bash
./scripts/test_backend_and_app.sh
```

What this script does:

1. Creates backend venv if missing.
2. Installs backend requirements.
3. Starts backend and waits for readiness.
4. Smoke-tests backend config + annotation create/read/delete.
5. Runs frontend type-check and production build.

### Optional AI endpoint smoke tests

If your API keys/provider are configured:

```bash
RUN_AI_TESTS=1 ./scripts/test_backend_and_app.sh
```

## Package Scripts

- `npm run backend:dev` — start the FastAPI backend
- `npm run dev` — start Vite dev server
- `npm run dev:full` — start backend + Vite together
- `npm run lint` — TypeScript type-check
- `npm run build` — production frontend build
- `npm run electron:dev` — run Electron against local dev server
- `npm run electron:full` — run backend + Vite + Electron together
- `npm run electron:build` — package Electron app
