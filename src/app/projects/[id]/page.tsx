import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, Archive, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types'
import { archiveProject } from '@/app/actions'
import { format } from 'date-fns'

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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <span className="size-3.5 rounded-full" style={{ background: project.color }} />
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.status === 'archived' && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Archived</span>
        )}
        <div className="ml-auto flex gap-2">
          <Link href={`/projects/${id}/tasks/new`}>
            <Button size="sm"><Plus size={14} className="mr-1" /> Add Task</Button>
          </Link>
          <Link href={`/projects/${id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          {project.status === 'active' && (
            <form action={archiveProject.bind(null, id)}>
              <Button variant="ghost" size="sm" type="submit">
                <Archive size={14} className="mr-1" /> Archive
              </Button>
            </form>
          )}
        </div>
      </div>

      {project.description && <p className="text-muted-foreground">{project.description}</p>}

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(byStatus) as Array<keyof typeof byStatus>).map((status) => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
              <span className="text-xs text-muted-foreground">{byStatus[status].length}</span>
            </div>
            <div className="space-y-2">
              {byStatus[status].map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${id}/tasks/${task.id}`}
                  className="block rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}>
                      {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                    </span>
                    <div className="flex -space-x-1">
                      {task.assignees.slice(0, 3).map((a) => (
                        <span
                          key={a.userId}
                          className="size-5 rounded-full text-white text-xs flex items-center justify-center font-medium ring-1 ring-background"
                          style={{ background: a.user.color }}
                          title={a.user.name}
                        >
                          {a.user.name[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">{format(task.dueDate, 'MMM d')}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
