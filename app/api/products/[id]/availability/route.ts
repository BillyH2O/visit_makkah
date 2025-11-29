import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Récupérer uniquement les dates marquées comme indisponibles
    // Par défaut, toutes les dates sont disponibles
    const availability = await prisma.productAvailability.findMany({
      where: { 
        productId: id,
        isAvailable: false, // Seulement les dates indisponibles
      },
      orderBy: { date: 'asc' },
    })

    const unavailableDates = availability.map((item) => 
      item.date.toISOString().split('T')[0] // Format YYYY-MM-DD
    )

    return NextResponse.json({
      availableDates: [], // Vide car toutes les dates sont disponibles par défaut
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

