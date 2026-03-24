import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const task = await db.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignees: { include: { user: true } },
        comments: {
          include: { user: true, parent: true, replies: { include: { user: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, description, status, priority, dueDate } = await request.json()
    const task = await db.task.update({
      where: { id },
      data: { title, description, status, priority, dueDate: dueDate ? new Date(dueDate) : null },
      include: { assignees: { include: { user: true } }, project: true },
    })
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
