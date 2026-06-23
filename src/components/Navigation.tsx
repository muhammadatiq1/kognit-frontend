"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { LayoutDashboard, CheckSquare, LogOut, LogIn, UserPlus, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

export function Navigation({ isCollapsed, setIsCollapsed }: { isCollapsed?: boolean, setIsCollapsed?: (val: boolean) => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className={cn("bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 flex flex-col p-4 z-50 text-sidebar-foreground transition-all duration-300", isCollapsed ? "w-16 items-center" : "w-60")}>
      
      <div className={cn("mb-8 flex items-center", isCollapsed ? "justify-center pl-0" : "gap-3 pl-2")}>
        <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold shadow-sm">
          K
        </div>
        <div>
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight leading-tight">
              Kognit
            </h1>
          )}
          {user && !isCollapsed && (
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              {user.role} &bull; {user.name}
            </p>
          )}
        </div>
      </div>

      <div className={cn("flex flex-col gap-2 flex-1", isCollapsed && "items-center")}>
        {user ? (
          <>
            <NavItem href="/" icon={<LayoutDashboard size={isCollapsed ? 20 : 18} />} label="Dashboard" active={pathname === '/'} isCollapsed={isCollapsed} />
            <NavItem href="/tasks" icon={<CheckSquare size={isCollapsed ? 20 : 18} />} label="Tasks" active={pathname?.startsWith('/tasks')} isCollapsed={isCollapsed} />
          </>
        ) : (
          <>
            <NavItem href="/login" icon={<LogIn size={18} />} label="Login" active={pathname === '/login'} isCollapsed={isCollapsed} />
            <NavItem href="/register" icon={<UserPlus size={18} />} label="Register" active={pathname === '/register'} isCollapsed={isCollapsed} />
          </>
        )}
      </div>

      <div className={cn("mt-auto flex items-center gap-2 border-t border-sidebar-border pt-4", isCollapsed ? "flex-col" : "justify-between")}>
        {user && (
          <Button 
            variant="ghost" 
            className={cn("text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 h-auto text-[13px]", isCollapsed ? "justify-center w-10 px-0" : "justify-start flex-1")}
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Logout"}
          </Button>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
}

function NavItem({ href, icon, label, active, isCollapsed }: { href: string; icon: React.ReactNode; label: string; active: boolean; isCollapsed?: boolean }) {
  return (
    <Link 
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors group",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        isCollapsed && "justify-center px-0 py-2 w-10"
      )}
    >
      <div className={cn("text-sidebar-foreground/50 group-hover:text-sidebar-foreground transition-colors", active && "text-sidebar-primary")}>
        {icon}
      </div>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}
