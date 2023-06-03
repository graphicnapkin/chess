import React from 'react'
import Pieces from '../assets/chesspieces'

const CapturedPieces = ({
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

export default CapturedPieces
