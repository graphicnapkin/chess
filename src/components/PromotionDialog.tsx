import React, { useEffect, useRef } from 'react'

export default function PromotionDialog({ onChoose, onCancel }: {
    onChoose: (piece: string) => void; onCancel: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null)
    useEffect(() => {
        const element = dialog.current
        element?.showModal()
        return () => element?.close()
    }, [])
    return <dialog ref={dialog} className="promotion" aria-labelledby="promotion-heading" onCancel={onCancel} onKeyDown={event => {
        if (event.key !== 'Tab') return
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button')
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    }}>
        <p id="promotion-heading">Promote your pawn</p>
        <div className="promotion-actions">
            {[['q', 'Queen'], ['r', 'Rook'], ['b', 'Bishop'], ['n', 'Knight']].map(([piece, label]) =>
                <button autoFocus={piece === 'q'} key={piece} onClick={() => onChoose(piece)}>{label}</button>)}
        </div>
        <button className="promotion-cancel" onClick={onCancel}>Cancel</button>
    </dialog>
}
