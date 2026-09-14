import { createClient } from '@supabase/supabase-js'
import { validateMove } from '../_shared/validateMove.ts'
const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)
Deno.serve(async req => {
    const origin = req.headers.get('Origin') || ''
    const headers = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null',
        'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
        'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin',
    }
    const reply = (body: unknown, status = 200) => Response.json(body, { status, headers })
    if (origin && !allowedOrigins.includes(origin)) return reply({ error: 'Origin not allowed.' }, 403)
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (req.method !== 'POST') return reply({ error: 'Use POST.' }, 405)
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return reply({ error: 'Sign in to play online.' }, 401)
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) return reply({ error: 'Sign in to play online.' }, 401)
    try {
        // Bound request bodies before parsing, even with chunked transfer encoding.
        const reader = req.body?.getReader()
        if (!reader) return reply({ error: 'Missing request body.' }, 400)
        const chunks: Uint8Array[] = []; let length = 0
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            length += value.byteLength
            if (length > 2048) { await reader.cancel(); return reply({ error: 'Request too large.' }, 413) }
            chunks.push(value)
        }
        const bytes = new Uint8Array(length); let offset = 0
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
        const input = JSON.parse(new TextDecoder().decode(bytes))
        if (!input || typeof input !== 'object') return reply({ error: 'Invalid request.' }, 400)
        let response
        if (input.action === 'create') response = await admin.rpc('create_game', { p_user: user.id })
        else {
            if (typeof input.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.id)) return reply({ error: 'Invalid game invitation.' }, 400)
            if (input.action === 'join') response = await admin.rpc('join_game', { p_id: input.id, p_user: user.id })
            else if (input.action === 'move') {
                if (!Number.isInteger(input.version) || !/^[a-h][1-8]$/.test(input.from) || !/^[a-h][1-8]$/.test(input.to) || (input.promotion && !/^[qrbn]$/.test(input.promotion))) return reply({ error: 'Invalid move.' }, 400)
                const { data: game, error } = await admin.from('games').select('*').eq('id', input.id).single()
                if (error || !game) return reply({ error: 'Game unavailable.' }, 404)
                const accepted = validateMove(game, user.id, input)
                response = await admin.rpc('commit_move', { p_id: input.id, p_user: user.id, p_version: input.version, p_move: accepted.move, p_fen: accepted.fen, p_result: accepted.result })
            } else return reply({ error: 'Unknown action.' }, 400)
        }
        if (response.error) return reply({ error: response.error.code === 'P0001' ? response.error.message : 'Game could not be saved.' }, 409)
        return reply({ game: response.data })
    } catch (error) {
        return reply({ error: error instanceof Error ? error.message : 'Invalid request.' }, 400)
    }
})
