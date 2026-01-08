import { google } from 'googleapis'

/**
 * Crée un client OAuth2 pour Google Calendar
 */
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost'

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google Calendar credentials are not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables.'
    )
  }

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
  } catch (error) {
    console.error('[google-calendar] Error creating event:', error)
    throw error
  }
}


