# Configuration Google Calendar

Ce guide vous explique comment configurer l'intégration Google Calendar pour créer automatiquement des événements lors des commandes avec date de réservation.

## 📋 Prérequis

- Un compte Google
- Accès à la [Google Cloud Console](https://console.cloud.google.com/)

## 🔧 Étapes de configuration

### 1. Créer un projet dans Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez le nom de votre projet

### 2. Activer l'API Google Calendar

1. Dans la Google Cloud Console, allez dans **APIs & Services** > **Library**
2. Recherchez "Google Calendar API"
3. Cliquez sur **Enable** pour activer l'API

### 3. Configurer l'écran de consentement OAuth

1. Allez dans **APIs & Services** > **OAuth consent screen**
2. Choisissez **External** (ou Internal si vous avez Google Workspace)
3. Remplissez les informations requises:
   - **App name**: Visit Makkah (ou le nom de votre choix)
   - **User support email**: Votre email
   - **Developer contact information**: Votre email
4. **IMPORTANT**: Dans la section **Test users**, cliquez sur **+ ADD USERS**
5. Ajoutez votre email (`visitmakkahsaoudite@gmail.com`) et tous les emails qui devront accéder à l'application
6. Cliquez sur **Save and Continue** pour chaque étape jusqu'à la fin
7. **Note**: En mode test, seuls les emails ajoutés dans "Test users" peuvent autoriser l'application

### 4. Créer des identifiants OAuth 2.0

1. Allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Créez les identifiants OAuth:
   - **Application type**: Web application
   - **Name**: Visit Makkah Calendar (ou un nom de votre choix)
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/auth/callback` (pour le développement)
     - `https://votre-domaine.com/auth/callback` (pour la production)
5. Cliquez sur **Create**
6. **Copiez le Client ID et le Client Secret** (vous ne pourrez plus voir le secret plus tard)

### 5. Obtenir le Refresh Token

#### Option A: Utiliser le script fourni (recommandé)

1. Installez `dotenv` si ce n'est pas déjà fait:
   ```bash
   npm install dotenv
   ```

2. Ajoutez vos credentials dans `.env`:
   ```env
   GOOGLE_CLIENT_ID=votre_client_id_ici
   GOOGLE_CLIENT_SECRET=votre_client_secret_ici
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

3. Exécutez le script:
   ```bash
   node scripts/get-google-refresh-token.js
   ```

4. Suivez les instructions affichées:
   - Ouvrez l'URL dans votre navigateur
   - Connectez-vous avec votre compte Google
   - Autorisez l'application
   - Copiez le code d'autorisation
   - Collez-le dans le terminal

5. Le refresh token sera affiché. Ajoutez-le à votre `.env`:
   ```env
   GOOGLE_REFRESH_TOKEN=votre_refresh_token_ici
   ```

#### Option B: Méthode manuelle

1. Construisez cette URL (remplacez `YOUR_CLIENT_ID` et `YOUR_REDIRECT_URI`):
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent
   ```

2. Ouvrez cette URL dans votre navigateur et autorisez l'application

3. Après autorisation, vous serez redirigé vers votre redirect URI avec un code dans l'URL:
   ```
   http://localhost:3000/auth/callback?code=4/0A...&scope=...
   ```

4. Utilisez ce code pour obtenir le refresh token avec une requête POST:
   ```bash
   curl -X POST https://oauth2.googleapis.com/token \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=CODE_FROM_URL" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=YOUR_REDIRECT_URI"
   ```

5. La réponse contiendra `refresh_token`. Ajoutez-le à votre `.env`.

### 6. Configuration finale dans `.env`

Ajoutez toutes les variables nécessaires:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REFRESH_TOKEN=votre_refresh_token
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

**Note**: Pour la production, changez `GOOGLE_REDIRECT_URI` vers votre domaine réel.

## ✅ Vérification

Une fois configuré, lorsque qu'un client passe une commande avec une date de réservation:

1. ✅ La commande est marquée comme payée
2. ✅ Un email de confirmation est envoyé au client
3. ✅ Un email de notification est envoyé à l'admin
4. ✅ **Un événement est créé dans votre calendrier Google** avec:
   - Le titre: `📅 [Nom du produit] - [Numéro de commande]`
   - La date de réservation choisie par le client
   - Les détails de la commande dans la description
   - Le client ajouté comme participant (si email fourni)
   - Des rappels automatiques (24h avant par email, 1h avant par popup)

## 🔍 Dépannage

### Erreur: "Google Calendar credentials are not configured"
- Vérifiez que toutes les variables d'environnement sont définies dans `.env`
- Redémarrez votre serveur après avoir modifié `.env`

### Erreur: "invalid_grant" ou "Token has been expired or revoked"
- Le refresh token a expiré ou été révoqué
- Régénérez un nouveau refresh token en suivant l'étape 4

### Les événements ne sont pas créés
- Vérifiez les logs du serveur pour voir les erreurs
- Assurez-vous que l'API Google Calendar est activée
- Vérifiez que le refresh token est valide

### L'événement est créé mais pas visible
- Vérifiez que vous regardez le bon calendrier (calendrier principal)
- Vérifiez les paramètres de partage de votre calendrier

## 📝 Notes importantes

- Le refresh token ne doit **jamais** être commité dans Git
- Ajoutez `.env` à votre `.gitignore`
- Pour la production, utilisez des variables d'environnement sécurisées
- Le fuseau horaire est configuré sur `Europe/Paris` par défaut (modifiable dans `lib/google-calendar.ts`)
- Les événements sont créés de 9h à 18h par défaut (modifiable dans le webhook)

