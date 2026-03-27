import React from 'react';
import { Languages, FileText, BookOpen, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SidebarTab } from './common/SidebarTab';

interface SidebarProps {
  isSidebarOpen: boolean;
  selectedTab: 'translation' | 'notes' | 'vocab';
  onTabChange: (tab: 'translation' | 'notes' | 'vocab') => void;
}

export function Sidebar({ isSidebarOpen, selectedTab, onTabChange }: SidebarProps) {
  return (
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
          onClick={() => onTabChange('translation')} 
        />
        <SidebarTab 
          icon={<FileText size={18} />} 
          label="Notes" 
          isActive={selectedTab === 'notes'} 
          onClick={() => onTabChange('notes')} 
        />
        <SidebarTab 
          icon={<BookOpen size={18} />} 
          label="Vocab" 
          isActive={selectedTab === 'vocab'} 
          onClick={() => onTabChange('vocab')} 
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
  );
}
