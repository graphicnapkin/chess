import { createClient } from '@supabase/supabase-js'
const url = process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_PUBLISHABLE_KEY || ''
export const supabase = url && key ? createClient(url, key, {
    auth: { flowType: 'pkce', detectSessionInUrl: true },
}) : null
export type OnlineGame = {
    id: string; white_id: string; black_id: string | null; moves: string[]
    fen: string; version: number; status: 'waiting' | 'active' | 'finished'
    result: string | null; expires_at: string
}
export async function gameAction(action: string, values: Record<string, unknown> = {}): Promise<OnlineGame> {
    if (!supabase) throw new Error('Online play is not configured yet. You can still play the computer.')
    const { data, error } = await supabase.functions.invoke('game', { body: { action, ...values } })
    if (error) {
        let message = 'Online play is unavailable. Please try again.'
        try { message = (await error.context.json()).error || message } catch { /* network failure */ }
        throw new Error(message)
    }
    return data.game
}
