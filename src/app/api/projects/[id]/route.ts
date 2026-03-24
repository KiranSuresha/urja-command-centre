import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: { tasks: { include: { assignees: { include: { user: true } }, project: true }, orderBy: { updatedAt: 'desc' } } },
    })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, description, status, color } = await request.json()
    const project = await db.project.update({
      where: { id },
      data: { name, description, status, color },
    })
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}
