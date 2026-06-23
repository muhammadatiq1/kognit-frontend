"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ListTodo, Activity, CheckCircle, Clock, Plus, ArrowRight, LayoutDashboard, TrendingUp, Inbox } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, backlog: 0, inProgress: 0, review: 0, completed: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (token) {
      setLoadingTasks(true);
      fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
          setStats({
            total: data.length,
            backlog: data.filter((t: any) => t.status === 'BACKLOG').length,
            inProgress: data.filter((t: any) => t.status === 'IN_PROGRESS').length,
            review: data.filter((t: any) => t.status === 'REVIEW').length,
            completed: data.filter((t: any) => t.status === 'COMPLETED').length,
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingTasks(false));
    }
  }, [token]);

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  const recentTasks = tasks.slice(0, 5);

  const chartData = [
    { name: 'Backlog', value: stats.backlog, color: '#64748b' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Review', value: stats.review, color: '#f59e0b' },
    { name: 'Completed', value: stats.completed, color: '#10b981' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-10 text-primary-foreground shadow-lg">
        <div className="absolute inset-0 bg-black/5 backdrop-blur-sm"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur-md mb-2 border border-white/20">
              <LayoutDashboard size={16} />
              <span>Project Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-primary-foreground/90 max-w-xl text-lg">
              You have <span className="font-bold text-white">{stats.inProgress} tasks in progress</span> and <span className="font-bold text-white">{stats.review} awaiting review</span> today. Let's make it a productive day!
            </p>
          </div>
          
          {user.role === 'PM' && (
            <Link href="/tasks/new">
              <Button variant="secondary" className="shadow-lg font-semibold transition-all hover:scale-105 active:scale-95 h-11 px-6">
                <Plus className="mr-2 h-5 w-5" /> Create New Task
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tasks" value={stats.total} icon={<ListTodo className="h-5 w-5" />} loading={loadingTasks} gradient="bg-muted text-foreground border-border" />
        <StatCard title="In Progress" value={stats.inProgress} icon={<Activity className="h-5 w-5" />} loading={loadingTasks} gradient="bg-primary/10 text-primary border-primary/20" />
        <StatCard title="In Review" value={stats.review} icon={<Clock className="h-5 w-5" />} loading={loadingTasks} gradient="bg-amber-500/10 text-amber-600 border-amber-500/20" />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle className="h-5 w-5" />} loading={loadingTasks} gradient="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Chart Section */}
        <Card className="col-span-1 shadow-sm overflow-hidden group">
          <CardHeader className="bg-muted/50 border-b border-border transition-colors">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" /> Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            {loadingTasks ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                <Inbox className="h-10 w-10 mb-2 opacity-20" />
                <p>No tasks found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <Card className="col-span-1 md:col-span-2 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-lg">Recent Tasks</CardTitle>
              <CardDescription>Your latest team activity.</CardDescription>
            </div>
            <Link href="/tasks" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {loadingTasks ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="divide-y divide-border">
                {recentTasks.map((task) => (
                  <Link href={`/tasks/${task.id}`} key={task.id} className="block group">
                    <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "mt-0.5 w-2 h-2 rounded-full ring-4 ring-offset-1 dark:ring-offset-background",
                          task.status === 'COMPLETED' ? "bg-emerald-500 ring-emerald-500/20" :
                          task.status === 'IN_PROGRESS' ? "bg-primary ring-primary/20" :
                          task.status === 'REVIEW' ? "bg-amber-500 ring-amber-500/20" :
                          "bg-muted-foreground ring-muted-foreground/20"
                        )} />
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            {getPriorityBadge(task.priority)}
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <ListTodo className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No tasks yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
                  Get started by creating your first task or importing existing work.
                </p>
                <Link href="/tasks/new">
                  <Button variant="outline" className="shadow-sm">Create First Task</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading, gradient }: { title: string; value: number; icon: React.ReactNode; loading?: boolean; gradient: string }) {
  return (
    <Card className={cn("border border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", gradient)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {loading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {value}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Hero Banner Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />
      
      {/* Stat Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts & Recent Activity Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Chart Skeleton */}
        <Card className="col-span-1">
          <CardHeader className="border-b border-border">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="pt-6 flex justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </CardContent>
        </Card>

        {/* Recent Tasks Skeleton */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="border-b border-border flex flex-row items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'URGENT': return <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Urgent</Badge>;
    case 'HIGH': return <Badge className="bg-orange-500 hover:bg-orange-600 h-5 px-1.5 text-[10px]">High</Badge>;
    case 'MEDIUM': return <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Medium</Badge>;
    case 'LOW': return <Badge variant="outline" className="text-muted-foreground h-5 px-1.5 text-[10px]">Low</Badge>;
    default: return null;
  }
}
