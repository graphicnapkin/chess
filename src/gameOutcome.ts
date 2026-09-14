import type { Chess } from 'chess.js'

export function getGameOutcome(game: Chess, playerColor: 'w' | 'b') {
    if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'b' : 'w'
        return { heading: 'Checkmate', outcome: winner === playerColor ? 'won' : 'lost', winner, reason: `${winner === 'w' ? 'White' : 'Black'} wins by checkmate.` } as const
    }
    if (!game.isDraw()) return null
    const reason = game.isStalemate() ? 'Stalemate. No legal moves remain.'
        : game.isInsufficientMaterial() ? 'Neither side has enough material to checkmate.'
        : game.isThreefoldRepetition() ? 'The same position occurred three times.'
        : game.isDrawByFiftyMoves() ? 'Fifty moves without a pawn move or capture.'
        : 'The game ended in a draw.'
    return { heading: 'Draw', outcome: 'draw', winner: null, reason } as const
}
