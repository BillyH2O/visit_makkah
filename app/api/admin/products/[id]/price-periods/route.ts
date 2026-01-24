import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer toutes les périodes de prix d'un produit
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pricePeriods = await prisma.productPricePeriod.findMany({
      where: { productId: id },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json({ pricePeriods })
  } catch (error) {
    console.error('Error fetching price periods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price periods' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les périodes de prix d'un produit
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { pricePeriods } = body

    if (!Array.isArray(pricePeriods)) {
      return NextResponse.json(
        { error: 'Invalid price periods data: expected an array' },
        { status: 400 }
      )
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 }
      )
    }

    // Supprimer toutes les périodes existantes
    await prisma.productPricePeriod.deleteMany({
      where: { productId: id },
    })

    // Créer les nouvelles périodes
    if (pricePeriods.length > 0) {
      await prisma.productPricePeriod.createMany({
        data: pricePeriods.map((period: {
          name: string
          startDate: string
          endDate: string
          unitAmount: number
          compareAtAmount?: number | null
          extraPerPersonCents?: number | null
          isActive?: boolean
        }) => ({
          productId: id,
          name: period.name,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
          unitAmount: period.unitAmount,
          compareAtAmount: period.compareAtAmount || null,
          extraPerPersonCents: period.extraPerPersonCents ?? null,
          isActive: period.isActive ?? true,
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving price periods:', error)
    return NextResponse.json(
      { error: 'Failed to save price periods', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Ajouter une nouvelle période de prix
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, startDate, endDate, unitAmount, compareAtAmount, extraPerPersonCents, isActive } = body

    if (!name || !startDate || !endDate || unitAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startDate, endDate, unitAmount' },
        { status: 400 }
      )
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 }
      )
    }

    const pricePeriod = await prisma.productPricePeriod.create({
      data: {
        productId: id,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        unitAmount,
        compareAtAmount: compareAtAmount || null,
        extraPerPersonCents: extraPerPersonCents ?? null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ pricePeriod })
  } catch (error) {
    console.error('Error creating price period:', error)
    return NextResponse.json(
      { error: 'Failed to create price period' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une période de prix spécifique
export async function DELETE(
  req: NextRequest
) {
  try {
    const { searchParams } = new URL(req.url)
    const periodId = searchParams.get('periodId')

    if (!periodId) {
      return NextResponse.json(
        { error: 'Missing periodId parameter' },
        { status: 400 }
      )
    }

    await prisma.productPricePeriod.delete({
      where: { id: periodId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting price period:', error)
    return NextResponse.json(
      { error: 'Failed to delete price period' },
      { status: 500 }
    )
  }
}

