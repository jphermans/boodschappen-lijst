# 🔥 Firebase Setup Gids

Deze gids helpt je bij het opzetten van Firebase voor de Boodschappenlijst applicatie.

## 📋 Vereisten

- Google account
- Node.js geïnstalleerd
- Project gedownload/gecloned

## 🚀 Stap-voor-stap Setup

### 1. Firebase Project Aanmaken

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Klik op "Create a project" of "Add project"
3. Voer een project naam in (bijv. "mijn-boodschappenlijst")
4. Schakel Google Analytics uit (niet nodig voor deze app)
5. Klik "Create project"

### 2. Web App Toevoegen

1. In je Firebase project, klik op het web icoon (`</>`)
2. Voer een app naam in (bijv. "Boodschappenlijst Web")
3. **Schakel NIET "Firebase Hosting" in** (tenzij je dat wilt gebruiken)
4. Klik "Register app"
5. **Kopieer de configuratie code** - je hebt deze straks nodig!

### 3. Firestore Database Opzetten

1. Ga naar "Firestore Database" in het linker menu
2. Klik "Create database"
3. Kies "Start in test mode" (we voegen later security rules toe)
4. Kies een locatie (bijv. "europe-west3" voor Nederland/België)
5. Klik "Done"

### 4. Authentication Instellen

1. Ga naar "Authentication" in het linker menu
2. Klik op de "Get started" knop
3. Ga naar het "Sign-in method" tabblad
4. Klik op "Anonymous"
5. Schakel "Enable" in
6. Klik "Save"

### 5. Lokale Configuratie

1. **Kopieer het voorbeeld bestand:**
   ```bash
   cp .env .env.local
   ```

2. **Bewerk `.env.local`** met je Firebase configuratie:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC_jouw_echte_api_key_hier
   VITE_FIREBASE_AUTH_DOMAIN=jouw-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=jouw-project-id
   VITE_FIREBASE_STORAGE_BUCKET=jouw-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

   > **Let op:** Vervang alle waarden met je echte Firebase configuratie!

### 6. Security Rules Instellen

1. Ga terug naar "Firestore Database"
2. Klik op het "Rules" tabblad
3. Vervang de inhoud met:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Shopping lists with creator permissions and sharing support
    match /shoppingLists/{listId} {
      // Users can read lists they created or are shared with
      allow read: if request.auth != null
        && (resource.data.creatorId == request.auth.uid
            || request.auth.uid in resource.data.sharedWith);
      
      // Only authenticated users can create lists
      allow create: if request.auth != null
        && request.resource.data.creatorId == request.auth.uid
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 100
        && request.resource.data.items is list
        && request.resource.data.sharedWith is list;
      
      // Users can update lists they created or are shared with
      allow update: if request.auth != null
        && (resource.data.creatorId == request.auth.uid
            || request.auth.uid in resource.data.sharedWith)
        && request.resource.data.creatorId == resource.data.creatorId;
      
      // Only the creator can delete lists
      allow delete: if request.auth != null
        && resource.data.creatorId == request.auth.uid;
    }
  }
}
```

4. Klik "Publish"

### 7. App Testen

1. **Start de development server:**
   ```bash
   npm run dev
   ```

2. **Open de app** in je browser: `http://localhost:5174`

3. **Test de functionaliteit:**
   - Maak een nieuwe lijst aan
   - Voeg items toe
   - Test het delen via QR-code

## ✅ Verificatie

Als alles goed is ingesteld, zou je:
- ✅ Geen "Verbindingsprobleem" error moeten zien
- ✅ Lijsten kunnen aanmaken en bewerken
- ✅ QR-codes kunnen genereren voor delen
- ✅ Realtime updates zien tussen verschillende browser tabs

## 🚨 Veelvoorkomende Problemen

### "Firebase configuratie niet ingesteld" Error
- **Oorzaak:** `.env.local` bestand ontbreekt of bevat placeholder waarden
- **Oplossing:** Controleer of `.env.local` bestaat en echte Firebase waarden bevat

### "auth/api-key-not-valid" Error
- **Oorzaak:** Onjuiste API key in configuratie
- **Oplossing:** Kopieer de API key opnieuw uit Firebase Console

### "Missing or insufficient permissions" Error
- **Oorzaak:** Firestore security rules niet correct ingesteld
- **Oplossing:** Controleer of de security rules correct zijn gekopieerd

### Anonymous Authentication Werkt Niet
- **Oorzaak:** Anonymous provider niet ingeschakeld
- **Oplossing:** Ga naar Authentication > Sign-in method > Anonymous > Enable

## 🔒 Beveiliging

- **Test Mode:** De database start in test mode (iedereen kan lezen/schrijven)
- **Security Rules:** Na het instellen van de rules kunnen alleen geauthenticeerde gebruikers hun eigen lijsten beheren
- **Anonymous Auth:** Gebruikers krijgen automatisch een unieke ID zonder registratie

## 📞 Hulp Nodig?

Als je problemen ondervindt:
1. Controleer de browser console voor error berichten
2. Verifieer dat alle Firebase services zijn ingeschakeld
3. Controleer of `.env.local` de juiste waarden bevat
4. Maak een GitHub issue aan met je error bericht

---

**Succes met je Firebase setup! 🎉**