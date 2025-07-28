Ontwikkel een moderne boodschappenlijst-webapp in React met Vite.
De app gebruikt Firebase Firestore (geen Authentication) voor alle data-opslag.

Gebruikers:
	•	Bij eerste gebruik genereert de app een device UID (via crypto.randomUUID())
	•	Deze UID wordt opgeslagen in Firestore onder users/{uid} met alle relevante info:
	•	Aangemaakte lijsten
	•	Voorkeuren: thema, kleurinstellingen, taal, enz.

⸻

🛠 Functionaliteit

📋 Lijsten:
	•	Elke gebruiker kan lijsten aanmaken
	•	Lijsten kunnen gedeeld worden via een QR-code of code (listId)
	•	Gebruikers kunnen boodschappen toevoegen, afvinken, verwijderen
	•	Als alle boodschappen zijn afgevinkt → vraag of de lijst mag verwijderd worden

⚙️ Instellingen:
	•	Donker/licht thema
	•	Selectie van primaire knop-/accentkleur
	•	Alles wordt automatisch opgeslagen in Firestore

🎨 UI:
	•	React + Vite
	•	Tailwind CSS voor styling
	•	Framer Motion voor animaties
	•	react-qr-code of qrcode.react voor delen van lijsten
	•	Firebase Firestore SDK v10+

shopping-list-app/
├── .github/workflows/deploy.yml
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── utils/
│   │   └── deviceUID.js
├── .gitignore
├── vite.config.js
├── tailwind.config.js
├── README.md


