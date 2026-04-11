import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { DocumentData } from '../types/document';

export function useDocumentUpload(
  onDocumentLoad: (doc: DocumentData) => void,
  onPageReset: () => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Track the current blob URL so we can revoke it when a new file is loaded,
  // preventing memory leaks across multiple imports in one session.
  const currentBlobUrl = useRef<string | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (file.type === 'application/pdf') {
        // Revoke the previous object URL to free memory.
        if (currentBlobUrl.current) {
          URL.revokeObjectURL(currentBlobUrl.current);
        }

        // Create a stable blob URL pointing at the original, unmodified PDF.
        // react-pdf will stream / parse this directly — no destructive processing.
        const blobUrl = URL.createObjectURL(file);
        currentBlobUrl.current = blobUrl;

        // We need the page count up-front so the progress controls are correct.
        // Import pdfjs only for metadata; rendering is fully owned by react-pdf.
        const { getDocument } = await import('pdfjs-dist');
        const { GlobalWorkerOptions } = await import('pdfjs-dist');
        const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
        GlobalWorkerOptions.workerSrc = workerSrc;

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
        const numPages = pdfDoc.numPages;
        pdfDoc.destroy(); // free the pdfjs instance; react-pdf opens its own

        onDocumentLoad({
          title: file.name.replace(/\.pdf$/i, ''),
          content: [],          // PDFs use fileUrl, not content[]
          totalPages: numPages,
          isPdf: true,
          fileUrl: blobUrl,
        });
        onPageReset();
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        const paragraphs = text.split('\n').filter((p) => p.trim() !== '');

        onDocumentLoad({
          title: file.name,
          content: paragraphs,
          totalPages: 1,
          isPdf: false,
        });
        onPageReset();
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process document. Please try a different file.');
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be re-imported if needed.
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return { fileInputRef, isUploading, handleImportClick, handleFileUpload };
}