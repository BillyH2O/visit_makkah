"use client"

import { useCallback, useState } from 'react'

export type ContactFormData = {
  lastName: string
  firstName: string
  email: string
  message: string
  phone?: string
  subject?: string
}

export type ContactStatus = 'idle' | 'ok' | 'error'

export function useContact() {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<ContactStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const reset = useCallback(() => {
    setSending(false)
    setStatus('idle')
    setErrorMsg(null)
  }, [])

  const sendContact = useCallback(async (data: ContactFormData) => {
    try {
      setSending(true)
      setStatus('idle')
      setErrorMsg(null)

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone,
          subject: data.subject || 'Contact site',
          message: data.message,
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Erreur lors de l\'envoi du message')
      }

      setStatus('ok')
      return { ok: true }
    } catch (err) {
      setStatus('error')
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setErrorMsg(errorMessage)
      return { ok: false, error: errorMessage }
    } finally {
      setSending(false)
    }
  }, [])

  return { sending, status, errorMsg, sendContact, reset }
}
