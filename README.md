# CRT4M Reader

A modern, modular scholarly reading assistant built with React and Electron. Import PDFs or text files, extract and display content, and interact with an AI-powered sidebar for translations, notes, and vocabulary assistance.

## Features

- 📖 **Document Import** — Upload PDF or plain text files for instant viewing
- 🔍 **Text Extraction** — Client-side PDF parsing with PDF.js
- 💬 **AI Assistant Sidebar** — Collapsible panel with translation, notes, and vocabulary tabs
- 🎨 **Responsive Design** — Clean Material Design 3 interface with Tailwind CSS
- ⚛️ **Modern Stack** — React 19 + Vite + TypeScript + Electron
- 📱 **Cross-Platform** — Runs as web app or native Electron desktop app

## Quick Start

### Prerequisites
- Node.js v18 or later
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Run development server (web)
npm run dev

# Run Electron app with hot reload
npm run electron:dev

# Build for production (web)
npm run build

# Build & package Electron app
npm run electron:build
```

## Project Structure

```
src/
├── App.tsx                          # Main orchestrator component
├── components/
│   ├── Header.tsx                   # Navigation bar with search
│   ├── Sidebar.tsx                  # AI assistant panel
│   ├── Reader.tsx                   # Document display
│   ├── ProgressControls.tsx         # Page navigation
│   └── common/
│       ├── SidebarTab.tsx           # Reusable tab component
│       └── FloatingButton.tsx       # Floating action buttons
├── hooks/
│   ├── useDocumentUpload.ts         # File upload & PDF parsing logic
│   └── useSidebarState.ts           # Sidebar state management
├── types/
│   └── document.ts                  # DocumentData interface
├── constants/
│   └── defaultDocument.ts           # Sample document content
├── main.tsx                         # React entry point
└── index.css                        # Tailwind + custom utilities

electron/
├── main.js                          # Electron main process
└── preload.js                       # Preload script for IPC

Configuration files:
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript options
├── tailwind.config.js               # Tailwind theming
└── package.json                     # Dependencies & scripts
```

## Architecture

### Component Hierarchy
- **App** (state orchestrator)
  - Header (navigation & search)
  - Sidebar (AI assistant)
  - Reader (document display)
  - ProgressControls (page navigation)

### Key Hooks
- `useDocumentUpload()` — Handles PDF/text file parsing via PDF.js
- `useSidebarState()` — Manages sidebar open/close and tab selection

### Design System
- Material Design 3 color palette (primary, secondary, tertiary)
- Custom Tailwind theme in `index.css`
- Responsive breakpoints: mobile, tablet, desktop

## Environment Variables (Optional)

Create an `.env.local` file to add optional configurations:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

The build process (Vite) makes these available at `process.env.*` at build time.

## Supported File Formats

- **PDF** — Text extraction via PDF.js library
- **Plain Text** — Direct import with line-based paragraph splitting

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Web development server (Vite) |
| `npm run electron:dev` | Electron app with hot reload |
| `npm run build` | Production build (web) |
| `npm run electron:build` | Build & package Electron app |
| `npm run preview` | Preview production build |

## Dependencies

### Core
- **react** — UI framework
- **typescript** — Type safety
- **vite** — Build tool & dev server
- **tailwindcss** — Utility-first CSS
- **pdfjs-dist** — PDF text extraction

### UI & Animation
- **lucide-react** — Icon library
- **motion** (Framer Motion) — Animations

### Desktop
- **electron** — Desktop app framework
- **electron-builder** — Package & distribute
- **concurrently** — Run multiple commands
- **wait-on** — Wait for dev server startup

## Deployment

### Web
```bash
npm run build
# Deploy `dist/` folder to any static host
```

### Desktop (macOS, Windows, Linux)
```bash
npm run electron:build
# Outputs packaged apps in `dist/` directory
```

## Notes

- The app is primarily **client-side** — no backend server required for basic functionality
- PDF parsing happens entirely in the browser (no server upload needed)
- Electron support is built-in for native desktop distribution
- Custom theming can be modified in [src/index.css](src/index.css)

## Future Enhancements

- [ ] Implement AI backend integration (Gemini API)
- [ ] Add search functionality across documents
- [ ] Support for more file formats (EPUB, Word docs)
- [ ] Annotation and highlighting tools
- [ ] Local storage for saved notes and bookmarks
- [ ] Dark mode toggle
