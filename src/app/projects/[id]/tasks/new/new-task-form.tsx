'use client'

import { useActionState, useState } from 'react'
import { createTask } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types'
import { Loader2, Plus, X } from 'lucide-react'

export function NewTaskForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createTask, {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <form 
      action={(data) => {
        setIsSubmitting(true)
        action(data)
      }} 
      className="space-y-6"
    >
      <input type="hidden" name="projectId" value={projectId} />
      
      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
        <Input 
          id="title" 
          name="title" 
          required 
          placeholder="What needs to be done?" 
          className="h-12 text-base font-medium rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/30 shadow-sm transition-all hover:bg-background/80 placeholder:text-muted-foreground/50"
        />
        {state.errors?.title && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.title[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Add more details..." 
          rows={5} 
          className="resize-none rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/30 shadow-sm transition-all hover:bg-background/80 p-4 leading-relaxed placeholder:text-muted-foreground/50"
        />
        {state.errors?.description && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
          <div className="relative">
            <select 
              name="status" 
              defaultValue="backlog"
              className="w-full h-12 appearance-none rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 hover:bg-background/80"
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          {state.errors?.status && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.status[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Priority</Label>
          <div className="relative">
            <select 
              name="priority" 
              defaultValue="medium"
              className="w-full h-12 appearance-none rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 hover:bg-background/80"
            >
              {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          {state.errors?.priority && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.priority[0]}</p>}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/30 mt-6 pt-6">
        <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Due Date (Optional)</Label>
        <Input 
          id="dueDate" 
          name="dueDate" 
          type="date" 
          className="h-12 w-full md:w-1/2 rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/30 shadow-sm transition-all hover:bg-background/80 font-medium"
        />
        {state.errors?.dueDate && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.dueDate[0]}</p>}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-8 pb-2">
        <Link href={`/projects/${projectId}`} className="w-full sm:w-auto">
          <Button variant="ghost" type="button" className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold tracking-wide transition-all gap-2" disabled={pending || isSubmitting}>
            <X size={16} /> Cancel
          </Button>
        </Link>
        <Button 
          type="submit" 
          disabled={pending || isSubmitting}
          className="w-full sm:flex-1 h-12 rounded-xl font-bold tracking-wide shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all gap-2 text-base"
        >
          {pending || isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus size={18} />
              Create Task
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
