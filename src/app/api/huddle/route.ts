import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

type HuddleItemInput = {
  description: string
  projectId?: string | null
  taskId?: string | null
  assigneeId?: string | null
}

export async function GET() {
  try {
    const huddles = await db.huddle.findMany({
      include: { items: { include: { assignee: true, project: true, task: true }, orderBy: { order: 'asc' } } },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(huddles)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch huddles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { date, notes, items } = await request.json() as {
      date: string
      notes?: string | null
      items: HuddleItemInput[]
    }

    const huddle = await db.huddle.create({
      data: {
        date: new Date(date),
        notes,
        items: {
          create: items.map((item, idx) => ({
            description: item.description,
            projectId: item.projectId || null,
            taskId: item.taskId || null,
            assigneeId: item.assigneeId || null,
            order: idx,
          })),
        },
      },
      include: { items: { include: { assignee: true, project: true, task: true } } },
    })
    return NextResponse.json(huddle)
  } catch {
    return NextResponse.json({ error: 'Failed to create huddle' }, { status: 500 })
  }
}
