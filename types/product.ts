export type CategoryCode = 'OFFRE' | 'SADAQA' | 'VISA' | 'SERVICE'

export type ProductDTO = {
  id: string
  slug: string
  name: string
  description?: string | null
  categoryCode: CategoryCode
  imageUrl?: string | null
  currency?: string | null
  unitAmount?: number | null
  firstUnitAmount?: number | null
  infoLabel?: string | null
  // Landing specific
  landingTitle?: string | null
  landingBio?: string | null
  landingGradientClassName?: string | null
  landingImageUrl?: string | null
  // Detail page specific
  detailTitle?: string | null
  longDescriptionHtml?: string | null
  detailColorHex?: string | null
}


