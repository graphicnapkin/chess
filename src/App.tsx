import React, { useState } from 'react'
import Chessboard from 'chessboardjsx'
import CapturedPieces from './components/CapturedPieces'
import Controls from './components/Controls'
import InfoDisplay from './components/InfoDisplay'

import { useChessGame } from './hooks/useChessGame'
import { useStockfishWorker } from './hooks/useStockfishWorker'

import { type Square } from 'chess.js'

const App = () => {
    const [capturedPieces, setCapturedPieces] = useState<string[]>([])
    const [highLightStyles, setHighLightStyles] = useState<{
        [key: string]: string
    }>({})
    const [difficulty, setDifficulty] = useState(5)

    const {
        game,
        fen,
        setFen,
        gameOver,
        setGameOver,
        gameResult,
        setGameResult,
        checkGameStatus,
        makeMove,
        undoMove,
        playerColor,
        setPlayerColor,
        getCapturedPieces,
    } = useChessGame(setCapturedPieces)

    const stockfish = useStockfishWorker(
        game,
        setFen,
        difficulty,
        playerColor,
        makeMove
    )

    const resetGame = () => {
        game.reset()
        setFen(game.fen())
        setGameOver(false)
        setGameResult('')
        if (game.turn() != playerColor) {
            stockfish.current?.postMessage('position fen ' + game.fen())
            stockfish.current?.postMessage('go depth 9')
        }
    }

    const movePiece = (move: { from: string; to: string; piece: string }) => {
        // If it's not the player's turn, ignore the move
        if (
            (game.turn() === 'w' && move.piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && move.piece.search(/^w/) !== -1)
        ) {
            return
        }

        const newMove = makeMove(move, game, stockfish)
        console.log('newMove: ', newMove)
        if (!newMove) return

        checkGameStatus()
        setFen(game.fen()) // Update the chessboard position
        setCapturedPieces(getCapturedPieces(game))
    }

    const handleMouseOverSquare = (square: Square) => {
        const highlightSquareStyles = {
            // Customize the style for the highlighted squares
            boxShadow: 'inset 0 0 0 4px rgba(255, 255, 0, 0.6)',
        }
        const moves = game.moves({
            square: square,
            verbose: true,
        })
        if (moves.length === 0) return
        const squares = moves.map((move) => move.to)
        const highLightStyles = squares.reduce((a, c) => {
            return {
                ...a,
                ...{
                    [c]: highlightSquareStyles,
                },
            }
        }, {})
        setHighLightStyles(highLightStyles)
    }

    const currentTurn = game.turn() === 'w' ? 'White' : 'Black'

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <InfoDisplay
                gameOver={gameOver}
                gameResult={gameResult}
                currentTurn={currentTurn}
            />
            <CapturedPieces
                pieces={capturedPieces}
                color={playerColor == 'w' ? 'w' : 'b'}
            />
            <br />
            <Chessboard
                boardStyle={{
                    borderRadius: '5px',
                    boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
                }}
                lightSquareStyle={{ backgroundColor: 'AliceBlue' }}
                darkSquareStyle={{ backgroundColor: 'CornFlowerBlue' }}
                position={fen}
                draggable={true}
                orientation={playerColor == 'w' ? 'white' : 'black'}
                onDrop={(move) => {
                    movePiece({
                        from: move.sourceSquare,
                        to: move.targetSquare,
                        piece: move.piece,
                    })
                }}
                onMouseOverSquare={handleMouseOverSquare}
                onMouseOutSquare={() => setHighLightStyles({})}
                squareStyles={highLightStyles}
            />
            <br />
            <CapturedPieces
                pieces={capturedPieces}
                color={playerColor == 'w' ? 'b' : 'w'}
            />
            <Controls
                undoMove={undoMove}
                resetGame={resetGame}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                setPlayerColor={setPlayerColor}
                playerColor={playerColor}
            />
        </main>
    )
}

export default App
