import { db } from '@/lib/db'
import Link from 'next/link'
import { STATUS_COLORS, STATUS_LABELS } from '@/types'
import { format } from 'date-fns'
import { FolderKanban, CheckSquare, Sun, ArrowRight, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [activeProjects, openTasks, todayHuddle] = await Promise.all([
    db.project.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.task.findMany({
      where: { status: { not: 'done' } },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: { project: true, assignees: { include: { user: true } } },
    }),
    db.huddle.findFirst({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      include: { items: { include: { assignee: true, project: true }, orderBy: { order: 'asc' } } },
    }),
  ])

  const [totalTasks, doneTasks, inProgressTasks] = await Promise.all([
    db.task.count(),
    db.task.count({ where: { status: 'done' } }),
    db.task.count({ where: { status: 'in_progress' } }),
  ])

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Good morning <Sparkles className="text-primary animate-pulse" size={24} />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium tracking-wide uppercase">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Active Projects', value: activeProjects.length, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
          { label: 'Open Tasks', value: totalTasks - doneTasks, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'In Progress', value: inProgressTasks, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Completed', value: doneTasks, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-6 group cursor-default hover:-translate-y-1 transition-transform duration-300">
            <div className={`size-12 rounded-xl border ${s.bg} ${s.border} flex items-center justify-center mb-4 transition-all group-hover:scale-110 duration-300`}>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Today's Huddle */}
        <div className="glass-card rounded-3xl p-7 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 font-semibold text-foreground tracking-tight">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Sun size={18} className="text-amber-500" />
              </div>
              Today's Huddle
            </div>
            <Link href="/huddle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group">
              View <ArrowRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col">
            {todayHuddle && todayHuddle.items.length > 0 ? (
              <ul className="space-y-4">
                {todayHuddle.items.slice(0, 5).map((item) => (
                  <li key={item.id} className={`flex items-start gap-4 text-sm group ${item.done ? 'opacity-40' : ''}`}>
                    <span className={`mt-1.5 size-2 rounded-full shrink-0 shadow-sm ${item.done ? 'bg-muted-foreground/50' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]'}`} />
                    <span className={`flex-1 leading-snug font-medium ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.description}
                    </span>
                    {item.assignee && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground shrink-0 bg-muted/50 px-2 py-1 rounded-md border border-border/60">
                        {item.assignee.name.split(' ')[0]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-muted/20 border border-border/30 border-dashed">
                <span className="text-sm font-medium text-muted-foreground mb-3">No huddle created today.</span>
                <Link href="/huddle" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full">
                  Start Huddle
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="glass-card rounded-3xl p-7 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 font-semibold text-foreground tracking-tight">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <FolderKanban size={18} className="text-primary" />
              </div>
              Active Projects
            </div>
            <Link href="/projects" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group">
              View all <ArrowRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col">
            <ul className="space-y-2">
              {activeProjects.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="flex items-center gap-4 hover:bg-muted/40 rounded-xl px-4 py-3 -mx-4 transition-all duration-300 border border-transparent hover:border-border/50 group hover:shadow-sm">
                    <span className="size-3 rounded-full shrink-0 ring-4 ring-background shadow-inner" style={{ background: p.color }} />
                    <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground">{p.name}</span>
                    <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground transition-all duration-300 transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
              {activeProjects.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-muted/20 border border-border/30 border-dashed">
                  <span className="text-sm font-medium text-muted-foreground mb-3">No active projects.</span>
                  <Link href="/projects/new" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full">
                    Create Project
                  </Link>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Open Tasks */}
      <div className="glass-card rounded-3xl p-7">
        <div className="flex items-center gap-3 font-semibold text-foreground tracking-tight mb-6">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <CheckSquare size={18} className="text-blue-500" />
          </div>
          Important Tasks
        </div>
        {openTasks.length === 0 ? (
          <div className="py-12 text-center text-sm font-semibold text-muted-foreground bg-muted/20 rounded-2xl border border-border/40 border-dashed">
            All caught up! 🎉
          </div>
        ) : (
          <div className="grid gap-3">
            {openTasks.map((task) => (
              <Link
                key={task.id}
                href={`/projects/${task.projectId}/tasks/${task.id}`}
                className="flex items-center gap-5 py-4 px-5 rounded-2xl bg-muted/10 hover:bg-muted/40 border border-border/40 hover:border-border/80 transition-all duration-300 group hover:shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/90 truncate group-hover:text-foreground">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 opacity-80">
                    <span className="size-2 rounded-full shadow-inner" style={{ background: task.project.color }} />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{task.project.name}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg border shrink-0 ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]} bg-current/10 border-current/20`}>
                    {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
                  </span>
                  <div className="flex -space-x-2 shrink-0">
                    {task.assignees.slice(0, 3).map((a) => (
                      <span
                        key={a.userId}
                        className="size-8 rounded-full text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-background shadow-md transition-transform hover:scale-110 hover:z-10"
                        style={{ background: a.user.color }}
                        title={a.user.name}
                      >
                        {a.user.name.substring(0, 2).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
