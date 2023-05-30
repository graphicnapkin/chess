import React, { useEffect, useState, useRef, ReactFragment } from 'react'
import Chessboard from 'chessboardjsx'
import { Chess, Square } from 'chess.js'
import Pieces from './chesspieces'

export const Game = () => {
    const [capturedWhite, setCapturedWhite] = useState<string[]>([])
    const [capturedBlack, setCapturedBlack] = useState<string[]>([])
    const [highLightStyles, setHighLightStyles] = useState<{
        [key: string]: string
    }>({})
    const [difficulty, setDifficulty] = useState(5)

    const {
        game,
        fen,
        setFen,
        gameOver,
        gameResult,
        checkGameStatus,
        undoMove,
        resetGame,
        setPlayerColor,
        playerColor,
    } = useChessGame()

    const stockfish = useStockfishWorker(game, setFen, difficulty, playerColor)

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
        if (newMove.flags.includes('c') || newMove.flags.includes('e')) {
            const piece =
                newMove.color === 'w' ? `b${move.piece}` : `w${move.piece}`

            if (newMove.color === 'w') {
                setCapturedBlack((capturedBlack) => [...capturedBlack, piece])
            } else {
                setCapturedWhite((capturedWhite) => [...capturedWhite, piece])
            }
        }
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

    // console.log('captuered black:', capturedBlack)
    // console.log('captured white:', capturedWhite)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <InfoDisplay
                gameOver={gameOver}
                gameResult={gameResult}
                currentTurn={currentTurn}
            />
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
            <Controls
                undoMove={undoMove}
                resetGame={resetGame}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                setPlayerColor={setPlayerColor}
            />
            <CapturedBlackPieces pieces={capturedBlack} />
            <CapturedWhitePieces pieces={capturedWhite} />
        </div>
    )
}

const CapturedWhitePieces = ({ pieces }: { pieces: string[] }) => (
    <div>
        {pieces.map((piece, index) => (
            <div>
                {piece}
                {Pieces[(piece[0] + piece[2]) as 'wK']}
            </div>
        ))}
    </div>
)

const CapturedBlackPieces = ({ pieces }: { pieces: string[] }) => (
    <div>
        {pieces.map((piece, index) => (
            <div>
                {piece}
                {Pieces[(piece[0] + piece[2]) as 'wK']}
            </div>
        ))}
    </div>
)

const Controls = ({
    undoMove,
    resetGame,
    difficulty,
    setDifficulty,
    setPlayerColor,
}: {
    undoMove: () => void
    resetGame: () => void
    difficulty: number
    setDifficulty: React.Dispatch<React.SetStateAction<number>>
    setPlayerColor: React.Dispatch<React.SetStateAction<string>>
}) => {
    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex space-x-4 mb-4">
                <button
                    className="btn px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={undoMove}
                >
                    Undo Move
                </button>
                <button
                    className="btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={resetGame}
                >
                    New Game
                </button>
            </div>
            <label htmlFor="difficulty" className="mb-2">
                Difficulty: {difficulty}
            </label>
            <input
                id="difficulty"
                type="range"
                defaultValue={difficulty}
                min="0"
                max="10"
                className="w-64"
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
            />
            <div className="flex items-center mt-4">
                <span className="mr-2">Player Color: </span>
                <input
                    id="playerColorWhite"
                    type="radio"
                    name="playerColor"
                    value="w"
                    defaultChecked
                    className="mr-1"
                    onChange={(e) => setPlayerColor(e.target.value)}
                />
                <label htmlFor="playerColorWhite" className="mr-4">
                    White
                </label>
                <input
                    id="playerColorBlack"
                    type="radio"
                    name="playerColor"
                    value="b"
                    className="mr-1"
                    onChange={(e) => setPlayerColor(e.target.value)}
                />
                <label htmlFor="playerColorBlack">Black</label>
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

const useChessGame = () => {
    const [game] = useState(new Chess())
    const [fen, setFen] = useState('start')
    const [gameOver, setGameOver] = useState(false)
    const [gameResult, setGameResult] = useState('')
    const [playerColor, setPlayerColor] = useState('w')

    useEffect(() => {
        setFen(game.fen())
    }, [game])

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

    const resetGame = () => {
        game.reset()
        setFen(game.fen())
        setGameOver(false)
        setGameResult('')
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
        resetGame,
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
        if (window.Worker) {
            stockfish.current = new Worker('/stockfish/stockfish.js')
            stockfish.current.onmessage = stockfishMessage
            if (playerColor == 'b') {
                stockfish.current.postMessage('position fen ' + game.fen())
                stockfish.current.postMessage('go depth 9')
            }
        }
    }, [playerColor])

    const stockfishMessage = (event: MessageEvent<any>) => {
        stockfish.current?.postMessage(
            'setoption name Skill Level value ' + difficulty
        )
        // console.log('Stockfish said: ' + event.data)

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

function get_captured_pieces(game: Chess, color: string) {
    const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 }

    for (const move of game.history({ verbose: true })) {
        if (move.hasOwnProperty('captured') && move.color !== color[0]) {
            captured[move.captured! as 'p']++
        }
    }

    return captured
}
