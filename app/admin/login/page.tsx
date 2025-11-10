"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

function AdminLoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/admin'

  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([null, null, null, null])

  useEffect(() => {
    // Focus first input on mount
    inputsRef.current[0]?.focus()
  }, [])

  const handleChange = (idx: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 1)
    const next = [...digits]
    next[idx] = d
    setDigits(next)
    if (d && idx < 3) {
      inputsRef.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      const prevIdx = idx - 1
      const next = [...digits]
      next[prevIdx] = ''
      setDigits(next)
      inputsRef.current[prevIdx]?.focus()
      e.preventDefault()
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 3) inputsRef.current[idx + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (!text) return
    e.preventDefault()
    const next = ['', '', '', '']
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setDigits(next)
    const lastIdx = Math.min(text.length, 4) - 1
    inputsRef.current[lastIdx]?.focus()
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pin = digits.join('')
    if (pin.length !== 4) {
      setError('Veuillez saisir 4 chiffres')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Code incorrect')
      }
      router.replace(redirect)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Code incorrect'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm border border-black/10 rounded-2xl p-6 bg-white/80 dark:bg-black/30">
        <h1 className="text-2xl font-semibold mb-4">Accès administration</h1>
        <label className="block text-sm mb-2">Code à 4 chiffres</label>
        <div className="flex items-center gap-3">
          {digits.map((val, idx) => (
            <input
              key={idx}
              ref={(el) => { inputsRef.current[idx] = el }}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={val}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-2xl rounded-xl border-2 border-black/20 bg-white/90 outline-none focus:border-primary"
              placeholder="•"
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center p-6">Chargement…</div>}>
      <AdminLoginContent />
    </Suspense>
  )
}
