import { useState } from 'react';

export function useSidebarState() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'translation' | 'notes' | 'vocab'>('translation');

  return { isSidebarOpen, setIsSidebarOpen, selectedTab, setSelectedTab };
}
