import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CategoryCode } from '@/types/product'
import { PricingType } from '@prisma/client'

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

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
                unitAmount: data.price != null && data.price !== '' ? Math.round(Number(data.price) * 100) : null,
                ...(data.firstPrice !== undefined && {
                  compareAtUnitAmount: data.firstPrice != null && data.firstPrice !== '' ? Math.round(Number(data.firstPrice) * 100) : null,
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
  } catch (error) {
    console.error('Error updating product:', error)
    return new Response('Server error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { categoryCode, ...data } = body

    // Find category by code
    const category = await prisma.category.findFirst({
      where: { code: categoryCode as CategoryCode },
    })

    if (!category) {
      return new Response('Category not found', { status: 400 })
    }

    // Generate slug from name
    const slug = slugify(data.name || `product-${Date.now()}`)

    // Create product
    const created = await prisma.product.create({
      data: {
        slug,
        name: data.name || 'Nouveau produit',
        description: data.description || null,
        categoryId: category.id,
        pricingType: PricingType.FIXED,
        landingTitle: data.landingTitle || null,
        landingBio: data.landingBio || null,
        landingGradientClassName: data.landingGradientClassName || null,
        landingImageUrl: data.landingImageUrl || null,
        detailTitle: data.detailTitle || null,
        longDescriptionHtml: data.longDescriptionHtml || null,
        detailColorHex: data.detailColorHex || null,
        isPremium: data.isPremium || false,
        active: data.active !== false,
        defaultCurrency: 'EUR',
        metadata: data.metadata || {},
      },
    })

    // Create default price if provided
    if (data.price !== undefined && data.price !== null && data.price !== '') {
      await prisma.price.create({
        data: {
          productId: created.id,
          unitAmount: Math.round(Number(data.price) * 100),
          compareAtUnitAmount: data.firstPrice ? Math.round(Number(data.firstPrice) * 100) : null,
          currency: 'EUR',
          active: true,
          isDefault: true,
          pricingType: PricingType.FIXED,
        },
      })
    }

    // Create image if provided
    if (data.imageUrl && data.imageUrl.trim() !== '') {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: data.imageUrl,
          alt: data.name || created.name,
          sortOrder: 0,
        },
      })
    }

    return Response.json({ product: created })
  } catch (error) {
    console.error('Error creating product:', error)
    return new Response('Server error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new Response('Product ID is required', { status: 400 })
    }

    // Delete product (cascade will delete prices, images, etc.)
    await prisma.product.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return new Response('Server error', { status: 500 })
  }
}

