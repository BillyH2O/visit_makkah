import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/products/[id]/price-for-date?date=YYYY-MM-DD
 * 
 * Retourne le prix applicable pour un produit à une date donnée.
 * Si une période de prix active existe pour cette date, elle est utilisée.
 * Sinon, le prix de base du produit est retourné.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date')

    // Récupérer le produit avec son prix de base
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        prices: {
          where: { active: true, isDefault: true },
          take: 1,
        },
        pricePeriods: {
          where: { isActive: true },
          orderBy: { startDate: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const basePrice = product.prices[0]?.unitAmount || null
    const baseCompareAtPrice = product.prices[0]?.compareAtUnitAmount || null
    
    // Récupérer extraPerPersonCents depuis les métadonnées du produit
    const productMetadata = product.metadata as { extraPerPersonCents?: number } | null
    const baseExtraPerPersonCents = productMetadata?.extraPerPersonCents ?? null

    // Si pas de date fournie, retourner le prix de base
    if (!dateStr) {
      return NextResponse.json({
        productId: id,
        date: null,
        unitAmount: basePrice,
        compareAtAmount: baseCompareAtPrice,
        extraPerPersonCents: baseExtraPerPersonCents,
        periodName: null,
        isBasePeriod: true,
      })
    }

    // Parser la date
    const targetDate = new Date(dateStr)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Chercher une période de prix active qui couvre cette date
    const applicablePeriod = product.pricePeriods.find(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      // Normaliser les dates pour comparer uniquement les jours
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      const target = new Date(targetDate)
      target.setHours(12, 0, 0, 0)
      
      return target >= start && target <= end
    })

    if (applicablePeriod) {
      return NextResponse.json({
        productId: id,
        date: dateStr,
        unitAmount: applicablePeriod.unitAmount,
        compareAtAmount: applicablePeriod.compareAtAmount,
        extraPerPersonCents: applicablePeriod.extraPerPersonCents,
        periodName: applicablePeriod.name,
        isBasePeriod: false,
        periodId: applicablePeriod.id,
      })
    }

    // Aucune période applicable, retourner le prix de base
    return NextResponse.json({
      productId: id,
      date: dateStr,
      unitAmount: basePrice,
      compareAtAmount: baseCompareAtPrice,
      extraPerPersonCents: baseExtraPerPersonCents,
      periodName: null,
      isBasePeriod: true,
    })

  } catch (error) {
    console.error('Error fetching price for date:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    )
  }
}

