import { prisma } from '@/lib/prisma'
import { ProductDTO, CategoryCode } from '@/types/product'

type GetProductsOptions = { limit?: number; isPremium?: boolean; isHighlight?: boolean }

export async function getProductsByCategory(category: CategoryCode, options?: GetProductsOptions): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: {
      category: { code: category },
      active: true,
      ...(typeof options?.isPremium === 'boolean' ? { isPremium: options.isPremium } : {}),
      ...(typeof options?.isHighlight === 'boolean' ? { isHighlight: options.isHighlight } : {}),
    },
    include: {
      prices: {
        where: { active: true },
        orderBy: [{ isDefault: 'desc' as const }, { createdAt: 'asc' as const }],
        take: 1,
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
      category: true,
    },
    orderBy: { createdAt: 'asc' },
    take: options?.limit,
  })

  return products.map((p): ProductDTO => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? undefined,
    categoryCode: p.category.code as CategoryCode,
    imageUrl: p.images[0]?.url ?? undefined,
    currency: p.prices[0]?.currency ?? undefined,
    unitAmount: p.prices[0]?.unitAmount ?? undefined,
    firstUnitAmount: p.prices[0]?.compareAtUnitAmount ?? undefined,
    infoLabel: (p.metadata as { infoLabel?: string } | null)?.infoLabel ?? undefined,
    landingTitle: p.landingTitle ?? undefined,
    landingBio: p.landingBio ?? undefined,
    landingGradientClassName: p.landingGradientClassName ?? undefined,
    landingImageUrl: p.landingImageUrl ?? undefined,
    detailTitle: p.detailTitle ?? undefined,
    longDescriptionHtml: p.longDescriptionHtml ?? undefined,
    detailColorHex: p.detailColorHex ?? undefined,
  }))
}


