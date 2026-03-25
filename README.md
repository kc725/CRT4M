# CRT4M Reader — Project Analysis and Run Instructions

## Summary

CRT4M Reader is a client-side React-based scholarly reading assistant that provides document import (PDF / plain text), text extraction, and an in-app AI assistant UI. The app is bootstrapped with Vite and Tailwind, uses PDF.js for PDF text extraction, and renders a single-page reader interface in [src/App.tsx](src/App.tsx#L1).

## Quick Start

Prerequisites: Node.js (recommended v18+), npm or compatible package manager.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add environment variables (optional): create `.env.local` and set:

   ```text
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   `vite.config.ts` maps `GEMINI_API_KEY` into `process.env.GEMINI_API_KEY` at build time.

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Build / preview:

   ```bash
   npm run build
   npm run preview
   ```

## Project Structure (key files)

- [index.html](index.html) — app entry HTML.
- [vite.config.ts](vite.config.ts) — Vite config, adds Tailwind plugin and defines `GEMINI_API_KEY`.
- [tsconfig.json](tsconfig.json) — TypeScript compiler options.
- [package.json](package.json) — scripts and dependencies.
- [src/App.tsx](src/App.tsx) — main reader UI, PDF/text import and client-side processing.
- [src/main.tsx](src/main.tsx) — React entry.
- [src/index.css](src/index.css) — Tailwind + custom CSS utilities.
- [metadata.json](metadata.json) — app metadata.

## Notable Dependencies & Observations

- React 19 + Vite 6 are used for the frontend.
- `pdfjs-dist` is used to extract text from uploaded PDFs in the browser (`src/App.tsx`).
- Tailwind is enabled via `@tailwindcss/vite` and a custom theme is in [src/index.css](src/index.css#L1).
- The package list includes `@google/genai` and `express` but this repository appears to be a purely client-side app: there are no server files in the workspace. If you intend to call server-side APIs or host an API proxy, please add server code or remove unused deps.
- `vite` is listed in both `dependencies` and `devDependencies`; prefer keeping it only in `devDependencies`.

## Runtime Behavior and Security Notes

- Uploaded PDFs are processed entirely in the browser via PDF.js — no server upload required.
- `GEMINI_API_KEY` is injected at build time in `vite.config.ts`. Avoid committing API keys; provide them via CI / environment variables and add `.env.local` to `.gitignore`.

## Suggested Improvements

- Remove unused dependencies (`express`, `@google/genai`) or add server code that uses them.
- Move `vite` to `devDependencies` only.
- Add an example env file: create [`.env.example`](.env.example) documenting required variables.
- Add basic linting / formatting (ESLint / Prettier) and a CI workflow to run `npm run lint`.
- Add tests for critical UI behaviors and PDF extraction (unit or E2E).

## Where to Look Next

- Read the reader UI: [src/App.tsx](src/App.tsx#L1).
- Verify environment handling: [vite.config.ts](vite.config.ts#L1).
- Check scripts and dependencies: [package.json](package.json#L1).

If you want, I can:

- remove unused dependencies and update `package.json`,
- add a `.env.example`, or
- open a PR with the suggested cleanup and a CI workflow.

---
Generated: automated project analysis and updated README.

**Electron Support**
- **Files:** [electron/main.js](electron/main.js), [electron/preload.js](electron/preload.js)
- **Package changes:** `main` set to `electron/main.js`; devDependencies added: `electron`, `electron-builder`, `concurrently`, `wait-on`, `cross-env`.
- **Dev (hot-reload):** Install deps then run `npm run electron:dev` — starts Vite and opens Electron pointed at `http://localhost:3000`.
- **Build / Package:** Run `npm run electron:build` — builds the renderer with Vite and packages with `electron-builder` (config is in `package.json`).
- **After `npm audit fix --force`:** Run `npm install` so `package-lock.json` and `node_modules` are consistent, then review and commit both `package.json` and `package-lock.json`. If you want `package.json` to exactly reflect the lockfile top-level versions, sync them manually (e.g. `npm install <pkg>@<version> --save`) or run a small sync script.
