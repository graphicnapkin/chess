# Roadmap and handoff

## Implemented
- Node 24 runtime pins, CI build/test workflow template, Vercel configuration.
- Remove Firebase; local AI works without configuration.
- Preserve Stockfish and cross-origin isolation; retire old isolation service worker.
- Supabase schema, restricted RPCs, Edge Function and frontend adapter.
- PKCE login integration; Google and GitHub providers configured and reported working by the owner.
- Responsive UI, promotion picker, keyboard entry, history and PGN export.
- Local PostgreSQL and actual browser-engine regression coverage.

## Pending external access and verification
- DONE: Supabase CLI authenticated.
- DONE: migration and function deployed to mtcibrvwekegkvcjqlwf.
- DONE: local, Vercel Preview, and Production public variables configured.
- DONE: Google and GitHub OAuth clients configured. Google IAM/billing still requires owner verification.
- DONE: two-user hosted gameplay, refresh, Realtime, outsider RLS, direct write/RPC denial, illegal moves, concurrent duplicate rejection and offline reconnect verified. Owner reports social login working on the preview.
- DONE: preview accepted by owner. Production domain configured as https://chess.graphicnapkin.com.

## Later polish
- Worker reuse with explicit cancellation/search IDs if profiling shows startup overhead.
- Replace legacy chessboard component for complete keyboard-board navigation.
- Clocks with server timestamps, resign/draw/rematch, saved game browser.
- Improve bundle size/dependency maintenance and clarify application license.
- No ratings, matchmaking, spectators or paid services in the first release.

## GitHub Actions activation
The current GitHub authorization lacks workflow scope. The reviewed workflow is saved as docs/checks.workflow.yml. An account with workflow permission can move it to .github/workflows/checks.yml to enable CI. Local tests have been run successfully.

## Production release evidence — 2026-09-13 (America/New_York)

Release commit `dd66ff3511d393d68509751d54e169c6c67fe6e1` was pushed to main and PR #4 was merged. Vercel deployment `dpl_3VgqXrTVNdxufuorYXszVDY7BLyd` reached READY and served https://chess.graphicnapkin.com with Node 24.

Verified on the custom domain: three real-Stockfish browser tests; two-user hosted multiplayer/Realtime; refresh and reconnect; third-seat and outsider read rejection; direct-write/RPC restrictions; illegal moves; concurrent duplicate rejection. Temporary hosted-test accounts and games were cleaned up. WASM returned HTTP 200 with the required isolation headers.

Google and GitHub authorization endpoints accepted the production return URL and used the expected Supabase callback. The owner reported complete social login working on the preview; a complete social login on the custom domain was left for the owner to confirm. Google IAM/billing was not independently audited. Vercel's error-log query returned no logs, which is not proof of comprehensive monitoring.

This is historical evidence. Recheck live deployment and repository state before future releases.

## UI revision — 2026-09-14

Modernized the portfolio-aligned interface and provider buttons, removed promotional copy, and added links back to graphicnapkin.com. Board themes and piece styles persist locally. Captured pieces use complete, correctly scaled artwork. Piece and font assets are served locally with their license/attribution files.

Game-over dialogs use chess.js history and the player's assigned color to distinguish wins, losses, and draw reasons. Native modal behavior, explicit keyboard focus, board review, result reopening, and local restart are supported. Online games offer board review or a computer game; no online rematch protocol was added.

Verification: production build, seven rule/database/result tests, and eight browser tests passed locally. Browser coverage includes real Stockfish, mobile layouts, preferences, captured artwork, modal keyboard behavior, and simulated signed-in winner/loser seat handling. The simulated online result test intercepts backend requests; it does not claim fresh live multiplayer or social-login verification.
