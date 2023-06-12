import React, { useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { ChessMove, type MakeMove } from './useChessGame'

// Custom React hook to handle Stockfish AI integration.
export const useStockfishWorker = (
    game: Chess, // The current game state
    difficulty: number, // The difficulty level of the AI between 1-20
    playerColor: string,
    makeMove: MakeMove,
    gameType: React.MutableRefObject<'ai' | 'multiplayer'>
) => {
    const stockfish = useRef<Worker | null>(null)

    useEffect(() => {
        // Terminate the worker if it exists which prevents memory leaks
        if (stockfish.current) {
            stockfish.current.terminate()
            console.log('Terminated stockfish')
        }

        console.log('gameType', gameType.current)
        if (gameType.current == 'multiplayer') return

        // Initialize the worker and set the skill level
        if (window.Worker) {
            stockfish.current = new Worker('/stockfish/stockfish.js')
            stockfish.current.onmessage = stockfishMessage
            stockfish.current?.postMessage(
                'setoption name Skill Level value ' + difficulty
            )
        }

        // If it is the AI's turn, make a move
        if (game.turn() != playerColor) {
            stockfish.current?.postMessage('position fen ' + game.fen())
            stockfish.current?.postMessage('go depth 9')
        }
    }, [playerColor, difficulty, gameType.current])

    const stockfishMessage = (event: MessageEvent<any>) => {
        console.log('Stockfish said: ' + event.data)

        // If the AI is done calculating a move, make it
        if (game.turn() != playerColor && event.data.includes('bestmove')) {
            const bestMove = event.data.split(' ')[1]
            const nextMove = {
                from: bestMove.slice(0, 2),
                to: bestMove.slice(2, 4),
                promote: 'q',
            }

            makeMove(nextMove, game, 'ai', stockfish, '')
        }
    }

    return stockfish
}
