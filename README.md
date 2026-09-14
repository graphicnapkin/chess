# GNAP Chess

React/TypeScript chess with Stockfish running in a browser Web Worker. Node 24 is used to build the frontend. Supabase provides optional multiplayer and Google/GitHub login; computer games work without backend configuration.

## Develop

Use Node 24 (`.nvmrc` / `.node-version`).

```sh
npm ci
npm start
```

Open http://localhost:9000. Production verification:

```sh
npm run build
npm test
npm run test:browser
```

Install Chromium once with `npx playwright install chromium`. `npm run preview` serves the production artifact at http://127.0.0.1:9001. Browser tests use the real bundled Stockfish engine.

## Deploy and configure

Vercel builds with Node 24 and serves `build/`, as specified in `vercel.json`. The asset script copies the existing Stockfish JS/WASM into the output; it does not compile a new engine. `dist/stockfish/` retains the upstream source and license from the original repository. The other historical `dist/` files are not the deployment output.

Local AI play requires no environment variables. To enable online play, copy `.env.example` to `.env` and configure only the public Supabase URL and publishable key. Never put a service-role key or OAuth client secret into frontend variables.

See [Supabase and OAuth setup](docs/SETUP.md), [architecture](docs/ARCHITECTURE.md), and [remaining work](docs/ROADMAP.md).

## Current features

- Real Stockfish AI, color/difficulty selection, undo, reset, and session recovery.
- Drag, click, or keyboard move entry; selectable pawn promotion.
- Captured pieces, move history, and PGN download.
- Supabase-backed invitations, assigned player seats, validated moves, and reconnect snapshots (requires hosted setup).
- Full-page Google/GitHub OAuth redirects with PKCE (requires provider setup).

## Licensing

The original README described the app as MIT while package.json declares ISC; the app license needs owner clarification before changing either declaration. Bundled Stockfish is GPLv3; its license and source are retained in `dist/stockfish/`, and `Copying.txt` is included with deployed engine assets.
