import React, { useEffect, useState } from 'react'
import { Chess } from 'chess.js'

export const useChessGame = (
    setCapturedPieces: React.Dispatch<React.SetStateAction<string[]>>
) => {
    const [game] = useState(new Chess())
    const [fen, setFen] = useState('start')
    const [gameOver, setGameOver] = useState(false)
    const [gameResult, setGameResult] = useState('')
    const [playerColor, setPlayerColor] = useState('w')

    useEffect(() => {
        setFen(game.fen())
    }, [game])

    useEffect(() => {
        setTimeout(() => {
            setCapturedPieces(getCapturedPieces(game))
        }, 499)
    }, [game.moveNumber()])

    const checkGameStatus = () => {
        if (game.isCheckmate()) {
            setGameOver(true)
            setGameResult('Checkmate!')
        } else if (game.isDraw()) {
            setGameOver(true)
            setGameResult('Draw!')
        }
    }

    const undoMove = () => {
        game.undo()
        if (game.turn() != playerColor) {
            game.undo()
        }
        setFen(game.fen())
    }

    const getCapturedPieces = (chess: Chess) => {
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
            promotion?: string
        },
        game: Chess,
        stockfish?: React.MutableRefObject<Worker | null>
    ) => {
        try {
            const nextMove = game.move({ ...move, promotion: 'q' })
            console.log('position fen ' + game.fen())
            if (stockfish) {
                stockfish.current?.postMessage('position fen ' + game.fen())
                stockfish.current?.postMessage('go depth 8')
            }
            return nextMove
        } catch (err) {
            console.log(err)
        }
    }

    const currentTurn = game.turn() === 'w' ? 'White' : 'Black'

    return {
        game,
        fen,
        setFen,
        gameOver,
        setGameOver,
        gameResult,
        setGameResult,
        checkGameStatus,
        undoMove,
        currentTurn,
        setPlayerColor,
        playerColor,
        getCapturedPieces,
        makeMove,
    }
}
