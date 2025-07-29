# 🚀 GitHub Pages Deployment Setup

Deze gids helpt je bij het opzetten van automatische deployment naar GitHub Pages met Firebase configuratie via GitHub Secrets.

## 📋 Vereisten

- GitHub repository met de boodschappenlijst code
- Firebase project opgezet (zie [FIREBASE_SETUP.md](FIREBASE_SETUP.md))
- GitHub Pages ingeschakeld voor je repository

## 🔧 GitHub Secrets Configureren

### 1. Firebase Configuratie Ophalen

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Selecteer je project
3. Ga naar Project Settings (tandwiel icoon)
4. Scroll naar beneden naar "Your apps"
5. Klik op je web app
6. Kopieer de configuratie waarden

### 2. GitHub Secrets Toevoegen

1. Ga naar je GitHub repository
2. Klik op **Settings** (in de repository, niet je account)
3. Ga naar **Secrets and variables** > **Actions**
4. Klik **New repository secret** voor elke waarde:

| Secret Name | Waarde uit Firebase |
|-------------|-------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `measurementId` (optioneel) |

### 3. Voorbeeld Secret Configuratie

```
Secret: VITE_FIREBASE_API_KEY
Value: AIzaSyC_jouw_echte_api_key_hier

Secret: VITE_FIREBASE_AUTH_DOMAIN  
Value: jouw-project-id.firebaseapp.com

Secret: VITE_FIREBASE_PROJECT_ID
Value: jouw-project-id

Secret: VITE_FIREBASE_STORAGE_BUCKET
Value: jouw-project-id.appspot.com

Secret: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789012

Secret: VITE_FIREBASE_APP_ID
Value: 1:123456789012:web:abcdef123456

Secret: VITE_FIREBASE_MEASUREMENT_ID
Value: G-XXXXXXXXXX
```

## 🔄 GitHub Pages Inschakelen

### 1. Firebase Domain Autoriseren

**Belangrijk:** Voeg je GitHub Pages domain toe aan Firebase:

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Selecteer je project
3. Ga naar **Authentication** > **Settings**
4. Scroll naar **Authorized domains**
5. Klik **Add domain**
6. Voeg toe: `jouwusername.github.io` (vervang met je echte GitHub username)
7. Klik **Add**

### 2. Pages Configuratie

1. Ga naar **Settings** > **Pages**
2. Bij **Source** selecteer **GitHub Actions**
3. De workflow wordt automatisch gedetecteerd

### 2. Workflow Verificatie

De bestaande workflow (`.github/workflows/deploy.yml`) is al geconfigureerd met:

```yaml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
  VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
  VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
  VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
  VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
  VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
```

## 🚀 Deployment Proces

### Automatische Deployment

1. **Push naar main branch** triggert automatisch de deployment
2. **GitHub Actions** bouwt de applicatie met je Firebase secrets
3. **Deployment** naar GitHub Pages gebeurt automatisch
4. **Live URL** is beschikbaar op: `https://jouwusername.github.io/repository-naam/`

### Handmatige Deployment

1. Ga naar **Actions** tab in je repository
2. Selecteer de "Deploy to GitHub Pages" workflow
3. Klik **Run workflow** > **Run workflow**

## ✅ Verificatie

Na succesvolle deployment:

1. **Ga naar je GitHub Pages URL**
2. **Controleer of de app laadt** zonder "Verbindingsprobleem" error
3. **Test Firebase functionaliteit**:
   - Maak een nieuwe lijst aan
   - Voeg items toe
   - Test QR-code delen
4. **Controleer browser console** voor eventuele errors

## 🔍 Troubleshooting

### "Verbindingsprobleem" Error op GitHub Pages

**Mogelijke oorzaken:**
- ❌ GitHub Secrets niet correct ingesteld
- ❌ Firebase project niet correct geconfigureerd
- ❌ Anonymous Authentication niet ingeschakeld

**Oplossingen:**
1. Controleer alle GitHub Secrets zijn ingesteld
2. Verifieer Firebase configuratie in console
3. Controleer Firestore security rules
4. Bekijk GitHub Actions logs voor build errors

### "Permission Denied" Error

**Error:** `FirebaseError: [code=permission-denied]: Missing or insufficient permissions.`

**Oorzaak:** Firestore security rules zijn niet correct ingesteld of domain niet geautoriseerd.

**Oplossingen:**
1. **Update Firestore Security Rules** met de nieuwe rules (zie boven)
2. **Autoriseer GitHub Pages Domain:**
   - Firebase Console > Authentication > Settings > Authorized domains
   - Voeg `jouwusername.github.io` toe
3. **Controleer Anonymous Authentication** is ingeschakeld
4. **Wacht 5-10 minuten** na het updaten van rules voor propagatie

### "Domain Not Authorized" Warning

**Warning:** `The current domain is not authorized for OAuth operations`

**Oplossing:**
1. Ga naar Firebase Console > Authentication > Settings
2. Scroll naar "Authorized domains"
3. Klik "Add domain"
4. Voeg toe: `jouwusername.github.io`
5. Klik "Add"

### Cross-Device Sharing Problemen

**Probleem:** Gedeelde lijst is niet zichtbaar op ander apparaat

**Mogelijke oorzaken:**
- ❌ URL routing werkt niet correct
- ❌ Firestore security rules blokkeren toegang
- ❌ Anonymous authentication problemen

**Oplossingen:**
1. **Controleer URL format**: Zorg dat de gedeelde link het format `#/shared/listId` heeft
2. **Test URL routing**: Open de gedeelde link direct in browser - je zou een success melding moeten zien
3. **Controleer browser console** voor JavaScript errors
4. **Verifieer Firestore rules** zijn correct ingesteld (zie boven)
5. **Test met verschillende browsers** om browser-specifieke problemen uit te sluiten

**Verwacht gedrag:**
- ✅ Gedeelde link openen toont success melding: "Lijst [naam] is gedeeld met jou! 🎉"
- ✅ Lijst verschijnt automatisch in het overzicht
- ✅ Badge toont "Gedeeld" in plaats van "Eigenaar"
- ✅ Realtime updates werken tussen alle apparaten

### Build Fails in GitHub Actions

**Controleer:**
1. **Actions tab** voor error details
2. **Secrets** zijn correct gespeld (hoofdlettergevoelig)
3. **Firebase project** is actief en toegankelijk
4. **Node.js versie** compatibiliteit

### Firebase Permissions Error

**Controleer:**
1. **Firestore security rules** zijn correct ingesteld
2. **Anonymous Authentication** is ingeschakeld
3. **API keys** hebben juiste permissions

## 🔒 Beveiliging

### GitHub Secrets Beveiliging

- ✅ **Secrets zijn versleuteld** en alleen zichtbaar tijdens builds
- ✅ **Geen secrets in code** - alles via environment variables
- ✅ **Branch protection** - alleen main branch kan deployen
- ✅ **Firebase security rules** beschermen je database

### Firebase Beveiliging

- ✅ **Anonymous Authentication** - geen persoonlijke data
- ✅ **Firestore rules** - gebruikers kunnen alleen eigen lijsten beheren
- ✅ **API key restrictions** - configureer in Firebase Console

## 📊 Monitoring

### GitHub Actions

- **Actions tab** toont deployment geschiedenis
- **Build logs** voor debugging
- **Deployment status** en tijden

### Firebase Console

- **Authentication** - aantal actieve gebruikers
- **Firestore** - database usage en queries
- **Hosting** - als je Firebase Hosting gebruikt

## 🔄 Updates Deployen

1. **Maak wijzigingen** in je lokale code
2. **Commit en push** naar main branch:
   ```bash
   git add .
   git commit -m "Update: nieuwe functionaliteit"
   git push origin main
   ```
3. **Automatische deployment** start binnen enkele minuten
4. **Controleer GitHub Actions** voor build status
5. **Test de live site** na succesvolle deployment

---

**🎉 Je app is nu live op GitHub Pages met automatische Firebase configuratie!**

Voor vragen of problemen, check de GitHub Actions logs of maak een issue aan in de repository.