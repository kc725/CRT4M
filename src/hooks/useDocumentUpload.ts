import { useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { DocumentData } from '../types/document';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function useDocumentUpload(onDocumentLoad: (doc: DocumentData) => void, onPageReset: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const pagesContent: string[] = [];

        // Extract text from all pages
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          pagesContent.push(pageText);
        }

        onDocumentLoad({
          title: file.name.replace('.pdf', ''),
          author: "Uploaded Document",
          content: pagesContent,
          totalPages: numPages
        });
        onPageReset();
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        onDocumentLoad({
          title: file.name,
          author: "Uploaded Text",
          content: paragraphs,
          totalPages: 1
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
