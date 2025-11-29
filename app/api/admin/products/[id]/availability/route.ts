import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const availability = await prisma.productAvailability.findMany({
      where: { productId: id },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({
      availability: availability.map((item) => ({
        id: item.id,
        date: item.date.toISOString(),
        isAvailable: item.isAvailable,
      })),
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { availability } = body

    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { error: 'Invalid availability data' },
        { status: 400 }
      )
    }

    // Delete all existing availability for this product
    await prisma.productAvailability.deleteMany({
      where: { productId: id },
    })

    // Create new availability entries
    if (availability.length > 0) {
      await prisma.productAvailability.createMany({
        data: availability.map((item: { date: string; isAvailable: boolean }) => ({
          productId: id,
          date: new Date(item.date),
          isAvailable: item.isAvailable,
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving availability:', error)
    return NextResponse.json(
      { error: 'Failed to save availability' },
      { status: 500 }
    )
  }
}

