'use client'

import { toggleHuddleItem, deleteHuddleItem } from '@/app/actions'
import { Trash2 } from 'lucide-react'

type Item = {
  id: string
  description: string
  done: boolean
  assignee: { name: string; color: string } | null
  project: { name: string } | null
  task: { title: string } | null
}

export function HuddleItemToggle({ item }: { item: Item }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border border-border ${item.done ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        checked={item.done}
        onChange={async (e) => {
          await toggleHuddleItem(item.id, e.target.checked)
        }}
        className="mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${item.done ? 'line-through text-muted-foreground' : 'font-medium'}`}>
          {item.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {item.project && <span className="text-xs text-muted-foreground">{item.project.name}</span>}
          {item.task && <span className="text-xs text-muted-foreground">→ {item.task.title}</span>}
        </div>
      </div>
      {item.assignee && (
        <span
          className="size-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0"
          style={{ background: item.assignee.color }}
          title={item.assignee.name}
        >
          {item.assignee.name[0]}
        </span>
      )}
      <form action={deleteHuddleItem.bind(null, item.id)}>
        <button type="submit" className="text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 size={14} />
        </button>
      </form>
    </div>
  )
}
