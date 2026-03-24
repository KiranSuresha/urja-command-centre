import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const tasks = await db.task.findMany({
      where: projectId ? { projectId } : {},
      include: {
        project: true,
        assignees: { include: { user: true } },
        comments: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(tasks)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { projectId, title, description, priority, status, dueDate } = await request.json()
    const task = await db.task.create({
      data: {
        projectId,
        title,
        description,
        priority: priority || 'medium',
        status: status || 'backlog',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { assignees: { include: { user: true } }, project: true },
    })
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
