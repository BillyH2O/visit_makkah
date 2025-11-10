import { NextRequest } from 'next/server'
import type { CategoryCode } from '@/types/product'
import { getProductsByCategory } from '@/server/services/products'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as CategoryCode | null
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined
  const isPremiumParam = searchParams.get('isPremium')
  const isPremium = isPremiumParam === null ? undefined : isPremiumParam === 'true'
  const isHighlightParam = searchParams.get('isHighlight')
  const isHighlight = isHighlightParam === null ? undefined : isHighlightParam === 'true'

  if (!category || !['OFFRE', 'SADAQA', 'VISA', 'SERVICE'].includes(category)) {
    return new Response('Invalid or missing category', { status: 400 })
  }

  try {
    const products = await getProductsByCategory(category, { limit, isPremium, isHighlight })
    return Response.json({ products })
  } catch (err) {
    return new Response(`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 500 })
  }
}


