import React from 'react';

interface FloatingButtonProps {
  icon: React.ReactNode;
  label: string;
}

export function FloatingButton({ icon, label }: FloatingButtonProps) {
  return (
    <button className="p-2 hover:bg-primary-container/50 rounded-full text-primary transition-colors flex items-center gap-1.5 px-3 cursor-pointer">
      {icon}
      <span className="text-[10px] font-headline font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
