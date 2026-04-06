# CRT4M Reader

A scholarly reading assistant for language learning and document analysis. Displays PDFs with original formatting intact, with an AI-powered sidebar for translation, summarization, vocabulary extraction, Q&A, and annotations.

## Architecture

```
CRT4M/
├── electron/
│   ├── main.js              # Spawns Python backend as child process
│   └── preload.js
├── backend/                 # Python FastAPI server
│   ├── main.py              # All API routes
│   ├── extractor.py         # PDF parsing via pdfplumber
│   ├── analyzer.py          # AI features (translate, summarize, vocab, Q&A)
│   ├── annotations.py       # Local JSON annotation store
│   ├── config.py            # AI provider + model configuration
│   └── requirements.txt
├── src/                     # React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Reader.tsx       # Displays PDF via iframe (preserves formatting)
│   │   ├── Sidebar.tsx      # AI assistant panel
│   │   ├── ProgressControls.tsx
│   │   └── common/
│   │       ├── SidebarTab.tsx
│   │       └── FloatingButton.tsx
│   ├── hooks/
│   │   ├── useDocumentUpload.ts   # POSTs PDF to /api/extract
│   │   └── useSidebarState.ts
│   ├── types/
│   │   └── document.ts
│   └── constants/
│       └── defaultDocument.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### How the pieces fit together

```
Upload PDF
  → React POSTs file to /api/extract
  → pdfplumber extracts structured text per page
  → Returns { pages, totalPages, title }
  → iframe renders the original PDF for display

Select text → click Translate / Summarize / Vocab / Q&A
  → React POSTs { text, feature } to /api/analyze/*
  → Configured AI provider processes the request
  → Result displayed in sidebar

Add annotation
  → React POSTs { page, note, selected_text } to /api/annotations
  → Stored in backend/annotations.json
  → Persists across sessions
```

## Prerequisites

- Node.js v18 or later
- Python 3.11 or later
- An API key for at least one supported AI provider

## Installation

### Frontend

```bash
npm install
```

### Backend

```bash
# Create and activate a virtual environment (recommended)
python -m venv backend/venv
backend\venv\Scripts\activate   # Windows
source backend/venv/bin/activate # macOS/Linux

pip install -r backend/requirements.txt
```

`requirements.txt` includes all four provider SDKs. If you only use one, you can remove the others — they are all optional at install time.

## Configuration

### AI Provider

Set the `AI_PROVIDER` environment variable to one of:

| Value | Provider | Required key |
|---|---|---|
| `gemini` | Google Gemini (default) | `GEMINI_API_KEY` |
| `openai` | OpenAI GPT | `OPENAI_API_KEY` |
| `anthropic` | Anthropic Claude | `ANTHROPIC_API_KEY` |
| `openrouter` | OpenRouter (access to all models) | `OPENROUTER_API_KEY` |

### Default models

Edit `backend/config.py` to change the default model for any provider:

```python
MODELS = {
    "gemini": "gemini-1.5-flash",
    "openai": "gpt-4o",
    "anthropic": "claude-opus-4-6",
    "openrouter": "anthropic/claude-opus-4",
}
```

For OpenRouter, any model slug from [openrouter.ai/models](https://openrouter.ai/models) works. Some useful options:

| Use case | Slug |
|---|---|
| Best quality | `anthropic/claude-opus-4` |
| Fast and cheap | `mistralai/mistral-7b-instruct` |
| Balanced | `meta-llama/llama-3.1-8b-instruct` |
| Free tier | `google/gemini-2.0-flash-exp:free` |

## Running the app

### Web (development)

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 — backend
cd backend
AI_PROVIDER=gemini GEMINI_API_KEY=your_key python main.py

# Terminal 2 — frontend
npm run dev
```

### Electron (desktop)

```bash
AI_PROVIDER=gemini GEMINI_API_KEY=your_key npm run electron:dev
```

Electron spawns the Python backend automatically as a child process.

### Production build

```bash
# Web
npm run build

# Desktop (packages Electron app)
npm run electron:build
```

## API reference

### Extraction

```
POST /api/extract
Content-Type: multipart/form-data
Body: file (PDF)

→ { title, pages: string[], total_pages }
```

### AI analysis

All analysis endpoints accept and return JSON.

```
POST /api/analyze/translate
{ text, target_language }
→ { literal, idiomatic, notes: string[] }

POST /api/analyze/summarize
{ text }
→ { summary, key_points: string[], themes: string[] }

POST /api/analyze/vocabulary
{ text }
→ { words: [{ word, definition, part_of_speech, example }] }

POST /api/analyze/qa
{ question, context }
→ { answer, confidence, relevant_quote }
```

### Annotations

```
GET    /api/annotations/:document_id
POST   /api/annotations
       { document_id, page, note, selected_text }
DELETE /api/annotations/:document_id/:annotation_id
```

### Configuration

```
GET  /api/config
→ { provider, model, available_providers, available_models }

POST /api/config/provider
     { provider, model? }
→ { provider, model }
```

Switch provider at runtime without restarting:

```bash
curl -X POST http://localhost:8000/api/config/provider \
  -H "Content-Type: application/json" \
  -d '{"provider": "openrouter", "model": "mistralai/mistral-7b-instruct"}'
```

## Supported file formats

| Format | Extraction | Display |
|---|---|---|
| PDF (digital) | pdfplumber | Browser iframe (original formatting) |
| Plain text (.txt) | Direct read | Paragraph rendering |

Scanned / image-based PDFs are not currently supported.

## Development commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run electron:dev` | Electron with hot reload |
| `npm run build` | Production web build |
| `npm run electron:build` | Package desktop app |
| `npm run lint` | TypeScript type check |

## Dependencies

### Frontend
- **React 19** — UI framework
- **TypeScript** — type safety
- **Vite** — build tool
- **Tailwind CSS** — styling
- **Lucide React** — icons
- **Motion** — animations
- **Electron** — desktop runtime

### Backend
- **FastAPI** — API framework
- **uvicorn** — ASGI server
- **pdfplumber** — PDF text extraction
- **google-generativeai** — Gemini SDK
- **openai** — OpenAI + OpenRouter SDK
- **anthropic** — Claude SDK
- **python-multipart** — file upload handling