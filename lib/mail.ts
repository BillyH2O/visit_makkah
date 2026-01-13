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
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
}

export async function sendMail(params: SendMailParams) {
  console.log('[mail] Attempting to send email:', {
    to: params.to,
    subject: params.subject,
    hasHtml: !!params.html,
    hasText: !!params.text,
  })
  
  try {
    const transporter = getTransporter()
  const from = params.from || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'no-reply@example.com'
    
    console.log('[mail] SMTP transporter created, from:', from)
    
    const result = await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
    replyTo: params.replyTo,
    attachments: params.attachments,
  })
    
    console.log('[mail] ✅ Email sent successfully:', {
      messageId: result.messageId,
      to: params.to,
      subject: params.subject,
    })
    
    return result
  } catch (error) {
    console.error('[mail] ❌ Failed to send email:', {
      to: params.to,
      subject: params.subject,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}
