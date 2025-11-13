import { NextRequest } from 'next/server'
import { sendMail } from '@/lib/mail'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    const name = String(form.get('name') || '').slice(0, 200)
    const email = String(form.get('email') || '').slice(0, 200)
    const phone = String(form.get('phone') || '').slice(0, 50)
    const message = String(form.get('message') || '').slice(0, 5000)

    const files = form.getAll('files').filter(Boolean) as File[]
    if (!email && !phone) {
      return new Response('Email ou téléphone requis', { status: 400 })
    }

    // Convert uploaded files to Buffers for nodemailer attachments
    const attachments = await Promise.all(
      files.map(async (f) => {
        const arrayBuffer = await f.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return {
          filename: f.name || 'document',
          content: buffer,
          contentType: f.type || undefined,
        }
      })
    )

    const adminTo =
      process.env.SMTP_ADMIN ||
      process.env.ADMIN_EMAIL ||
      'visitmakkah@visit-makkah.fr'

    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;font-size:14px;line-height:1.6">
        <h2 style="margin:0 0 12px 0">Nouveaux documents — Visa</h2>
        <p><strong>Nom:</strong> ${name || '—'}</p>
        <p><strong>Email:</strong> ${email || '—'}</p>
        <p><strong>Téléphone:</strong> ${phone || '—'}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit">${message || '—'}</pre>
        <p style="margin-top:12px"><strong>Pièces jointes:</strong> ${attachments.length} fichier(s)</p>
      </div>
    `

    await sendMail({
      to: adminTo,
      subject: `[Visa] Téléversement de documents`,
      html,
      text: `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\n\nMessage:\n${message}\n\nPièces jointes: ${attachments.length}`,
      replyTo: email || undefined,
      attachments,
    })

    return Response.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[visa/upload] error:', e)
    return new Response(`Server error: ${msg}`, { status: 500 })
  }
}


