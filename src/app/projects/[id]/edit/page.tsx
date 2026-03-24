import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { updateProject } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { TEAM_COLORS } from '@/types'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({ where: { id } })
  if (!project) notFound()

  const action = updateProject.bind(null, id)

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" name="name" required defaultValue={project.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={project.description ?? ''} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {TEAM_COLORS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="color" value={c} defaultChecked={project.color === c} className="sr-only peer" />
                <span
                  className="size-7 rounded-full block ring-2 ring-transparent peer-checked:ring-offset-2 peer-checked:ring-foreground transition-all"
                  style={{ background: c }}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Save Changes</Button>
          <Link href={`/projects/${id}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
