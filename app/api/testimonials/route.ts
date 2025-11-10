import { getTestimonials } from '@/server/services/testimonials'

export async function GET() {
  try {
    const items = await getTestimonials()
    return Response.json({ items })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}


