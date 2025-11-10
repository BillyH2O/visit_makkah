import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_auth'

export async function POST(req: NextRequest) {
  const { pin } = (await req.json().catch(() => ({}))) as { pin?: string }
  const expected = (process.env.ADMIN_PIN || '').trim()

  if (!expected || expected.length !== 4) {
    return new NextResponse('Admin PIN not configured', { status: 500 })
  }

  if (!pin || pin !== expected) {
    return new NextResponse('Invalid PIN', { status: 401 })
  }

  const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 })
  res.headers.set(
    'Set-Cookie',
    `${ADMIN_COOKIE}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`
  )
  return res
}
