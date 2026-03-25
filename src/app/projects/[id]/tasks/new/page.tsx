import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewTaskForm } from './new-task-form'

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({ where: { id } })
  if (!project) notFound()

  return (
    <div className="p-8 md:p-12 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${id}`} className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Create Task</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="size-2 rounded-full" style={{ background: project.color }} />
              <span className="text-sm font-medium text-muted-foreground">{project.name}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card rounded-3xl p-8 border border-border/40">
        <NewTaskForm projectId={id} />
      </div>
    </div>
  )
}
