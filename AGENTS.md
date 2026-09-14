# Guidance for agents working on GNAP Chess

## Scope and owner preferences

- This is the standalone `graphicnapkin/chess` Git repository. Its local folder is `C:\Users\Graph\Documents\My Portfolio\chess`; the parent portfolio folder is a different repository. Run Git, npm, Supabase, and Vercel commands from this repository. Do not edit or deploy the parent portfolio as part of a chess task.
- The owner requires zero recurring service cost. Use the existing GitHub, Vercel Hobby, and Supabase Free stack. Do not enable paid plans, add-ons, AI APIs, or keepalive automation. Free quotas can interrupt multiplayer; keep local computer games usable independently.
- Work autonomously within the current request. Do not treat past release authorization as permission to deploy unrelated future changes. Ask for missing account-owner setup only when needed.
- Google Cloud is for OAuth identity only. The intended setup has no linked billing account and minimal IAM/scopes. This has not been independently audited; do not claim billing/IAM was verified.

## Start here

Read `README.md`, `docs/ARCHITECTURE.md`, `docs/SETUP.md`, and `docs/ROADMAP.md`. Run `git status -sb` before editing and preserve user changes. Fetch remote state before deciding what is current; dated handoff notes are evidence of a past release, not live status.

## Stack and boundaries

- Node 24, React 18, TypeScript, Webpack, chess.js. This is not a Next.js app.
- `src/App.tsx`: board, game controls, account UI, and multiplayer interaction.
- `src/hooks/useChessGame.tsx`: local game rules/history and session recovery.
- `src/hooks/useStockfishWorker.tsx`: browser Stockfish worker lifecycle and UCI commands.
- `src/hooks/useAuth.ts`: full-page PKCE login and invitation-preserving return URL.
- `src/hooks/useOnlineGame.ts`: hosted game state, Realtime, and reconnect recovery.
- `src/services/supabase.ts`: public client and authenticated Edge Function calls.
- `supabase/functions/game/index.ts`: authenticated multiplayer endpoint.
- `supabase/functions/_shared/validateMove.ts`: server-side move validation through history replay.
- `supabase/migrations/`: authoritative database schema, grants, RLS, and transactional writes.
- `scripts/assets.cjs` copies engine assets from `dist/stockfish/` to ignored `build/stockfish/`. Vercel deploys `build/`; historical `dist/` frontend files are not the deployment output.

## Invariants to preserve

- Stockfish runs locally in WebAssembly, not a hosted Python or AI service. Historical Python/source files support engine building, not a required runtime backend.
- Keep native COOP `same-origin` and COEP `require-corp` headers. Verify `crossOriginIsolated` and a real engine reply after changes to hosting, authentication, or workers.
- Use full-page OAuth redirects. Do not weaken isolation to make popup login work. Preserve invitations across login and local game recovery.
- Preserve the old service worker retirement script and its no-store response unless replacing it with a deliberate migration for existing visitors.
- Multiplayer writes go through authenticated Edge Functions and restricted database RPCs. Never trust client-supplied identity, turn, FEN, or result. Preserve participant-only reads, server-assigned seats, version checks, row locks, and history replay for repetition detection.
- `verify_jwt = false` is intentional for asymmetric JWT compatibility: the function itself validates every bearer with `auth.getUser` before database access. Do not remove that authentication.
- An invite URL lets a signed-in recipient claim the vacant seat. Preserve seat immutability after claiming and prevent outsider game reads.
- Preserve room/storage limits and expiration. These do not cap incoming request volume; do not promise unlimited free hosting or competitive anti-cheat.
- Keep Stockfish license/source assets. The application MIT-versus-ISC discrepancy needs owner clarification before changing license declarations.

## Environments and credentials

Production: https://chess.graphicnapkin.com
GitHub: https://github.com/graphicnapkin/chess
Vercel project: `chess` / `prj_41EJXOk1F5Hrgq1LDiBy7KdHreKJ`
Vercel team: `graphicnapkins-projects`
Supabase project: `mtcibrvwekegkvcjqlwf`
Supabase dashboard: https://supabase.com/dashboard/project/mtcibrvwekegkvcjqlwf
OAuth callback for Google and GitHub: `https://mtcibrvwekegkvcjqlwf.supabase.co/auth/v1/callback`

Only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` belong in frontend configuration. Never print or commit OAuth secrets, service-role keys, access tokens, or local credential files. `.env`, `.env.local`, `.vercel/`, and Supabase temporary state are ignored. Authentication on this machine is not guaranteed on another machine.

For a new frontend domain, update Supabase Auth Site URL/redirects and the function's exact-origin `ALLOWED_ORIGINS` list; verify provider settings. Preserve existing provider credentials. Read `supabase config diff` before `config push`: only intentionally declared settings should change. Check current CLI help/docs rather than assuming older command syntax.

## Development and verification

Use Node 24 and `npm ci`. `npm start` serves development on port 9000.

```sh
npm run build
npm test
npm run test:browser
```

Install the test browser once with `npx playwright install chromium`. Browser tests start the production preview on port 9001 when `TEST_URL` is absent. Build first. `npm run typecheck` is also available.

- `npm test`: real PostgreSQL permission/transaction tests using PGlite, plus chess-rule tests.
- `npm run test:browser`: real Stockfish, reset/undo, mobile layout, keyboard moves, reload recovery, and underpromotion.
- `tests/hosted.mjs`: real Supabase multiplayer, Realtime, seat/RLS/write restrictions, concurrent submissions, and reconnect. It creates temporary users/games and deletes them afterward. It accepts Supabase CLI API-key JSON on stdin; keep credentials in memory and never log them. It does not complete social-provider login.
- Set `TEST_URL` to an explicitly intended deployment to run browser/hosted verification there. Live tests mutate the shared backend temporarily; confirm the target and cleanup.
- For Edge Function edits, also type-check with Deno using `supabase/functions/game/deno.json` and run relevant hosted checks.
- Scale verification to the change. Documentation-only edits need diff/link checks, not a new production deployment.

## Release workflow and known gaps

Inspect `.vercel/project.json` before deploying to ensure it points to chess. Production needs both public Supabase environment variables at build time. Source commits alone do not prove a successful deployment; verify the intended commit, READY status, custom domain, engine assets/isolation, and relevant user flows.

The September 2026 release used `vercel deploy --prod` after pushing GitHub main. Do not assume Git-triggered deployments are working merely because the repository is linked. Use preview deployments for review and deploy production when the current request authorizes it. Keep preview protection enabled.

GitHub Actions is not active: `docs/checks.workflow.yml` is the reviewed template. The authorization available during the initial release lacked workflow scope. An authorized account can move it to `.github/workflows/checks.yml`; recheck current permissions rather than repeatedly attempting a known-denied push.

See `docs/ROADMAP.md` for dated release evidence, remaining verification, and future feature ideas. Update these notes when architecture or deployment assumptions change.
