import React, { useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import { writeNewFen } from '../firebase'

export const useChessGame = (p: string) => {
    const [game] = useState(new Chess())
    const [fen, setFen] = useState('start')
    const [gameOver, setGameOver] = useState(false)
    const [gameResult, setGameResult] = useState('')
    const [playerColor, setPlayerColor] = useState(p)
    const [capturedPieces, setCapturedPieces] = useState<string[]>([])

    useEffect(() => {
        // Add slight delay to capture of pieces so to not interfere with the move animation
        setTimeout(() => {
            setCapturedPieces(getCapturedPieces(game))
        }, 499)
    }, [game.moveNumber()])

    const undoMove = () => {
        // undo twice to go back to the current players move
        game.undo()
        game.undo()
        setFen(game.fen())
    }

    const getCapturedPieces = (chess: Chess) => {
        console.log('checking for captured peices')
        const history = chess.history({ verbose: true })
        let capturedPieces = []

        for (let move of history) {
            if (move.captured) {
                // The color of the captured piece is the opposite of the color of the current move.
                const color = move.color === 'w' ? 'b' : 'w'
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
            console.log('gameId', gameId)
            game.move({ ...move, promotion: 'q' })
            writeNewFen(move, playerColor, gameId)
            if (gameType != 'multiplayer' && stockfish) {
                console.log('got here')
                stockfish.current?.postMessage('position fen ' + game.fen())
                stockfish.current?.postMessage('go depth 8')
            }
            setCapturedPieces(getCapturedPieces(game))
            setFen(game.fen())

            if (game.isCheckmate()) {
                setGameOver(true)
                setGameResult('Checkmate!')
            } else if (game.isDraw()) {
                setGameOver(true)
                setGameResult('Draw!')
            }
        } catch (err) {
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
