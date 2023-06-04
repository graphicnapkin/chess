import React, { useState } from 'react'

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
    const [showModal, setShowModal] = useState(true)
    const [tempColor, setTempColor] = useState(playerColor)
    const [tempDifficulty, setTempDifficulty] = useState(difficulty)

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            {showModal && (
                <Modal
                    setShowModal={setShowModal}
                    tempColor={tempColor}
                    setTempColor={setTempColor}
                    tempDifficulty={tempDifficulty}
                    setTempDifficulty={setTempDifficulty}
                    setPlayerColor={setPlayerColor}
                    setDifficulty={setDifficulty}
                    resetGame={resetGame}
                />
            )}

            <div
                className={`flex space-x-4 mb-4 opacity-${
                    showModal ? '0' : '100'
                }`}
            >
                <UndoMove
                    undoMove={undoMove}
                    undoColor={undoColor}
                    setUndoColor={setUndoColor}
                />
                <NewGame setShowModal={setShowModal} />
            </div>
        </div>
    )
}

const Modal = ({
    setShowModal,
    tempColor,
    setTempColor,
    tempDifficulty,
    setTempDifficulty,
    setPlayerColor,
    setDifficulty,
    resetGame,
}: {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    tempColor: string
    setTempColor: React.Dispatch<React.SetStateAction<string>>
    tempDifficulty: number
    setTempDifficulty: React.Dispatch<React.SetStateAction<number>>
    setPlayerColor: React.Dispatch<React.SetStateAction<string>>
    setDifficulty: React.Dispatch<React.SetStateAction<number>>
    resetGame: () => void
}) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-sm w-300">
                <div className="flex flex-col items-start">
                    <div className="flex items-center w-full">
                        <div className="text-gray-900 font-medium text-lg mr-4">
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
                    <div className="py-1 flex items-center justify-between">
                        <label htmlFor="difficulty" className="mr-8">
                            <b>Difficulty: </b>
                        </label>
                        <select
                            id="difficulty"
                            name="difficulty"
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
                    </div>
                    <div className="mr-2">
                        <b>Player Color: </b>
                    </div>
                    <div className="flex items-center">
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
                    </div>
                    <hr className="my-3" />
                    <div className="flex w-full justify-center space-x-3">
                        <button
                            className="btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            onClick={() => {
                                setPlayerColor(tempColor)
                                setDifficulty(tempDifficulty)
                                resetGame()
                                setShowModal(false)
                            }}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const UndoMove = ({
    undoMove,
    undoColor,
    setUndoColor,
}: {
    undoMove: () => void
    undoColor: string
    setUndoColor: React.Dispatch<React.SetStateAction<string>>
}) => {
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

const NewGame = ({
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

export default Controls
