import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId, body, parentId } = await request.json()

    const comment = await db.comment.create({
      data: {
        taskId: id,
        userId,
        body,
        parentId: parentId || null,
      },
      include: { user: true },
    })
    return NextResponse.json(comment)
  } catch {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
