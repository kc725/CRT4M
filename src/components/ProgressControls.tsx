import React from 'react';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProgressControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
}

export function ProgressControls({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onFirstPage, 
  onPreviousPage,
  onNextPage,
  onLastPage 
}: ProgressControlsProps) {
  const isAtFirstPage = currentPage <= 1;
  const isAtLastPage = currentPage >= totalPages || totalPages === 0;

  return (
    <div className="mt-16 flex flex-col items-center gap-6 w-full max-w-xl mx-auto">
      <div className="w-full flex items-center gap-4">
        <button 
          onClick={onFirstPage}
          disabled={isAtFirstPage}
          aria-label="First page"
          className="text-outline/40 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-outline/40"
        >
          <ChevronFirst size={20} />
        </button>
        <button 
          onClick={onPreviousPage}
          disabled={isAtFirstPage}
          aria-label="Previous page"
          className="text-outline/40 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-outline/40"
        >
          <ChevronLeft size={20} />
        </button>
        <input 
          type="range" 
          min="1" 
          max={totalPages} 
          value={currentPage}
          onChange={(e) => onPageChange(parseInt(e.target.value))}
          className="flex-1 h-1 bg-outline-variant/20 rounded-full appearance-none cursor-pointer accent-primary"
        />
        <button 
          onClick={onNextPage}
          disabled={isAtLastPage}
          aria-label="Next page"
          className="text-outline/40 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-outline/40"
        >
          <ChevronRight size={20} />
        </button>
        <button 
          onClick={onLastPage}
          disabled={isAtLastPage}
          aria-label="Last page"
          className="text-outline/40 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-outline/40"
        >
          <ChevronLast size={20} />
        </button>
      </div>
      <div className="flex items-center gap-2 bg-surface-variant/50 px-4 py-2 rounded-full border border-outline-variant/10">
        <span className="text-[10px] uppercase tracking-widest font-headline text-outline">Page</span>
        <input 
          type="number" 
          value={currentPage}
          onChange={(e) => onPageChange(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-12 bg-transparent border-none focus:ring-0 text-center font-headline font-bold text-primary p-0" 
        />
        <span className="text-[10px] uppercase tracking-widest font-headline text-outline">of {totalPages}</span>
      </div>
    </div>
  );
}
