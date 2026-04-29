import React, { Suspense, useCallback, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { Header } from './components/Header';
import { ProgressControls } from './components/ProgressControls';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useDocumentUpload } from './hooks/useDocumentUpload';
import { useSidebarState } from './hooks/useSidebarState';
import { DocumentData } from './types/document';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const Reader = React.lazy(() => import('./components/Reader').then(m => ({ default: m.Reader })));
const Sidebar = React.lazy(() => import('./components/Sidebar').then(m => ({ default: m.Sidebar })));

// Import react-pdf layer styles here so they're loaded once globally.
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState('');
  const [document, setDocument] = useState<DocumentData>({
    title: '',
    content: [],
    totalPages: 0,
  });

  const { isSidebarOpen, setIsSidebarOpen, selectedTab, setSelectedTab } = useSidebarState();
  const { fileInputRef, isUploading, uploadError, clearUploadError, handleImportClick, handleFileUpload } = useDocumentUpload(
    setDocument,
    () => setCurrentPage(1),
  );

  const handleTextSelection = useCallback((text: string) => {
    setSelectedText(text);
    setIsSidebarOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.txt"
        className="hidden"
      />

      <Header
        isUploading={isUploading}
        onImportClick={handleImportClick}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <ErrorBoundary>
        <Suspense>
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            selectedText={selectedText}
          />
        </Suspense>
      </ErrorBoundary>

      <main
        className={`pt-16 md:pt-32 pb-16 md:pb-24 transition-all duration-300 ${
          isSidebarOpen ? 'mr-80' : 'mr-0'
        } flex justify-center min-h-screen`}
      >
        <div className="w-full px-4 md:px-8 lg:px-12 flex flex-col justify-center">
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-600 font-body">{uploadError}</span>
              <button onClick={clearUploadError} className="text-red-400 hover:text-red-600 text-xs cursor-pointer">Dismiss</button>
            </div>
          )}
          <ErrorBoundary>
            <Suspense>
              <Reader
                document={document}
                currentPage={currentPage}
                onTextSelect={handleTextSelection}
              />
            </Suspense>
          </ErrorBoundary>

          <ProgressControls
            currentPage={currentPage}
            totalPages={document.totalPages}
            onPageChange={setCurrentPage}
            onFirstPage={() => setCurrentPage(1)}
            onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNextPage={() => setCurrentPage((p) => Math.min(document.totalPages || 1, p + 1))}
            onLastPage={() => setCurrentPage(document.totalPages)}
          />
        </div>
      </main>
    </div>
  );
}