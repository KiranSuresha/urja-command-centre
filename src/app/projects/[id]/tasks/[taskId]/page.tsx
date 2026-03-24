import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types'
import { updateTask, deleteTask, upsertAssignee, removeAssignee } from '@/app/actions'
import { format } from 'date-fns'
import { CommentThread } from '@/components/comment-thread'

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

  const updateAction = updateTask.bind(null, taskId, projectId)
  const deleteAction = deleteTask.bind(null, taskId, projectId)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/projects/${projectId}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-sm text-muted-foreground">{task.project.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-end">
            <form action={deleteAction}>
              <Button variant="ghost" size="sm" type="submit" className="text-destructive hover:text-destructive">
                <Trash2 size={14} className="mr-1" /> Delete
              </Button>
            </form>
          </div>

          <form action={updateAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={task.title} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={task.description ?? ''} rows={5} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select name="status" defaultValue={task.status} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select name="priority" defaultValue={task.priority} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" name="dueDate" defaultValue={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save</Button>
            </div>
          </form>

          {/* Comments */}
          <CommentThread
            comments={task.comments as Parameters<typeof CommentThread>[0]['comments']}
            users={users}
            taskId={taskId}
            projectId={projectId}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status/Priority badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}`}>
              {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}>
              {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
            </span>
          </div>

          {/* Assignees */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Assignees</h3>
            <div className="space-y-2">
              {task.assignees.map((a) => (
                <div key={a.userId} className="flex items-center gap-2 p-2 rounded-lg border border-border">
                  <span
                    className="size-7 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0"
                    style={{ background: a.user.color }}
                  >
                    {a.user.name[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.user.name}</p>
                    {a.taskRole && <p className="text-xs text-muted-foreground">{a.taskRole}</p>}
                    {a.points > 0 && <p className="text-xs text-muted-foreground">{a.points} pts</p>}
                  </div>
                  <form action={removeAssignee.bind(null, taskId, a.userId, projectId)}>
                    <button type="submit" className="text-muted-foreground hover:text-destructive text-xs">✕</button>
                  </form>
                </div>
              ))}
            </div>

            {/* Add assignee */}
            {unassigned.length > 0 && (
              <form action={upsertAssignee} className="mt-3 space-y-2">
                <input type="hidden" name="taskId" value={taskId} />
                <input type="hidden" name="projectId" value={projectId} />
                <select name="userId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {unassigned.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <Input name="taskRole" placeholder="Role (e.g. Lead, Reviewer)" className="text-sm" />
                <Input name="points" type="number" placeholder="Points" min={0} className="text-sm" />
                <Button type="submit" size="sm" variant="outline" className="w-full">Assign</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
