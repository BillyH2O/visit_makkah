import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULTS: Record<string, string> = {
  videoSrc: 'https://www.youtube.com/watch?v=V1RPi2MYptM',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key') || 'videoSrc'
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key } })
    const value = setting?.value ?? DEFAULTS[key] ?? null
    return Response.json({ key, value })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}
