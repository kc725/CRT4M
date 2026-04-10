import React from 'react';
import { DocumentData } from '../types/document';

interface ReaderProps {
  document: DocumentData;
  currentPage: number;
  onTextSelect: (text: string) => void;
}

export function Reader({ document, currentPage, onTextSelect }: ReaderProps) {
  const pageContent = document.content[currentPage - 1] ?? '';
  const currentOverlay = document.pageOverlays?.[currentPage - 1];

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if(text) {
      onTextSelect(text);
    }
  };

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
                <div className="absolute inset-0 select-text">
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
