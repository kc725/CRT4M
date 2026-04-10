import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { DocumentData } from '../types/document';

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
         }

        onDocumentLoad({
          title: file.name.replace('.pdf', ''),
          content: pageImages,
          totalPages: numPages,
          isPdf: true,
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
