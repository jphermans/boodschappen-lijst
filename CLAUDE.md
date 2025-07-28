# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
React shopping list web application with Firebase Firestore backend, using device-based UID instead of authentication.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore v10+
- **Animations**: Framer Motion
- **QR Codes**: react-qr-code or qrcode.react
- **Build Tool**: Vite

## Key Architecture
- **Device Identification**: Uses crypto.randomUUID() for unique device UID storage
- **Real-time Sync**: All data saved to Firestore with real-time updates
- **State Management**: React Context for global state
- **Routing**: Component-based routing
- **Theme System**: Dark/light mode with user preferences

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Main application pages
├── context/        # React Context providers
├── utils/          # Utility functions (deviceUID.js)
├── firebase.js     # Firebase configuration
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## Firebase Setup
- Firestore database for shopping lists and items
- No authentication - uses device UID for user identification
- Real-time listeners for data synchronization
- Auto-cleanup prompts for completed lists

## Key Features to Implement
- Shopping list creation and management
- QR code sharing between devices
- Item add/remove with real-time updates
- Theme preferences (dark/light/custom colors)
- Language settings
- Auto-cleanup of old completed lists