import React from 'react'
import ClassicPieces from '../assets/chesspieces'

export const pieceStyles = [
    { id: 'classic', name: 'Classic' },
    { id: 'chessnut', name: 'Chessnut' },
    { id: 'spatial', name: 'Spatial' },
] as const
export type PieceStyle = typeof pieceStyles[number]['id']
export type PieceCode = keyof typeof ClassicPieces

export function readPieceStyle(): PieceStyle {
    try {
        const saved = localStorage.getItem('gnap-piece-style')
        return pieceStyles.find(style => style.id === saved)?.id ?? 'classic'
    } catch { return 'classic' }
}

export function PieceGraphic({ piece, style, size }: { piece: PieceCode; style: PieceStyle; size: number }) {
    if (style === 'classic') return React.cloneElement(ClassicPieces[piece], {
        width: size, height: size, viewBox: '0 0 45 45',
        'aria-hidden': true, focusable: false,
        style: { display: 'block', width: size, height: size, pointerEvents: 'none' },
    })
    return <img src={`/ui/pieces/${style}/${piece}.svg`} alt="" aria-hidden="true" draggable={false}
        width={size} height={size} style={{ display: 'block', width: size, height: size, objectFit: 'contain', pointerEvents: 'none' }} />
}

// Stable renderers keep the board's drag-and-drop pieces mounted during ordinary moves.
export function createBoardPieces(style: PieceStyle) {
    return Object.fromEntries((Object.keys(ClassicPieces) as PieceCode[]).map(piece => [piece,
        ({ squareWidth }: { squareWidth: number }) => <PieceGraphic piece={piece} style={style} size={squareWidth} />,
    ]))
}

export default function PieceStylePicker({ value, onChange }: { value: PieceStyle; onChange: (value: PieceStyle) => void }) {
    return <fieldset className="piece-picker">
        <legend>Piece style</legend>
        <div className="piece-options">
            {pieceStyles.map(style => <label className="piece-option" key={style.id}>
                <input type="radio" name="piece-style" value={style.id} checked={value === style.id} onChange={() => onChange(style.id)} />
                <span className="piece-preview" aria-hidden="true">
                    <PieceGraphic piece="wN" style={style.id} size={36} />
                    <PieceGraphic piece="bN" style={style.id} size={36} />
                </span>
                <span className="piece-style-name">{style.name}<span className="piece-selected" aria-hidden="true">✓</span></span>
            </label>)}
        </div>
    </fieldset>
}
