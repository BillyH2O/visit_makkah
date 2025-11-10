import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const portStr = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  const allowSelfSigned = String(process.env.SMTP_ALLOW_SELF_SIGNED || '').toLowerCase() === 'true'

  if (!host || !portStr || !user || !pass) {
    throw new Error('SMTP environment variables are not fully configured')
  }

  const port = Number(portStr)
  const secure = port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(allowSelfSigned ? { tls: { rejectUnauthorized: false } } : {}),
  })
}

export type SendMailParams = {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
  replyTo?: string
}

export async function sendMail(params: SendMailParams) {
  const transporter = getTransporter()
  const from = params.from || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'no-reply@example.com'
  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
    replyTo: params.replyTo,
  })
}
