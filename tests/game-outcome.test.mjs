import test from 'node:test'
import assert from 'node:assert/strict'
import { Chess } from 'chess.js'
import { getGameOutcome } from '../src/gameOutcome.ts'

test('checkmate results use the player seat for either winning color', () => {
 for (const [moves, winner] of [
  [['f3','e5','g4','Qh4#'], 'b'],
  [['e4','e5','Bc4','Nc6','Qh5','Nf6','Qxf7#'], 'w'],
 ]) {
  const game = new Chess(); moves.forEach(move => game.move(move))
  assert.equal(getGameOutcome(game, winner).outcome, 'won')
  assert.equal(getGameOutcome(game, winner === 'w' ? 'b' : 'w').outcome, 'lost')
  assert.equal(getGameOutcome(game, winner).winner, winner)
 }
})
test('draw results describe stalemate, material, repetition and fifty moves', () => {
 for (const [fen, reason] of [
  ['7k/5K2/6Q1/8/8/8/8/8 b - - 0 1', /Stalemate/],
  ['7k/8/8/8/8/8/8/7K w - - 0 1', /enough material/],
  ['7k/8/8/8/8/8/R7/7K w - - 100 51', /Fifty moves/],
 ]) {
  const result=getGameOutcome(new Chess(fen),'w')
  assert.equal(result.outcome,'draw');assert.equal(result.winner,null);assert.match(result.reason,reason)
 }
 const game=new Chess();['Nf3','Nf6','Ng1','Ng8','Nf3','Nf6','Ng1','Ng8'].forEach(move=>game.move(move))
 assert.match(getGameOutcome(game,'b').reason,/three times/)
 assert.equal(getGameOutcome(new Chess(),'w'),null)
})
