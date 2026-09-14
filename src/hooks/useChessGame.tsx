import { useCallback, useState } from 'react'
import { Chess } from 'chess.js'
const savedGameKey = 'gnap-chess-local-v1'
export function useChessGame() {
    const [game] = useState(() => {
        const chess = new Chess()
        try { const pgn = sessionStorage.getItem(savedGameKey); if (pgn) chess.loadPgn(pgn) } catch { chess.reset() }
        return chess
    })
    const [fen, setFen] = useState(game.fen())
    const refresh = useCallback(() => {
        setFen(game.fen())
        try { sessionStorage.setItem(savedGameKey,game.pgn()) } catch { /* Play still works without storage. */ }
    }, [game])
    const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
        try { game.move(move); refresh() } catch { /* Illegal drops leave the position unchanged. */ }
    }, [game, refresh])
    const reset = () => { game.reset(); refresh() }
    const undo = (playerColor: string) => {
        game.undo()
        if (game.turn() !== playerColor) game.undo()
        refresh()
    }
    return { game, fen, makeMove, reset, undo }
}
