import React, { useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import { writeMoveAndGameState } from '../firebase'
import { BLACK, WHITE } from '../constants'

export const useChessGame = (initialPlayerColor: string) => {
    const [game] = useState(new Chess())
    const [fen, setFen] = useState('start')
    const [gameOver, setGameOver] = useState(false)
    const [gameResult, setGameResult] = useState('')
    const [playerColor, setPlayerColor] = useState(initialPlayerColor)
    const [capturedPieces, setCapturedPieces] = useState<string[]>([])

    useEffect(() => {
        // Add slight delay to capture of pieces so to not interfere with the move animation, in testing half a second was sufficient
        setTimeout(() => {
            setCapturedPieces(getCapturedPieces(game))
        }, 500)
    }, [game.moveNumber()])

    const undoMove = () => {
        // undo twice to go back to the current players move
        game.undo()
        game.undo()
        setFen(game.fen())
    }

    const getCapturedPieces = (chess: Chess) => {
        const history = chess.history({ verbose: true })
        let capturedPieces = []

        for (let move of history) {
            if (move.captured) {
                // The color of the captured piece is the opposite of the color of the current move.
                const color = move.color === WHITE ? BLACK : WHITE
                capturedPieces.push(color + move.captured)
            }
        }

        return capturedPieces
    }

    const makeMove: MakeMove = (
        move,
        game,
        gameType,
        stockfish?,
        gameId = ''
    ) => {
        try {
            game.move({ ...move, promotion: 'q' })
            // If it is a multiplayer game, and the player just made a move, write it to the database
            if (gameType == 'multiplayer' && game.turn() != playerColor) {
                writeMoveAndGameState(move, playerColor, gameId, game.fen())
            }

            // If it is the AI's turn, send stockfish the current game state and tell it to make a move
            if (gameType != 'multiplayer' && stockfish) {
                stockfish.current?.postMessage('position fen ' + game.fen())
                stockfish.current?.postMessage('go depth 8')
            }

            // Update the captured pieces
            setCapturedPieces(getCapturedPieces(game))
            // Update the game state
            setFen(game.fen())

            // Check if the game is over
            if (game.isCheckmate()) {
                setGameOver(true)
                setGameResult('Checkmate!')
            } else if (game.isDraw()) {
                setGameOver(true)
                setGameResult('Draw!')
            }
        } catch (err) {
            // If the move is illegal, log an error
            console.log(err)
        }
    }

    const resetGame = (stockfish: React.MutableRefObject<Worker | null>) => {
        game.reset()
        setFen(game.fen())
        setGameOver(false)
        setGameResult('')
        if (game.turn() != playerColor) {
            stockfish.current?.postMessage('position fen ' + game.fen())
            stockfish.current?.postMessage('go depth 9')
        }
    }

    return {
        game,
        resetGame,
        fen,
        gameOver,
        gameResult,
        makeMove,
        undoMove,
        playerColor,
        setPlayerColor,
        capturedPieces,
    }
}

export type ChessMove = {
    from: string
    to: string
    piece?: string
    promotion?: string
}

export type MakeMove = (
    move: ChessMove,
    game: Chess,
    gameType: 'ai' | 'multiplayer',
    stockfish?: React.MutableRefObject<Worker | null>,
    gameId?: string
) => void
