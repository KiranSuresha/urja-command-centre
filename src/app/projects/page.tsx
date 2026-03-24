import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { tasks: true } } },
  })

  const active = projects.filter((p) => p.status === 'active')
  const archived = projects.filter((p) => p.status === 'archived')

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button><Plus size={16} className="mr-1" /> New Project</Button>
        </Link>
      </div>

      <ProjectGrid title="Active" projects={active} />
      {archived.length > 0 && <ProjectGrid title="Archived" projects={archived} muted />}
    </div>
  )
}

function ProjectGrid({ title, projects, muted }: {
  title: string
  projects: Array<{ id: string; name: string; description: string | null; color: string; _count: { tasks: number }; createdAt: Date }>
  muted?: boolean
}) {
  return (
    <section>
      <h2 className={`text-sm font-semibold mb-3 ${muted ? 'text-muted-foreground' : ''}`}>{title} ({projects.length})</h2>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No projects yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="rounded-xl border border-border p-5 hover:bg-accent transition-colors group"
            >
              <div className="flex items-start justify-between">
                <span className="size-3 rounded-full mt-1" style={{ background: p.color }} />
              </div>
              <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">{p.name}</h3>
              {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
              <p className="text-xs text-muted-foreground mt-3">
                <FolderKanban size={12} className="inline mr-1" />{p._count.tasks} tasks
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
