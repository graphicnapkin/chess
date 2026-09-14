# Architecture

Browser: React + chess.js renders the board; Stockfish worker computes local AI. The UI uses a session snapshot for local play. No AI API is used.

Multiplayer: browser -> authenticated Supabase Edge Function -> chess.js validation -> transactional PostgreSQL commit -> Realtime update -> both clients. Each snapshot includes ordered LAN moves, FEN, players, version, result and expiration. History replay preserves repetition detection. Server identities assign seats; URL color parameters are ignored.

Only service_role can execute write RPCs. RLS permits participants to select unexpired games. Moves are validated against persisted history in the Edge Function, then committed under a row lock and expected version in PostgreSQL. Repeated submissions with an old version are rejected and the client refetches. Invite UUIDs are unguessable seat-claim capabilities; anyone given the invite can claim the vacant black seat, after which the invitation cannot reassign it.

Cost limits: ten created rooms per user/hour; 5,000 stored rooms globally; seven-day fixed expiry; at most 1,024 half-moves per game. Expired rows are pruned in batches on room creation. These limits bound game storage, not incoming function requests. Free-plan service quotas remain the outer limit and online availability can be interrupted. This is casual invite chess, not ranked competitive anti-cheat.

The backend is designed for the free stack. No separate websocket server, Vercel function, paid AI, or external database is required. Supabase hosts the functions, database and realtime transport. Google is only an OAuth issuer.
