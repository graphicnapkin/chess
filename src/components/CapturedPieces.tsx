import React from 'react'
import Pieces, { pieceValues } from '../assets/chesspieces'

const CapturedPieces = ({
    pieces,
    color,
}: {
    pieces: string[]
    color: 'w' | 'b'
}) => {
    let playerScore =
        pieces
            .filter((piece) => piece[0] == color)
            .reduce(
                (a, b) =>
                    a +
                    Math.abs(pieceValues[(b[0] + b[1].toUpperCase()) as 'wP']),
                0
            ) -
        pieces
            .filter((piece) => piece[0] != color)
            .reduce(
                (a, b) =>
                    a +
                    Math.abs(pieceValues[(b[0] + b[1].toUpperCase()) as 'wP']),
                0
            )

    return (
        <div className="flex flex-row" style={{ minHeight: '45px' }}>
            {pieces
                .filter((piece) => piece[0] == color)
                .map((piece, index) => (
                    <div key={index}>
                        {Pieces[(piece[0] + piece[1].toUpperCase()) as 'wP']}
                    </div>
                ))}
            {playerScore > 0 && (
                <div className="text-green-500">+{playerScore}</div>
            )}
            {playerScore < 0 && (
                <div className="text-red-500">{playerScore}</div>
            )}
        </div>
    )
}

export default CapturedPieces
