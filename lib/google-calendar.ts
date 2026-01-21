import { google } from 'googleapis'

/**
 * Crée un client OAuth2 pour Google Calendar
 */
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google Calendar credentials are not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables.'
    )
  }

  console.log('[google-calendar] Creating OAuth2 client with redirectUri:', redirectUri)
  console.log('[google-calendar] Client ID present:', !!clientId)
  console.log('[google-calendar] Client Secret present:', !!clientSecret)
  console.log('[google-calendar] Refresh Token present:', !!refreshToken)
  console.log('[google-calendar] Refresh Token length:', refreshToken?.length || 0)

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  return oauth2Client
}

/**
 * Crée un événement dans Google Calendar
 * @param eventData - Données de l'événement à créer
 * @returns L'ID de l'événement créé
 */
export async function createCalendarEvent(eventData: {
  summary: string
  description?: string
  startDateTime: Date
  endDateTime?: Date
  location?: string
  attendees?: Array<{ email: string; name?: string }>
}): Promise<string> {
  try {
    const auth = getOAuth2Client()
    const calendar = google.calendar({ version: 'v3', auth })

    // Format des dates pour Google Calendar (RFC3339)
    const startDate = eventData.startDateTime.toISOString()
    // Par défaut, l'événement dure 1 heure si endDateTime n'est pas spécifié
    const endDate = eventData.endDateTime
      ? eventData.endDateTime.toISOString()
      : new Date(eventData.startDateTime.getTime() + 60 * 60 * 1000).toISOString()

    const event = {
      summary: eventData.summary,
      description: eventData.description || '',
      start: {
        dateTime: startDate,
        timeZone: 'Europe/Paris', // Ajustez selon votre fuseau horaire
      },
      end: {
        dateTime: endDate,
        timeZone: 'Europe/Paris',
      },
      ...(eventData.location && { location: eventData.location }),
      ...(eventData.attendees && eventData.attendees.length > 0 && {
        attendees: eventData.attendees.map((a) => ({
          email: a.email,
          ...(a.name && { displayName: a.name }),
        })),
      }),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // Rappel 24h avant par email
          { method: 'popup', minutes: 60 }, // Rappel 1h avant par popup
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary', // Utilise le calendrier principal de l'utilisateur
      requestBody: event,
    })

    if (!response.data.id) {
      throw new Error('Failed to create calendar event: no event ID returned')
    }

    return response.data.id
  } catch (error: unknown) {
    console.error('[google-calendar] Error creating event:', error)
    
    // Détecter les erreurs spécifiques
    const errorWithCode = error as { code?: number; message?: string }
    if (errorWithCode?.code === 400 && errorWithCode?.message?.includes('invalid_grant')) {
      console.error('[google-calendar] ❌ Invalid grant error - Possible causes:')
      console.error('[google-calendar]   1. Refresh token has been revoked')
      console.error('[google-calendar]   2. Refresh token was obtained with a different redirect URI')
      console.error('[google-calendar]   3. Refresh token was obtained with a different Google account')
      console.error('[google-calendar]   4. Refresh token has expired (rare)')
      console.error('[google-calendar]')
      console.error('[google-calendar] 💡 Solution: Regenerate the refresh token:')
      console.error('[google-calendar]   1. Run: node scripts/get-google-refresh-token.js')
      console.error('[google-calendar]   2. Use the SAME redirect URI as configured in production')
      console.error('[google-calendar]   3. Use the SAME Google account')
      console.error('[google-calendar]   4. Update GOOGLE_REFRESH_TOKEN in production environment variables')
    }
    
    throw error
  }
}


