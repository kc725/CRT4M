# CRT4M Known Bugs & Issues

## High Severity

### 1. No React Error Boundary
**Location:** Entire frontend
**Impact:** Any unhandled render error (e.g., from react-pdf or react-virtuoso) crashes the app to a blank white screen with no recovery UI.
**Fix:** Add an `<ErrorBoundary>` component wrapping `<Reader>` and `<Sidebar>`.

### 2. Unhandled `json.JSONDecodeError` in backend
**Location:** `backend/analyzer.py:176-186` — `translate()`, `summarize()`, `extract_vocabulary()`, `answer_question()`
**Impact:** All four public functions call `json.loads()` on raw AI output with no `try/except`. If the AI returns malformed output (refusal, rate-limit HTML, partial response), the backend returns a 500 with a raw traceback.
**Fix:** Wrap `json.loads()` calls in try/except, return a structured error response.

### 3. `_call_anthropic` bad JSON extraction
**Location:** `backend/analyzer.py:89-92`
**Impact:** When the Anthropic response contains no `{` character, `text.find("{")` returns `-1`. Then `text[-1:0]` yields an empty string, which causes `json.loads("")` to raise `JSONDecodeError`. The Ollama version (line 149-152) correctly guards against this with `if start == -1`, but the Anthropic version does not.
**Fix:** Add the same guard as the Ollama handler: `if start == -1 or end == 0: raise ValueError(...)`.

### 4. Hardcoded `API_BASE`
**Location:** `src/constants/api.ts:1` — `export const API_BASE = 'http://localhost:8000'`
**Impact:** No mechanism to override this for production Electron builds or deployments. The backend URL is baked into the bundle.
**Fix:** Read from `import.meta.env.VITE_API_BASE` with a localhost fallback.

### 5. No tests
**Impact:** Zero frontend tests (no test framework configured). Zero backend unit tests. Only a bash smoke-test script at `scripts/test_backend_and_app.sh`.
**Fix:** Add Vitest for frontend, pytest for backend.

### 6. Incorrect Anthropic model name
**Location:** `backend/config.py:9` — `"anthropic": "claude-opus-4-6"`
**Impact:** `claude-opus-4-6` is not a valid Anthropic model ID. API calls to Anthropic will fail.
**Fix:** Use a valid model ID (e.g., `claude-sonnet-4-6-20250514`).

---

## Medium Severity

### 7. Unimplemented UI features (dead buttons/links)
- **Search bar** — `src/components/Header.tsx:31-39` — rendered but no event handlers or state wired
- **Save to Vocab button** — `src/components/Sidebar.tsx:326-329` — no `onClick` handler
- **Library nav link** — `src/components/Header.tsx:25` — `<a href="#">`, visually styled as active
- **Settings nav link** — `src/components/Header.tsx:26` — `<a href="#">`, no functionality

### 8. Q&A endpoint unused
**Location:** Backend `POST /api/analyze/qa` is implemented (`backend/main.py:111-114`, `backend/analyzer.py:185`) but no frontend UI exists to call it.

### 9. Annotations not wired to frontend
**Location:** Backend has full CRUD at `/api/annotations/*` (`backend/annotations.py`, `backend/main.py:117-137`). Frontend never calls these endpoints. The "Save to Vocab" button in the sidebar does nothing.

### 10. TypeScript strict mode disabled
**Location:** `tsconfig.json` — no `"strict": true`, `"noImplicitAny"`, or `"strictNullChecks"`
**Impact:** TypeScript's most important safety checks are off. Implicit `any` types, nullable access without checks, etc. all compile silently.

### 11. Unsafe error casting
**Location:** `src/hooks/useAnalysis.ts:50,57,64` — `(e as Error).message`
**Impact:** If a non-Error value is thrown (string, object), `.message` is `undefined`. The error state will show "undefined" to the user.
**Fix:** Use `e instanceof Error ? e.message : String(e)`.

### 12. `alert()` for file upload errors
**Location:** `src/hooks/useDocumentUpload.ts:71`
**Impact:** Blocks the main thread with a native browser dialog. Poor UX.
**Fix:** Use an inline error state or toast notification.

### 13. Missing accessibility
- **Icon buttons lack `aria-label`** — sidebar toggle (`Header.tsx:43-46`), settings button (`Header.tsx:49-51`)
- **Range/number inputs have no accessible labels** — `ProgressControls.tsx:58-65`, `ProgressControls.tsx:87-95`
- **`<label>` elements used as display text** without `htmlFor` — multiple instances in `Sidebar.tsx`
- **`<a href="#">` links** — `Header.tsx:25-26` — cause page jump, meaningless to screen readers
- **`<nav>` in Sidebar has no `aria-label`** to distinguish from Header's `<nav>`

### 14. Duplicate pdfjs-dist initialization
**Location:** `src/hooks/useDocumentUpload.ts:39-42` dynamically imports pdfjs-dist (worker + getDocument) on every upload. `src/components/Reader.tsx:21-24` also configures pdfjs worker at module load time via react-pdf. Two pdfjs instances may coexist.
**Fix:** Reuse react-pdf's pdfjs instance, or extract the page count differently (e.g., from the `<Document>` `onLoadSuccess` callback).

### 15. Unused npm dependencies
- `@google/genai` — listed in `package.json` but never imported in frontend source
- `express` — listed in `package.json` but no Express code exists (backend is FastAPI)
- `@types/express` — dev dependency for unused express

### 16. Unused component: `FloatingButton`
**Location:** `src/components/common/FloatingButton.tsx` — exists but is never imported or rendered anywhere.

### 17. Unused types
**Location:** `src/types/document.ts` — `PageTextSpan` and `PdfPageOverlay` interfaces are declared but never imported or referenced.

---

## Low Severity

### 18. Hardcoded fallback page width
**Location:** `src/components/Reader.tsx:213` — `width: pageWidth ?? 600`
**Impact:** Loading skeleton is always 600x848px regardless of viewport. The `pageWidth` prop is defined in `ReaderProps` but never passed from `App.tsx`.

### 19. Hardcoded CORS origins
**Location:** `backend/main.py:15-18` — only allows `http://localhost:3000` and `http://localhost:5173`. Electron's `file://` origin and any deployed URLs are blocked.

### 20. Array index as React key
**Location:** `src/components/Sidebar.tsx:178,235,253,297` — `key={i}` used for AI result lists. Low risk since data is replaced atomically, but still an anti-pattern.

### 21. Unstable `handleMouseUp` callback
**Location:** `src/components/Reader.tsx:74-78` — depends on `onTextSelect`, which is an inline arrow function in `App.tsx:32-35`, creating a new reference every render.
**Fix:** Wrap `onTextSelect` in `useCallback` in `App.tsx`.

### 22. `pageWidth` prop never passed
**Location:** `ReaderProps` defines `pageWidth?: number` but `App.tsx` never provides it. The prop exists but is dead code.

### 23. Backend type mismatch in `extract_pdf`
**Location:** `backend/extractor.py:12` — parameter typed as `bytes` but `main.py:70` passes `io.BytesIO(contents)` which is `BinaryIO`. Works because `pdfplumber.open()` accepts both, but the annotation is misleading.

### 24. Electron hardcoded dev port
**Location:** `electron/main.js:22` — `win.loadURL('http://localhost:3000')`. If the Vite dev server runs on a different port, Electron shows a blank window.

### 25. Silent no-op on unsupported file types
**Location:** `src/hooks/useDocumentUpload.ts:26-68` — the if/else chain handles PDF and TXT but does nothing for other file types. No error feedback is given. The `<input accept>` attribute mitigates this but doesn't prevent it programmatically.
