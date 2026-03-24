'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string

  const project = await db.project.create({
    data: { name, description, color: color || '#6366f1' },
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

export async function createTask(formData: FormData) {
  const projectId = formData.get('projectId') as string
  const task = await db.task.create({
    data: {
      projectId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: (formData.get('status') as string) || 'backlog',
      priority: (formData.get('priority') as string) || 'medium',
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
    },
  })
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}/tasks/${task.id}`)
}

export async function updateTask(taskId: string, projectId: string, formData: FormData) {
  await db.task.update({
    where: { id: taskId },
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      priority: formData.get('priority') as string,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
    },
  })
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
  revalidatePath(`/projects/${projectId}`)
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

export async function addComment(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const userId = formData.get('userId') as string
  const body = formData.get('body') as string
  const parentId = (formData.get('parentId') as string) || null
  const projectId = formData.get('projectId') as string

  await db.comment.create({ data: { taskId, userId, body, parentId } })
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
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
