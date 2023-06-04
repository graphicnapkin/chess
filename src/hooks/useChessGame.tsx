import React, { useEffect, useState } from 'react'
import { Chess } from 'chess.js'

export const useChessGame = () => {
    const [game] = useState(new Chess())
    const [fen, setFen] = useState('start')
    const [gameOver, setGameOver] = useState(false)
    const [gameResult, setGameResult] = useState('')
    const [playerColor, setPlayerColor] = useState('w')
    const [capturedPieces, setCapturedPieces] = useState<string[]>([])

    useEffect(() => {
        // Add slight delay to capture of pieces so to not interfere with the move animation
        setTimeout(() => {
            setCapturedPieces(getCapturedPieces(game))
        }, 499)
    }, [game.moveNumber()])

    const undoMove = () => {
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

    const makeMove = (
        move: {
            from: string
            to: string
            piece?: string
            promotion?: string
        },
        game: Chess,
        stockfish?: React.MutableRefObject<Worker | null>
    ) => {
        try {
            game.move({ ...move, promotion: 'q' })
            if (stockfish) {
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

    const currentTurn = game.turn() === 'w' ? 'White' : 'Black'

    return {
        game,
        fen,
        setFen,
        gameOver,
        gameResult,
        undoMove,
        currentTurn,
        setPlayerColor,
        playerColor,
        capturedPieces,
        makeMove,
        resetGame,
    }
}
