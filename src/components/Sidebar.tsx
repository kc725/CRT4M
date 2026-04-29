import React from 'react';
import { Languages, FileText, BookOpen, Bookmark, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SidebarTab } from './common/SidebarTab';
import { useAnalysis } from '../hooks/useAnalysis';

interface SidebarProps {
  isSidebarOpen: boolean;
  selectedTab: 'translation' | 'notes' | 'vocab';
  onTabChange: (tab: 'translation' | 'notes' | 'vocab') => void;
  selectedText: string;
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm font-body italic text-outline/50 text-center py-8">{message}</p>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-red-400 text-sm font-body p-3 bg-red-50 rounded-lg">
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-primary/50">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-xs font-headline uppercase tracking-widest">Analysing…</span>
    </div>
  );
}

function AnalyseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-primary-container text-on-primary-container py-2.5 rounded-md font-headline text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-surface transition-colors cursor-pointer"
    >
      {label}
    </button>
  );
}

export function Sidebar({
  isSidebarOpen,
  selectedTab,
  onTabChange,
  selectedText,
}: SidebarProps) {
  const { translation, summary, vocab, analyze } = useAnalysis();

  const hasSelection = selectedText.trim().length > 0;

  const selectionPreview =
    selectedText.length > 120 ? selectedText.slice(0, 120) + '…' : selectedText;

  return (
    <aside
      className={`fixed right-0 h-full w-80 z-40 bg-background flex flex-col pt-20 pb-8 px-4 border-l border-outline-variant/15 shadow-[-4px_0_24px_rgba(46,52,50,0.04)] transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="mb-6 px-4">
        <h2 className="text-lg font-bold font-headline text-on-surface">AI Assistant</h2>
        <p className="text-[10px] uppercase tracking-widest font-headline text-primary/60">
          Scholarly Analysis
        </p>
      </div>

      {/* Selected text preview */}
      <div className="mx-4 mb-6 min-h-[60px]">
        {hasSelection ? (
          <div className="p-3 bg-primary-container/40 rounded-lg border border-primary/10">
            <p className="text-[10px] uppercase tracking-widest font-headline text-primary/60 mb-1">
              Selected
            </p>
            <p className="text-sm font-body italic text-on-surface leading-snug line-clamp-3">
              "{selectionPreview}"
            </p>
          </div>
        ) : (
          <div className="p-3 bg-surface-variant/40 rounded-lg border border-outline-variant/10">
            <p className="text-[10px] uppercase tracking-widest font-headline text-outline/50 mb-1">
              No selection
            </p>
            <p className="text-xs font-body text-outline/40">
              Highlight text in the document to analyse it.
            </p>
          </div>
        )}
      </div>

      {/* Tab nav */}
      <nav aria-label="Analysis tabs" className="flex flex-col gap-2 mb-6 px-0">
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

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <AnimatePresence mode="wait">

          {/* ── Translation ── */}
          {selectedTab === 'translation' && (
            <motion.div
              key="translation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {hasSelection && translation.status !== 'loading' && (
                <AnalyseButton
                  label="Translate"
                  onClick={() => analyze('translation', selectedText)}
                />
              )}

              {!hasSelection && translation.status === 'idle' && (
                <EmptyState message="Select text to translate." />
              )}

              {translation.status === 'loading' && <LoadingState />}

              {translation.status === 'error' && (
                <ErrorState message={translation.error ?? 'Translation failed.'} />
              )}

              {translation.status === 'success' && translation.data && (
                <div className="space-y-4">
                  <section className="p-4 bg-surface rounded-xl border border-outline-variant/20 shadow-sm space-y-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-headline text-primary mb-1 block">
                        Literal
                      </span>
                      <p className="text-base font-body text-on-surface">
                        {translation.data.literal}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-headline text-primary mb-1 block">
                        Idiomatic
                      </span>
                      <p className="text-base font-body text-on-surface font-semibold">
                        {translation.data.idiomatic}
                      </p>
                    </div>
                  </section>

                  {translation.data.notes.length > 0 && (
                    <section className="space-y-3">
                      <span className="text-[10px] uppercase tracking-widest font-headline text-outline block">
                        Grammar Notes
                      </span>
                      {translation.data.notes.map((note, i) => (
                        <div key={note} className="flex gap-3 items-start">
                          <span className="text-xs font-bold font-headline text-primary/40 mt-0.5">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <p className="text-sm font-body leading-snug">{note}</p>
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Notes / Summary ── */}
          {selectedTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {hasSelection && summary.status !== 'loading' && (
                <AnalyseButton
                  label="Summarise"
                  onClick={() => analyze('notes', selectedText)}
                />
              )}

              {!hasSelection && summary.status === 'idle' && (
                <EmptyState message="Select text to summarise." />
              )}

              {summary.status === 'loading' && <LoadingState />}

              {summary.status === 'error' && (
                <ErrorState message={summary.error ?? 'Summarisation failed.'} />
              )}

              {summary.status === 'success' && summary.data && (
                <div className="space-y-4">
                  <section className="p-4 bg-surface rounded-xl border border-outline-variant/20 shadow-sm">
                    <span className="text-[10px] uppercase tracking-widest font-headline text-primary mb-2 block">
                      Summary
                    </span>
                    <p className="text-sm font-body leading-relaxed text-on-surface">
                      {summary.data.summary}
                    </p>
                  </section>

                  {summary.data.key_points.length > 0 && (
                    <section className="space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-headline text-outline block">
                        Key Points
                      </span>
                      {summary.data.key_points.map((point, i) => (
                        <div key={point} className="flex gap-3 items-start">
                          <span className="text-xs font-bold font-headline text-primary/40 mt-0.5">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <p className="text-sm font-body leading-snug">{point}</p>
                        </div>
                      ))}
                    </section>
                  )}

                  {summary.data.themes.length > 0 && (
                    <section>
                      <span className="text-[10px] uppercase tracking-widest font-headline text-outline mb-2 block">
                        Themes
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {summary.data.themes.map((theme, i) => (
                          <span
                            key={theme}
                            className="px-3 py-1 bg-primary-container/60 text-on-primary-container text-xs font-headline font-bold rounded-full"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Vocab ── */}
          {selectedTab === 'vocab' && (
            <motion.div
              key="vocab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {hasSelection && vocab.status !== 'loading' && (
                <AnalyseButton
                  label="Extract Vocabulary"
                  onClick={() => analyze('vocab', selectedText)}
                />
              )}

              {!hasSelection && vocab.status === 'idle' && (
                <EmptyState message="Select text to extract vocabulary." />
              )}

              {vocab.status === 'loading' && <LoadingState />}

              {vocab.status === 'error' && (
                <ErrorState message={vocab.error ?? 'Vocabulary extraction failed.'} />
              )}

              {vocab.status === 'success' && vocab.data && (
                <div className="space-y-3">
                  {vocab.data.words.map((w, i) => (
                    <div
                      key={w.word}
                      className="p-3 bg-surface rounded-xl border border-outline-variant/20 shadow-sm space-y-1"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-headline font-bold text-sm text-on-surface">
                          {w.word}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-headline text-outline/50 shrink-0">
                          {w.part_of_speech}
                        </span>
                      </div>
                      <p className="text-sm font-body text-on-surface-variant leading-snug">
                        {w.definition}
                      </p>
                      <p className="text-xs font-body italic text-outline/60 leading-snug">
                        "{w.example}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-outline-variant/10 px-4">
        <button className="w-full bg-primary text-surface py-3 rounded-md font-headline text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Bookmark size={14} />
          Save to Vocab
        </button>
      </div>
    </aside>
  );
}