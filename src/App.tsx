import React, { useState } from 'react'
import Chessboard from 'chessboardjsx'
import CapturedPieces from './components/CapturedPieces'
import Controls from './components/Controls'
import InfoDisplay from './components/InfoDisplay'

import { useChessGame } from './hooks/useChessGame'
import { useStockfishWorker } from './hooks/useStockfishWorker'

import { type Square } from 'chess.js'
import { writeNewFen } from './firebase'
import { validate } from 'webpack'

const App = () => {
    const [highLightStyles, setHighLightStyles] = useState<{
        [key: string]: string
    }>({})
    const [difficulty, setDifficulty] = useState(5)
    const [gameType, setGameType] = useState<'ai' | 'multiplayer'>('ai')

    const {
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
    } = useChessGame()

    const stockfish = useStockfishWorker(
        game,
        difficulty,
        playerColor,
        makeMove
    )

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

    const handleMove = (move: {
        sourceSquare: string
        targetSquare: string
        piece: string
    }) => {
        makeMove(
            {
                from: move.sourceSquare,
                to: move.targetSquare,
                piece: move.piece,
            },
            game,
            stockfish
        )
    }
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1>{gameType + 'right?'}</h1>
            <h2>{gameType == 'multiplayer'}</h2>
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
                onDrop={handleMove}
                calcWidth={({ screenWidth }) => (screenWidth < 500 ? 350 : 480)}
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
                resetGame={() => resetGame(stockfish)}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                playerColor={playerColor}
                setPlayerColor={setPlayerColor}
                gameType={gameType}
                setGameType={setGameType}
            />
        </main>
    )
}

export default App
