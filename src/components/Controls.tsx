import React, { useState } from 'react'

const Controls = ({
    undoMove,
    resetGame,
    difficulty,
    setDifficulty,
    playerColor,
    setPlayerColor,
    gameType,
    setGameType,
}: {
    undoMove: () => void
    resetGame: () => void
    difficulty: number
    setDifficulty: React.Dispatch<React.SetStateAction<number>>
    playerColor: string
    setPlayerColor: React.Dispatch<React.SetStateAction<string>>
    gameType: 'ai' | 'multiplayer'
    setGameType: React.Dispatch<React.SetStateAction<'ai' | 'multiplayer'>>
}) => {
    const [showModal, setShowModal] = useState(true)

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            {showModal && (
                <NewGameConfig
                    setShowModal={setShowModal}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    playerColor={playerColor}
                    setPlayerColor={setPlayerColor}
                    resetGame={resetGame}
                    gameType={gameType}
                    setGameType={setGameType}
                />
            )}

            <div
                className={`flex space-x-4 mb-4 opacity-${
                    showModal ? '0' : '100'
                }`}
            >
                <UndoMove undoMove={undoMove} />
                <NewGameButton setShowModal={setShowModal} />
            </div>
        </div>
    )
}

const NewGameConfig = ({
    setShowModal,
    playerColor,
    setPlayerColor,
    difficulty,
    setDifficulty,
    resetGame,
    gameType,
    setGameType,
}: {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    playerColor: string
    setPlayerColor: React.Dispatch<React.SetStateAction<string>>
    difficulty: number
    setDifficulty: React.Dispatch<React.SetStateAction<number>>
    resetGame: () => void
    gameType: 'ai' | 'multiplayer'
    setGameType: React.Dispatch<React.SetStateAction<'ai' | 'multiplayer'>>
}) => {
    const [tempColor, setTempColor] = useState(playerColor)
    const [tempDifficulty, setTempDifficulty] = useState(difficulty)
    const [tempGameType, setTempGameType] = useState(gameType)

    return (
        <section className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-sm w-300">
                <div className="flex flex-col items-start">
                    <div className="flex items-center w-full">
                        <div className="text-gray-900 font-medium text-lg mr-4">
                            Game Settings
                        </div>
                        {closeIcon(setShowModal)}
                    </div>
                    <Option label="Difficulty: ">
                        <select
                            id="difficulty"
                            className="block text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={tempDifficulty}
                            onChange={(e) =>
                                setTempDifficulty(parseInt(e.target.value))
                            }
                        >
                            {Array.from({ length: 11 }, (_, i) => i).map(
                                (value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                )
                            )}
                        </select>
                    </Option>
                    <Option label="Player Color: ">
                        <input
                            id="playerColorWhite"
                            type="radio"
                            name="playerColor"
                            value="w"
                            checked={tempColor == 'w'}
                            className="mr-1"
                            onChange={(e) => setTempColor(e.target.value)}
                        />
                        <label htmlFor="playerColorWhite" className="mr-4">
                            White
                        </label>
                        <input
                            id="playerColorBlack"
                            type="radio"
                            name="playerColor"
                            value="b"
                            checked={tempColor == 'b'}
                            className="mr-1"
                            onChange={(e) => setTempColor(e.target.value)}
                        />
                        <label htmlFor="playerColorBlack">Black</label>
                    </Option>
                    <Option label="Opponent: ">
                        <input
                            id="gameTypeAi"
                            type="radio"
                            name="gameType"
                            value="ai"
                            checked={tempGameType == 'ai'}
                            className="mr-1"
                            onChange={(e) =>
                                setTempGameType(
                                    e.target.value as 'ai' | 'multiplayer'
                                )
                            }
                        />
                        <label htmlFor="gameTypeAi" className="mr-4">
                            AI
                        </label>
                        <input
                            id="gameTypeMultiplayer"
                            type="radio"
                            name="gameType"
                            value="multiplayer"
                            checked={tempGameType == 'multiplayer'}
                            className="mr-1"
                            onChange={(e) =>
                                setTempGameType(
                                    e.target.value as 'ai' | 'multiplayer'
                                )
                            }
                        />
                        <label htmlFor="gameTypeMultiplayer">Multiplayer</label>
                    </Option>
                    <hr className="my-3" />
                    <div className="flex w-full justify-center space-x-3">
                        <button
                            className="btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            onClick={() => {
                                setPlayerColor(tempColor)
                                setDifficulty(tempDifficulty)
                                resetGame()
                                setShowModal(false)
                                setGameType(tempGameType)
                            }}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

const Option = ({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) => {
    return (
        <div className="flex items-center">
            <hr className="my-3" />
            <div className="py-1 flex items-center justify-between">
                <label htmlFor="difficulty" className="mr-8">
                    <b>{label}</b>
                </label>
                {children}
            </div>
        </div>
    )
}

const UndoMove = ({ undoMove }: { undoMove: () => void }) => {
    const [undoColor, setUndoColor] = useState('slategray')

    return (
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
    )
}

const NewGameButton = ({
    setShowModal,
}: {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    return (
        <div className="container mx-auto">
            <button
                className="btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={() => setShowModal(true)}
            >
                New Game
            </button>
        </div>
    )
}

function closeIcon(
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
) {
    return (
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
    )
}

export default Controls
