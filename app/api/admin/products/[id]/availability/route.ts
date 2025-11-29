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
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { availability } = body

    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { error: 'Invalid availability data: expected an array' },
        { status: 400 }
      )
    }

    // Verify product exists
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

    // Delete all existing availability for this product
    await prisma.productAvailability.deleteMany({
      where: { productId: id },
    })

    // Create new availability entries (only unavailable dates)
    if (availability.length > 0) {
      try {
        await prisma.productAvailability.createMany({
          data: availability.map((item: { date: string; isAvailable: boolean }) => {
            const date = new Date(item.date)
            if (isNaN(date.getTime())) {
              throw new Error(`Invalid date format: ${item.date}`)
            }
            return {
              productId: id,
              date,
              isAvailable: item.isAvailable ?? false,
            }
          }),
          skipDuplicates: true,
        })
      } catch (createError) {
        console.error('Error creating availability entries:', createError)
        throw createError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving availability:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    
    return NextResponse.json(
      { 
        error: 'Failed to save availability',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorDetails })
      },
      { status: 500 }
    )
  }
}

