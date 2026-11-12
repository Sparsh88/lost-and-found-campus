import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Please use /api/lost-items/[id] or /api/found-items/[id].' },
    { status: 410 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Please use /api/lost-items/[id] or /api/found-items/[id].' },
    { status: 410 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Please use /api/lost-items/[id] or /api/found-items/[id].' },
    { status: 410 }
  )
}
