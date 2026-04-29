import { useState } from 'react';
import type { SidebarTab } from '../types/document';

export function useSidebarState() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<SidebarTab>('translation');

  return { isSidebarOpen, setIsSidebarOpen, selectedTab, setSelectedTab };
}
