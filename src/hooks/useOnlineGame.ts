import { useCallback, useEffect, useRef, useState } from 'react'
import { gameAction, OnlineGame, supabase } from '../services/supabase'
export function useOnlineGame(id: string | null, userId: string | undefined) {
    const [game, setGame] = useState<OnlineGame | null>(null)
    const [connection, setConnection] = useState('Connecting…')
    const [error, setError] = useState('')
    const [pending, setPending] = useState(false)
    const busy = useRef(false)
    const activeId = useRef(id)
    activeId.current = userId ? id : null
    const accept = useCallback((next: OnlineGame) => {
        if (next.id !== activeId.current) return
        setGame(current => current?.id === next.id && current.version > next.version ? current : next)
    }, [])
    useEffect(() => {
        setGame(null); setError('')
        if (!id || !userId || !supabase) return
        let active = true
        const refresh = async () => {
            const { data, error } = await supabase!.from('games').select('*').eq('id', id).single()
            if (!active) return
            if (error) { setError('This game is unavailable or you have not joined it.'); return }
            accept(data as OnlineGame)
        }
        const channel = supabase.channel(`game:${id}`).on('postgres_changes', {
            event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}`,
        }, payload => { if (active) accept(payload.new as OnlineGame) }).on('system', {}, payload => {
            // PostgreSQL subscription readiness can lag the websocket join.
            if (active && payload.status === 'ok') void refresh()
        }).subscribe(status => {
            if (!active) return
            setConnection(status === 'SUBSCRIBED' ? 'Connected' : 'Reconnecting…')
            if (status === 'SUBSCRIBED') void refresh()
        })
        void refresh()
        const onVisible = () => { if (document.visibilityState === 'visible') void refresh() }
        window.addEventListener('online', refresh)
        document.addEventListener('visibilitychange', onVisible)
        return () => {
            active = false; void supabase!.removeChannel(channel)
            window.removeEventListener('online', refresh)
            document.removeEventListener('visibilitychange', onVisible)
        }
    }, [id, userId, accept])
    const move = async (from: string, to: string, promotion = 'q') => {
        if (!game || busy.current) return
        busy.current = true; setPending(true); setError('')
        try { accept(await gameAction('move', { id: game.id, version: game.version, from, to, promotion })) }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Move could not be saved.')
            const { data } = await supabase!.from('games').select('*').eq('id', game.id).single()
            if (data) accept(data as OnlineGame)
        } finally { busy.current = false; setPending(false) }
    }
    return { game, connection, error, pending, move }
}
