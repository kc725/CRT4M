import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Languages, 
  Lightbulb, 
  Bookmark, 
  BookOpen, 
  FileText, 
  ChevronFirst, 
  ChevronLast,
  Search,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentData {
  title: string;
  author: string;
  content: string[];
  totalPages: number;
}

const DEFAULT_DOC: DocumentData = {
  title: "L'Étranger",
  author: "Albert Camus — Chapitre I",
  content: [
    "Aujourd’hui, maman est morte. Ou peut-être hier, je ne sais pas. J’ai reçu un télégramme de l’asile : « Mère décédée. Enterrement demain. Sentiments distingués. » Cela ne veut rien dire. C’était peut-être hier.",
    "L’asile de vieillards est à Marengo, à quatre-vingts kilomètres d’Alger. J'ai pris l'autobus de deux heures et il faisait très chaud. J’ai mangé au restaurant, chez Céleste, comme d’habitude. Ils avaient tous beaucoup de peine pour moi et Céleste m’a dit : « On n’a qu’une mère. » Quand je suis parti, ils m’ont accompagné jusqu’à la porte. J’étais un peu étourdi parce qu’il a fallu que je monte chez Emmanuel for lui emprunter une cravate noire and un brassard. Il a perdu son oncle, il y a quelques mois.",
    "J’ai couru pour ne pas manquer le départ. Ce hâte, cette course, c’est à cause de tout cela, sans doute, ajouté aux cahots, à l’odeur d’essence, à la réverbération de la route et du ciel, que je me suis assoupi. J’ai dormi pendant presque tout le trajet. Et quand je se suis réveillé, j’étais tassé against un militaire qui m’a souri et qui m’a demandé si je venais de loin. J’ai dit « oui » pour n’avoir plus à parler."
  ],
  totalPages: 142
};

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'translation' | 'notes' | 'vocab'>('translation');
  const [document, setDocument] = useState<DocumentData>(DEFAULT_DOC);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        setDocument({
          title: file.name.replace('.pdf', ''),
          author: "Uploaded Document",
          content: pagesContent,
          totalPages: numPages
        });
        setCurrentPage(1);
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        setDocument({
          title: file.name,
          author: "Uploaded Text",
          content: paragraphs,
          totalPages: 1
        });
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process document. Please try a different file.");
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface flex justify-between items-center h-16 px-8 border-b border-outline-variant/15">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black tracking-tighter text-on-surface font-headline">CRT4M</span>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={handleImportClick}
              disabled={isUploading}
              className="text-sm font-bold tracking-tight font-headline text-primary/60 hover:text-on-surface transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? "Processing..." : "Import"}
              <Upload size={14} />
            </button>
            <a href="#" className="text-sm font-bold tracking-tight font-headline text-on-surface border-b-2 border-primary pb-1">Library</a>
            <a href="#" className="text-sm font-bold tracking-tight font-headline text-primary/60 hover:text-on-surface transition-colors">Settings</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-primary hover:text-on-surface transition-colors cursor-pointer">
            <Search size={20} />
          </button>
          <button className="p-2 text-primary hover:text-on-surface transition-colors cursor-pointer">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar (AI Assistant) */}
      <aside className={`fixed right-0 h-full w-80 z-40 bg-background flex flex-col pt-20 pb-8 px-4 border-l border-outline-variant/15 shadow-[-4px_0_24px_rgba(46,52,50,0.04)] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="mb-8 px-4">
          <h2 className="text-lg font-bold font-headline text-on-surface">AI Assistant</h2>
          <p className="text-[10px] uppercase tracking-widest font-headline text-primary/60">Scholarly Analysis</p>
        </div>

        <nav className="flex flex-col gap-2 mb-8">
          <SidebarTab 
            icon={<Languages size={18} />} 
            label="Translation" 
            isActive={selectedTab === 'translation'} 
            onClick={() => setSelectedTab('translation')} 
          />
          <SidebarTab 
            icon={<FileText size={18} />} 
            label="Notes" 
            isActive={selectedTab === 'notes'} 
            onClick={() => setSelectedTab('notes')} 
          />
          <SidebarTab 
            icon={<BookOpen size={18} />} 
            label="Vocab" 
            isActive={selectedTab === 'vocab'} 
            onClick={() => setSelectedTab('vocab')} 
          />
        </nav>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'translation' && (
              <motion.div
                key="translation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <section>
                  <label className="text-[10px] uppercase tracking-widest font-headline text-outline mb-2 block">Source Text</label>
                  <p className="text-lg italic font-body text-on-surface leading-relaxed">"J'ai pris l'autobus de deux heures"</p>
                </section>

                <section className="p-4 bg-surface rounded-xl border border-outline-variant/20 shadow-sm">
                  <label className="text-[10px] uppercase tracking-widest font-headline text-primary mb-2 block">Literal Translation</label>
                  <p className="text-base font-body text-on-surface mb-4">"I took the bus of two hours."</p>
                  <label className="text-[10px] uppercase tracking-widest font-headline text-primary mb-2 block">Idiomatic Translation</label>
                  <p className="text-base font-body text-on-surface font-semibold">"I caught the two o'clock bus."</p>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-headline text-outline block">Grammar Note</label>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <span className="text-xs font-bold font-headline text-primary/40 mt-1">01</span>
                      <p className="text-sm font-body leading-snug">The phrase uses the <span className="italic">passé composé</span> ("J'ai pris") indicating a completed action in the past.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-xs font-bold font-headline text-primary/40 mt-1">02</span>
                      <p className="text-sm font-body leading-snug">"De deux heures" serves as an adjectival phrase modifying "l'autobus", specifying the schedule.</p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-6 border-t border-outline-variant/10 px-4">
          <button className="w-full bg-primary text-surface py-3 rounded-md font-headline text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Bookmark size={14} />
            Save to Vocab
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-32 pb-24 transition-all duration-300 ${isSidebarOpen ? 'mr-80' : 'mr-0'} flex justify-center`}>
        <div className="max-w-3xl w-full px-12">
          {/* Reader Canvas */}
          <article className="bg-surface p-12 md:p-20 reading-canvas relative min-h-[800px]">
            <header className="mb-12 border-b border-outline-variant/10 pb-8">
              <div className="flex justify-between items-baseline">
                <div>
                  <h1 className="text-4xl font-body mb-2 leading-tight">{document.title}</h1>
                  <p className="text-sm font-headline text-outline uppercase tracking-widest">{document.author}</p>
                </div>
                <span className="text-xs font-headline text-outline/40">Page {currentPage} of {document.totalPages}</span>
              </div>
            </header>

            <div className="space-y-8 text-xl leading-[1.8] text-on-surface font-body text-justify">
              {document.content.length > 0 ? (
                document.content.map((paragraph, idx) => (
                  <div key={idx}>
                    {idx === 1 && document.title === "L'Étranger" ? (
                      <>
                        L’asile de vieillards est à Marengo, à quatre-vingts kilomètres d’Alger. 
                        <span className="relative inline-block">
                          <span className="text-highlight cursor-pointer">J'ai pris l'autobus de deux heures</span>
                          
                          {/* Floating Action Menu */}
                          <motion.div 
                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            className="absolute bottom-full left-1/2 mb-4 z-20"
                          >
                            <div className="frosted-vellum border border-outline-variant/20 rounded-full py-1 px-1 shadow-xl flex items-center gap-0">
                              <FloatingButton icon={<Languages size={14} />} label="Translate" />
                              <div className="w-px h-4 bg-outline-variant/30" />
                              <FloatingButton icon={<Lightbulb size={14} />} label="Explain" />
                              <div className="w-px h-4 bg-outline-variant/30" />
                              <FloatingButton icon={<Bookmark size={14} />} label="Save" />
                            </div>
                            <div className="w-3 h-3 frosted-vellum border-r border-b border-outline-variant/20 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                          </motion.div>
                        </span>
                        {' '}et il faisait très chaud. J’ai mangé au restaurant, chez Céleste, comme d’habitude. Ils avaient tous beaucoup de peine pour moi et Céleste m’a dit : « On n’a qu’une mère. » Quand je suis parti, ils m’ont accompagné jusqu’à la porte. J’étais un peu étourdi parce qu’il a fallu que je monte chez Emmanuel for lui emprunter une cravate noire and un brassard. Il a perdu son oncle, il y a quelques mois.
                      </>
                    ) : (
                      paragraph
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-outline/40 italic">
                  No content to display. Import a document to begin.
                </div>
              )}
            </div>

            <footer className="mt-20 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-xs font-headline text-outline/30 italic">End of selection. Use the slider below to navigate.</p>
            </footer>
          </article>

          {/* Progress Controls */}
          <div className="mt-16 flex flex-col items-center gap-6 w-full max-w-xl mx-auto">
            <div className="w-full flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(1)}
                className="text-outline/40 hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronFirst size={20} />
              </button>
              <input 
                type="range" 
                min="1" 
                max={document.totalPages} 
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="flex-1 h-1 bg-outline-variant/20 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <button 
                onClick={() => setCurrentPage(document.totalPages)}
                className="text-outline/40 hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronLast size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-surface-variant/50 px-4 py-2 rounded-full border border-outline-variant/10">
              <span className="text-[10px] uppercase tracking-widest font-headline text-outline">Page</span>
              <input 
                type="number" 
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.min(document.totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-12 bg-transparent border-none focus:ring-0 text-center font-headline font-bold text-primary p-0" 
              />
              <span className="text-[10px] uppercase tracking-widest font-headline text-outline">of {document.totalPages}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarTab({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-row items-center gap-3 rounded-md px-4 py-3 transition-all duration-300 cursor-pointer ${
        isActive 
          ? 'bg-surface text-on-surface shadow-sm border border-outline-variant/10' 
          : 'text-primary hover:bg-surface-variant/30'
      }`}
    >
      <span className={isActive ? 'text-primary' : 'text-primary/60'}>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest font-headline">{label}</span>
    </button>
  );
}

function FloatingButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="p-2 hover:bg-primary-container/50 rounded-full text-primary transition-colors flex items-center gap-1.5 px-3 cursor-pointer">
      {icon}
      <span className="text-[10px] font-headline font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

