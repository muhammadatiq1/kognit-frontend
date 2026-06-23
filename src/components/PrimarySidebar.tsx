"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Home, CheckSquare, MessageSquare, Plus, Bell, Settings, Bot, Users, Search, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/mode-toggle';

export function PrimarySidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="w-16 h-screen fixed left-0 top-0 flex flex-col items-center py-4 z-50 bg-muted/30 border-r border-border transition-colors">
      
      {/* Brand Icon */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-extrabold text-lg shadow-md mb-6 shrink-0">
        K
      </div>

      <div className="flex flex-col gap-3 w-full px-2 flex-1 items-center">
        <PrimaryNavItem href="/" icon={<Home size={20} />} label="Home" active={pathname === '/'} />
        <PrimaryNavItem href="/tasks" icon={<CheckSquare size={20} />} label="Tasks" active={pathname?.startsWith('/tasks')} />
        <PrimaryNavItem href="/chat" icon={<MessageSquare size={20} />} label="Chat" active={pathname?.startsWith('/chat')} />
        <div className="w-8 h-[1px] bg-border my-1" />
        <PrimaryNavItem href="/ai" icon={<Bot size={20} />} label="AI" active={pathname?.startsWith('/ai')} />
        <PrimaryNavItem href="/teams" icon={<Users size={20} />} label="Teams" active={pathname?.startsWith('/teams')} />
      </div>

      <div className="mt-auto flex flex-col gap-3 items-center w-full px-2">
        <PrimaryNavItem href="/search" icon={<Search size={20} />} label="Search" active={pathname === '/search'} />
        <PrimaryNavItem href="/notifications" icon={<Bell size={20} />} label="Notifications" active={pathname === '/notifications'} />
        
        <div className="w-8 h-[1px] bg-border my-1" />
        
        <div className="flex flex-col items-center gap-3">
          <ModeToggle />
          
          {user && (
            <button 
              onClick={logout}
              title="Logout"
              className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <LogOut size={20} />
            </button>
          )}

          {user && (
            <Avatar className="w-9 h-9 border border-border cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </nav>
  );
}

function PrimaryNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link 
      href={href}
      title={label}
      className={cn(
        "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 group relative",
        active 
          ? "bg-primary/15 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {/* Tooltip-like active indicator dot could go here */}
    </Link>
  );
}
