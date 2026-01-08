# Configuration du Webhook Stripe

Ce guide explique comment configurer le webhook Stripe pour recevoir les notifications de paiement et envoyer automatiquement les emails et créer les événements Google Calendar.

## 🔍 Diagnostic : Aucun log du webhook

Si vous ne voyez **aucun log** `[webhooks/stripe]` dans votre console, cela signifie que le webhook Stripe n'est **pas configuré** ou **ne se déclenche pas**.

### ✅ Vérification rapide

1. **Testez votre configuration** :
   ```
   http://localhost:3000/api/webhooks/stripe/test
   ```
   Cela vous dira si `STRIPE_WEBHOOK_SECRET` est bien configuré.

2. **Vérifiez dans Stripe Dashboard** :
   - Allez sur https://dashboard.stripe.com/webhooks
   - Vérifiez s'il existe un webhook configuré
   - Si oui, vérifiez l'URL et les événements sélectionnés

## 📋 Configuration du Webhook Stripe

### 1. Pour la Production (site en ligne)

1. Allez sur [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **"Add endpoint"**
3. Configurez le webhook :
   - **Endpoint URL**: `https://votre-domaine.com/api/webhooks/stripe`
   - **Description**: "Webhook pour les commandes"
   - **Events to send**: Sélectionnez `checkout.session.completed`
4. Cliquez sur **"Add endpoint"**
5. **Copiez le "Signing secret"** (commence par `whsec_...`)
6. Ajoutez-le dans votre fichier `.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
   ```
7. Redémarrez votre serveur

### 2. Pour le Développement Local

En développement local, Stripe ne peut pas accéder à `localhost`. Vous devez utiliser un tunnel comme **ngrok**.

#### Option A : Utiliser ngrok (Recommandé)

1. **Installez ngrok** :
   ```bash
   # Windows (avec Chocolatey)
   choco install ngrok
   
   # Ou téléchargez depuis https://ngrok.com/download
   ```

2. **Démarrez votre serveur Next.js** :
   ```bash
   npm run dev
   ```

3. **Dans un autre terminal, exposez le port 3000** :
   ```bash
   ngrok http 3000
   ```

4. **Copiez l'URL HTTPS** affichée (ex: `https://abc123.ngrok.io`)

5. **Configurez le webhook dans Stripe** :
   - Allez sur [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
   - Cliquez sur **"Add endpoint"**
   - **Endpoint URL**: `https://abc123.ngrok.io/api/webhooks/stripe`
   - **Events to send**: `checkout.session.completed`
   - Cliquez sur **"Add endpoint"**

6. **Copiez le Signing secret** et ajoutez-le dans `.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

7. **Redémarrez votre serveur Next.js**

#### Option B : Utiliser Stripe CLI (Alternative)

1. **Installez Stripe CLI** :
   ```bash
   # Windows
   scoop install stripe
   # Ou téléchargez depuis https://stripe.com/docs/stripe-cli
   ```

2. **Connectez-vous** :
   ```bash
   stripe login
   ```

3. **Démarrez le forwarding** :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copiez le webhook signing secret** affiché et ajoutez-le dans `.env`

## ✅ Vérification

### Vérifier que le webhook fonctionne

1. **Démarrez votre serveur** :
   ```bash
   npm run dev
   ```

2. **Passez une commande test** sur votre site

3. **Vérifiez les logs** dans votre terminal. Vous devriez voir :
   ```
   [webhooks/stripe] Webhook endpoint called
   [webhooks/stripe] Signature present: true
   [webhooks/stripe] Webhook secret configured: true
   [webhooks/stripe] Received event: checkout.session.completed (id: evt_...)
   [webhooks/stripe] Processing checkout.session.completed event
   [webhooks/stripe] Order ID: ..., Email: ...
   [webhooks/stripe] Sending confirmation email to customer: ...
   [webhooks/stripe] Customer email sent successfully to ...
   [webhooks/stripe] Sending admin notification email to ...
   [webhooks/stripe] Admin email sent successfully to ...
   ```

### Vérifier dans Stripe Dashboard

1. Allez sur [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur votre webhook
3. Vérifiez les **"Recent events"**
4. Vous devriez voir des événements `checkout.session.completed` avec le statut **"Succeeded"**

## 🔧 Dépannage

### Problème : Aucun log dans la console

**Causes possibles** :
- Le webhook n'est pas configuré dans Stripe Dashboard
- L'URL du webhook est incorrecte
- Le webhook secret n'est pas dans `.env`
- Le serveur n'a pas été redémarré après avoir ajouté le secret

**Solution** :
1. Vérifiez que le webhook existe dans Stripe Dashboard
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est dans votre `.env`
3. Redémarrez votre serveur
4. En local, utilisez ngrok ou Stripe CLI

### Problème : "Missing Stripe signature"

**Cause** : Le webhook n'est pas appelé par Stripe (probablement un appel direct à l'URL)

**Solution** : Le webhook doit être appelé uniquement par Stripe, pas directement

### Problème : "Webhook signature verification failed"

**Cause** : Le `STRIPE_WEBHOOK_SECRET` ne correspond pas au secret du webhook

**Solution** :
1. Allez dans Stripe Dashboard → Webhooks
2. Cliquez sur votre webhook
3. Cliquez sur "Reveal" pour voir le secret
4. Copiez-le dans votre `.env`
5. Redémarrez le serveur

### Problème : Les emails ne sont pas envoyés

**Vérifiez** :
1. Les logs montrent-ils `[webhooks/stripe] Sending confirmation email` ?
2. Y a-t-il des erreurs dans les logs ?
3. Les variables SMTP sont-elles configurées dans `.env` ?
4. Vérifiez les logs pour `[webhooks/stripe] Failed to send customer email`

### Problème : Les événements Google Calendar ne sont pas créés

**Vérifiez** :
1. Les logs montrent-ils `[webhooks/stripe] Google Calendar event created` ?
2. Y a-t-il des erreurs dans les logs ?
3. Les variables Google Calendar sont-elles configurées dans `.env` ?
4. Vérifiez les logs pour `[webhooks/stripe] Failed to create Google Calendar event`

## 📝 Variables d'environnement requises

Assurez-vous que toutes ces variables sont dans votre `.env` :

```env
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
SMTP_HOST=smtp.votre-serveur.com
SMTP_PORT=587
SMTP_USER=votre-email@domaine.com
SMTP_PASSWORD=votre-mot-de-passe
ADMIN_EMAIL=visitmakkah@visit-makkah.fr

# Google Calendar (optionnel)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

## 🎯 Résumé

Pour que les emails et les événements Google Calendar soient créés automatiquement :

1. ✅ Configurez le webhook dans Stripe Dashboard
2. ✅ Ajoutez `STRIPE_WEBHOOK_SECRET` dans `.env`
3. ✅ Configurez les variables SMTP dans `.env`
4. ✅ (Optionnel) Configurez Google Calendar dans `.env`
5. ✅ Redémarrez votre serveur
6. ✅ Testez une commande et vérifiez les logs

