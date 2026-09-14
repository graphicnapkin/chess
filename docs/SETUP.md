# Supabase / OAuth setup

Target project: https://supabase.com/dashboard/project/mtcibrvwekegkvcjqlwf
Organization: iseffqxxfuzehpftohcc
Vercel project: chess (prj_41EJXOk1F5Hrgq1LDiBy7KdHreKJ)

## Free service configuration

Keep Supabase on the Free organization plan and Vercel on Hobby. Do not enable paid add-ons, custom Supabase domains, paid compute, or automatic paid upgrades. Free quotas may interrupt online play; the computer game stays local. Supabase Free may pause inactive projects after a week. No keepalive automation is installed.

## Backend deployment

Run from this repository after `npx supabase login`:

```sh
npx supabase link --project-ref mtcibrvwekegkvcjqlwf
npx supabase db push
npx supabase functions deploy game --project-ref mtcibrvwekegkvcjqlwf
```

Configure the `ALLOWED_ORIGINS` function secret with a comma-separated list of exact frontend origins: the verified production chess origin, the current preview origin while testing, and localhost only for development. The Supabase URL and service-role key are platform-provided function secrets. They must never be copied to the frontend. The function explicitly verifies the bearer token with `auth.getUser` before any database access. Its gateway JWT check is disabled to support asymmetric signing keys; do not remove the in-handler authentication.

Frontend variables:

- `SUPABASE_URL=https://mtcibrvwekegkvcjqlwf.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY`: project publishable key (safe to expose; access still depends on JWT/RLS).

Store these in `.env` locally and the corresponding Vercel environment settings. Rebuild after changing them. Configure the Supabase Site URL and redirect allowlist for the real frontend origin, allowing its `/?game=...` invitation query. Restrict callback patterns to that exact origin; do not authorize all Vercel preview domains.

## OAuth

Google and GitHub provider callback URL:

`https://mtcibrvwekegkvcjqlwf.supabase.co/auth/v1/callback`

The application uses full-page PKCE redirects. The frontend's native COOP/COEP headers stay enabled. Do not weaken them to enable popup sign-in. Existing isolation service workers are retired by the replacement script at the same URL.

For GitHub: create an OAuth app, set the homepage to the real frontend origin, set the callback above, and save its ID/secret only in Supabase's GitHub provider configuration.

For Google: use a dedicated OAuth-only Cloud project. Verify that it has no linked billing account. Limit IAM access to the owner and secure the owner account with MFA/passkeys. Configure an external OAuth consent screen and web client, exact origins/callback, and only openid/email/profile scopes. Keep Gemini/Vertex AI and unrelated APIs disabled. Remove unused API keys/service accounts. Add test users while in Testing; configure Production audience before broad release. Save the client ID/secret only in Supabase's Google provider configuration. Billing alerts are not a substitute for unlinked billing.

## Hosted acceptance checks before production

- Confirm organization is Free and Google project billing is unlinked.
- Google and GitHub login/logout work; callbacks preserve invitations and local AI games.
- Two independent users create/join/play; third user cannot claim a seat or read that game.
- Direct REST writes and direct privileged RPC calls fail for authenticated users.
- Duplicate/concurrent move attempts cannot both commit.
- Refresh and disconnect/reconnect recover the entire move history.
- Checkmate, draw, promotion, expiration, room-limit and network-error states behave correctly.
- Real WASM worker works before/after login in supported desktop/mobile browsers.

## Local evidence and limitations

`npm test` executes real PostgreSQL (PGlite) permission/transaction tests and chess-rule tests. It does not test hosted Supabase Auth, Realtime delivery, or the deployed Edge Function. Playwright exercises local real Stockfish gameplay and layout. Hosted acceptance remains necessary.

## Production domain

Production frontend: https://chess.graphicnapkin.com

This exact origin is allowed in Supabase Auth redirects and the game function's ALLOWED_ORIGINS. Vercel Production must contain SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before building. The Google and GitHub provider callback remains the Supabase callback above. Keep the Google OAuth client's authorized JavaScript origins and GitHub OAuth app homepage aligned with this production URL.

Run browser and hosted acceptance tests against production by setting TEST_URL=https://chess.graphicnapkin.com. The hosted test creates temporary users and games and cleans them up afterward; it does not complete social-provider login.
