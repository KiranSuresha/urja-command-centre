'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateTask } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '@/types'
import { format } from 'date-fns'
import { CheckCircle2, Loader2, Save } from 'lucide-react'

interface Props {
  task: {
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    dueDate: Date | null
  }
  projectId: string
}

export function EditTaskForm({ task, projectId }: Props) {
  const updateAction = updateTask.bind(null, task.id, projectId)
  const [state, action, pending] = useActionState(updateAction, {})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [state.success])

  return (
    <form action={action} className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold tracking-tight">Task Details</h3>
        {showSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-semibold border border-emerald-500/20 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={16} /> Saved
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
        <Input 
          id="title" 
          name="title" 
          defaultValue={task.title} 
          required 
          className="h-12 text-base font-medium rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/30 shadow-sm transition-all hover:bg-background/80"
        />
        {state.errors?.title && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.title[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          defaultValue={task.description ?? ''} 
          rows={6} 
          className="resize-none rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/30 shadow-sm transition-all hover:bg-background/80 p-4 leading-relaxed"
        />
        {state.errors?.description && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
          <div className="relative">
             <select 
               name="status" 
               defaultValue={task.status} 
               className="w-full h-12 appearance-none rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 hover:bg-background/80"
             >
               {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
             </select>
             {/* Custom arrow */}
             <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
          {state.errors?.status && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.status[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Priority</Label>
          <div className="relative">
            <select 
              name="priority" 
              defaultValue={task.priority} 
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

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Due Date</Label>
          <Input 
            type="date" 
            name="dueDate" 
            defaultValue={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''} 
            className="h-12 rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/30 shadow-sm transition-all hover:bg-background/80 w-full font-medium"
          />
          {state.errors?.dueDate && <p className="text-destructive text-sm font-medium mt-1 ml-1">{state.errors.dueDate[0]}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-border/30 mt-8">
        <Button 
          type="submit" 
          className="h-11 px-8 rounded-xl font-bold tracking-wide shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all text-sm gap-2" 
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
