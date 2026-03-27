import React from 'react';

interface SidebarTabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SidebarTab({ icon, label, isActive, onClick }: SidebarTabProps) {
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
