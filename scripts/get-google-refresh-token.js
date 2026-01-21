import { google } from 'googleapis'
import readline from 'readline'

// Charger dotenv si disponible (optionnel, car Next.js charge .env automatiquement)
try {
  const dotenv = await import('dotenv')
  dotenv.config()
} catch {
  // dotenv n'est pas installé, ce n'est pas grave si les variables sont déjà définies
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function getRefreshToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'

  if (!clientId || !clientSecret) {
    console.error('❌ Erreur: GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET doivent être définis dans .env')
    process.exit(1)
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  // Scopes nécessaires pour Google Calendar
  const scopes = ['https://www.googleapis.com/auth/calendar']

  // Générer l'URL d'autorisation
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force la demande de consentement pour obtenir le refresh token
  })

  console.log('\n📋 Étapes pour obtenir le refresh token:\n')
  console.log('⚠️  IMPORTANT: Assurez-vous d\'utiliser le BON compte Google!')
  console.log('   (Celui associé au calendrier où vous voulez créer les événements)\n')
  console.log('1. Ouvrez cette URL dans votre navigateur:')
  console.log(`\n   ${authUrl}\n`)
  console.log('2. Si vous êtes déjà connecté avec le MAUVAIS compte:')
  console.log('   - Cliquez sur votre avatar en haut à droite')
  console.log('   - Cliquez sur "Se déconnecter" ou "Ajouter un autre compte"')
  console.log('   - Connectez-vous avec le BON compte Google')
  console.log('3. Autorisez l\'application à accéder à votre calendrier')
  console.log('4. Copiez le code d\'autorisation depuis l\'URL de redirection\n')

  const code = await askQuestion('Collez le code d\'autorisation ici: ')

  try {
    const { tokens } = await oauth2Client.getToken(code.trim())
    
    if (tokens.refresh_token) {
      console.log('\n✅ Succès! Voici votre refresh token:\n')
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`)
      console.log('Ajoutez cette ligne à votre fichier .env\n')
    } else {
      console.log('\n⚠️  Aucun refresh token reçu.')
      console.log('Assurez-vous d\'avoir utilisé prompt: "consent" dans l\'URL d\'autorisation.')
      console.log('Token d\'accès reçu:', tokens.access_token ? 'Oui' : 'Non')
      if (tokens.access_token) {
        console.log('\n💡 Astuce: Si vous avez déjà autorisé l\'application, révoquez l\'accès et réessayez.')
        console.log('   Allez sur: https://myaccount.google.com/permissions')
      }
    }

    rl.close()
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'obtention du token:', error.message)
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Le code d\'autorisation a expiré ou a déjà été utilisé.')
      console.log('   Les codes OAuth expirent rapidement (environ 10 minutes).')
      console.log('   Solution:')
      console.log('   1. Relancez ce script pour obtenir une nouvelle URL')
      console.log('   2. Ouvrez la nouvelle URL immédiatement')
      console.log('   3. Copiez le code dès que vous êtes redirigé')
      console.log('   4. Collez-le rapidement dans le script\n')
    }
    rl.close()
    process.exit(1)
  }
}

getRefreshToken()

