import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CategoryCode } from '@/types/product'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as CategoryCode | null

  try {
    const products = await prisma.product.findMany({
      where: category ? { category: { code: category } } : undefined,
      include: {
        prices: { where: { active: true }, orderBy: [{ isDefault: 'desc' }] },
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    return Response.json({ products })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        landingTitle: data.landingTitle,
        landingBio: data.landingBio,
        landingGradientClassName: data.landingGradientClassName,
        landingImageUrl: data.landingImageUrl,
        detailTitle: data.detailTitle,
        longDescriptionHtml: data.longDescriptionHtml,
        detailColorHex: data.detailColorHex,
        isPremium: data.isPremium,
        active: data.active,
        ...(data.metadata !== undefined && {
          metadata: data.metadata,
        }),
        ...(data.price !== undefined && {
          prices: {
            updateMany: {
              where: { productId: id, isDefault: true },
              data: {
                unitAmount: Math.round(Number(data.price) * 100),
                ...(data.firstPrice !== undefined && {
                  compareAtUnitAmount: Math.round(Number(data.firstPrice) * 100),
                }),
              },
            },
          },
        }),
      },
    })

    if (data.imageUrl !== undefined) {
      const url: string = data.imageUrl
      if (url && url.trim() !== '') {
        const existing = await prisma.productImage.findFirst({
          where: { productId: id },
          orderBy: { sortOrder: 'asc' },
        })
        if (existing) {
          await prisma.productImage.update({ where: { id: existing.id }, data: { url } })
        } else {
          await prisma.productImage.create({
            data: { productId: id, url, alt: data.name ?? updated.name, sortOrder: 0 },
          })
        }
      }
    }

    return Response.json({ product: updated })
  } catch {
    return new Response('Server error', { status: 500 })
  }
}

