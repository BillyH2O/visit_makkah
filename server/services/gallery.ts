import { prisma } from '@/lib/prisma'

export type GalleryItemDTO = {
  id: string
  type: string
  title?: string | null
  desc?: string | null
  url: string
  span?: string | null
}

export async function getGalleryItems(): Promise<GalleryItemDTO[]> {
  const items = await prisma.galleryItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return items.map((g) => ({
    id: g.id,
    type: g.type,
    title: g.title,
    desc: g.desc,
    url: g.url,
    span: g.span,
  }))
}


