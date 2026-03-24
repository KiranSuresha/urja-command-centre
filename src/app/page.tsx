export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import Link from 'next/link'
import { STATUS_COLORS, STATUS_LABELS } from '@/types'
import { format } from 'date-fns'
import { FolderKanban, CheckSquare, Sun, ArrowRight } from 'lucide-react'

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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Good morning ☀️</h1>
        <p className="text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: activeProjects.length, color: 'text-violet-500' },
          { label: 'Open Tasks', value: totalTasks - doneTasks, color: 'text-blue-500' },
          { label: 'In Progress', value: inProgressTasks, color: 'text-amber-500' },
          { label: 'Completed', value: doneTasks, color: 'text-green-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Huddle */}
        <div className="rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold">
              <Sun size={16} className="text-amber-400" /> Today&apos;s Huddle
            </div>
            <Link href="/huddle" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View <ArrowRight size={12} />
            </Link>
          </div>
          {todayHuddle ? (
            <ul className="space-y-2">
              {todayHuddle.items.slice(0, 5).map((item) => (
                <li key={item.id} className={`flex items-start gap-2 text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                  <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                  <span className="flex-1">{item.description}</span>
                  {item.assignee && (
                    <span className="text-xs text-muted-foreground shrink-0">{item.assignee.name}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No huddle yet today.{' '}
              <Link href="/huddle" className="underline underline-offset-2">Start one →</Link>
            </p>
          )}
        </div>

        {/* Active Projects */}
        <div className="rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-semibold">
              <FolderKanban size={16} className="text-violet-400" /> Projects
            </div>
            <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-1">
            {activeProjects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="flex items-center gap-3 hover:bg-accent rounded-md px-2 py-1.5 -mx-2 group">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-sm font-medium">{p.name}</span>
                  <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground" />
                </Link>
              </li>
            ))}
            {activeProjects.length === 0 && (
              <p className="text-sm text-muted-foreground">No active projects. <Link href="/projects/new" className="underline">Create one →</Link></p>
            )}
          </ul>
        </div>
      </div>

      {/* Open Tasks */}
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 font-semibold mb-4">
          <CheckSquare size={16} className="text-blue-400" /> Open Tasks
        </div>
        {openTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
        ) : (
          <div className="divide-y divide-border">
            {openTasks.map((task) => (
              <Link
                key={task.id}
                href={`/projects/${task.projectId}/tasks/${task.id}`}
                className="flex items-center gap-4 py-3 hover:bg-accent/50 px-2 -mx-2 rounded group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.project.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}`}>
                  {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
                </span>
                <div className="flex -space-x-1 shrink-0">
                  {task.assignees.slice(0, 3).map((a) => (
                    <span
                      key={a.userId}
                      className="size-6 rounded-full text-white text-xs flex items-center justify-center font-medium ring-2 ring-background"
                      style={{ background: a.user.color }}
                      title={a.user.name}
                    >
                      {a.user.name[0]}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
