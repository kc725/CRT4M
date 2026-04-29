import { Settings, Upload, Search, ChevronFirst, ChevronLast } from 'lucide-react';

interface HeaderProps {
  isUploading: boolean;
  onImportClick: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSettingsClick: () => void;
}

export function Header({ isUploading, onImportClick, isSidebarOpen, onToggleSidebar, onSettingsClick }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface flex justify-between items-center h-16 px-8 border-b border-outline-variant/15">
      <div className="flex items-center gap-8">
        <span className="text-xl font-black tracking-tighter text-on-surface font-headline">CRT4M</span>
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={onImportClick}
            disabled={isUploading}
            className="text-sm font-bold tracking-tight font-headline text-primary/60 hover:text-on-surface transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? "Processing..." : "Import"}
            <Upload size={14} />
          </button>
          <button disabled className="text-sm font-bold tracking-tight font-headline text-outline/40 pb-1 cursor-not-allowed">Library</button>
          <button onClick={onSettingsClick} className="text-sm font-bold tracking-tight font-headline text-primary/60 hover:text-on-surface transition-colors cursor-pointer">Settings</button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" />
          <input
            type="text"
            disabled
            aria-label="Search in document"
            placeholder="Search coming soon…"
            className="w-full bg-surface-variant border border-outline-variant/40 rounded-md px-10 py-2 text-sm font-body text-on-surface placeholder:text-outline/40 opacity-50 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="p-2 text-primary hover:text-on-surface transition-colors cursor-pointer"
        >
          {isSidebarOpen ? <ChevronLast size={20} /> : <ChevronFirst size={20} />}
        </button>
        <button onClick={onSettingsClick} aria-label="Settings" className="p-2 text-primary hover:text-on-surface transition-colors cursor-pointer">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
