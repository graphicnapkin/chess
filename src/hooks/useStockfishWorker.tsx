import React, { useEffect, useRef } from 'react'
import { Chess, Move } from 'chess.js'

export const useStockfishWorker = (
    game: Chess,
    setFen: React.Dispatch<React.SetStateAction<string>>,
    difficulty: number,
    playerColor: string,
    makeMove: (
        move: {
            from: string
            to: string
            promotion?: string
        },
        game: Chess,
        stockfish?: React.MutableRefObject<Worker | null>
    ) => Move | undefined
) => {
    const stockfish = useRef<Worker | null>(null)

    useEffect(() => {
        if (stockfish.current) {
            stockfish.current.terminate()
            console.log('Terminated stockfish')
        }

        if (window.Worker) {
            stockfish.current = new Worker('/stockfish/stockfish.js')
            stockfish.current.onmessage = stockfishMessage
            stockfish.current?.postMessage(
                'setoption name Skill Level value ' + difficulty
            )
        }
        if (game.turn() != playerColor) {
            stockfish.current?.postMessage('position fen ' + game.fen())
            stockfish.current?.postMessage('go depth 9')
        }
    }, [playerColor, difficulty])

    const stockfishMessage = (event: MessageEvent<any>) => {
        console.log('Stockfish said: ' + event.data)

        if (game.turn() != playerColor && event.data.includes('bestmove')) {
            const bestMove = event.data.split(' ')[1]
            const nextMove = {
                from: bestMove.slice(0, 2),
                to: bestMove.slice(2, 4),
                promote: 'q',
            }

            makeMove(nextMove, game, stockfish)
            setFen(game.fen())
        }
    }

    return stockfish
}
