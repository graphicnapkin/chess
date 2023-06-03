import React from 'react'

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

export default InfoDisplay
