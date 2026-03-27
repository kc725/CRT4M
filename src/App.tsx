import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Reader } from './components/Reader';
import { ProgressControls } from './components/ProgressControls';
import { useDocumentUpload } from './hooks/useDocumentUpload';
import { useSidebarState } from './hooks/useSidebarState';
import { DocumentData } from './types/document';
import { DEFAULT_DOC } from './constants/defaultDocument';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [document, setDocument] = useState<DocumentData>(DEFAULT_DOC);
  
  const { isSidebarOpen, setIsSidebarOpen, selectedTab, setSelectedTab } = useSidebarState();
  const { fileInputRef, isUploading, handleImportClick, handleFileUpload } = useDocumentUpload(
    setDocument,
    () => setCurrentPage(1)
  );

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
      />

      <main className={`pt-16 md:pt-32 pb-16 md:pb-24 transition-all duration-300 ${isSidebarOpen ? 'mr-80' : 'mr-0'} flex justify-center min-h-screen`}>
        <div className="w-full px-4 md:px-8 lg:px-12 flex flex-col justify-center">
          <Reader document={document} currentPage={currentPage} />

          <ProgressControls 
            currentPage={currentPage}
            totalPages={document.totalPages}
            onPageChange={setCurrentPage}
            onFirstPage={() => setCurrentPage(1)}
            onLastPage={() => setCurrentPage(document.totalPages)}
          />
        </div>
      </main>
    </div>
  );
}

