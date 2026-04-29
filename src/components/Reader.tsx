/**
 * Reader.tsx
 *
 * Single-page PDF viewer:
 *   <Document>   ← react-pdf: parses the PDF, provides context
 *     <Page>     ← react-pdf: renders the current page with text + annotation layers
 *
 * Text selection works out of the box via react-pdf's built-in TextLayer.
 * The annotation layer enables clickable links in the PDF.
 *
 * For plain-text documents the PDF path is skipped and paragraphs are rendered directly.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { DocumentData } from '../types/document';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReaderProps {
  document: DocumentData;
  currentPage: number;
  onTextSelect: (text: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Reader({ document: doc, currentPage, onTextSelect }: ReaderProps) {
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

  // Scroll to top when the page changes.
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [currentPage]);

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

  // ── PDF single-page renderer ────────────────────────────────────────────────
  return (
    <article
      ref={containerRef}
      className="bg-surface reading-canvas overflow-hidden"
      onMouseUp={handleMouseUp}
    >
      <header className="px-6 md:px-8 lg:px-12 pt-6 md:pt-8 lg:pt-12 mb-6 border-b border-outline-variant/10 pb-6">
        <div className="flex justify-between items-baseline">
          <h1 className="text-4xl font-body leading-tight">{doc.title}</h1>
          <span className="text-xs font-headline text-outline/40">
            Page {currentPage} of {doc.totalPages}
          </span>
        </div>
      </header>

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
        className="w-full"
      >
        <div className="flex justify-center px-4 md:px-8 py-6">
          <div className="shadow-sm bg-surface max-w-full overflow-hidden rounded-sm">
            <Page
              pageNumber={currentPage}
              width={containerWidth}
              renderTextLayer
              renderAnnotationLayer
              loading={
                containerWidth ? (
                  <div
                    className="flex items-center justify-center bg-surface-variant/30"
                    style={{ width: containerWidth, height: containerWidth * 1.414 }}
                  >
                    <span className="text-[10px] font-headline uppercase tracking-widest text-outline/40 animate-pulse">
                      p.{currentPage}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-surface-variant/30 w-full aspect-[1/1.414]">
                    <span className="text-[10px] font-headline uppercase tracking-widest text-outline/40 animate-pulse">
                      p.{currentPage}
                    </span>
                  </div>
                )
              }
              error={
                <div className="flex items-center justify-center p-8 text-red-300">
                  <span className="text-xs font-body">Page {currentPage} failed to render.</span>
                </div>
              }
            />
          </div>
        </div>
      </Document>

      <footer className="mt-8 py-8 border-t border-outline-variant/10 text-center">
        <p className="text-xs font-headline text-outline/30 italic">
          End of document. Use the controls below to navigate.
        </p>
      </footer>
    </article>
  );
}
