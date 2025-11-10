import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  try {
    if (!key) {
      const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })
      return Response.json({ settings })
    }
    const setting = await prisma.siteSetting.findUnique({ where: { key } })
    return Response.json({ key, value: setting?.value ?? null })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, value } = body as { key?: string; value?: string }
    if (!key || typeof value !== 'string') {
      return new Response('Missing key or value', { status: 400 })
    }
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
    return Response.json({ key: setting.key, value: setting.value })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}
