export type Status = 'backlog' | 'in_progress' | 'review' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type ProjectStatus = 'active' | 'archived'

export const STATUS_LABELS: Record<Status, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const STATUS_COLORS: Record<Status, string> = {
  backlog: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
}

export const TEAM_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
]
