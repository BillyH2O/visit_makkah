"use client"
import { testimonials, type TestimonialItem } from '@/data/testimonials'

export type { TestimonialItem }

export function useTestimonials() {
  // Retourne directement les données statiques, sans requête API
  return {
    data: testimonials,
    loading: false,
    error: null,
  }
}


