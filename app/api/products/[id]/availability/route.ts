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

    const availableDates: string[] = []
    const unavailableDates: string[] = []

    availability.forEach((item) => {
      const dateStr = item.date.toISOString().split('T')[0] // Format YYYY-MM-DD
      if (item.isAvailable) {
        availableDates.push(dateStr)
      } else {
        unavailableDates.push(dateStr)
      }
    })

    return NextResponse.json({
      availableDates,
      unavailableDates,
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

