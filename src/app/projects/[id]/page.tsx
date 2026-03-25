import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, Archive, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types'
import { archiveProject } from '@/app/actions'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
        include: { assignees: { include: { user: true } } },
      },
    },
  })
  if (!project) notFound()

  const byStatus = {
    backlog: project.tasks.filter((t) => t.status === 'backlog'),
    in_progress: project.tasks.filter((t) => t.status === 'in_progress'),
    review: project.tasks.filter((t) => t.status === 'review'),
    done: project.tasks.filter((t) => t.status === 'done'),
  }

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto space-y-10 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 glass-card rounded-3xl p-6 sm:px-8 border border-border/40 shadow-sm relative overflow-hidden">
        {/* Subtle background glow for project header based on project color */}
        <div 
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
          style={{ background: project.color }}
        />
        
        <div className="flex items-center gap-4 relative z-10">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/60 rounded-xl transition-all hover:scale-105 active:scale-95 bg-background/50 border border-border/40">
            <ArrowLeft size={18} />
          </Link>
          <span className="size-5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.15)] ring-4 ring-background/50" style={{ background: project.color }} />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{project.name}</h1>
          {project.status === 'archived' && (
            <span className="text-xs font-bold uppercase tracking-widest bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-lg border border-border/60">Archived</span>
          )}
        </div>

        <div className="sm:ml-auto flex flex-wrap items-center gap-3 relative z-10 w-full sm:w-auto">
          {project.status === 'active' && (
            <form action={archiveProject.bind(null, id)}>
              <Button variant="ghost" size="sm" type="submit" className="rounded-xl text-muted-foreground font-semibold tracking-wide hover:text-destructive hover:bg-destructive/10 transition-colors px-4">
                <Archive size={16} className="mr-2 opacity-70" /> Archive
              </Button>
            </form>
          )}
          <Link href={`/projects/${id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full rounded-xl bg-background/50 backdrop-blur-sm shadow-sm hover:bg-muted/50 border-border/60 font-semibold tracking-wide transition-all hover:border-border">
              Edit Project
            </Button>
          </Link>
          <Link href={`/projects/${id}/tasks/new`} className="flex-1 sm:flex-none">
             <Button size="sm" className="w-full rounded-xl shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all font-bold tracking-wide">
              <Plus size={16} className="mr-1.5" /> Add Task
            </Button>
          </Link>
        </div>
      </div>

      {project.description && (
        <div className="px-4">
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-4xl font-medium">{project.description}</p>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {(Object.keys(byStatus) as Array<keyof typeof byStatus>).map((status) => (
          <div key={status} className="glass-card bg-muted/5 border-border/30 rounded-3xl p-5 flex flex-col h-full min-h-[600px] hover:border-border/50 transition-colors group/column">
            
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${STATUS_COLORS[status]} bg-current/10 border-current/20 shadow-sm`}>
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground/70">{byStatus[status].length}</span>
              </div>
              <Link href={`/projects/${id}/tasks/new?status=${status}`} className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover/column:opacity-100">
                <Plus size={16} />
              </Link>
            </div>
            
            <div className="space-y-4 flex-1">
              {byStatus[status].map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${id}/tasks/${task.id}`}
                  className="block rounded-2xl border border-border/40 bg-background/90 backdrop-blur-xl p-5 shadow-sm hover:shadow-lg hover:border-border/80 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
                >
                  <p className="text-sm font-semibold leading-snug text-foreground/90 group-hover:text-foreground">{task.title}</p>
                  
                  {task.dueDate && (
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/40 w-fit px-2.5 py-1 rounded-md border border-border/30">
                      <span>{format(task.dueDate, 'MMM d')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]} bg-current/10 border-current/20`}>
                      {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                    </span>
                    <div className="flex -space-x-2">
                      {task.assignees.slice(0, 3).map((a) => (
                         <span
                          key={a.userId}
                          className="size-7 rounded-full text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-background shadow-md transition-transform hover:scale-125 hover:z-10"
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
              {byStatus[status].length === 0 && (
                <div className="h-32 rounded-2xl border-2 border-border/20 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/10 opacity-50 transition-opacity group-hover/column:opacity-100">
                  <span className="text-xs font-bold uppercase tracking-widest mb-1">Drop Tasks</span>
                  <span className="text-[10px] font-medium opacity-60">or click + to add</span>
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}
