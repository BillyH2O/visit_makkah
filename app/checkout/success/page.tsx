"use client"

import { Suspense } from 'react'
import SuccessContent from './success-content'

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center p-6">Chargement…</div>}>
      <SuccessContent />
    </Suspense>
  )
}
