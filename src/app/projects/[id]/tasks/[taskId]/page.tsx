import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, CalendarDays, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types'
import { deleteTask, upsertAssignee, removeAssignee } from '@/app/actions'
import { CommentThread } from '@/components/comment-thread'
import { EditTaskForm } from './edit-task-form'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function TaskPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id: projectId, taskId } = await params

  const [task, users] = await Promise.all([
    db.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignees: { include: { user: true } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'asc' },
          include: {
            user: true,
            replies: { orderBy: { createdAt: 'asc' }, include: { user: true } },
          },
        },
      },
    }),
    db.user.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!task) notFound()

  const assignedIds = task.assignees.map((a) => a.userId)
  const unassigned = users.filter((u) => !assignedIds.includes(u.id))

  const deleteAction = deleteTask.bind(null, taskId, projectId)

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3 mb-2">
            <Link href={`/projects/${projectId}`} className="text-muted-foreground hover:text-foreground p-2 -ml-2 hover:bg-muted/60 rounded-xl transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border/40 shadow-sm">
                <span className="size-2.5 rounded-full shadow-sm" style={{ background: task.project.color }} />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{task.project.name}</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{task.title}</h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <form action={deleteAction}>
            <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-semibold tracking-wide">
              <Trash2 size={16} className="mr-2 opacity-70" /> Delete Task
            </Button>
          </form>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 lg:gap-12 items-start">
        {/* Main */}
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8">
            <EditTaskForm task={task} projectId={projectId} />
          </div>

          <div className="glass-card rounded-3xl p-8 border border-border/40">
            <h3 className="text-xl font-bold tracking-tight mb-8">Discussion</h3>
            <CommentThread
              comments={task.comments as Parameters<typeof CommentThread>[0]['comments']}
              users={users}
              taskId={taskId}
              projectId={projectId}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-8">
            {/* Status & Priority */}
            <div className="space-y-5">
              <div>
                 <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Status</p>
                 <span className={`inline-block px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase border ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]} bg-current/10 border-current/20 shadow-sm`}>
                    {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
                  </span>
              </div>
              
               <div>
                 <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Priority</p>
                 <span className={`inline-block px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase border ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]} bg-current/10 border-current/20 shadow-sm`}>
                    {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                  </span>
              </div>
            </div>

            {/* Dates */}
             <div className="space-y-5 pt-6 border-t border-border/30">
               <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Created</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground px-3 py-2 rounded-xl bg-muted/30 border border-border/20">
                     <CalendarDays className="size-4 text-muted-foreground/70" />
                     {format(task.createdAt, 'MMM d, yyyy')}
                  </div>
               </div>
               {task.dueDate && (
                 <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Due Date</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20 shadow-sm">
                       <CalendarDays className="size-4" />
                       {format(task.dueDate, 'MMM d, yyyy')}
                    </div>
                 </div>
               )}
             </div>
          </div>

          {/* Assignees */}
          <div className="glass-card rounded-3xl p-6 border border-border/40">
            <div className="flex items-center gap-2 mb-6 text-foreground font-semibold">
               <Users className="size-5 text-muted-foreground" />
               <h3 className="tracking-tight">Assignees</h3>
            </div>
            
            <div className="space-y-3">
              {task.assignees.map((a) => (
                <div key={a.userId} className="group relative flex items-center gap-4 p-3 rounded-2xl bg-muted/20 border border-border/40 hover:bg-background/80 hover:border-border/80 hover:shadow-md transition-all">
                  <span
                    className="size-10 rounded-full text-white text-sm flex items-center justify-center font-bold shrink-0 shadow-sm ring-2 ring-background"
                    style={{ background: a.user.color }}
                  >
                    {a.user.name.substring(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate">{a.user.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {a.taskRole && <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{a.taskRole}</span>}
                      {a.points > 0 && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">{a.points} pts</span>}
                    </div>
                  </div>
                  <form action={removeAssignee.bind(null, taskId, a.userId, projectId)} className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="submit" className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">✕</button>
                  </form>
                </div>
              ))}
              
              {task.assignees.length === 0 && (
                 <p className="text-sm text-center text-muted-foreground italic py-4">No assignees yet.</p>
              )}
            </div>

            {/* Add assignee */}
            {unassigned.length > 0 && (
               <div className="mt-8 pt-6 border-t border-border/30">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Add Team Member</p>
                  <form action={upsertAssignee} className="space-y-3">
                    <input type="hidden" name="taskId" value={taskId} />
                    <input type="hidden" name="projectId" value={projectId} />
                    <select name="userId" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                      {unassigned.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <Input name="taskRole" placeholder="Role (Lead...)" className="rounded-xl bg-background shadow-sm text-sm h-10" />
                      <Input name="points" type="number" placeholder="Points" min={0} className="rounded-xl bg-background shadow-sm text-sm h-10" />
                    </div>
                    <Button type="submit" size="sm" className="w-full rounded-xl mt-2 font-bold tracking-wide shadow-sm">Assign User</Button>
                  </form>
               </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}
