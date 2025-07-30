# 🛒 Boodschappenlijst Applicatie

Een geavanceerde React web applicatie voor het maken en delen van boodschappenlijsten met realtime synchronisatie, gebruikersbeheer en een moderne Gruvbox interface.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-9+-orange.svg)
![Dutch](https://img.shields.io/badge/Language-Dutch%2FBelgium-green.svg)

## ✨ Hoofdfuncties

### 👤 **Gebruikersbeheer**
- ✅ **Gebruikersnamen systeem** - Verplichte naam instelling bij eerste gebruik
- ✅ **Creator tracking** - Wie heeft welke lijst gemaakt
- ✅ **Contributor tracking** - Wie heeft welk item toegevoegd
- ✅ **Veilige opslag** - Gebruikersnamen worden lokaal en veilig opgeslagen
- ✅ **Browser waarschuwing** - Melding bij wisselen van browser (Firefox → Chrome → Safari)
- ✅ **Validatie** - Naam moet tussen 2-50 karakters zijn

### 📝 **Lijstbeheer**
- ✅ **Boodschappenlijsten maken en beheren** met realtime synchronisatie
- ✅ **Items toevoegen, bewerken en markeren als voltooid**
- ✅ **Slimme item suggesties** tijdens het typen
- ✅ **Populaire items** voor snelle toevoeging
- ✅ **Filter functies**: Alles, Actief, Voltooid
- ✅ **Bulk acties**: Alle voltooide items verwijderen
- ✅ **Creator namen** - Zie wie elke lijst heeft gemaakt
- ✅ **Item attributie** - Zie wie elk item heeft toegevoegd

### 📱 **Delen & Synchronisatie**
- ✅ **QR-codes voor delen** van lijsten tussen gebruikers
- ✅ **QR-code generatie** met veilige validatie
- ✅ **Handmatige QR-code invoer** (camera scanning is placeholder)
- ✅ **Gebruikers koppelen** voor gedeelde toegang
- ✅ **Creator permissies** - alleen makers kunnen lijsten verwijderen
- ✅ **Gedeelde toegang** - anderen kunnen items toevoegen/bewerken
- ✅ **Realtime updates** via Firebase Firestore
- ✅ **Offline ondersteuning** met automatische sync
- ✅ **Visuele indicatoren** voor eigenaarschap (Eigenaar/Gedeeld badges)
- ✅ **Gebruikersbeheer modal** - Beheer wie toegang heeft tot je lijsten

### 🎨 **Interface & Thema's**
- ✅ **Gruvbox thema** - Authentieke Gruvbox kleuren voor licht en donker
- ✅ **Donker/licht thema** met naadloze overgangen
- ✅ **Warme, oogvriendelijke kleuren** geoptimaliseerd voor comfort
- ✅ **Responsive design** voor alle apparaten
- ✅ **Framer Motion animaties** voor vloeiende overgangen
- ✅ **Desktop geoptimaliseerd** - Enhanced layout voor grote schermen

### 🔄 **Gebruikerservaring**
- ✅ **Toast notificaties** met duidelijke feedback
- ✅ **Nederlandse interface** volledig gelokaliseerd
- ✅ **Toegankelijkheid** met ARIA labels en keyboard navigation
- ✅ **Analytics dashboard** - Inzicht in je lijstgebruik
- ✅ **Settings modal** - Centraal beheer van instellingen
- ✅ **Browser waarschuwing** - Melding bij browserwissel voor naam instelling

## 🚀 Installatie

### Lokale ontwikkeling

1. **Clone de repository**
```bash
git clone https://github.com/jphermans/boodschappen-lijst.git
cd boodschappenlijst
```

2. **Installeer dependencies**
```bash
npm install
```

3. **Firebase configuratie**

> 📖 **Gedetailleerde setup instructies:** Zie [FIREBASE_SETUP.md](FIREBASE_SETUP.md) voor een complete stap-voor-stap gids.

**Snelle setup:**
- Maak een Firebase project aan op [console.firebase.google.com](https://console.firebase.google.com)
- Voeg een web app toe en kopieer de configuratie
- Kopieer `.env` naar `.env.local` en vul je echte Firebase credentials in:

```bash
cp .env .env.local
```

Bewerk `.env.local` met je echte Firebase configuratie:
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=jouw-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jouw-project-id
VITE_FIREBASE_STORAGE_BUCKET=jouw-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

4. **Firestore setup**
- Maak een Firestore database aan in test mode
- Schakel Authentication in en kies "Anonymous" als provider
- Importeer de security rules (zie sectie hieronder)

5. **Start de development server**
```bash
npm run dev
```

🌐 **App is beschikbaar op**: `http://localhost:5174`

### GitHub Pages Deployment

Voor automatische deployment naar GitHub Pages met Firebase secrets:

> 📖 **GitHub Pages Setup**: Zie [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) voor complete deployment instructies.

**Snelle setup:**
1. Configureer GitHub Secrets met je Firebase credentials
2. Push naar main branch voor automatische deployment
3. App is live op: `https://jouwusername.github.io/repository-naam/`

## 📖 Gebruikshandleiding

### 🏠 **Eerste gebruik**
- **Naam instellen**: Bij eerste bezoek wordt je gevraagd je naam in te stellen
- **Validatie**: Naam moet tussen 2-50 karakters zijn
- **Veilige opslag**: Je naam wordt lokaal opgeslagen voor toekomstig gebruik

### 🏠 **Hoofdscherm**
- **Nieuwe lijst maken**: Type naam → klik "Lijst Aanmaken"
- **QR-code scannen**: Klik op QR icoon → voer code handmatig in
- **Thema wisselen**: Klik op zon/maan icoon voor Gruvbox licht/donker
- **Instellingen**: Klik op tandwiel voor analytics en instellingen

### 📝 **Lijstbeheer**
- **Lijst openen**: Klik "Lijst Openen" op een lijst
- **Lijst delen**: Klik "Delen" → QR-code en link verschijnen
- **Gebruikers beheren**: Klik "Gebruikers" (alleen voor creators)
- **Lijst verwijderen**: Klik "Verwijderen"
- **Creator info**: Zie "Gemaakt door [naam]" onder elke lijst

### 🛍️ **Items beheren**
- **Item toevoegen**: Type naam → klik "Toevoegen"
- **Item voltooien**: Klik op checkbox naast item
- **Item verwijderen**: Klik op prullenbak icoon
- **Filteren**: Gebruik "Alles", "Actief", "Voltooid" knoppen
- **Populaire items**: Klik op voorgestelde items voor snelle toevoeging
- **Contributor info**: Zie "Toegevoegd door [naam]" onder elk item

### 📱 **QR-code delen**
1. **Delen**: Klik "Delen" knop op lijst
2. **QR-code**: Toon QR-code aan ander apparaat
3. **Link kopiëren**: Klik "Link kopiëren" voor delen via bericht
4. **Cross-device toegang**: Anderen krijgen automatisch toegang wanneer ze de link openen

### 📷 **QR-code scannen**
1. **Scanner openen**: Klik QR icoon in header
2. **Handmatig invoeren**: Typ code in tekstveld (camera scanning is nog niet geïmplementeerd)
3. **Automatische toegang**: Lijst wordt automatisch toegevoegd aan je account

### 🔗 **Link delen tussen apparaten**
1. **Deel link**: Kopieer de deellink en stuur naar ander apparaat
2. **Open link**: Open de link op het andere apparaat
3. **Automatische toegang**: De lijst wordt automatisch gedeeld met het nieuwe apparaat
4. **Realtime sync**: Wijzigingen zijn direct zichtbaar op alle apparaten

### 👥 **Gebruikersbeheer**
1. **Toegang beheren**: Klik "Gebruikers" op een lijst die je hebt gemaakt
2. **Gebruikers zien**: Bekijk wie toegang heeft tot je lijst
3. **Toegang intrekken**: Verwijder gebruikers uit gedeelde lijsten
4. **Creator rechten**: Alleen de maker van een lijst kan gebruikers beheren

## ⚙️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Maak productie build
npm run preview      # Preview productie build
npm run lint         # Check code kwaliteit
```

## 🔒 Firebase Security Rules

Plaats deze rules in je Firestore console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Shopping lists with creator permissions and sharing support
    match /shoppingLists/{listId} {
      // Users can read lists they created or are shared with
      // Support both deviceUID (legacy) and creatorId (new)
      allow read: if request.auth != null
        && (resource.data.deviceUID == request.auth.uid
            || resource.data.creatorId == request.auth.uid
            || request.auth.uid in resource.data.get('sharedWith', []));
      
      // Only authenticated users can create lists
      allow create: if request.auth != null
        && (request.resource.data.deviceUID == request.auth.uid
            || request.resource.data.creatorId == request.auth.uid)
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 100
        && request.resource.data.items is list
        && request.resource.data.creatorName is string;
      
      // Users can update lists they created or are shared with
      allow update: if request.auth != null
        && (resource.data.deviceUID == request.auth.uid
            || resource.data.creatorId == request.auth.uid
            || request.auth.uid in resource.data.get('sharedWith', []))
        && (request.resource.data.deviceUID == resource.data.deviceUID
            || request.resource.data.creatorId == resource.data.creatorId) // Prevent changing creator
        && request.resource.data.creatorName == resource.data.creatorName; // Prevent changing creator name
      
      // Only the creator can delete lists
      allow delete: if request.auth != null
        && (resource.data.deviceUID == request.auth.uid
            || resource.data.creatorId == request.auth.uid);
    }
  }
}
```

## 🛠️ Technologieën

### **Frontend Framework**
- **React 18** - Modern React met hooks
- **Vite** - Snelle development en build tool
- **JavaScript ES6+** - Moderne JavaScript syntax

### **Styling & Animaties**
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Productie-ready animatie library
- **Gruvbox Theme** - Authentieke Gruvbox kleuren voor optimaal comfort

### **Backend & Database**
- **Firebase Firestore** - NoSQL realtime database
- **Firebase Authentication** - Anonymous authentication
- **Firebase Hosting** - Geoptimaliseerde web hosting

### **QR & Funcionaliteit**
- **react-qr-code** - QR-code generatie
- **Lucide React** - Moderne icon library
- **React Hooks** - State management en side effects

### **Development Tools**
- **ESLint** - Code kwaliteit en consistentie
- **PostCSS** - CSS processing
- **GitHub Actions** - Automatische deployment

## 🌍 Browser Ondersteuning

| Functie | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| **Basis functionaliteit** | ✅ | ✅ | ✅ | ✅ |
| **QR code generatie** | ✅ | ✅ | ✅ | ✅ |
| **Gruvbox thema** | ✅ | ✅ | ✅ | ✅ |
| **Realtime sync** | ✅ | ✅ | ✅ | ✅ |

⚠️ = Beperkte ondersteuning

## 📱 Responsive Design

- **📱 Mobile**: Geoptimaliseerd voor telefoons (320px+)
- **📱 Tablet**: Aangepaste layout voor tablets (768px+)
- **💻 Desktop**: Volledige functionaliteit met sidebar (1024px+)
- **🖥️ Large screens**: Enhanced ervaring met analytics (1440px+)

## 🔧 Ontwikkeling

### Project Structuur
```
src/
├── components/          # React componenten
│   ├── QRScannerModal.jsx # QR scanner functionaliteit
│   ├── UserNameModal.jsx # Gebruikersnaam instelling
│   ├── UserManagementModal.jsx # Gebruikersbeheer
│   ├── AnalyticsDashboard.jsx # Analytics weergave
│   ├── SettingsModal.jsx # Instellingen modal
│   └── ...
├── context/            # React Context providers
│   ├── ThemeContext.jsx # Gruvbox thema management
│   └── ToastContext.jsx # Notificatie systeem
├── utils/              # Utility functies
│   ├── userManager.js  # Gebruikersbeheer
│   ├── qrSecurity.js   # QR validatie
│   ├── deviceUID.js    # Apparaat identificatie
│   └── groceryItems.js # Item suggesties
└── firebase.js         # Firebase configuratie
```

### Nieuwe Features Toevoegen

1. **Component maken**: Maak nieuwe component in `/components`
2. **Context gebruiken**: Gebruik bestaande contexts voor state
3. **Styling**: Gebruik Tailwind classes en Gruvbox kleuren
4. **Testen**: Test op verschillende apparaten en browsers
5. **Documentatie**: Update README.md met nieuwe functionaliteit

## 🚧 Bekende Beperkingen

- **Camera QR Scanning**: Momenteel alleen handmatige invoer, camera scanning is nog niet geïmplementeerd
- **Offline Mode**: Beperkte functionaliteit zonder internetverbinding
- **Spraakherkenning**: Spraakfunctionaliteit is niet meer beschikbaar in de huidige versie

## 🤝 Bijdragen

1. **Fork** de repository
2. **Maak een feature branch**: `git checkout -b feature/nieuwe-functie`
3. **Commit** je wijzigingen: `git commit -m 'Voeg nieuwe functie toe'`
4. **Push** naar de branch: `git push origin feature/nieuwe-functie`
5. **Maak een Pull Request**

### Code Standaarden
- Gebruik **Nederlandse** variabele namen waar mogelijk
- Volg **React hooks** best practices
- Gebruik **Tailwind CSS** voor styling
- Voeg **JSDoc comments** toe voor complexe functies
- Test op **mobiele apparaten**
- Respecteer **Gruvbox kleuren** voor consistentie

## 📄 Licentie

MIT License - zie [LICENSE](LICENSE) voor details

## 🙏 Credits

- **Design Inspiratie**: Gruvbox color scheme
- **Icons**: Lucide React
- **Nederlandse lokalisatie**: Native speaker optimized

---

**Gemaakt met ❤️ voor de Belgische en Nederlandse gemeenschap**

🔗 **Live Demo**: [Boodschappenlijst App](https://jphermans.github.io/boodschappen-lijst/)
📧 **Contact**: Voor vragen of suggesties, maak een GitHub issue aan