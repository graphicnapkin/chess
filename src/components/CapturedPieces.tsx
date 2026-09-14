import React from 'react'
import { pieceValues } from '../assets/chesspieces'
import { PieceCode, PieceGraphic, PieceStyle } from './PieceStylePicker'

const pieceNames = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' }

export default function CapturedPieces({ pieces, color, pieceStyle }: {
    pieces: string[]; color: 'w' | 'b'; pieceStyle: PieceStyle;
}) {
    const captured = pieces.filter(piece => piece[0] === color)
    const playerScore = pieces.reduce((score, piece) => {
        const value = Math.abs(pieceValues[(piece[0] + piece[1].toUpperCase()) as PieceCode])
        return score + (piece[0] === color ? value : -value)
    }, 0)
    return <div className="captured-pieces" aria-label={`${color === 'w' ? 'White' : 'Black'} pieces captured`}>
        {captured.map((piece, index) => {
            const code = (piece[0] + piece[1].toUpperCase()) as PieceCode
            const name = `${color === 'w' ? 'White' : 'Black'} ${pieceNames[code[1] as keyof typeof pieceNames]}`
            return <span className="captured-piece" key={index} role="img" aria-label={name} title={name}>
                <PieceGraphic piece={code} style={pieceStyle} size={28} />
            </span>
        })}
        {playerScore !== 0 && <span className="material-score">{playerScore > 0 ? '+' : ''}{playerScore}</span>}
    </div>
}
