import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, role, color } = await request.json()
    const user = await db.user.create({
      data: { name, role, color: color || '#6366f1' },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
