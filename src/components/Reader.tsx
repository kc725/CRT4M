/**
 * Reader.tsx
 *
 * Sandwich architecture:
 *   <Document>          ← react-pdf: parses the PDF, provides context to every <Page>
 *     <Virtuoso>        ← react-virtuoso: virtualises the page list (only renders visible pages)
 *       <Page>          ← react-pdf: renders a single PDF page with text + annotation layers
 *
 * Text selection works out of the box via react-pdf's built-in TextLayer.
 * The annotation layer enables clickable links in the PDF.
 *
 * For plain-text documents the sandwich is skipped and paragraphs are rendered directly.
 */

import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

// react-pdf ships its own pdfjs-dist. Point the worker at it.
// Using import.meta.url keeps the path Vite-resolvable without a public/ copy.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Import the CSS that react-pdf needs for text + annotation layers.
// Add these two imports to your project (they ship with react-pdf):
//   import 'react-pdf/dist/Page/TextLayer.css';
//   import 'react-pdf/dist/Page/AnnotationLayer.css';
// They're omitted here because Vite will resolve them from the consuming file or App.tsx.

import { DocumentData } from '../types/document';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReaderProps {
  document: DocumentData;
  currentPage: number;
  onTextSelect: (text: string) => void;
}

/** Exposed handle so parent components can imperatively scroll to a page. */
export interface ReaderHandle {
  scrollToPage: (pageNumber: number) => void;
}

// ── Gap between pages (px) ────────────────────────────────────────────────────
const PAGE_GAP = 24;

// ── Component ─────────────────────────────────────────────────────────────────

export const Reader = forwardRef<ReaderHandle, ReaderProps>(function Reader(
  { document: doc, currentPage, onTextSelect },
  ref,
) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Expose scrollToPage so ProgressControls can jump to any page.
  useImperativeHandle(ref, () => ({
    scrollToPage(pageNumber: number) {
      // Virtuoso uses 0-based indices.
      virtuosoRef.current?.scrollToIndex({
        index: pageNumber - 1,
        behavior: 'smooth',
        align: 'start',
      });
    },
  }));

  // Capture text selections inside the reader area.
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text) onTextSelect(text);
  }, [onTextSelect]);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!doc.title && doc.content.length === 0 && !doc.fileUrl) {
    return (
      <article className="bg-surface p-6 md:p-8 lg:p-12 reading-canvas">
        <div className="text-center py-20 text-outline/40 italic font-body">
          No content to display. Import a document to begin.
        </div>
      </article>
    );
  }

  // ── Plain-text renderer ─────────────────────────────────────────────────────
  if (!doc.isPdf) {
    return (
      <article className="bg-surface p-6 md:p-8 lg:p-12 reading-canvas" onMouseUp={handleMouseUp}>
        <header className="mb-8 border-b border-outline-variant/10 pb-6">
          <h1 className="text-4xl font-body mb-2 leading-tight">{doc.title}</h1>
        </header>
        <div className="space-y-8 text-xl leading-[1.8] text-on-surface font-body text-justify">
          {doc.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
        <footer className="mt-20 pt-8 border-t border-outline-variant/10 text-center">
          <p className="text-xs font-headline text-outline/30 italic">End of document.</p>
        </footer>
      </article>
    );
  }

  // ── PDF sandwich renderer ───────────────────────────────────────────────────
  return (
    <article
      ref={containerRef}
      className="bg-surface reading-canvas overflow-hidden"
      onMouseUp={handleMouseUp}
    >
      {/* Document header — sits outside the virtualised list so it stays fixed */}
      <header className="px-6 md:px-8 lg:px-12 pt-6 md:pt-8 lg:pt-12 mb-6 border-b border-outline-variant/10 pb-6">
        <div className="flex justify-between items-baseline">
          <h1 className="text-4xl font-body leading-tight">{doc.title}</h1>
          <span className="text-xs font-headline text-outline/40">
            Page {currentPage} of {doc.totalPages}
          </span>
        </div>
      </header>

      {/*
       * THE SANDWICH
       * ┌──────────────────────────────────────────────────┐
       * │ <Document file={fileUrl}>                        │  react-pdf: PDF context
       * │   <Virtuoso totalCount={n}>                      │  react-virtuoso: window
       * │     {(index) => <Page pageNumber={index + 1} />} │  react-pdf: page render
       * │   </Virtuoso>                                    │
       * │ </Document>                                      │
       * └──────────────────────────────────────────────────┘
       *
       * react-pdf's <Document> sets up a shared PDF.js context that all child
       * <Page> components inherit — there's only one parse of the file regardless
       * of how many pages are rendered.
       *
       * react-virtuoso only mounts DOM nodes for pages that are currently in the
       * viewport (plus a small overscan buffer), keeping memory proportional to
       * visible pages rather than total page count.
       */}
      <Document
        file={doc.fileUrl}
        loading={
          <div className="flex items-center justify-center py-20 text-primary/50">
            <span className="text-xs font-headline uppercase tracking-widest animate-pulse">
              Loading PDF…
            </span>
          </div>
        }
        error={
          <div className="flex items-center justify-center py-20 text-red-400">
            <span className="text-sm font-body">Failed to load PDF.</span>
          </div>
        }
        // Disable the default canvas rendering for pages not yet visible —
        // react-virtuoso handles that entirely.
        className="w-full"
      >
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll          // scroll the page, not an inner div
          totalCount={doc.totalPages}
          overscan={1}             // render 1 extra page above/below the viewport
          itemContent={(index) => (
            <PageWrapper index={index} pageWidth={containerWidth} />
          )}
          style={{ width: '100%' }}
        />
      </Document>

      <footer className="mt-8 py-8 border-t border-outline-variant/10 text-center">
        <p className="text-xs font-headline text-outline/30 italic">
          End of document. Use the controls below to navigate.
        </p>
      </footer>
    </article>
  );
});

// ── PageWrapper ───────────────────────────────────────────────────────────────
// Isolated so Virtuoso can remount individual pages without re-rendering siblings.

interface PageWrapperProps {
  index: number;
  pageWidth?: number;
}

function PageWrapper({ index, pageWidth }: PageWrapperProps) {
  const pageNumber = index + 1;

  return (
    <div
      className="flex justify-center px-4 md:px-8"
      style={{ paddingBottom: PAGE_GAP }}
    >
      <div className="shadow-sm bg-surface max-w-full overflow-hidden rounded-sm">
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          // renderTextLayer enables native text selection & search within the PDF.
          // react-pdf renders an invisible <span> overlay that exactly covers each
          // glyph — no bespoke overlay code required.
          renderTextLayer
          // renderAnnotationLayer enables clickable links, form fields, etc.
          renderAnnotationLayer
          loading={
            pageWidth ? (
              <div
                className="flex items-center justify-center bg-surface-variant/30"
                style={{ width: pageWidth, height: pageWidth * 1.414 }}
              >
                <span className="text-[10px] font-headline uppercase tracking-widest text-outline/40 animate-pulse">
                  p.{pageNumber}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-surface-variant/30 w-full aspect-[1/1.414]">
                <span className="text-[10px] font-headline uppercase tracking-widest text-outline/40 animate-pulse">
                  p.{pageNumber}
                </span>
              </div>
            )
          }
          error={
            <div className="flex items-center justify-center p-8 text-red-300">
              <span className="text-xs font-body">Page {pageNumber} failed to render.</span>
            </div>
          }
        />
      </div>
    </div>
  );
}