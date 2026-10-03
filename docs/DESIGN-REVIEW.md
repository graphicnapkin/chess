# Chess design review — 2026-10-03

Isolated branch: `design/portfolio-chess-refresh`, based on origin/main `0c97cc80`.
Reference: approved graphicnapkin.com portfolio, shared DESIGN-LANGUAGE.md anchored at portfolio release `6f1e2e8`. This change owns the Chess application only.

## Changes

- Ivory #F4F1EA background, navy #233876 type/actions, red #AC3225 focus accents, lavender information surfaces, locally hosted Inter and its OFL license.
- Consistent flat cards, 16px corners, readable labels and restrained spacing. Original editable decorative chess SVG in the application header.
- Saved board colors and piece styles remain independent of the surrounding interface. Gameplay hooks, engine, authentication, multiplayer, database and deployment configuration are unchanged.
- Native promotion dialog supports focus containment, Escape, cancellation and underpromotion. Skip link reaches keyboard move input; errors associate with that input. New game clears stale move text and invitation-copy feedback.
- Local preview supports an optional PORT environment variable (default remains 9001) for isolated QA.

## Verification

Node 24.21.0; locked dependencies installed with npm ci.

- `npm run build`: passed (existing Webpack bundle-size and outdated Browserslist warnings).
- `npm run typecheck`: passed. No lint script exists in this repository.
- `npm test`: 7/7 passed, including PGlite permissions, seats, RLS, room/version limits, legal moves and game outcomes.
- `TEST_URL=http://127.0.0.1:9174 npm run test:browser`: 10/10 passed in Chromium.
- Browser coverage: real Stockfish reply and crossOriginIsolated, undo/reset, black-side play, keyboard input, reload recovery, knight underpromotion, promotion cancellation/retry and focus wrapping, board/piece preferences, captured artwork, PGN control availability, result dialog/restart, mocked online seat results, invalid move errors, and skip link.
- Overflow and board bounds checked at 320/390/768/980/1024/1440px. Desktop, full-page phone, and phone result screenshots inspected visually.
- agent-browser isolated headless session verified content, controls, no error overlay and no horizontal overflow; live portfolio read-only reference loaded successfully.
- `git diff --check`: passed.

## Review preview and limits

Review preview: http://127.0.0.1:9174 (isolated loopback process). Public Supabase configuration in this review build is deliberately a placeholder; intercepted tests exercise sign-in UI and multiplayer result seats without shared-backend writes. Social login and live two-user multiplayer were not rerun. All source changes work with existing production public configuration after a normal build.

No production deploy, credential/security/network settings changes, or existing project service changes. Full keyboard navigation on individual board squares remains a limitation of the existing chessboard library; labeled keyboard move entry is supported.

The network-enabled dependency install reported 54 existing audit findings (7 low, 12 moderate, 32 high, 3 critical); no dependency upgrades were made in this visual scope. A subsequent offline install printed zero findings because it had no fresh advisory lookup, which is not evidence those findings are resolved.
