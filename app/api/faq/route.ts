import { getFaqItems } from '@/server/services/faq'

export async function GET() {
  try {
    const items = await getFaqItems()
    return Response.json({ items })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}


