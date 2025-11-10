import { prisma } from '@/lib/prisma'

export type FaqItemDTO = {
  id: string
  question: string
  answer: string
}

export async function getFaqItems(): Promise<FaqItemDTO[]> {
  const items = await prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return items.map((i) => ({ id: i.id, question: i.question, answer: i.answer }))
}


