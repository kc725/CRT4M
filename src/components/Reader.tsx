import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DocumentData } from '../types/document';

interface HighlightRect {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
}

interface ReaderProps {
  document: DocumentData;
  currentPage: number;
  onTextSelect: (text: string) => void;
}

export function Reader({ document, currentPage, onTextSelect }: ReaderProps) {
  const pageContent = document.content[currentPage - 1] ?? '';
  const currentOverlay = document.pageOverlays?.[currentPage - 1];
  const overlayRef = useRef<HTMLDivElement>(null);
  const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setHighlightRects([]);
  }, []);

  const updateSelectionHighlight = useCallback(() => {
    const selection = window.getSelection();
    const overlayBounds = overlayRef.current?.getBoundingClientRect();

    if (!selection || selection.rangeCount === 0 || !overlayBounds) {
      setHighlightRects([]);
      return;
    }

    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects())
      .map((rect) => {
        const left = rect.left - overlayBounds.left;
        const top = rect.top - overlayBounds.top;

        return {
          leftPct: (left / overlayBounds.width) * 100,
          topPct: (top / overlayBounds.height) * 100,
          widthPct: (rect.width / overlayBounds.width) * 100,
          heightPct: (rect.height / overlayBounds.height) * 100,
        };
      })
      .filter((rect) => rect.widthPct > 0 && rect.heightPct > 0);

    setHighlightRects(rects);
  }, []);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if(text) {
      onTextSelect(text);
      updateSelectionHighlight();
    } else {
      setHighlightRects([]);
    }
  };

  useEffect(() => {
    setHighlightRects([]);
  }, [currentPage, document.title]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  return (
    <article className="bg-surface p-6 md:p-8 lg:p-12 reading-canvas relative">
      <header className="mb-8 border-b border-outline-variant/10 pb-6">
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-4xl font-body mb-2 leading-tight">{document.title}</h1>
          </div>
          <span className="text-xs font-headline text-outline/40">
            Page {currentPage} of {document.totalPages}
          </span>
        </div>
      </header>

      <div className="w-full">
        {document.content.length > 0 ? (
          document.isPdf ? (
            <div className="relative w-full" onMouseUp={handleMouseUp}>
              {/* Render the current page as an image to preserve formatting */}
              <img
                src={pageContent}
                alt={`Page ${currentPage}`}
                className="w-full h-auto shadow-sm block"
              />

              {currentOverlay && (
                <div ref={overlayRef} className="absolute inset-0 select-text">
                  {highlightRects.map((rect, idx) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`highlight-${idx}`}
                      className="absolute bg-primary/25 pointer-events-none"
                      style={{
                        left: `${rect.leftPct}%`,
                        top: `${rect.topPct}%`,
                        width: `${rect.widthPct}%`,
                        height: `${rect.heightPct}%`,
                      }}
                    />
                  ))}

                  {currentOverlay.spans.map((span, idx) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      className="absolute whitespace-pre"
                      style={{
                        left: `${span.leftPct}%`,
                        top: `${span.topPct}%`,
                        width: `${span.widthPct}%`,
                        height: `${span.heightPct}%`,
                        fontSize: `${span.fontSizePct}%`,
                        lineHeight: 1,
                        color: 'transparent',
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                      }}
                    >
                      {span.text}
                    </span>
                  ))}
                </div>
              )}

              {highlightRects.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute top-3 right-3 bg-surface/90 border border-outline-variant/30 px-3 py-1 text-xs rounded-md shadow-sm hover:bg-surface"
                >
                  Clear selection
                </button>
              )}
            </div>
          ) : (
            // Render plain text paragraphs
            <div className="space-y-8 text-xl leading-[1.8] text-on-surface font-body text-justify" onMouseUp={handleMouseUp}>
              {document.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 text-outline/40 italic">
            No content to display. Import a document to begin.
          </div>
        )}
      </div>

      <footer className="mt-20 pt-8 border-t border-outline-variant/10 text-center">
        <p className="text-xs font-headline text-outline/30 italic">
          End of page. Use the slider below to navigate.
        </p>
      </footer>
    </article>
  );
}
