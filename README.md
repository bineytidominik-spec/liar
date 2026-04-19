# Hochstapler

Ein Partyspiel für 3–15 Spieler. Einer kennt das geheime Wort nicht — findet den Hochstapler, bevor er sich herausredet.

## Spielprinzip

Alle Spieler sehen das geheime Wort auf ihrem Gerät, außer dem **Hochstapler**. In der Diskussionsrunde beschreibt reihum jeder das Wort — zu konkret und du verrätst es dem Hochstapler, zu vage und du machst dich verdächtig. Dann wird abgestimmt. Der Hochstapler kann sich noch retten, wenn er das Wort errät.

**Punktevergabe:**
- Spieler fangen den Hochstapler → alle außer Hochstapler +1 Punkt
- Hochstapler errät das Wort (auch wenn gefangen) → +1 Punkt extra
- Hochstapler bleibt unentdeckt → +2 Punkte
- Unentschieden beim Vote → Hochstapler +1 Punkt

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| PWA | @serwist/next (Service Worker, Offline) |
| Fonts | Fraunces + JetBrains Mono via next/font |
| Sound | Web Audio API (synthetisiert, keine Audiodateien) |
| Haptic | navigator.vibrate |
| Persistenz | localStorage (SSR-safe) |
| Package Manager | pnpm |

## Dev Setup

```bash
# Dependencies installieren
pnpm install

# Entwicklungsserver
pnpm dev

# Produktions-Build (--webpack erforderlich wegen @serwist/next)
pnpm build

# Icons generieren (benötigt sharp)
node scripts/generate-icons.mjs
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Deployment

Das Projekt ist für [Vercel](https://vercel.com) optimiert:

1. Repo auf GitHub pushen
2. Auf [vercel.com/new](https://vercel.com/new) importieren
3. Build Command: `pnpm build`
4. Install Command: `pnpm install`
5. Deploy klicken

Die App funktioniert als PWA — auf iOS/Android einfach "Zum Home-Bildschirm hinzufügen".

## Projektstruktur

```
app/
  _game/
    screens/            # Bildschirme pro Spielphase
    hooks/              # useGameState, useTimer, useHaptic, useSound
    components/         # Card3D (3D-Flip-Karte)
    lib/                # sounds.ts (Web Audio API)
    types.ts            # Shared TypeScript-Typen
    wordpacks.ts        # Wortlisten mit Kategorien
    utils.ts            # shuffle, pickRandom, pickWordAntiRepeat
    storage.ts          # localStorage-Persistenz
    HochstaplerApp.tsx  # Haupt-Orchestrator
  layout.tsx
  page.tsx
  globals.css
public/
  manifest.json         # PWA-Manifest
  sw.js                 # Service Worker (build-generiert)
  icons/                # PWA-Icons (192×192, 512×512)
scripts/
  generate-icons.mjs    # SVG→PNG Icon-Generator (sharp)
```

## Lizenz

MIT
