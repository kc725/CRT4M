# CRT4M Reader

AI-powered scholarly reading assistant for language learning and document analysis. Users import PDF/TXT documents, read them in a virtualized viewer, select text, and send it to an AI backend for translation, summarization, and vocabulary extraction.

## Tech Stack

**Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4 (CSS-based config, no `tailwind.config.js`), react-pdf v9, react-virtuoso v4, Electron 41 (optional desktop wrapper)

**Backend:** Python FastAPI + uvicorn, pdfplumber for PDF text extraction

**AI Providers (switchable at runtime via `AI_PROVIDER` env var):** Gemini (default), OpenAI, Anthropic, OpenRouter, Ollama (local)

## Project Structure

```
src/                    # React frontend
  components/           # Header, Reader, Sidebar, ProgressControls
  hooks/                # useDocumentUpload, useAnalysis, useSidebarState
  constants/api.ts      # API_BASE url
  types/document.ts     # DocumentData, AI result types
backend/                # Python FastAPI backend
  main.py               # Routes and CORS config
  analyzer.py           # AI prompt templates + provider dispatch
  extractor.py          # PDF text extraction via pdfplumber
  annotations.py        # Local JSON annotation CRUD
  config.py             # Provider/model/API key config
electron/               # Electron main + preload
scripts/                # Bash smoke-test script
```

## Dev Setup

```bash
npm install                  # Frontend deps
pip install -r backend/requirements.txt  # Backend deps (use a venv)

npm run dev                  # Vite dev server on :3000
npm run backend:dev          # FastAPI backend on :8000 (uses backend/venv/bin/python)
npm run dev:full             # Both frontend + backend via concurrently
npm run electron:dev         # Electron + Vite dev
npm run electron:full        # Electron + Vite + backend
npm run build                # Production build
npm run lint                 # TypeScript type-check only (tsc --noEmit)
```

**Required env vars:** Set `AI_PROVIDER` and the corresponding `*_API_KEY` (e.g., `GEMINI_API_KEY`). See `.env.example`.

## Architecture

### PDF Rendering ("Sandwich" Pattern)
`Reader.tsx` composes three libraries in a layered stack:
```
<Document>     ← react-pdf: parses PDF, provides pdfjs context
  <Virtuoso>   ← react-virtuoso: virtualizes the page list (only visible pages in DOM)
    <Page>     ← react-pdf: renders individual pages with text + annotation layers
```
Text selection is native browser selection via react-pdf's `TextLayer`. The pdfjs worker is configured via `import.meta.url`.

### State Management
Plain React `useState` at the `App` level, passed as props. No Redux/Context/Zustand. Analysis state lives inside the `Sidebar` component via the `useAnalysis` hook.

### API Flow
Frontend `fetch` (in `useAnalysis.ts`) → FastAPI endpoints (`/api/analyze/*`) → AI provider dispatch (`analyzer.py`) → JSON response parsed and displayed in Sidebar.

### Backend AI Dispatch
`analyzer.py` has prompt templates for each analysis type and a `_call()` dispatcher that routes to the active provider. All providers return JSON; Anthropic and Ollama extract JSON from free-text responses via string slicing.

## Key Conventions

- **Styling:** Tailwind v4 with custom `@theme` tokens in `src/index.css`. Scholarly palette (muted greens/grays). Custom utilities: `.reading-canvas`, `.frosted-vellum`.
- **Fonts:** Inter (headlines) + Newsreader (body), loaded from Google Fonts CDN in `index.html`.
- **Icons:** `lucide-react` throughout.
- **Animations:** `motion` (Framer Motion) for sidebar tab transitions.
- **No test framework configured.** Only a bash smoke-test script exists at `scripts/test_backend_and_app.sh`.
- **TypeScript strict mode is not enabled.** `tsconfig.json` only sets `noEmit: true` and `skipLibCheck: true`.

## Backend Endpoints

| Route | Method | Purpose |
|---|---|---|
| `/api/config` | GET | Current provider/model info |
| `/api/config/provider` | POST | Switch AI provider at runtime |
| `/api/analyze/translate` | POST | AI translation |
| `/api/analyze/summarize` | POST | AI summarization |
| `/api/analyze/vocabulary` | POST | AI vocab extraction |
| `/api/analyze/qa` | POST | AI Q&A (no frontend UI yet) |
| `/api/extract` | POST | PDF text extraction (not used by frontend) |
| `/api/annotations/*` | GET/POST/DELETE | Annotation CRUD (not used by frontend) |
