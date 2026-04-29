# CRT4M Known Bugs & Issues


## Resolved

### 1. Unimplemented UI features (dead buttons/links) — PARTIALLY FIXED
- **Search bar** — `src/components/Header.tsx` — disabled placeholder ("Search coming soon…")
- **Save to Vocab button** — `src/components/Sidebar.tsx` — disabled placeholder
- **Library nav link** — `src/components/Header.tsx` — disabled placeholder
- **Settings nav link** — `src/components/Header.tsx` — ✅ now opens Settings modal
- **Settings gear icon** — `src/components/Header.tsx` — ✅ now opens Settings modal
- **Accessibility:** Dead `<a href="#">` links replaced with disabled `<button>` elements

### 2. Q&A endpoint unused — FIXED
**Location:** `POST /api/analyze/qa` is now wired to a Q&A tab in the sidebar (`src/components/Sidebar.tsx`). Users can select text, type a question, and get an AI answer with confidence level and relevant quote.

### 3. Annotations not wired to frontend
**Location:** Backend has full CRUD at `/api/annotations/*` (`backend/annotations.py`, `backend/main.py`). Frontend never calls these endpoints. The "Save to Vocab" button in the sidebar is a disabled placeholder.

### 4. TypeScript strict mode disabled — FIXED
**Location:** `tsconfig.json` — `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true` are now enabled. All resulting errors have been fixed.


## Future Work

- **Search bar** — implement in-document text search (TXT + PDF)
- **Library** — implement document library/management
- **Save to Vocab / Annotations** — wire frontend to backend annotation CRUD endpoints
