import React, { useRef, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Reader, ReaderHandle } from './components/Reader';
import { ProgressControls } from './components/ProgressControls';
import { useDocumentUpload } from './hooks/useDocumentUpload';
import { useSidebarState } from './hooks/useSidebarState';
import { DocumentData } from './types/document';

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

  // Ref to the Reader so we can call scrollToPage imperatively.
  const readerRef = useRef<ReaderHandle>(null);

  const { isSidebarOpen, setIsSidebarOpen, selectedTab, setSelectedTab } = useSidebarState();
  const { fileInputRef, isUploading, handleImportClick, handleFileUpload } = useDocumentUpload(
    setDocument,
    () => setCurrentPage(1),
  );

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

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

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        selectedText={selectedText}
      />

      <main
        className={`pt-16 md:pt-32 pb-16 md:pb-24 transition-all duration-300 ${
          isSidebarOpen ? 'mr-80' : 'mr-0'
        } flex justify-center min-h-screen`}
      >
        <div className="w-full px-4 md:px-8 lg:px-12 flex flex-col justify-center">
          <Reader
            ref={readerRef}
            document={document}
            currentPage={currentPage}
            onTextSelect={handleTextSelection}
          />

          <ProgressControls
            currentPage={currentPage}
            totalPages={document.totalPages}
            onPageChange={setCurrentPage}
            onFirstPage={() => setCurrentPage(1)}
            onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNextPage={() => setCurrentPage((p) => Math.min(document.totalPages || 1, p + 1))}
            onLastPage={() => setCurrentPage(document.totalPages)}
            // Thread scrollToPage through to the virtualised list.
            onScrollToPage={(page) => readerRef.current?.scrollToPage(page)}
          />
        </div>
      </main>
    </div>
  );
}