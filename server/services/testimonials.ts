import { prisma } from '@/lib/prisma'

export type TestimonialDTO = {
  id: string
  text: string
  image: string
  name: string
  role?: string | null
}

export async function getTestimonials(): Promise<TestimonialDTO[]> {
  const items = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return items.map((t) => ({
    id: t.id,
    text: t.content,
    image: t.avatarUrl || '',
    name: t.authorName,
    role: t.authorRole || undefined,
  }))
}


