import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Chessboard from 'chessboardjsx'
import CapturedPieces from './components/CapturedPieces'
import Controls from './components/Controls'
import InfoDisplay from './components/InfoDisplay'

import { ChessMove, useChessGame } from './hooks/useChessGame'
import { useStockfishWorker } from './hooks/useStockfishWorker'
import { db, newGameId } from './firebase'
import { onValue, ref } from 'firebase/database'
import { WHITE, BLACK, AI, MULTIPLAYER } from './constants'
import GoogleAuth from './components/GoogleAuth'

// TODO: Add a timer
// TODO: Instead of auto promoting to a queen, allow the user to select the piece to promote to
// TODO: Add authentication through Firebase for the game and the database - https://firebase.google.com/docs/auth/web/firebaseui
// TODO: Restrict access to the database to only allow authenticated users to make changes
// TODO: Restrict access to the database to only allow the two players to make changes to the a given game

// Nice to haves:
// - Refactor stockfish implementation to be more straightforward like https://chessboardjsx.com/integrations/move-validation
// - Better styling for potential moves
// - Better styling for last move
// - Better styling for captured pieces
// - Better styling for game over
// - Better styling for game result
// - Better styling for controls
// - Better styling for info display
// - Better styling for footer
// - Better styling for share link
// - Better styling for new game button
// - Better styling for difficulty select

const App = () => {
    // Get the game id and player color from the url query string
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const multiplayerPlayerColor = searchParams.get('color')
    let gameId = searchParams.get('id') || newGameId || 'error'

    // Get a reference to the game in the database
    const query = ref(db, '/' + gameId)

    // styles for highlighting squares
    const [highLightStyles, setHighLightStyles] = useState<{
        [key: string]: string
    }>({})
    const [lastMoveStyles, setLastMoveStyles] = useState<{
        [key: string]: { [k: string]: string }
    }>({})

    // game settings
    const [difficulty, setDifficulty] = useState(5)
    const [gameType, setGameType] = useState<GameType>(MULTIPLAYER)
    const gameTypeRef = useRef<GameType>(gameType)

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
        handleMouseOverSquare,
    } = useChessGame(
        multiplayerPlayerColor || WHITE,
        setLastMoveStyles,
        setHighLightStyles
    )

    const stockfish = useStockfishWorker(
        game,
        difficulty,
        playerColor,
        makeMove,
        gameTypeRef
    )

    const currentTurn = game.turn() === WHITE ? 'White' : 'Black'

    useEffect(() => {
        if (gameType == AI) {
            gameTypeRef.current = AI
            return
        }

        if (gameTypeRef.current != MULTIPLAYER) {
            gameTypeRef.current = MULTIPLAYER
        }
        // Listen for changes to the game state in the database
        // and make the move if it exists
        return onValue(query, (snapshot) => {
            const data = snapshot.val() as {
                move: ChessMove
                playerColor: string
            }
            if (snapshot.exists()) {
                if (data.playerColor == playerColor) return
                makeMove(data.move, game, gameType, stockfish, gameId)
            }
        })
    }, [gameType])

    const handleMove = (move: {
        sourceSquare: string
        targetSquare: string
        piece: string
    }) => {
        const moveArgument = {
            from: move.sourceSquare,
            to: move.targetSquare,
            promote: 'q',
        }
        if (
            playerColor != game.turn() ||
            move.sourceSquare == move.targetSquare
        )
            return

        makeMove(moveArgument, game, gameType, stockfish, gameId || '')
    }

    return <GoogleAuth />

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1>Game Mode: {gameType}</h1>
            {!multiplayerPlayerColor && gameType != AI && (
                <Link
                    to={`${
                        process.env.NODE_ENV === 'development'
                            ? 'localhost:9000'
                            : 'https://graphicnapkin.com'
                    }/?id=${gameId}&color=${
                        playerColor == WHITE ? BLACK : WHITE
                    }`}
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
                color={playerColor == WHITE ? WHITE : BLACK}
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
                draggable={playerColor == game.turn() && !gameOver}
                orientation={playerColor == WHITE ? 'white' : 'black'}
                onDrop={handleMove}
                calcWidth={({ screenWidth }) => (screenWidth < 500 ? 350 : 480)}
                onMouseOverSquare={handleMouseOverSquare}
                onMouseOutSquare={() => setHighLightStyles({})}
                squareStyles={{ ...highLightStyles, ...lastMoveStyles }}
            />
            <br />
            <CapturedPieces
                pieces={capturedPieces}
                color={playerColor == WHITE ? BLACK : WHITE}
            />
            <Controls
                undoMove={undoMove}
                resetGame={() => {
                    setHighLightStyles({})
                    setLastMoveStyles({})
                    resetGame(stockfish)
                }}
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

const linkStyle = {
    color: 'blue',
    textDecoration: 'underline',
    cursor: 'pointer',
}

type GameType = 'ai' | 'multiplayer'

export default App
