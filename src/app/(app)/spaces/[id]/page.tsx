"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format, isPast, isToday } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, MessageSquare, List, LayoutGrid, ChevronDown, MoreHorizontal, Clock, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DndContext, useDraggable, useDroppable, DragEndEvent, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type ViewMode = 'list' | 'board';

function DroppableColumn({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "ring-2 ring-primary ring-inset rounded-b-xl bg-primary/5 transition-colors")}>
      {children}
    </div>
  );
}

function DraggableTaskCard({ task, children }: { task: any, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status }
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none block outline-none">
      {children}
    </div>
  );
}

export default function SpacePage() {
  const params = useParams();
  const spaceId = params.id as string;
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [space, setSpace] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag, allows clicks to pass through
      },
    })
  );

  // Collapsed state for groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (status: string) => {
    setCollapsedGroups(prev => ({ ...prev, [status]: !prev[status] }));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const fetchTasks = async () => {
    if (!token) return;
    setLoadingTasks(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (statusFilter && statusFilter !== 'ALL') q.append('status', statusFilter);
      if (spaceId) q.append('spaceId', spaceId);

      const res = await fetch(`http://localhost:5000/api/tasks?${q.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        logout();
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.statusText}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
      }

      if (spaceId) {
        const spaceRes = await fetch(`http://localhost:5000/api/spaces/${spaceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (spaceRes.ok) {
          const spaceData = await spaceRes.json();
          setSpace(spaceData);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, token]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return; // Dropped outside

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const oldStatus = active.data.current?.status;

    if (newStatus === oldStatus) return; // Dropped in the same column

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    // Backend update
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
    } catch (e) {
      console.error("Drag update failed", e);
      // Revert optimistic update on failure
      fetchTasks();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BACKLOG': return 'bg-muted-foreground';
      case 'IN_PROGRESS': return 'bg-primary';
      case 'REVIEW': return 'bg-amber-500';
      case 'COMPLETED': return 'bg-emerald-500';
      default: return 'bg-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Urgent</Badge>;
      case 'HIGH': return <Badge className="bg-orange-500 hover:bg-orange-600 h-5 px-1.5 text-[10px]">High</Badge>;
      case 'MEDIUM': return <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Medium</Badge>;
      case 'LOW': return <Badge variant="outline" className="text-muted-foreground h-5 px-1.5 text-[10px]">Low</Badge>;
      default: return null;
    }
  };

  const groupedTasks = useMemo(() => {
    const groups: Record<string, any[]> = {
      'BACKLOG': [],
      'IN_PROGRESS': [],
      'REVIEW': [],
      'COMPLETED': []
    };
    
    tasks.forEach(task => {
      if (!groups[task.status]) groups[task.status] = [];
      groups[task.status].push(task);
    });

    // Remove empty groups if filtering by status, otherwise keep them
    return Object.entries(groups).filter(([_, groupTasks]) => statusFilter === 'ALL' || groupTasks.length > 0);
  }, [tasks, statusFilter]);

  if (loading || (!user && !loading)) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-8 relative">
        <div className="px-8 py-5 border-b border-border bg-background flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="px-8 border-b border-border bg-background h-14 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="flex gap-4"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
          <div className="flex gap-3"><Skeleton className="h-8 w-64" /><Skeleton className="h-8 w-32" /></div>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          <TasksPageSkeleton viewMode="list" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-8 relative">
      
      {/* Top Header */}
      <div className="px-8 py-5 border-b border-border bg-background flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{space ? space.name : 'Space Tasks'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'PM' && (
            <Link href={`/tasks/new?spaceId=${spaceId}`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Task
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* View Tabs & Filters Bar */}
      <div className="px-8 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-6 h-12">
          <button 
            onClick={() => setViewMode('list')}
            className={cn("h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors", viewMode === 'list' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <List size={16} /> List
          </button>
          <button 
            onClick={() => setViewMode('board')}
            className={cn("h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors", viewMode === 'board' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid size={16} /> Board
          </button>
        </div>

        <div className="flex items-center gap-3 py-2 sm:py-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9 h-8 text-sm" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
            <SelectTrigger className="w-full sm:w-[140px] h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="BACKLOG">Backlog</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="p-8 pb-20">
          
          {loadingTasks ? (
            <TasksPageSkeleton viewMode={viewMode} />
          ) : viewMode === 'list' ? (
            <div className="space-y-8">
              {groupedTasks.map(([statusKey, groupTasks]) => {
                const isCollapsed = collapsedGroups[statusKey];
                const statusName = statusKey.replace('_', ' ');

                return (
                  <div key={statusKey} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div 
                      className="flex items-center gap-2 mb-3 cursor-pointer group w-fit"
                      onClick={() => toggleGroup(statusKey)}
                    >
                      <div className={cn("p-0.5 rounded hover:bg-muted transition-colors", isCollapsed ? "-rotate-90" : "rotate-0")}>
                        <ChevronDown size={18} className="text-muted-foreground" />
                      </div>
                      <div className={cn("w-2 h-2 rounded-full", getStatusColor(statusKey))} />
                      <h2 className="text-sm font-semibold uppercase tracking-wider">{statusName}</h2>
                      <span className="text-xs text-muted-foreground ml-1">{groupTasks.length}</span>
                    </div>

                    {!isCollapsed && (
                      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-sm">
                        
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-2.5 border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <div className="col-span-7 pl-6">Task Name</div>
                          <div className="col-span-2">Assignee</div>
                          <div className="col-span-2">Due Date</div>
                          <div className="col-span-1 text-right"></div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-border">
                          {groupTasks.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground py-8">
                              No tasks in this group
                            </div>
                          ) : (
                            groupTasks.map((task) => (
                              <div key={task.id} className="grid grid-cols-12 gap-4 p-2.5 items-center hover:bg-muted/50 transition-colors group relative bg-card text-card-foreground">
                                {/* Hover Checkbox Placeholder (Visual Only) */}
                                <div className="absolute left-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-3.5 h-3.5 border border-border rounded-[3px] bg-transparent" />
                                </div>
                                
                                <div className="col-span-7 pl-6 flex items-center gap-3">
                                  {getPriorityBadge(task.priority)}
                                  {task.tags && task.tags.map((tag: any) => (
                                    <Badge 
                                      key={tag.id} 
                                      variant="secondary"
                                      className="px-1.5 py-0 text-[10px] font-medium"
                                      style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40`, borderWidth: 1 }}
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))}
                                  <Link href={`/tasks/${task.id}`} className="font-medium truncate hover:text-primary transition-colors cursor-pointer text-foreground text-[13px]">
                                    {task.title}
                                  </Link>
                                  {task._count?.comments > 0 && (
                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-2">
                                      <MessageSquare className="w-3 h-3" /> {task._count.comments}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="col-span-2">
                                  {task.assignee ? (
                                    <span className="flex items-center gap-2 text-[13px]">
                                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                                        {task.assignee.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="truncate">{task.assignee.name}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[13px] text-muted-foreground italic">Unassigned</span>
                                  )}
                                </div>
                                
                                <div className="col-span-2 text-[13px] flex items-center">
                                  {task.dueDate ? (
                                    <span className={cn(
                                      "flex items-center gap-1",
                                      isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) 
                                        ? "text-red-500 font-medium" 
                                        : "text-muted-foreground"
                                    )}>
                                      <Clock className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground italic opacity-50 text-[12px]">No Due Date</span>
                                  )}
                                </div>

                                <div className="col-span-1 text-right flex justify-end pr-2">
                                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted text-muted-foreground transition-all">
                                    <MoreHorizontal size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'board' ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCorners} 
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 h-full min-h-[600px] overflow-x-auto pb-4 items-start">
                {groupedTasks.map(([statusKey, groupTasks]) => {
                  const statusName = statusKey.replace('_', ' ');
                  return (
                    <div key={statusKey} className="flex-shrink-0 w-[320px] flex flex-col bg-muted/30 rounded-xl border border-border max-h-full">
                      {/* Column Header */}
                      <div className="p-3 border-b border-border flex items-center justify-between bg-muted/50 rounded-t-xl sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(statusKey))} />
                          <h3 className="font-semibold text-sm uppercase tracking-wider">{statusName}</h3>
                          <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                            {groupTasks.length}
                          </span>
                        </div>
                        <Link href={`/tasks/new?spaceId=${spaceId}`}>
                          <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted">
                            <Plus size={16} />
                          </button>
                        </Link>
                      </div>

                      {/* Column Content Area (Droppable) */}
                      <DroppableColumn id={statusKey} className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar min-h-[120px]">
                        {groupTasks.length === 0 ? (
                          <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground bg-background/50">
                            Drop tasks here
                          </div>
                        ) : (
                          groupTasks.map(task => (
                            <DraggableTaskCard key={task.id} task={task}>
                              <div className="bg-card text-card-foreground border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all hover:border-primary/50 cursor-grab active:cursor-grabbing group">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors pr-2">{task.title}</h4>
                                  <div className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer">
                                    <Link href={`/tasks/${task.id}`}>
                                      <MoreHorizontal size={14} />
                                    </Link>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                  {getPriorityBadge(task.priority)}
                                  {task.tags && task.tags.map((tag: any) => (
                                    <Badge 
                                      key={tag.id} 
                                      variant="secondary"
                                      className="px-1.5 py-0 text-[10px] font-medium"
                                      style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40`, borderWidth: 1 }}
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                                  {task.assignee ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary" title={task.assignee.name}>
                                        {task.assignee.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground" title="Unassigned">
                                      ?
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {task._count?.comments > 0 && (
                                      <span className="flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> {task._count.comments}
                                      </span>
                                    )}
                                    {task.dueDate ? (
                                      <span className={cn(
                                        "flex items-center gap-1",
                                        isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) 
                                          ? "text-red-500 font-medium" 
                                          : ""
                                      )}>
                                        <Clock className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM d')}
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 opacity-50">
                                        <Clock className="w-3 h-3" /> --
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DraggableTaskCard>
                          ))
                        )}
                      </DroppableColumn>
                    </div>
                  );
                })}
              </div>
            </DndContext>
          ) : null}

        </div>
      </div>
    </div>
  );
}

function TasksPageSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-2.5 border-b border-border bg-muted/50">
                <div className="col-span-7 pl-6"><Skeleton className="h-3 w-20" /></div>
                <div className="col-span-2"><Skeleton className="h-3 w-16" /></div>
                <div className="col-span-2"><Skeleton className="h-3 w-16" /></div>
              </div>
              <div className="divide-y divide-border">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="grid grid-cols-12 gap-4 p-2.5 items-center">
                    <div className="col-span-7 pl-6 flex items-center gap-3">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full min-h-[600px] overflow-x-hidden pb-4 items-start animate-in fade-in duration-500">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex-shrink-0 w-[320px] flex flex-col bg-muted/30 rounded-xl border border-border">
          <div className="p-3 border-b border-border flex items-center justify-between bg-muted/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <div className="p-3 space-y-3">
            {[1, 2, 3].map(j => (
              <div key={j} className="bg-card border border-border rounded-lg p-3 shadow-sm">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
