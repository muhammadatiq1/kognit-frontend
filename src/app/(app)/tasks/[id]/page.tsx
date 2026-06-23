"use client";

import React, { useEffect, useState, use } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ArrowLeft, Clock, MessageSquare, Send, Trash2, CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TagSelector } from '@/components/TagSelector';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const fetchTask = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      } else {
        router.push('/tasks');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id, token]);

  const handleStatusChange = async (newStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTask({ ...task, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDateChange = async (field: 'startDate' | 'dueDate', date: Date | undefined) => {
    if (!token) return;
    try {
      const value = date ? date.toISOString() : null;
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        setTask({ ...task, [field]: value });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTagsChange = async (tagIds: string[]) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tagIds })
      });
      if (res.ok) {
        fetchTask();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim() || !token) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`http://localhost:5000/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment, taskId: id })
      });
      if (res.ok) {
        setComment('');
        fetchTask();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!token || !window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) router.push('/tasks');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !user || !task) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <div className="flex gap-4 border-b border-border/60 pb-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
            <div className="pt-8 mt-8 border-t border-border">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
        {user.role === 'PM' && (
          <Button variant="destructive" size="sm" onClick={handleDeleteTask}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground leading-tight">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium border-b border-border/60 pb-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground/70" /> {format(new Date(task.createdAt), 'MMMM d, yyyy')}
              </span>
              <span className="text-muted-foreground/30">&bull;</span>
              <span className="flex items-center gap-2">
                <Avatar className="w-5 h-5 border border-border">
                  <AvatarFallback className="text-[10px]">{getInitials(task.author.name)}</AvatarFallback>
                </Avatar>
                Created by {task.author.name}
              </span>
            </div>
          </div>

          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <div className="bg-muted/50 p-4 rounded-lg border border-border whitespace-pre-wrap">
                {task.description}
              </div>
            </div>

            {task.acceptanceCriteria && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Acceptance Criteria</h3>
                <div className="bg-muted/50 p-4 rounded-lg border border-border whitespace-pre-wrap">
                  {task.acceptanceCriteria}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="pt-8 mt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Team Discussion
            </h3>

            <div className="space-y-4 mb-6">
              {task.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No comments yet. Start the discussion!</p>
              ) : (
                task.comments.map((c: any) => (
                  <div key={c.id} className="flex gap-4">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(c.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/50 p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{c.author.name} <span className="text-xs text-muted-foreground font-normal ml-1">({c.author.role})</span></span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-4">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder="Ask a question or provide an update..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button onClick={handlePostComment} disabled={submittingComment || !comment.trim()}>
                    <Send className="w-4 h-4 mr-2" /> Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground block">Assignee</span>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarFallback className="text-xs">{getInitials(task.assignee.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Unassigned</span>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground block">Start Date</span>
                <Popover>
                  <PopoverTrigger 
                    className={cn(
                      "group/button inline-flex shrink-0 items-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-8 px-2.5",
                      "w-full justify-start text-left font-normal",
                      !task.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {task.startDate ? format(new Date(task.startDate), "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={task.startDate ? new Date(task.startDate) : undefined}
                      onSelect={(date) => handleDateChange('startDate', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground block">Due Date</span>
                <Popover>
                  <PopoverTrigger 
                    className={cn(
                      "group/button inline-flex shrink-0 items-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-8 px-2.5",
                      "w-full justify-start text-left font-normal",
                      !task.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {task.dueDate ? format(new Date(task.dueDate), "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={task.dueDate ? new Date(task.dueDate) : undefined}
                      onSelect={(date) => handleDateChange('dueDate', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground block">Priority</span>
                <Badge variant={task.priority === 'URGENT' ? 'destructive' : 'outline'} className="text-xs uppercase">
                  {task.priority}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground block">Tags</span>
                <TagSelector 
                  selectedTagIds={task.tags?.map((t: any) => t.id) || []} 
                  onChange={handleTagsChange} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
