"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Hash, Folder, Layout, Lock, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreateSpaceModal } from './CreateSpaceModal';
import { useAuth } from '@/app/context/AuthContext';

export function SecondarySidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const { token } = useAuth();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/spaces', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSpaces(data);
        }
      })
      .catch(err => console.error(err));
    }
  }, [token]);

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <aside 
      className={cn(
        "h-screen fixed top-0 left-16 bg-card border-r border-border transition-all duration-300 z-40 flex flex-col overflow-hidden",
        isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-64 opacity-100"
      )}
    >
      {/* Header Area */}
      <div className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-transparent mt-2">
        <h2 className="font-bold text-foreground text-[15px] truncate max-w-[180px]">
          Kognit Workspace
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Settings size={16} />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
        
        {/* Favorites / Global Section */}
        <div className="space-y-1">
          <SidebarItem href="/" icon={<Layout size={16} />} label="Everything" active={pathname === '/'} />
          <SidebarItem href="/tasks" icon={<Hash size={16} />} label="All Tasks" active={pathname?.startsWith('/tasks')} />
        </div>

        {/* SPACES ACCORDION */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 mb-1 group text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-[11px] font-bold uppercase tracking-wider">Spaces</span>
            <button 
              onClick={() => setIsCreateSpaceOpen(true)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <AccordionItem title="All Spaces" defaultOpen={true}>
            {spaces.map(space => (
              <SidebarItem 
                key={space.id} 
                href={`/spaces/${space.id}`} 
                icon={<Folder size={14} />} 
                label={space.name} 
                active={pathname === `/spaces/${space.id}`} 
                isSubItem 
              />
            ))}
            {spaces.length === 0 && (
              <div className="text-[12px] text-muted-foreground px-6 py-2">No spaces yet.</div>
            )}
          </AccordionItem>
        </div>

        {/* DIRECT MESSAGES ACCORDION */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 mb-1 group cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-[11px] font-bold uppercase tracking-wider">Direct Messages</span>
            <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Mock Users */}
          <UserItem name="Alice Smith" online={true} />
          <UserItem name="Bob Jones" online={false} />
          <UserItem name="Charlie Brown" online={true} />
        </div>

      </div>
      
      <CreateSpaceModal 
        isOpen={isCreateSpaceOpen} 
        onClose={() => setIsCreateSpaceOpen(false)} 
        onSpaceCreated={(space) => setSpaces([space, ...spaces])}
      />
    </aside>
  );
}

function SidebarItem({ href, icon, label, active, isSubItem = false }: { href: string; icon: React.ReactNode; label: string; active: boolean; isSubItem?: boolean }) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2 py-[6px] rounded-md text-[13px] font-medium transition-colors group",
        isSubItem ? "ml-4" : "",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <div className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-[2px]">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-[6px] rounded-md text-[13px] font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
      >
        <div className="shrink-0 text-muted-foreground">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <div className="w-4 h-4 rounded-[4px] bg-primary/20 text-primary flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold">{title.charAt(0)}</span>
        </div>
        <span className="truncate">{title}</span>
      </div>
      {isOpen && (
        <div className="flex flex-col space-y-[2px] mt-1 relative">
          <div className="absolute left-[15px] top-0 bottom-2 w-[1px] bg-border pointer-events-none" />
          {children}
        </div>
      )}
    </div>
  );
}

function UserItem({ name, online }: { name: string; online: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-[6px] rounded-md text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
      <div className="relative shrink-0 flex">
        <div className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-bold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        {online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
        )}
      </div>
      <span className="truncate">{name}</span>
    </div>
  );
}
