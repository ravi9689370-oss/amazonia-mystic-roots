# APP_NAME_HERE (Amazonia: The Mystic Roots)

100% offline, mobile-first 3D survival action game. Every asset — jungle, torii
gates, vedic pillars, enemies, sounds, music and the app icon — is generated
procedurally in code (Three.js + Web Audio API). No third-party or copyrighted
material.

## Identity (single source of truth)

The app name lives in exactly ONE place: [`src/config.js`](src/config.js)
(`APP_NAME_HERE`). It drives the browser page title and, at build time, the
Capacitor `appName` via [`scripts/sync-capacitor.js`](scripts/sync-capacitor.js)
→ `capacitor.config.json`. Change it there and rebuild.

## Features

- 3D open jungle with fog, campfire, torii gates, carved pillars
- Chakrastra (trident-katana) melee + chakra blast combat
- Shadow anaconda & jaguar-monster AI enemies
- Fog-valley relic quest (3 relics → bonus)
- Levels 1-10 progression with automatic unlocks
- Economy: coins + diamonds, 10,000 coins = 1 diamond exchange
- Offline squad chat log persisted in localStorage
- Procedural Vedic-Zen music & jungle ambience (Web Audio)

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

## Deployment

- **Web:** `.github/workflows/pages.yml` builds with Vite (`base: './'`) and
  deploys `dist/` to GitHub Pages on every push to `main`.
- **Android:** `.github/workflows/android.yml` builds a debug APK with
  Capacitor + Gradle and uploads it as the artifact
  `amazonia-mystic-roots-apk` on every push to `main`.

## License

Original work — MIT.
