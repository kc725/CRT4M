import React from 'react';
import { motion } from 'motion/react';
import { Languages, Lightbulb, Bookmark } from 'lucide-react';
import { DocumentData } from '../types/document';
import { FloatingButton } from './common/FloatingButton';

interface ReaderProps {
  document: DocumentData;
  currentPage: number;
}

export function Reader({ document, currentPage }: ReaderProps) {
  return (
    <article className="bg-surface p-6 md:p-8 lg:p-12 reading-canvas relative">
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
                  L'asile de vieillards est à Marengo, à quatre-vingts kilomètres d'Alger. 
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
                  {' '}et il faisait très chaud. J'ai mangé au restaurant, chez Céleste, comme d'habitude. Ils avaient tous beaucoup de peine pour moi et Céleste m'a dit : « On n'a qu'une mère. » Quand je suis parti, ils m'ont accompagné jusqu'à la porte. J'étais un peu étourdi parce qu'il a fallu que je monte chez Emmanuel for lui emprunter une cravate noire and un brassard. Il a perdu son oncle, il y a quelques mois.
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
  );
}
