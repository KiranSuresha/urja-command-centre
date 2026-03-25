'use client'

import { useActionState } from 'react'
import { createProject } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { TEAM_COLORS } from '@/types'

export default function NewProjectPage() {
  const [state, action, pending] = useActionState(createProject, {})

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Project</h1>
      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" name="name" required placeholder="e.g. Website Redesign" />
          {state.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="What is this project about?" rows={3} />
          {state.errors?.description && <p className="text-destructive text-sm mt-1">{state.errors.description[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {TEAM_COLORS.map((c, i) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="color" value={c} defaultChecked={i === 0} className="sr-only peer" />
                <span
                  className="size-7 rounded-full block ring-2 ring-transparent peer-checked:ring-offset-2 peer-checked:ring-foreground transition-all"
                  style={{ background: c }}
                />
              </label>
            ))}
          </div>
          {state.errors?.color && <p className="text-destructive text-sm mt-1">{state.errors.color[0]}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>Create Project</Button>
          <Link href="/projects">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
