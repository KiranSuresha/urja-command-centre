import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId, taskRole, points } = await request.json()

    // Check if already assigned
    const existing = await db.taskAssignee.findUnique({
      where: { taskId_userId: { taskId: id, userId } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already assigned' }, { status: 400 })
    }

    const assignee = await db.taskAssignee.create({
      data: { taskId: id, userId, taskRole, points: points || 0 },
      include: { user: true },
    })
    return NextResponse.json(assignee)
  } catch {
    return NextResponse.json({ error: 'Failed to assign task' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await request.json()
    await db.taskAssignee.delete({
      where: { taskId_userId: { taskId: id, userId } },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 })
  }
}
