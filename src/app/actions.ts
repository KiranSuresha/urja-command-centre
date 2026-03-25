'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState, ProjectSchema, TaskSchema, CommentSchema } from '@/lib/validations'

export async function createProject(state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    color: formData.get('color'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const project = await db.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      color: parsed.data.color || '#6366f1',
    },
  })
  revalidatePath('/projects')
  redirect(`/projects/${project.id}`)
}

export async function updateProject(id: string, formData: FormData) {
  await db.project.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      color: formData.get('color') as string,
    },
  })
  revalidatePath(`/projects/${id}`)
  revalidatePath('/projects')
}

export async function archiveProject(id: string) {
  await db.project.update({ where: { id }, data: { status: 'archived' } })
  revalidatePath('/projects')
  redirect('/projects')
}

export async function createUser(formData: FormData) {
  await db.user.create({
    data: {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      color: (formData.get('color') as string) || '#6366f1',
    },
  })
  revalidatePath('/team')
}

export async function createTask(state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = TaskSchema.safeParse({
    projectId: formData.get('projectId'),
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    dueDate: formData.get('dueDate'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { projectId, title, description, status, priority, dueDate } = parsed.data
  const task = await db.task.create({
    data: {
      projectId,
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}/tasks/${task.id}`)
}

export async function updateTask(taskId: string, projectId: string, state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = TaskSchema.safeParse({
    projectId,
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    dueDate: formData.get('dueDate'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { title, description, status, priority, dueDate } = parsed.data
  await db.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function deleteTask(taskId: string, projectId: string) {
  await db.task.delete({ where: { id: taskId } })
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}

export async function upsertAssignee(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const userId = formData.get('userId') as string
  const taskRole = formData.get('taskRole') as string
  const points = parseInt(formData.get('points') as string) || 0
  const projectId = formData.get('projectId') as string

  await db.taskAssignee.upsert({
    where: { taskId_userId: { taskId, userId } },
    create: { taskId, userId, taskRole, points },
    update: { taskRole, points },
  })
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
}

export async function removeAssignee(taskId: string, userId: string, projectId: string) {
  await db.taskAssignee.delete({ where: { taskId_userId: { taskId, userId } } })
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
}

export async function addComment(state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = CommentSchema.safeParse({
    taskId: formData.get('taskId'),
    projectId: formData.get('projectId'),
    userId: formData.get('userId'),
    body: formData.get('body'),
    parentId: formData.get('parentId'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { taskId, userId, body, parentId, projectId } = parsed.data
  await db.comment.create({ data: { taskId, userId, body, parentId: parentId || null } })
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, taskId: string, projectId: string) {
  await db.comment.delete({ where: { id: commentId } })
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
}

export async function upsertHuddle(formData: FormData) {
  const dateStr = formData.get('date') as string
  const notes = formData.get('notes') as string
  const date = new Date(dateStr)

  await db.huddle.upsert({
    where: { date },
    create: { date, notes },
    update: { notes },
  })
  revalidatePath('/huddle')
}

export async function addHuddleItem(formData: FormData) {
  const huddleId = formData.get('huddleId') as string
  const description = formData.get('description') as string
  const projectId = (formData.get('projectId') as string) || null
  const taskId = (formData.get('taskId') as string) || null
  const assigneeId = (formData.get('assigneeId') as string) || null

  const count = await db.huddleItem.count({ where: { huddleId } })
  await db.huddleItem.create({
    data: { huddleId, description, projectId, taskId, assigneeId, order: count },
  })
  revalidatePath('/huddle')
}

export async function toggleHuddleItem(itemId: string, done: boolean) {
  await db.huddleItem.update({ where: { id: itemId }, data: { done } })
  revalidatePath('/huddle')
}

export async function deleteHuddleItem(itemId: string) {
  await db.huddleItem.delete({ where: { id: itemId } })
  revalidatePath('/huddle')
}
