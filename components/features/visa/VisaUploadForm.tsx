"use client"

import { useState } from 'react'

type Props = {
  id?: string
}

export default function VisaUploadForm({ id }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(null)
    setError(null)
    try {
      const form = new FormData()
      form.append('name', name)
      form.append('email', email)
      form.append('phone', phone)
      form.append('message', message)
      if (files) {
        for (let i = 0; i < files.length; i++) {
          form.append('files', files.item(i) as File)
        }
      }
      const res = await fetch('/api/visa/upload', {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Upload failed')
      }
      setSuccess('Documents envoyés avec succès. Nous vous recontacterons rapidement.')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      setFiles(null)
      const input = document.getElementById('visa-files-input') as HTMLInputElement | null
      if (input) input.value = ''
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id={id} className="w-full max-w-3xl mx-auto border border-black/10 dark:border-white/10 rounded-2xl p-6 bg-white/70 dark:bg-black/30">
      <h3 className="text-2xl font-semibold mb-2">Envoyer vos documents (Visa)</h3>
      <p className="text-sm text-black/70 dark:text-white/70 mb-4">
        Téléversez vos pièces (PDF, JPG, PNG). Elles seront envoyées à notre équipe par email.
      </p>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 rounded-xl border-2 border-black/20 bg-white/90 px-3 outline-none focus:border-primary dark:bg-black/40 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 rounded-xl border-2 border-black/20 bg-white/90 px-3 outline-none focus:border-primary dark:bg_black/40 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!phone}
            className="w-full h-11 rounded-xl border-2 border-black/20 bg-white/90 px-3 outline-none focus:border-primary dark:bg-black/40 dark:text-white"
            placeholder="votre@email.com"
          />
          <p className="text-xs text-black/60 dark:text-white/60 mt-1">Email ou téléphone requis.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-xl border-2 border-black/20 bg-white/90 px-3 py-2 outline-none focus:border-primary dark:bg-black/40 dark:text-white"
            placeholder="Informations complémentaires (optionnel)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pièces jointes</label>
          <input
            id="visa-files-input"
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="block w-full text-sm text-black/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:text-white/80"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <p className="text-xs text-black/60 dark:text-white/60 mt-1">Formats: PDF, JPG, PNG. Taille maximale conseillée: 10 Mo par fichier.</p>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-white/5 bg-secondary px-6 py-3 text-white hover:bg-secondary/90 disabled:opacity-60"
          >
            {submitting ? 'Envoi...' : 'Envoyer les documents'}
          </button>
        </div>
      </form>
    </section>
  )
}


