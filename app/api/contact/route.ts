 import { NextRequest } from 'next/server'
import { sendMail } from '@/lib/mail'

export const runtime = 'nodejs'

type ContactPayload = {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}
                                                                                                                                    
function sanitize(input?: string) {
  if (!input) return ''
  return String(input).toString().slice(0, 5000)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload
    const name = sanitize(body.name)
    const email = sanitize(body.email)
    const phone = sanitize(body.phone)
    const subject = sanitize(body.subject) || 'Nouveau message de contact'
    const message = sanitize(body.message)

    if (!message || (!email && !phone)) {
      return new Response('Missing required fields', { status: 400 })
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'visitmakkah@visit-makkah.fr'

    const htmlAdmin = `
      <div style="font-family:system-ui,Arial,sans-serif;font-size:14px;line-height:1.5">
        <h2 style="margin:0 0 12px 0">Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name || '—'}</p>
        <p><strong>Email:</strong> ${email || '—'}</p>
        <p><strong>Téléphone:</strong> ${phone || '—'}</p>
        <p><strong>Objet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>
      </div>
    `

    await sendMail({
      to: adminEmail,
      subject: `[Contact] ${subject}`,
      html: htmlAdmin,
      text: `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\n\n${message}`,
      replyTo: email || undefined,
    })

    if (email) {
      const htmlUser = `
        <div style="font-family:system-ui,Arial,sans-serif;font-size:14px;line-height:1.5">
          <p>Bonjour${name ? ` ${name}` : ''},</p>
          <p>Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>
          <p style="margin-top:12px;opacity:0.8">Copie de votre message:</p>
          <blockquote style="margin:8px 0;padding-left:12px;border-left:3px solid #e5e7eb">
            <pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>
          </blockquote>
          <p style="margin-top:16px">Cordialement,<br/>Visit Makkah</p>
        </div>
      `
      await sendMail({
        to: email,
        subject: 'Nous avons bien reçu votre message',
        html: htmlUser,
        text: `Nous avons bien reçu votre message:\n\n${message}`,
      })
    }

    return Response.json({ ok: true })
  } catch (e) {
    console.error('[contact] send error:', e)
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return new Response(`Server error: ${msg}`, { status: 500 })
  }
}
