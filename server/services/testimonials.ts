import { testimonials } from '@/data/testimonials'

export type TestimonialDTO = {
  id: string
  text: string
  image: string
  name: string
  role?: string | null
}

export async function getTestimonials(): Promise<TestimonialDTO[]> {
  // Retourne directement les données statiques depuis le fichier
  return testimonials.map((t) => ({
    id: t.id,
    text: t.text,
    image: t.image,
    name: t.name,
    role: t.role || null,
  }))
}


