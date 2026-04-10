import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { DocumentData, PdfPageOverlay } from '../types/document';

// Set up PDF.js worker - use bundled worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export function useDocumentUpload(onDocumentLoad: (doc: DocumentData) => void, onPageReset: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const pageImages: string[] = [];
        const pageOverlays: PdfPageOverlay[] = [];

        // Extract pages from PDF
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 }); // scale up for sharpness

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;

          pageImages.push(canvas.toDataURL('image/png'));

          const textContent = await page.getTextContent();
          const spans = textContent.items
            .map((item) => {
              if (!('str' in item) || !item.str.trim()) return null;

              const textMatrix = pdfjs.Util.transform(viewport.transform, item.transform);
              const fontSize = Math.hypot(textMatrix[2], textMatrix[3]);
              const x = textMatrix[4];
              const y = textMatrix[5] - fontSize;
              const width = item.width * viewport.scale;
              const height = fontSize;

              return {
                text: item.str,
                leftPct: (x / viewport.width) * 100,
                topPct: (y / viewport.height) * 100,
                widthPct: (width / viewport.width) * 100,
                heightPct: (height / viewport.height) * 100,
                fontSizePct: (fontSize / viewport.height) * 100,
              };
            })
            .filter((item): item is PdfPageOverlay['spans'][number] => item !== null);

          pageOverlays.push({
            width: viewport.width,
            height: viewport.height,
            spans,
          });
        }

        onDocumentLoad({
          title: file.name.replace('.pdf', ''),
          content: pageImages,
          totalPages: numPages,
          isPdf: true,
          pageOverlays,
        });
        onPageReset();
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        onDocumentLoad({
          title: file.name,
          content: paragraphs,
          totalPages: 1,
          isPdf: false,
        });
        onPageReset();
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process document. Please try a different file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return { fileInputRef, isUploading, handleImportClick, handleFileUpload };
}
