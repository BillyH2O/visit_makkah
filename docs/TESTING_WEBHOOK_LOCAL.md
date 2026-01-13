# Tester le Webhook Stripe en Local

Vous avez configuré votre webhook en production dans Stripe Dashboard, mais vous voulez le tester en local. Voici plusieurs méthodes :

## 🎯 Méthode 1 : Stripe CLI (Recommandé - Le plus simple)

Stripe CLI permet de forwarder les événements de votre compte Stripe vers votre serveur local, **sans modifier le webhook de production**.

### Installation

```bash
# Windows (avec Scoop)
scoop install stripe

# Ou téléchargez depuis https://stripe.com/docs/stripe-cli
```

### Utilisation

1. **Connectez-vous à Stripe CLI** :
   ```bash
   stripe login
   ```
   Cela ouvrira votre navigateur pour vous authentifier.

2. **Démarrez votre serveur Next.js** :
   ```bash
   npm run dev
   ```

3. **Dans un autre terminal, forwardez les événements** :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Stripe CLI affichera un webhook secret** (commence par `whsec_...`). **Copiez-le** !

5. **Ajoutez ce secret dans votre `.env` local** :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_le_secret_affiché_par_stripe_cli
   ```

6. **Redémarrez votre serveur Next.js**

7. **Dans un troisième terminal, déclenchez un événement test** :
   ```bash
   stripe trigger checkout.session.completed
   ```

### Avantages de cette méthode :
- ✅ Ne modifie pas votre webhook de production
- ✅ Teste avec de vrais événements Stripe
- ✅ Pas besoin de ngrok
- ✅ Fonctionne même si vous n'avez pas de compte ngrok payant

## 🎯 Méthode 2 : ngrok (Alternative)

Si vous préférez utiliser ngrok :

1. **Démarrez votre serveur** :
   ```bash
   npm run dev
   ```

2. **Dans un autre terminal, exposez le port 3000** :
   ```bash
   ngrok http 3000
   ```

3. **Copiez l'URL HTTPS** affichée (ex: `https://abc123.ngrok.io`)

4. **Créez un webhook de test dans Stripe Dashboard** :
   - Allez sur https://dashboard.stripe.com/webhooks
   - Cliquez sur "Add endpoint"
   - URL : `https://abc123.ngrok.io/api/webhooks/stripe`
   - Événements : `checkout.session.completed`
   - Cliquez sur "Add endpoint"

5. **Copiez le secret** et ajoutez-le dans `.env` local

6. **Redémarrez votre serveur**

7. **Passez une commande test** sur votre site local

### Inconvénients :
- ⚠️ L'URL ngrok change à chaque redémarrage (sauf compte payant)
- ⚠️ Il faut créer/modifier un webhook dans Stripe Dashboard

## 🎯 Méthode 3 : Tester avec une vraie commande en production

Si vous voulez tester le webhook de production directement :

1. **Assurez-vous que votre `.env` de production contient le bon secret** :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_le_secret_du_webhook_prod
   ```

2. **Déployez votre code en production**

3. **Passez une vraie commande test** sur votre site de production

4. **Vérifiez les logs** dans votre serveur de production

### Avantages :
- ✅ Teste le vrai flux de production
- ✅ Pas de configuration supplémentaire

### Inconvénients :
- ⚠️ Nécessite un déploiement
- ⚠️ Plus long à tester

## 🎯 Méthode 4 : Tester l'endpoint `/api/checkout/finalize` en local

L'endpoint `/api/checkout/finalize` est appelé depuis la page de succès et peut servir de solution de secours :

1. **Passez une commande test** sur votre site local
2. **Après le paiement, vous serez redirigé vers** `/checkout/success?session_id=...`
3. **La page de succès appelle automatiquement** `/api/checkout/finalize`
4. **Vérifiez les logs** pour voir si l'endpoint est appelé

**Note** : Cet endpoint ne fait que mettre à jour les métadonnées, pas les emails ni Google Calendar. Pour tester complètement, utilisez Stripe CLI.

## 📋 Comparaison des méthodes

| Méthode | Facilité | Nécessite ngrok | Nécessite Stripe CLI | Modifie prod webhook |
|---------|----------|-----------------|---------------------|---------------------|
| Stripe CLI | ⭐⭐⭐⭐⭐ | ❌ | ✅ | ❌ |
| ngrok | ⭐⭐⭐ | ✅ | ❌ | ✅ (nouveau webhook) |
| Test prod | ⭐⭐ | ❌ | ❌ | ❌ |
| finalize endpoint | ⭐⭐⭐⭐ | ❌ | ❌ | ❌ |

## ✅ Recommandation

**Utilisez Stripe CLI** (Méthode 1) - C'est la méthode la plus simple et la plus propre pour tester en local sans affecter votre configuration de production.

## 🔍 Vérification

Après avoir configuré Stripe CLI ou ngrok :

1. **Passez une commande test**
2. **Regardez les logs** - vous devriez voir :
   ```
   [webhooks/stripe] ========== WEBHOOK CALLED ==========
   [webhooks/stripe] Received event: checkout.session.completed
   [webhooks/stripe] Sending confirmation email...
   ```

## 🐛 Dépannage

### Stripe CLI ne fonctionne pas
- Vérifiez que vous êtes bien connecté : `stripe login`
- Vérifiez que le secret affiché par Stripe CLI est bien dans votre `.env`
- Redémarrez votre serveur après avoir ajouté le secret

### ngrok ne fonctionne pas
- Vérifiez que ngrok est bien installé
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Vérifiez que l'URL ngrok est bien configurée dans Stripe Dashboard




