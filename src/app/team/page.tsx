export const dynamic = 'force-dynamic'

import { createUser } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { db } from '@/lib/db'
import { TEAM_COLORS } from '@/types'

export default async function TeamPage() {
  const users = await db.user.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { assignedTasks: true, comments: true } },
      assignedTasks: {
        include: { task: { include: { project: true } } },
        take: 5,
      },
    },
  })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-border p-5 space-y-5 h-fit">
          <div>
            <h1 className="text-2xl font-bold">Team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add teammates here so tasks, comments, and huddles can be assigned properly.
            </p>
          </div>

          <form action={createUser} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Priya Sharma" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" required placeholder="e.g. Product Manager" />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {TEAM_COLORS.map((color, index) => (
                  <label key={color} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color}
                      defaultChecked={index === 0}
                      className="sr-only peer"
                    />
                    <span
                      className="size-7 rounded-full block ring-2 ring-transparent peer-checked:ring-offset-2 peer-checked:ring-foreground transition-all"
                      style={{ background: color }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">Add Team Member</Button>
          </form>
        </div>

        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
              No team members yet. Create one to unlock task assignments, comments, and huddle ownership.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="rounded-xl border border-border p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-10 rounded-full text-white text-sm flex items-center justify-center font-bold shrink-0"
                      style={{ background: user.color }}
                    >
                      {user.name[0]}
                    </span>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <span>{user._count.assignedTasks} tasks</span>
                    <span>{user._count.comments} comments</span>
                  </div>

                  {user.assignedTasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                        Recent assignments
                      </p>
                      <div className="space-y-2">
                        {user.assignedTasks.map(({ id, task }) => (
                          <div key={id} className="text-sm">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.project.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
