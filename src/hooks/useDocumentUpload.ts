import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { pdfjs } from 'react-pdf';
import { DocumentData } from '../types/document';

export function useDocumentUpload(
  onDocumentLoad: (doc: DocumentData) => void,
  onPageReset: () => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    setUploadError(null);
    try {
      if (file.type === 'application/pdf') {
        if (currentBlobUrl.current) {
          URL.revokeObjectURL(currentBlobUrl.current);
        }

        const blobUrl = URL.createObjectURL(file);
        currentBlobUrl.current = blobUrl;

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdfDoc.numPages;
        pdfDoc.destroy();

        onDocumentLoad({
          title: file.name.replace(/\.pdf$/i, ''),
          content: [],
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
      } else {
        setUploadError('Unsupported file type. Please upload a PDF or TXT file.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadError('Failed to process document. Please try a different file.');
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be re-imported if needed.
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearUploadError = () => setUploadError(null);

  return { fileInputRef, isUploading, uploadError, clearUploadError, handleImportClick, handleFileUpload };
}