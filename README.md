# 🛒 Boodschappenlijst Applicatie

Een geavanceerde React PWA (Progressive Web App) voor het maken en delen van boodschappenlijsten met realtime synchronisatie, gebruikersbeheer, analytics en een moderne Gruvbox interface.

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-9+-orange.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)
![Dutch](https://img.shields.io/badge/Language-Dutch%2FBelgium-green.svg)
![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-13K+-brightgreen.svg)
![Files](https://img.shields.io/badge/Source%20Files-46-blue.svg)

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
- ✅ **Voortgangsbalk** - Visuele weergave van voltooiingspercentage
- ✅ **Creator namen** - Zie wie elke lijst heeft gemaakt
- ✅ **Item attributie** - Zie wie elk item heeft toegevoegd
- ✅ **Lijst naam bewerken** - Klik op lijstnaam om te bewerken

### 📱 **Delen & Synchronisatie**
- ✅ **QR-codes voor delen** van lijsten tussen gebruikers
- ✅ **QR-code generatie** met veilige validatie
- ✅ **QR-code scanner** - Scan codes om lijsten te delen
- ✅ **Direct delen** - WhatsApp, Telegram, Email integratie
- ✅ **Native Share API** - Gebruik apparaat's eigen deel functionaliteit
- ✅ **Gebruikers koppelen** voor gedeelde toegang
- ✅ **Creator permissies** - alleen makers kunnen lijsten verwijderen
- ✅ **Gedeelde toegang** - anderen kunnen items toevoegen/bewerken
- ✅ **Realtime updates** via Firebase Firestore
- ✅ **Offline ondersteuning** met automatische sync
- ✅ **Visuele indicatoren** voor eigenaarschap (Eigenaar/Gedeeld badges)
- ✅ **Gebruikersbeheer modal** - Beheer wie toegang heeft tot je lijsten

### 🎨 **Interface & Thema's**
- ✅ **Unified Theme System** - Geavanceerd thema management
- ✅ **Gruvbox thema** - Authentieke Gruvbox kleuren voor licht en donker
- ✅ **Custom thema's** - Maak je eigen kleurenschema's
- ✅ **Thema preview** - Bekijk thema's voordat je ze toepast
- ✅ **Donker/licht thema** met naadloze overgangen
- ✅ **Warme, oogvriendelijke kleuren** geoptimaliseerd voor comfort
- ✅ **Responsive design** voor alle apparaten
- ✅ **Framer Motion animaties** voor vloeiende overgangen
- ✅ **Desktop geoptimaliseerd** - Enhanced layout voor grote schermen
- ✅ **SafeArea ondersteuning** - Optimaal voor mobiele apparaten

### 📊 **Analytics & Inzichten**
- ✅ **Analytics dashboard** - Uitgebreide statistieken over je lijstgebruik
- ✅ **Deel statistieken** - Zie hoeveel mensen toegang hebben tot je lijsten
- ✅ **Activiteit overzicht** - Voltooiingspercentages en trends
- ✅ **Grootste lijsten** - Ranking van je meest gebruikte lijsten
- ✅ **Recente activiteit** - Overzicht van recent gewijzigde lijsten
- ✅ **Voortgangsbalk** - Visuele weergave van voltooiing in analytics

### 🔧 **Instellingen & Beheer**
- ✅ **Settings pagina** - Centraal beheer van alle instellingen
- ✅ **Thema instellingen** - Toegang tot thema aanpassingen
- ✅ **Analytics toegang** - Directe link naar statistieken
- ✅ **Persistentie beheer** - Data backup en herstel opties
- ✅ **PWA update systeem** - Automatische app updates met gebruikerscontrole

### 💾 **Data Persistentie**
- ✅ **Persistentie pagina** - Overzicht van data opslag
- ✅ **Health monitoring** - Status van data synchronisatie
- ✅ **Backup functionaliteit** - Export en import van data
- ✅ **Firebase integratie** - Veilige cloud opslag
- ✅ **Lokale opslag** - Offline functionaliteit

### 📱 **PWA Functionaliteit**
- ✅ **Progressive Web App** - Installeerbaar op alle apparaten
- ✅ **App iconen** - Favicon en Apple Touch iconen
- ✅ **Manifest configuratie** - Volledige PWA ondersteuning
- ✅ **Service Worker** - Offline functionaliteit en caching
- ✅ **Update notificaties** - Automatische melding van nieuwe versies
- ✅ **Install prompts** - Gebruiksvriendelijke installatie
- ✅ **GitHub Pages optimalisatie** - Werkt perfect op GitHub Pages

### 🔄 **Gebruikerservaring**
- ✅ **Toast notificaties** met duidelijke feedback
- ✅ **Nederlandse interface** volledig gelokaliseerd
- ✅ **Toegankelijkheid** met ARIA labels en keyboard navigation
- ✅ **Browser waarschuwing** - Melding bij browserwissel voor naam instelling
- ✅ **Confirmation dialogs** - Veilige bevestiging voor belangrijke acties
- ✅ **Loading states** - Duidelijke feedback tijdens bewerkingen

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
- **QR-code scannen**: Klik op QR icoon → scan code of voer handmatig in
- **Thema wisselen**: Klik op zon/maan icoon voor Gruvbox licht/donker
- **Instellingen**: Klik op tandwiel voor analytics en instellingen

### 📝 **Lijstbeheer**
- **Lijst openen**: Klik "Lijst Openen" op een lijst
- **Lijst delen**: Klik "Delen" → QR-code, link en direct delen opties
- **Gebruikers beheren**: Klik "Gebruikers" (alleen voor creators)
- **Lijst verwijderen**: Klik "Verwijderen"
- **Creator info**: Zie "Gemaakt door [naam]" onder elke lijst
- **Voortgang**: Zie voltooiingspercentage met groene voortgangsbalk

### 🛍️ **Items beheren**
- **Item toevoegen**: Type naam → klik "Toevoegen"
- **Item voltooien**: Klik op checkbox naast item
- **Item bewerken**: Klik op potlood icoon
- **Item verwijderen**: Klik op prullenbak icoon
- **Populaire items**: Klik op voorgestelde items voor snelle toevoeging
- **Contributor info**: Zie "Toegevoegd door [naam]" onder elk item

### 📱 **QR-code delen**
1. **Delen**: Klik "Delen" knop op lijst
2. **QR-code**: Toon QR-code aan ander apparaat
3. **Direct delen**: Gebruik WhatsApp, Telegram of Email knoppen
4. **Link kopiëren**: Klik "Link kopiëren" voor delen via bericht
5. **Native Share**: Gebruik apparaat's eigen deel functionaliteit

### 📷 **QR-code scannen**
1. **Scanner openen**: Klik QR icoon in header
2. **Code scannen**: Gebruik camera om QR-code te scannen
3. **Handmatig invoeren**: Typ code in tekstveld als alternatief
4. **Automatische toegang**: Lijst wordt automatisch toegevoegd aan je account

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

### 📊 **Analytics Dashboard**
1. **Analytics openen**: Klik op "Analytics" in het menu
2. **Overzicht statistieken**: Zie totaal lijsten, eigenaarschap en deel info
3. **Deel statistieken**: Bekijk hoeveel mensen toegang hebben
4. **Activiteit overzicht**: Zie voltooiingspercentages en trends
5. **Grootste lijsten**: Ranking van meest gebruikte lijsten
6. **Recente activiteit**: Overzicht van recent gewijzigde lijsten

### 🎨 **Thema Aanpassingen**
1. **Thema pagina**: Klik op "Thema" in het menu
2. **Vooraf ingestelde thema's**: Kies uit Gruvbox Light/Dark
3. **Custom thema's**: Maak je eigen kleurenschema
4. **Live preview**: Zie wijzigingen direct in de interface
5. **Opslaan**: Thema wordt automatisch opgeslagen

### 📱 **PWA Installatie**
1. **Install prompt**: Klik "Installeren" wanneer de melding verschijnt
2. **Handmatige installatie**: Gebruik browser menu → "Installeren" of "Toevoegen aan startscherm"
3. **App updates**: Krijg automatisch meldingen van nieuwe versies
4. **Offline gebruik**: App werkt ook zonder internetverbinding

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
- **Unified Theme System** - Geavanceerd thema management
- **Gruvbox Theme** - Authentieke Gruvbox kleuren voor optimaal comfort

### **Backend & Database**
- **Firebase Firestore** - NoSQL realtime database
- **Firebase Authentication** - Anonymous authentication
- **Firebase Hosting** - Geoptimaliseerde web hosting

### **PWA & Performance**
- **Service Worker** - Offline functionaliteit en caching
- **Web App Manifest** - PWA configuratie
- **PWA Update Manager** - Automatische update detectie

### **QR & Funcionaliteit**
- **react-qr-code** - QR-code generatie
- **QR Scanner** - Camera-based QR code scanning
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
| **QR code scanning** | ✅ | ✅ | ✅ | ✅ |
| **PWA installatie** | ✅ | ✅ | ✅ | ✅ |
| **Gruvbox thema** | ✅ | ✅ | ✅ | ✅ |
| **Realtime sync** | ✅ | ✅ | ✅ | ✅ |
| **Service Worker** | ✅ | ✅ | ✅ | ✅ |

## 📱 Responsive Design

- **📱 Mobile**: Geoptimaliseerd voor telefoons (320px+)
- **📱 Tablet**: Aangepaste layout voor tablets (768px+)
- **💻 Desktop**: Volledige functionaliteit met sidebar (1024px+)
- **🖥️ Large screens**: Enhanced ervaring met analytics (1440px+)
- **SafeArea**: Ondersteuning voor notch en home indicator

## 📊 Code Statistieken

Het project bevat een aanzienlijke hoeveelheid code verdeeld over verschillende bestandstypen:

| **Categorie** | **Bestanden** | **Regels Code** | **Beschrijving** |
|---------------|---------------|-----------------|------------------|
| **JavaScript/JSX** | 45 bestanden | ~12,385 regels | React componenten, hooks, utilities en pagina's |
| **CSS** | 1 bestand | ~513 regels | Globale styling, thema's en responsive design |
| **PWA/Config** | 2 bestanden | ~179 regels | Service Worker en PWA manifest |
| **Totaal** | **48 bestanden** | **~13,077 regels** | **Complete applicatie** |

### **Code Verdeling per Categorie**
- **🧩 Components**: 14 React componenten voor UI functionaliteit
- **📄 Pages**: 6 pagina componenten voor verschillende app secties
- **🔧 Utils**: 15 utility bestanden voor diverse functionaliteiten
- **🎣 Hooks**: 3 custom React hooks voor herbruikbare logica
- **🌐 Context**: 3 context providers voor state management
- **🎨 Styling**: 1 CSS bestand met 500+ regels voor complete theming
- **📱 PWA**: Service Worker en manifest voor Progressive Web App

### **Kwaliteitskenmerken**
- **Modulair ontwerp**: Code verdeeld over logische modules
- **Herbruikbare componenten**: DRY principe toegepast
- **TypeScript-ready**: Moderne JavaScript ES6+ syntax
- **Responsive**: Mobile-first design approach
- **PWA-compliant**: Volledige Progressive Web App implementatie

## 🔧 Ontwikkeling

### Project Structuur
```
src/
├── App.jsx            # Hoofd applicatie component
├── main.jsx           # React applicatie entry point
├── index.css          # Globale CSS en thema definities
├── firebase.js        # Firebase configuratie en functies
├── components/        # React componenten
│   ├── AnalyticsDashboard.jsx # Analytics weergave component
│   ├── ColorPicker.jsx # Kleur selectie component
│   ├── ConfirmationDialog.jsx # Bevestigingsdialogen
│   ├── ConnectionError.jsx # Verbindingsfout weergave
│   ├── DeviceLinkModal.jsx # Apparaat koppeling modal
│   ├── PersistenceHealthMonitor.jsx # Data sync status
│   ├── PWAUpdateNotification.jsx # PWA update meldingen
│   ├── QRScannerModal.jsx # QR scanner functionaliteit
│   ├── QRShareModal.jsx # QR delen met direct share opties
│   ├── SettingsModal.jsx # Instellingen modal (legacy)
│   ├── Toast.jsx      # Notificatie systeem
│   ├── UserManagementModal.jsx # Gebruikersbeheer
│   ├── UserNameModal.jsx # Gebruikersnaam instelling
│   └── VoiceInput.jsx # Spraak input component
├── pages/             # Pagina componenten
│   ├── Analytics.jsx  # Analytics dashboard pagina
│   ├── Persistence.jsx # Data persistentie pagina
│   ├── Settings.jsx   # Instellingen pagina
│   ├── ShoppingListPage.jsx # Lijst detail pagina
│   ├── Theme.jsx      # Thema component (legacy)
│   └── ThemePage.jsx  # Thema aanpassingen pagina
├── context/           # React Context providers
│   ├── ThemeContext.jsx # Legacy thema context
│   ├── ToastContext.jsx # Notificatie context
│   └── UnifiedThemeContext.jsx # Unified thema systeem
├── hooks/             # Custom React hooks
│   ├── usePersistentState.js # Persistent state management
│   ├── useSpeechRecognition.js # Spraakherkenning hook
│   └── useUnifiedTheme.js # Unified thema hook
└── utils/             # Utility functies
    ├── colorManager.js # Kleur utilities en conversies
    ├── debugThemes.js # Thema debugging tools
    ├── deviceUID.js   # Apparaat identificatie
    ├── enhancedUserManager.js # Geavanceerd gebruikersbeheer
    ├── firebaseBackup.js # Firebase backup functionaliteit
    ├── groceryItems.js # Item suggesties database
    ├── persistentStorage.js # Lokale opslag management
    ├── pwaUpdateManager.js # PWA update management
    ├── qrSecurity.js  # QR validatie en beveiliging
    ├── secureStorage.js # Veilige lokale opslag
    ├── stateManager.js # State management utilities
    ├── testThemes.js  # Thema test utilities
    ├── themePalettes.js # Thema kleurpaletten
    ├── userManager.js # Basis gebruikersbeheer
    └── validation.js  # Input validatie functies

public/
├── index.html         # HTML template
├── manifest.json      # PWA manifest configuratie
├── sw.js             # Service Worker voor PWA
├── favicon.ico       # Browser favicon
├── icon.svg          # Scalable app icon
├── apple-touch-icon.png # iOS home screen icon (180x180)
├── apple-touch-icon-57x57.png # iOS legacy icon
└── apple-touch-icon-180x180.png # iOS retina icon
```

### Nieuwe Features Toevoegen

1. **Component maken**: Maak nieuwe component in `/components` of `/pages`
2. **Context gebruiken**: Gebruik bestaande contexts voor state
3. **Styling**: Gebruik Tailwind classes en Unified Theme System
4. **PWA**: Overweeg PWA functionaliteit voor nieuwe features
5. **Testen**: Test op verschillende apparaten en browsers
6. **Documentatie**: Update README.md met nieuwe functionaliteit

## 🚧 Bekende Beperkingen

- **Offline Mode**: Beperkte functionaliteit zonder internetverbinding (alleen cached data)
- **Browser Permissions**: QR scanning vereist camera toegang

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
- Gebruik **Unified Theme System** voor kleuren
- Voeg **JSDoc comments** toe voor complexe functies
- Test op **mobiele apparaten**
- Respecteer **PWA best practices**
- Test **offline functionaliteit**

## 📄 Licentie

MIT License - zie [LICENSE](LICENSE) voor details

## 🙏 Credits

- **Design Inspiratie**: Gruvbox color scheme
- **Icons**: Lucide React
- **Nederlandse lokalisatie**: Native speaker optimized
- **PWA**: Modern Progressive Web App standards

---

**Gemaakt met ❤️ voor de Belgische en Nederlandse gemeenschap**

🔗 **Live Demo**: [Boodschappenlijst App](https://jphermans.github.io/boodschappen-lijst/)
📧 **Contact**: Voor vragen of suggesties, maak een GitHub issue aan