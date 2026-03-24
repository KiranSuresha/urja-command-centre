import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { createTask } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({ where: { id } })
  if (!project) notFound()

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/projects/${id}`} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-bold">New Task</h1>
        <span className="text-muted-foreground">in {project.name}</span>
      </div>
      <form action={createTask} className="space-y-5">
        <input type="hidden" name="projectId" value={id} />
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="What needs to be done?" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Add more details..." rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              name="priority"
              defaultValue="medium"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" name="dueDate" type="date" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Create Task</Button>
          <Link href={`/projects/${id}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
