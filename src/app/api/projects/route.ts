import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    })
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, color } = await request.json()
    const project = await db.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        status: 'active',
      },
    })
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
