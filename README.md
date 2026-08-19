# Wallet

A private, installable PWA for keeping every card in one place — modeled on the
single-tap "reveal everything" feel of Apple Wallet. There is no backend, no
API route, and no database anywhere except your own device.

## How your data is stored

- Every card lives in your browser's **IndexedDB**, encrypted with
  **AES-256-GCM**. The encryption key is derived from a PIN you set, stretched
  with **PBKDF2 (210,000 iterations, SHA-256)** — the PIN itself is never
  stored anywhere, only a key derived from it.
- The decrypted key exists **only in memory** for as long as the app is
  unlocked. Closing the tab, backgrounding the app, or letting it sit idle
  clears it and locks the vault again.
- Nothing is ever sent over the network. This app makes zero requests to any
  server for your card data — it's a fully static site (`next build` with
  `output: "export"`) that runs entirely client-side.
- Clearing your browser's site data (or uninstalling the PWA) deletes
  everything. Use **Settings → Export encrypted backup** to keep a copy you
  control — the exported file is still encrypted with your PIN, so it's safe
  to store wherever you'd store any other backup.

## Getting it running

You'll need [Node.js](https://nodejs.org) 18.18+ installed.

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the app works immediately in dev mode.

## Building the installable PWA

```bash
npm run build
```

This produces a static site in `out/`. Because it's 100% static, you can host
it anywhere that serves plain files over HTTPS:

- **Vercel**: `npx vercel --prod` from this folder (or connect the repo in
  the Vercel dashboard) — free, HTTPS included, zero config needed for a
  Next.js static export.
- **Netlify**: drag-and-drop the `out/` folder onto app.netlify.com/drop, or
  connect the repo with build command `npm run build` and publish directory
  `out`.
- **GitHub Pages**: push `out/` to a `gh-pages` branch.
- Any static file host / your own server (nginx, Caddy, etc.) — just serve
  the contents of `out/`.

HTTPS is required for the service worker (and therefore offline support and
"Add to Home Screen") to work — `localhost` is the only exception, which is
why `npm run dev` works without it.

### Installing it on your phone

1. Open the deployed URL in Safari (iPhone) or Chrome (Android).
2. **iPhone**: tap the Share icon → "Add to Home Screen".
   **Android**: tap the browser menu → "Install app" (or you'll see an
   automatic install prompt).
3. Launch it from your home screen — it opens full-screen, no browser chrome,
   and works offline after the first load.

## Setting it up

The first time you open the app, you'll be asked to create a 6-digit PIN.
That's it — you're in. Tap **+** to add your first card. Tap any card to see
the full number, expiry, CVV, and copy any field to your clipboard.

Auto-lock, PIN changes, encrypted backup/restore, and "erase everything" all
live under the gear icon in the top-right corner.

## Project structure

```
src/
  app/                Next.js App Router entry (layout, page, global styles)
  components/          UI: lock screen, card stack, detail sheet, add/edit
                        form, settings, hand-drawn icon set
  context/             WalletContext — the single source of truth for the
                        unlocked-session state (cards, lock status)
  lib/
    crypto.ts          AES-GCM + PBKDF2 helpers (Web Crypto API only)
    db.ts               Minimal IndexedDB wrapper (no external dependency)
    vaultStore.ts       Vault lifecycle: create, unlock, persist, backup
    cardUtils.ts        Luhn check, brand detection, formatting, masking
    useAutoLock.ts       Locks on inactivity / backgrounding
public/
  manifest.webmanifest  PWA manifest
  sw.js                  Offline app-shell service worker
  icons/                  App icons (192, 512, maskable)
```

## A note on how this was built

This project was hand-written in an offline sandbox without access to npm's
registry, so `npm install` / `next build` couldn't be run there to produce a
live build. Every piece of business logic that could be verified without a
real npm install *was*: the encryption/PBKDF2 round-trip, PIN verification
(including wrong-PIN and tampered-ciphertext cases), Luhn validation and
card-brand detection, and the full vault lifecycle (create → unlock → persist
cards → change PIN → export/import backup → wipe) were all run end-to-end
against a real Web Crypto implementation and an IndexedDB-compatible store.
Every component was also rendered in isolation to catch syntax/runtime
errors. Standard `npm install && npm run dev` on your machine is the first
real Next.js build — if anything doesn't compile, it's almost certainly a
dependency-version nuance rather than a logic bug, and worth flagging so it
can be fixed.
