import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.faqItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return Response.json({ items })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json()
    const item = await prisma.faqItem.create({
      data: { question, answer, isActive: true },
    })
    return Response.json({ item })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, question, answer, isActive, sortOrder } = await req.json()
    const item = await prisma.faqItem.update({
      where: { id },
      data: { question, answer, isActive, sortOrder },
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
    await prisma.faqItem.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

