# Roadmap and handoff

## Implemented locally
- Node 24 runtime pins, CI build/test workflow template, Vercel configuration.
- Remove Firebase; local AI works without configuration.
- Preserve Stockfish and cross-origin isolation; retire old isolation service worker.
- Supabase schema, restricted RPCs, Edge Function and frontend adapter.
- PKCE login integration; actual provider configuration is still needed.
- Responsive UI, promotion picker, keyboard entry, history and PGN export.
- Local PostgreSQL and actual browser-engine regression coverage.

## Pending external access and verification
- DONE: Supabase CLI authenticated.
- DONE: migration and function deployed to mtcibrvwekegkvcjqlwf.
- DONE: local and Vercel Preview public variables configured; production variables pending release.
- Create/configure Google and GitHub OAuth clients; inspect Google IAM/billing.
- DONE: two-user hosted gameplay, refresh, Realtime, outsider RLS, direct write/RPC denial, illegal moves, concurrent duplicate rejection and offline reconnect verified. OAuth provider flow still pending.
- Review preview and release to production.

## Later polish
- Worker reuse with explicit cancellation/search IDs if profiling shows startup overhead.
- Replace legacy chessboard component for complete keyboard-board navigation.
- Clocks with server timestamps, resign/draw/rematch, saved game browser.
- Improve bundle size/dependency maintenance and clarify application license.
- No ratings, matchmaking, spectators or paid services in the first release.

## GitHub Actions activation
The current GitHub authorization lacks workflow scope. The reviewed workflow is saved as docs/checks.workflow.yml. An account with workflow permission can move it to .github/workflows/checks.yml to enable CI. Local tests have been run successfully.
