import { z } from 'zod'

export const ProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().trim().optional(),
  color: z.string().trim().optional(),
})

export const TaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().trim().min(1, 'Task title is required'),
  description: z.string().trim().optional(),
  status: z.enum(['backlog', 'in_progress', 'review', 'done']).default('backlog'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
})

export const CommentSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  userId: z.string().min(1, 'User must be selected'),
  body: z.string().trim().min(1, 'Comment cannot be empty'),
  parentId: z.string().optional(),
})

// Define a standardized State type for Form Actions returning React 19's useActionState signature
export type ActionState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
  data?: any
}
