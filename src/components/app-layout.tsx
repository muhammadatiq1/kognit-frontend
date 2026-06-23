"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PrimarySidebar } from './PrimarySidebar';
import { SecondarySidebar } from './SecondarySidebar';

import { Menu } from 'lucide-react';
import { Button } from './ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSecondaryCollapsed, setIsSecondaryCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <PrimarySidebar />
      <SecondarySidebar isCollapsed={isSecondaryCollapsed} />
      
      <main 
        className={`flex-1 transition-all duration-300 flex flex-col min-h-screen ${
          isSecondaryCollapsed ? 'ml-16' : 'ml-[20rem]' /* 16px (w-16 = 4rem) + 64px (w-64 = 16rem) = 20rem total */
        }`}
      >
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center px-4 shrink-0 bg-white/50 dark:bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsSecondaryCollapsed(!isSecondaryCollapsed)}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Menu size={18} />
          </Button>
          
          {/* Breadcrumbs or Context Title could go here */}
          <div className="ml-3 text-sm font-medium text-muted-foreground">
            Numbrics Development Space
          </div>
        </header>
        
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
