import { getGalleryItems } from '@/server/services/gallery'

export async function GET() {
  try {
    const items = await getGalleryItems()
    return Response.json({ items })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}


