# 🛒 Boodschappenlijst Applicatie

Een geavanceerde React web applicatie voor het maken en delen van boodschappenlijsten met realtime synchronisatie, spraakherkenning en een moderne Liquid Glass interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-9+-orange.svg)
![Dutch](https://img.shields.io/badge/Language-Dutch%2FBelgium-green.svg)

## ✨ Hoofdfuncties

### 📝 **Lijstbeheer**
- ✅ **Boodschappenlijsten maken en beheren** met realtime synchronisatie
- ✅ **Items toevoegen, bewerken en markeren als voltooid**
- ✅ **Slimme item suggesties** tijdens het typen
- ✅ **Populaire items** voor snelle toevoeging
- ✅ **Filter functies**: Alles, Actief, Voltooid
- ✅ **Bulk acties**: Alle voltooide items verwijderen

### 🎤 **Spraakherkenning**
- ✅ **Nederlandse spraakherkenning** (Nederland & België)
- ✅ **Spraakcommando's**: "Voeg toe melk", "Ik heb nodig brood"
- ✅ **Microfoon toegang** met duidelijke instructies
- ✅ **Automatische tekstverwerking** met slimme filtering

### 📱 **Delen & Synchronisatie**
- ✅ **QR-codes voor delen** van lijsten tussen gebruikers
- ✅ **QR-code scannen** via camera of bestand upload
- ✅ **Gebruikers koppelen** voor gedeelde toegang
- ✅ **Creator permissies** - alleen makers kunnen lijsten verwijderen
- ✅ **Gedeelde toegang** - anderen kunnen items toevoegen/bewerken
- ✅ **Realtime updates** via Firebase Firestore
- ✅ **Offline ondersteuning** met automatische sync
- ✅ **Visuele indicatoren** voor eigenaarschap (Eigenaar/Gedeeld badges)

### 🎨 **Interface & Thema's**
- ✅ **Liquid Glass design** met geavanceerde visuele effecten
- ✅ **Donker/licht thema** automatisch detectie
- ✅ **Aanpasbare kleuren**: Primair, Secundair, Accent
- ✅ **Responsive design** voor alle apparaten
- ✅ **Framer Motion animaties** voor vloeiende overgangen

### 🔄 **Gebruikerservaring**
- ✅ **Undo functionaliteit** voor alle acties
- ✅ **Toast notificaties** met duidelijke feedback
- ✅ **Nederlandse interface** volledig gelokaliseerd
- ✅ **Toegankelijkheid** met ARIA labels en keyboard navigation
- ✅ **Device-based identificatie** (geen login vereist)

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

### 🏠 **Hoofdscherm**
- **Nieuwe lijst maken**: Type naam → klik "Aanmaken" of gebruik spraakherkenning 🎤
- **QR-code scannen**: Klik op QR icoon → scan gedeelde lijst
- **Thema wisselen**: Klik op zon/maan icoon
- **Instellingen**: Klik op tandwiel voor kleuren en apparaat koppeling

### 📝 **Lijstbeheer**
- **Lijst openen**: Klik "Openen" op een lijst
- **Lijst delen**: Klik "Delen" → QR-code verschijnt
- **Lijst verwijderen**: Klik "Verwijderen" → optie om ongedaan te maken

### 🛍️ **Items beheren**
- **Item toevoegen**: Type naam of gebruik spraak 🎤 → klik "Toevoegen"
- **Spraakcommando's**:
  - *"Voeg toe melk"* → voegt "melk" toe
  - *"Ik heb nodig brood"* → voegt "brood" toe
  - *"Koop appels"* → voegt "appels" toe
- **Item voltooien**: Klik op checkbox naast item
- **Item verwijderen**: Klik op prullenbak icoon
- **Filteren**: Gebruik "Alles", "Actief", "Voltooid" knoppen
- **Populaire items**: Klik op voorgestelde items voor snelle toevoeging

### 🎤 **Spraakherkenning gebruiken**
1. **Toegang verlenen**: Klik op oranje "Microfoon toegang" knop
2. **Toestemming geven**: Klik "Toestaan" in browser dialog
3. **Spraak gebruiken**: Klik paarse microfoon knop → spreek duidelijk
4. **Stop opname**: Klik rode knop of wacht op automatische stop

### 📱 **QR-code delen**
1. **Delen**: Klik "Delen" knop op lijst
2. **QR-code**: Toon QR-code aan ander apparaat
3. **Link kopiëren**: Klik "Link kopiëren" voor delen via bericht

### 📷 **QR-code scannen**
1. **Scanner openen**: Klik QR icoon in header
2. **Camera gebruiken**: Richt camera op QR-code
3. **Handmatig invoeren**: Typ code in tekstveld
4. **Bestand uploaden**: Upload QR-code afbeelding

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
        && request.resource.data.creatorId == resource.data.creatorId; // Prevent changing creator
      
      // Only the creator can delete lists
      allow delete: if request.auth != null
        && resource.data.creatorId == request.auth.uid;
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
- **Liquid Glass Design** - Custom CSS effecten voor moderne UI

### **Backend & Database**
- **Firebase Firestore** - NoSQL realtime database
- **Firebase Hosting** - Geoptimaliseerde web hosting

### **Spraaktechnologie**
- **Web Speech API** - Native browser spraakherkenning
- **Nederlandse taalmodellen** - Geoptimaliseerd voor NL/BE

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
| **Spraakherkenning** | ✅ | ✅ | ⚠️ | ✅ |
| **Camera QR scan** | ✅ | ✅ | ✅ | ✅ |
| **Liquid Glass effecten** | ✅ | ✅ | ✅ | ✅ |
| **Push notificaties** | ✅ | ✅ | ⚠️ | ✅ |

⚠️ = Beperkte ondersteuning

## 📱 Responsive Design

- **📱 Mobile**: Geoptimaliseerd voor telefoons (320px+)
- **📱 Tablet**: Aangepaste layout voor tablets (768px+)
- **💻 Desktop**: Volledige functionaliteit (1024px+)
- **🖥️ Large screens**: Enhanced ervaring (1440px+)

## 🔧 Ontwikkeling

### Project Structuur
```
src/
├── components/          # React componenten
│   ├── VoiceInput.jsx  # Spraakherkenning component
│   ├── QRScannerModal.jsx # QR scanner functionaliteit
│   └── ...
├── context/            # React Context providers
│   ├── ThemeContext.jsx # Thema management
│   ├── ToastContext.jsx # Notificatie systeem
│   └── UndoContext.jsx  # Undo functionaliteit
├── hooks/              # Custom React hooks
│   └── useSpeechRecognition.js # Spraak hook
├── utils/              # Utility functies
│   ├── deviceUID.js    # Apparaat identificatie
│   └── groceryItems.js # Item suggesties
└── firebase.js         # Firebase configuratie
```

### Nieuwe Features Toevoegen

1. **Component maken**: Maak nieuwe component in `/components`
2. **Context gebruiken**: Gebruik bestaande contexts voor state
3. **Styling**: Gebruik Tailwind classes en liquid glass patterns
4. **Testen**: Test op verschillende apparaten en browsers
5. **Documentatie**: Update README.md met nieuwe functionaliteit

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

## 📄 Licentie

MIT License - zie [LICENSE](LICENSE) voor details

## 🙏 Credits

- **Spraakherkenning**: Web Speech API
- **Design Inspiratie**: Apple iOS 26 Liquid Glass
- **Icons**: Lucide React
- **Nederlandse lokalisatie**: Native speaker optimized

---

**Gemaakt met ❤️ voor de Nederlandse en Belgische gemeenschap**

🔗 **Live Demo**: [Boodschappenlijst App](https://jphermans.github.io/boodschappen-lijst/)
📧 **Contact**: Voor vragen of suggesties, maak een GitHub issue aan