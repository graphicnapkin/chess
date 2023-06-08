import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Chessboard from 'chessboardjsx'
import CapturedPieces from './components/CapturedPieces'
import Controls from './components/Controls'
import InfoDisplay from './components/InfoDisplay'

import { ChessMove, useChessGame } from './hooks/useChessGame'
import { useStockfishWorker } from './hooks/useStockfishWorker'
import { type Square } from 'chess.js'
import { db } from './firebase'
import { child, onValue, push, ref } from 'firebase/database'

const newGameId = push(child(ref(db), 'games')).key

const App = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    // get playerColor from params if it exists
    const multiplayerPlayerColor = searchParams.get('color')
    // get gameId from params if it exists or create a new one
    let gameId = searchParams.get('id') || newGameId || 'error'

    const [highLightStyles, setHighLightStyles] = useState<{
        [key: string]: string
    }>({})
    const [difficulty, setDifficulty] = useState(5)
    const [gameType, setGameType] = useState<'ai' | 'multiplayer'>(
        'multiplayer'
    )

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
    } = useChessGame(multiplayerPlayerColor || 'w')

    const stockfish = useStockfishWorker(
        game,
        gameType,
        difficulty,
        playerColor,
        makeMove,
        multiplayerPlayerColor
    )

    // Get the game id from the url query string if it exists

    useEffect(() => {
        if (gameType == 'ai') return
        // Listen for changes to the game state in the database
        // and make the move if it exists
        const query = ref(db, '/' + gameId)
        return onValue(query, (snapshot) => {
            const data = snapshot.val() as {
                move: ChessMove
                playerColor: string
            }
            if (snapshot.exists()) {
                console.log(data)

                makeMove(data.move, game, gameType, stockfish, gameId)
            }
        })
    }, [])

    // store the environment in a variable

    // Highlight the squares that the current piece can move to
    // if it is the current players turn and there are moves available
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
            gameType,
            stockfish,
            gameId || ''
        )
    }

    const isDev = process.env.NODE_ENV === 'development'
    const linkStyle = {
        color: 'blue',
        textDecoration: 'underline',
        cursor: 'pointer',
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1>Game Mode: {gameType}</h1>
            {!multiplayerPlayerColor && gameType != 'ai' && (
                <Link
                    to={`${
                        isDev ? 'localhost:9000' : 'https://graphicnapkin.com'
                    }/?id=${gameId}&color=${playerColor == 'w' ? 'b' : 'w'}`}
                >
                    <span style={linkStyle}>Share Link with Friend</span>
                </Link>
            )}

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
                skipConfig={multiplayerPlayerColor ? true : false}
            />
            <footer>
                Checkout this project on
                <Link to="https://github.com/graphicnapkin/chess">
                    {' '}
                    <span style={linkStyle}>Github</span>
                </Link>
            </footer>
        </main>
    )
}

export default App
