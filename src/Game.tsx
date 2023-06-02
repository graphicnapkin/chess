import React, { useEffect, useState, useRef } from 'react'
import Chessboard from 'chessboardjsx'
import { Chess, Square } from 'chess.js'
import Pieces from './chesspieces'

export const Game = () => {
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
        undoMove,
        setPlayerColor,
        playerColor,
    } = useChessGame(setCapturedPieces)

    const stockfish = useStockfishWorker(game, setFen, difficulty, playerColor)

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

        const newMove = tryMove(move, game, stockfish)
        console.log('newMove: ', newMove)
        if (!newMove) return

        checkGameStatus()
        setFen(game.fen()) // Update the chessboard position
        setCapturedPieces(getCapturedPieces(game))
    }

    const currentTurn = game.turn() === 'w' ? 'White' : 'Black'

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <InfoDisplay
                gameOver={gameOver}
                gameResult={gameResult}
                currentTurn={currentTurn}
            />
            <CapturedPeices
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
            <CapturedPeices
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
        </div>
    )
}

function getCapturedPieces(chess: Chess) {
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

const CapturedPeices = ({
    pieces,
    color,
}: {
    pieces: string[]
    color: 'w' | 'b'
}) => (
    <div className="flex flex-row" style={{ minHeight: '45px' }}>
        {pieces
            .filter((piece) => piece[0] == color)
            .map((piece, index) => (
                <div key={index}>
                    {Pieces[(piece[0] + piece[1].toUpperCase()) as 'wP']}
                </div>
            ))}
    </div>
)

const Controls = ({
    undoMove,
    resetGame,
    difficulty,
    setDifficulty,
    playerColor,
    setPlayerColor,
}: {
    undoMove: () => void
    resetGame: () => void
    difficulty: number
    setDifficulty: React.Dispatch<React.SetStateAction<number>>
    playerColor: string
    setPlayerColor: React.Dispatch<React.SetStateAction<string>>
}) => {
    const [undoColor, setUndoColor] = useState('slategray')
    const [showModal, setShowModal] = useState(false)
    const [tempColor, setTempColor] = useState(playerColor)
    const [tempDifficulty, setTempDifficulty] = useState(difficulty)

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            {showModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 max-w-sm w-full">
                        <div className="flex flex-col items-start">
                            <div className="flex items-center w-full">
                                <div className="text-gray-900 font-medium text-lg">
                                    Game Settings
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4 ml-auto cursor-pointer"
                                    onClick={() => setShowModal(false)}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <hr className="my-3" />
                            <div className="py-4 flex items-center justify-between">
                                <label
                                    htmlFor="difficulty"
                                    className="mr-2 text-sm font-medium text-gray-700"
                                >
                                    Difficulty
                                </label>
                                <select
                                    id="difficulty"
                                    name="difficulty"
                                    className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={tempDifficulty}
                                    onChange={(e) =>
                                        setTempDifficulty(
                                            parseInt(e.target.value)
                                        )
                                    }
                                >
                                    {Array.from(
                                        { length: 11 },
                                        (_, i) => i
                                    ).map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center mt-4">
                                <span className="mr-2">Player Color: </span>
                                <input
                                    id="playerColorWhite"
                                    type="radio"
                                    name="playerColor"
                                    value="w"
                                    checked={tempColor == 'w'}
                                    className="mr-1"
                                    onChange={(e) =>
                                        setTempColor(e.target.value)
                                    }
                                />
                                <label
                                    htmlFor="playerColorWhite"
                                    className="mr-4"
                                >
                                    White
                                </label>
                                <input
                                    id="playerColorBlack"
                                    type="radio"
                                    name="playerColor"
                                    value="b"
                                    checked={tempColor == 'b'}
                                    className="mr-1"
                                    onChange={(e) =>
                                        setTempColor(e.target.value)
                                    }
                                />
                                <label htmlFor="playerColorBlack">Black</label>
                            </div>
                            <hr className="my-3" />
                            <div className="flex w-full justify-center space-x-3">
                                <button
                                    className="btn px-4 bg-red-500 text-white rounded hover:bg-red-700"
                                    onClick={() => {
                                        setPlayerColor(tempColor)
                                        setDifficulty(tempDifficulty)
                                        resetGame()
                                        setShowModal(false)
                                    }}
                                >
                                    New Game
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex space-x-4 mb-4">
                <div className="my-auto">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 cursor-pointer"
                        onClick={undoMove}
                        color={undoColor}
                        onMouseOver={() => setUndoColor('black')}
                        onMouseOut={() => setUndoColor('slategray')}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                    </svg>
                </div>
                <div className="container mx-auto">
                    <button
                        className="btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        onClick={() => setShowModal(true)}
                    >
                        New Game
                    </button>
                </div>
            </div>
        </div>
    )
}

const InfoDisplay = ({
    gameOver = false,
    gameResult = '',
    currentTurn = '',
}) => {
    return (
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
            {gameOver
                ? `Game Over - ${gameResult}`
                : `Current Turn: ${currentTurn}`}
        </h2>
    )
}

const tryMove = (
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

const useChessGame = (
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
    }
}

const useStockfishWorker = (
    game: Chess,
    setFen: React.Dispatch<React.SetStateAction<string>>,
    difficulty: number,
    playerColor: string
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

            tryMove(nextMove, game, stockfish)
            setFen(game.fen())
        }
    }

    return stockfish
}
