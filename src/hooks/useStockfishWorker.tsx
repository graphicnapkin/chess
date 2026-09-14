import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
export function useStockfishWorker(fen: string, difficulty: number, playerColor: string, enabled: boolean, onMove: (move: { from: string; to: string; promotion?: string }) => void) {
    const callback = useRef(onMove)
    callback.current = onMove
    const [error, setError] = useState('')
    const [thinking, setThinking] = useState(false)
    useEffect(() => {
        setError(''); setThinking(false)
        const position = new Chess(fen)
        if (!enabled || position.turn() === playerColor || position.isGameOver()) return
        if (!window.Worker || !window.crossOriginIsolated) {
            setError('The chess engine could not start. Reload this page in a supported browser.')
            return
        }
        // Each worker belongs to one position; reset/undo invalidate all its replies.
        const worker = new Worker('/stockfish/stockfish.js')
        let active = true
        setThinking(true)
        const timeout = window.setTimeout(() => {
            active = false; worker.terminate(); setThinking(false)
            setError('The engine took too long. Start a new game to try again.')
        }, 30000)
        worker.onerror = () => { if (active) { setError('The chess engine failed to load. Please reload.'); setThinking(false) } }
        worker.onmessage = ({ data }) => {
            if (!active || typeof data !== 'string') return
            if (data.trim() === 'uciok') {
                worker.postMessage(`setoption name Skill Level value ${difficulty}`)
                worker.postMessage('isready')
            } else if (data.trim() === 'readyok') {
                worker.postMessage(`position fen ${fen}`)
                worker.postMessage('go depth 8')
            } else {
                const best = /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/.exec(data)
                if (best) {
                    active = false; window.clearTimeout(timeout); setThinking(false)
                    callback.current({ from: best[1], to: best[2], promotion: best[3] || 'q' })
                    worker.terminate()
                }
            }
        }
        worker.postMessage('uci')
        return () => { active = false; window.clearTimeout(timeout); worker.terminate() }
    }, [fen, difficulty, playerColor, enabled])
    return { error, thinking }
}
