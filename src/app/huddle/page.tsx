import { db } from '@/lib/db'
import { format } from 'date-fns'
import { upsertHuddle, addHuddleItem } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sun, Plus } from 'lucide-react'
import { HuddleItemToggle } from '@/components/huddle-item-toggle'

export default async function HuddlePage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = format(today, 'yyyy-MM-dd')

  const [huddle, allHuddles, projects, users, tasks] = await Promise.all([
    db.huddle.findFirst({
      where: { date: { gte: today } },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { assignee: true, project: true, task: true },
        },
      },
    }),
    db.huddle.findMany({
      orderBy: { date: 'desc' },
      take: 10,
      include: { _count: { select: { items: true } } },
    }),
    db.project.findMany({ where: { status: 'active' }, orderBy: { name: 'asc' } }),
    db.user.findMany({ orderBy: { name: 'asc' } }),
    db.task.findMany({ where: { status: { not: 'done' } }, orderBy: { title: 'asc' }, include: { project: true } }),
  ])

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Sun size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold">Daily Huddle</h1>
      </div>

      {/* Create/Edit today's huddle */}
      <div className="rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Today — {format(today, 'EEEE, MMMM d')}</h2>
        <form action={upsertHuddle} className="space-y-3">
          <input type="hidden" name="date" value={todayStr} />
          <div className="space-y-1.5">
            <Label htmlFor="notes">Overall notes / theme for today</Label>
            <Textarea id="notes" name="notes" defaultValue={huddle?.notes ?? ''} placeholder="What's the focus today?" rows={2} />
          </div>
          <Button type="submit" size="sm">Save Notes</Button>
        </form>

        {huddle && (
          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="font-semibold text-sm">Action Items ({huddle.items.length})</h3>

            <div className="space-y-2">
              {huddle.items.map((item) => (
                <HuddleItemToggle key={item.id} item={item} />
              ))}
            </div>

            {/* Add item */}
            <form action={addHuddleItem} className="grid sm:grid-cols-2 gap-3 pt-2">
              <input type="hidden" name="huddleId" value={huddle.id} />
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="description">Action Item</Label>
                <Input id="description" name="description" required placeholder="What needs to happen?" />
              </div>
              <div className="space-y-1">
                <Label>Assign to</Label>
                <select name="assigneeId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— no one —</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Project</Label>
                <select name="projectId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— no project —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Task (optional)</Label>
                <select name="taskId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— no task —</option>
                  {tasks.map((t) => <option key={t.id} value={t.id}>{t.project.name}: {t.title}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" size="sm" className="w-full"><Plus size={14} className="mr-1" /> Add Item</Button>
              </div>
            </form>
          </div>
        )}

        {!huddle && (
          <p className="text-sm text-muted-foreground">Save notes first to add action items.</p>
        )}
      </div>

      {/* Past huddles */}
      {allHuddles.length > 0 && (
        <div className="rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4">Past Huddles</h2>
          <div className="space-y-2">
            {allHuddles.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium">{format(h.date, 'EEEE, MMM d, yyyy')}</span>
                <span className="text-xs text-muted-foreground">{h._count.items} items</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
