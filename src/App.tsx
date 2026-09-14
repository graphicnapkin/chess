import React, { useMemo, useState } from 'react'
import Chessboard from 'chessboardjsx'
import { Chess, Square } from 'chess.js'
import { useChessGame } from './hooks/useChessGame'
import { useStockfishWorker } from './hooks/useStockfishWorker'
import { useAuth } from './hooks/useAuth'
import { useOnlineGame } from './hooks/useOnlineGame'
import { getGameOutcome } from './gameOutcome'
import GameResultDialog from './components/GameResultDialog'
import CapturedPieces from './components/CapturedPieces'
import PieceStylePicker, { createBoardPieces, readPieceStyle } from './components/PieceStylePicker'
import BoardThemePicker, { boardThemes, readBoardTheme } from './components/BoardThemePicker'
import { gameAction, supabase } from './services/supabase'

export default function App() {
    const local = useChessGame()
    const auth = useAuth()
    const invite = new URLSearchParams(window.location.search).get('game')
    const [mode, setMode] = useState<'ai' | 'multiplayer'>('ai')
    const [gameId, setGameId] = useState<string | null>(null)
    const [color, setColor] = useState<'w' | 'b'>(() => { try { return sessionStorage.getItem('gnap-color') === 'b' ? 'b' : 'w' } catch { return 'w' } })
    const [difficulty, setDifficulty] = useState(5)
    const [pieceStyle, setPieceStyle] = useState(readPieceStyle)
    const boardPieces = useMemo(() => createBoardPieces(pieceStyle), [pieceStyle])
    const [boardTheme, setBoardTheme] = useState(readBoardTheme)
    const theme = boardThemes.find(theme => theme.id === boardTheme) ?? boardThemes[0]
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [copied, setCopied] = useState(false)
    const [moveText, setMoveText] = useState('')
    const [selected, setSelected] = useState<Square | null>(null)
    const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null)
    const online = useOnlineGame(mode === 'multiplayer' ? gameId : null, auth.user?.id)
    const engine = useStockfishWorker(local.fen, difficulty, color, mode === 'ai', local.makeMove)
    const game = useMemo(() => {
        if (mode === 'ai') return local.game
        const chess = new Chess()
        for (const move of online.game?.moves ?? []) chess.move(move)
        return chess
    }, [mode, local.fen, online.game?.moves])
    const playerColor = mode === 'ai' ? color : online.game?.white_id === auth.user?.id ? 'w' : 'b'
    const participant = mode === 'ai' || (!!auth.user && (online.game?.white_id === auth.user.id || online.game?.black_id === auth.user.id))
    const result = participant ? getGameOutcome(game, playerColor) : null
    const expired = online.game ? Date.parse(online.game.expires_at) < Date.now() : false
    const canMove = !promotion && !game.isGameOver() && game.turn() === playerColor && (mode === 'ai' || (!!auth.user && online.game?.status === 'active' && !online.pending && !expired))
    const history = game.history({ verbose: true })
    const captured = history.filter(move => move.captured).map(move => (move.color === 'w' ? 'b' : 'w') + move.captured)
    const last = history[history.length - 1]
    const legal = selected ? game.moves({ square: selected, verbose: true }) : []
    const squareStyles: Record<string, React.CSSProperties> = {}
    if (last) { squareStyles[last.from] = { backgroundColor: theme.highlight }; squareStyles[last.to] = { backgroundColor: theme.highlight } }
    for (const move of legal) squareStyles[move.to] = { backgroundImage: 'radial-gradient(circle, #24293355 18%, transparent 20%)' }
    const status = game.isCheckmate() ? `Checkmate · ${result?.outcome === 'won' ? 'You won' : mode === 'ai' ? 'Stockfish won' : 'Your opponent won'}` : game.isDraw() ? 'Draw' : mode === 'multiplayer' && online.game?.status === 'waiting' ? 'Waiting for your friend' : engine.thinking && mode === 'ai' ? 'Stockfish is thinking…' : `${game.turn() === 'w' ? 'White' : 'Black'} to move${game.isCheck() ? ' · Check' : ''}`
    const submit = (from: string, to: string, piece = 'q') => {
        setSelected(null); setPromotion(null)
        if (mode === 'ai') local.makeMove({ from, to, promotion: piece })
        else void online.move(from, to, piece)
    }
    const attempt = (from: string, to: string) => {
        if (!canMove || from === to) return
        const candidates = game.moves({ square: from as Square, verbose: true }).filter(move => move.to === to)
        if (!candidates.length) return
        if (candidates.some(move => move.promotion)) setPromotion({ from, to })
        else submit(from, to)
    }
    const openGame = async (action: 'create' | 'join') => {
        setBusy(true); setError('')
        try {
            const result = await gameAction(action, action === 'join' ? { id: invite } : {})
            setGameId(result.id); setMode('multiplayer'); setSelected(null); setPromotion(null)
            window.history.replaceState(null, '', `/?game=${result.id}`)
        } catch (e) { setError(e instanceof Error ? e.message : 'Could not open this game.') }
        finally { setBusy(false) }
    }
    const startLocal = () => {
        local.reset(); setMode('ai'); setGameId(null); setSelected(null); setPromotion(null); setError('')
        window.history.replaceState(null, '', '/')
    }
    const share = async () => {
        try { await navigator.clipboard.writeText(`${window.location.origin}/?game=${gameId}`); setCopied(true) }
        catch { setError('Copy the invitation from your address bar.') }
    }
    return <main className="app-shell">
        <header className="site-header"><h1 className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>GN<span> / </span>CHESS</h1><a href="https://graphicnapkin.com">Graphicnapkin <span aria-hidden="true">↗</span></a></header>
        <section className="game-layout">
            <div className="board-panel">
                <div className="board-toolbar"><p role="status" className="game-status">{expired ? 'This game has expired' : status}</p><span className="mode-label">{mode === 'ai' ? 'Computer' : 'Online'}</span></div>
                <div className="player-bar"><span className="player-identity"><span aria-hidden="true" className={`player-avatar ${playerColor === 'w' ? 'piece-black' : 'piece-white'}`}>♟︎</span>{mode === 'ai' ? 'Stockfish' : 'Your friend'}</span><span>{playerColor === 'w' ? 'Black' : 'White'}</span></div>
                <CapturedPieces pieceStyle={pieceStyle} pieces={captured} color={playerColor} />
                <div className="board" aria-label="Chess board">
                    <Chessboard key={pieceStyle} pieces={boardPieces} position={game.fen()} orientation={playerColor === 'w' ? 'white' : 'black'} draggable={canMove}
                        onDrop={({ sourceSquare, targetSquare }) => attempt(sourceSquare, targetSquare)}
                        onSquareClick={square => {
                            if (!canMove) return
                            if (selected) attempt(selected, square)
                            setSelected(game.get(square as Square)?.color === playerColor ? square as Square : null)
                        }}
                        calcWidth={({ screenWidth }) => Math.max(200, Math.min(560, screenWidth - 64))}
                        lightSquareStyle={{ backgroundColor: theme.light }} darkSquareStyle={{ backgroundColor: theme.dark }}
                        squareStyles={squareStyles} />
                </div>
                <div className="player-bar"><span className="player-identity"><span aria-hidden="true" className={`player-avatar ${playerColor === 'w' ? 'piece-white' : 'piece-black'}`}>♟︎</span>You · {playerColor === 'w' ? 'White' : 'Black'}</span><span>{mode === 'ai' ? 'Computer game' : online.connection}</span></div>
                <CapturedPieces pieceStyle={pieceStyle} pieces={captured} color={playerColor === 'w' ? 'b' : 'w'} />
                {result && <GameResultDialog key={`${mode}:${gameId}:${game.fen()}`} result={result} playerColor={playerColor}
                    opponent={mode === 'ai' ? 'Stockfish' : 'Your opponent'} online={mode === 'multiplayer'} onNewGame={startLocal} />}
                <BoardThemePicker value={boardTheme} onChange={value => {
                    setBoardTheme(value)
                    try { localStorage.setItem('gnap-board-theme', value) } catch {}
                }} />
                <PieceStylePicker value={pieceStyle} onChange={value => {
                    setPieceStyle(value)
                    try { localStorage.setItem('gnap-piece-style', value) } catch {}
                }} />
                {promotion && <div role="dialog" aria-modal="true" aria-label="Promote pawn" className="promotion"><p>Promote your pawn</p>{[['q','Queen'],['r','Rook'],['b','Bishop'],['n','Knight']].map(([piece,label]) => <button autoFocus={piece === 'q'} key={piece} onClick={() => submit(promotion.from, promotion.to, piece)}>{label}</button>)}</div>}
            </div>
            <aside className="sidebar">
                <section className="card" aria-label="Game controls">
                    <h2>{mode === 'ai' ? 'Play the computer' : 'Play a friend'}</h2>
                    {mode === 'ai' && <><div className="settings-grid"><div><label htmlFor="color">Your pieces</label><select id="color" value={color} onChange={e => { setColor(e.target.value as 'w' | 'b'); try { sessionStorage.setItem('gnap-color',e.target.value) } catch {} local.reset(); setSelected(null); setPromotion(null) }}><option value="w">White</option><option value="b">Black</option></select></div>
                    <div><label htmlFor="difficulty">Difficulty</label><select id="difficulty" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}>{[0,2,5,8,12,16,20].map(level => <option key={level} value={level}>Level {level}</option>)}</select></div></div>
                    <div className="button-row"><button onClick={() => { local.undo(color); setSelected(null); setPromotion(null) }} disabled={!history.length}>Undo</button><button className="primary" onClick={startLocal}>New game</button></div></>}
                    {mode === 'multiplayer' && <><button onClick={share}>{copied ? 'Invitation copied' : 'Copy invitation'}</button><button onClick={startLocal}>Play the computer</button></>}
                </section>
                {(error || auth.error || online.error || engine.error) && <p role="alert" className="error">{error || auth.error || online.error || engine.error}</p>}
                <section className="card moves-card"><h2>Moves</h2><form onSubmit={e => {
                    e.preventDefault()
                    if (!canMove) return
                    try { const parsed = new Chess(game.fen()).move(moveText); submit(parsed.from, parsed.to, parsed.promotion); setMoveText(''); setError('') }
                    catch { setError('Enter a legal move, such as e4 or Nf3.') }
                }}><label htmlFor="move-entry">Enter a move (for example, e4)</label><div className="button-row"><input id="move-entry" value={moveText} onChange={e => setMoveText(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="e4, Nf3…" /><button type="submit" disabled={!canMove || !moveText}>Move</button></div></form><p className="move-list" aria-label="Move history">{history.length ? history.map((move, i) => `${i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}${move.san}`).join(' ') : 'No moves yet.'}</p>
                    <button disabled={!history.length} onClick={() => { const url = URL.createObjectURL(new Blob([game.pgn()], { type: 'application/x-chess-pgn' })); const a = document.createElement('a'); a.href = url; a.download = 'game.pgn'; a.click(); URL.revokeObjectURL(url) }}>Download PGN</button>
                </section>
                <section className="card online-card" aria-label="Online play"><h2>Play a friend</h2>
                    {!supabase ? <p>Online play is unavailable.</p> : !auth.ready ? <p>Checking sign-in…</p> : auth.user ? <><p>Signed in as {auth.user.user_metadata.full_name || auth.user.email}</p>
                    {invite && <button disabled={busy} onClick={() => void openGame('join')}>Join / resume invited game</button>}
                    <button className="primary" disabled={busy} onClick={() => void openGame('create')}>Invite a friend</button><button onClick={() => { void auth.signOut(); startLocal() }}>Sign out</button></> : <><p>Sign in to play online.</p><button className="social-button google-button" onClick={() => void auth.signIn('google')}><img src="/ui/google-g.png" width="20" height="20" alt="" />Continue with Google</button><button className="social-button" onClick={() => void auth.signIn('github')}><img src="/ui/github.svg" width="20" height="20" alt="" />Continue with GitHub</button></>}
                </section>
            </aside>
        </section>
        <footer><a href="https://graphicnapkin.com">Built by Graphicnapkin <span aria-hidden="true">↗</span></a><a href="https://github.com/graphicnapkin/chess">Source code <span aria-hidden="true">↗</span></a></footer>
    </main>
}
