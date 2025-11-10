import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return Response.json({ items })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, title, desc, url, span, sortOrder } = await req.json()
    const item = await prisma.galleryItem.create({
      data: { type: type || 'image', title, desc, url, span, isActive: true, sortOrder: typeof sortOrder === 'number' ? sortOrder : 0 },
    })
    return Response.json({ item })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, type, title, desc, url, span, isActive, sortOrder } = await req.json()
    const item = await prisma.galleryItem.update({
      where: { id },
      data: { type, title, desc, url, span, isActive, sortOrder },
    })
    return Response.json({ item })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return new Response('Missing id', { status: 400 })
    await prisma.galleryItem.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

