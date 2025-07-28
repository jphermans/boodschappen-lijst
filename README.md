# Boodschappenlijst App

Een React web applicatie voor het maken en delen van boodschappenlijsten met realtime synchronisatie via Firebase Firestore.

## Functies

- ✅ **Boodschappenlijsten maken en beheren**
- ✅ **Items toevoegen, verwijderen en markeren als voltooid**
- ✅ **QR-codes voor delen van lijsten**
- ✅ **Donker/licht thema**
- ✅ **Aanpasbare kleuren**
- ✅ **Nederlandse interface**
- ✅ **Device-based identificatie (geen login nodig)**

## Installatie

### Lokale ontwikkeling

1. **Clone de repository**
```bash
git clone [repository-url]
cd boodschappenlijst
```

2. **Installeer dependencies**
```bash
npm install
```

3. **Firebase configuratie**
- Maak een Firebase project aan op [console.firebase.google.com](https://console.firebase.google.com)
- Voeg een web app toe en kopieer de configuratie
- Kopieer `.env.example` naar `.env` en vul je eigen Firebase credentials in:
```bash
cp .env.example .env
```
- Vul de volgende variabelen in je `.env` bestand:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

4. **Firestore setup**
- Maak een Firestore database aan in test mode
- Deploy de security rules uit `src/firebase.js` (optioneel)

5. **Start de development server**
```bash
npm run dev
```

### GitHub Pages deployment

1. **Repository instellen**
- Push de code naar een publieke GitHub repository
- Ga naar Settings > Pages in je repository
- Selecteer "GitHub Actions" als source

2. **Secrets toevoegen**
- Ga naar Settings > Secrets and variables > Actions
- Voeg de volgende repository secrets toe:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

3. **Automatisch deployen**
- Push naar de `main` branch om automatisch te deployen
- Je app is beschikbaar op: `https://[username].github.io/[repository-name]`

## Gebruik

1. **Lijst maken**: Voeg een naam in en klik op "+"
2. **Items toevoegen**: Open een lijst en typ items in het invoerveld
3. **Delen**: Klik op het deel icoon om een QR-code te genereren
4. **Thema aanpassen**: Klik op het tandwiel icoon voor instellingen

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Maakt productie build
- `npm run preview` - Preview productie build
- `npm run lint` - Check code kwaliteit

## Firebase Security Rules

Plaats deze in je Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shoppingLists/{listId} {
      allow read, write: if request.auth == null 
        && resource.data.deviceUID == request.auth.uid;
      allow create: if request.auth == null
        && request.resource.data.deviceUID == request.auth.uid;
    }
    
    match /shoppingLists/{listId}/items/{itemId} {
      allow read, write: if request.auth == null
        && get(/databases/$(database)/documents/shoppingLists/$(listId)).data.deviceUID == request.auth.uid;
    }
  }
}
```

## Technologieën

- **Frontend**: React 18 + Vite
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Animaties**: Framer Motion
- **QR-codes**: react-qr-code
- **Icons**: Lucide React

## Bijdragen

1. Fork de repository
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Maak een Pull Request

## Licentie

MIT License - zie [LICENSE](LICENSE) voor details