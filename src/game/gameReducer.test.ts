import { describe, expect, it } from 'vitest';
import { gameReducer, initialGameState } from './gameReducer';
import { emptyBoard } from '../engine/board';

describe('gameReducer', () => {
  it('NEW_ROUND returns an empty board and increments round', () => {
    // From mid-game.
    let midGame = gameReducer(initialGameState, { type: 'MOVE', index: 0 });
    midGame = gameReducer(midGame, { type: 'MOVE', index: 4 });
    const afterMidGameNewRound = gameReducer(midGame, { type: 'NEW_ROUND' });
    expect(afterMidGameNewRound.board).toEqual(emptyBoard());
    expect(afterMidGameNewRound.round).toBe(1);

    // From a finished (won) game.
    let finished = initialGameState;
    for (const index of [0, 3, 1, 4, 2]) {
      finished = gameReducer(finished, { type: 'MOVE', index });
    }
    const afterFinishedNewRound = gameReducer(finished, { type: 'NEW_ROUND' });
    expect(afterFinishedNewRound.board).toEqual(emptyBoard());
    expect(afterFinishedNewRound.round).toBe(1);
  });

  it('NEW_ROUND on an empty board still increments round', () => {
    const afterNewRound = gameReducer(initialGameState, { type: 'NEW_ROUND' });
    expect(afterNewRound.board).toEqual(emptyBoard());
    expect(afterNewRound.round).toBe(1);
  });

  it('MOVE keeps the round and places the derived mark', () => {
    const afterNewRound = gameReducer(initialGameState, { type: 'NEW_ROUND' });
    expect(afterNewRound.round).toBe(1);

    const afterMove = gameReducer(afterNewRound, { type: 'MOVE', index: 0 });
    expect(afterMove.round).toBe(1);
    expect(afterMove.board[0]).toBe('X');
  });

  it('an illegal MOVE returns the same state object', () => {
    // Occupied cell.
    const occupiedState = gameReducer(initialGameState, {
      type: 'MOVE',
      index: 0,
    });
    const afterOccupied = gameReducer(occupiedState, {
      type: 'MOVE',
      index: 0,
    });
    expect(afterOccupied).toBe(occupiedState);

    // Out-of-range index.
    const afterOutOfRange = gameReducer(occupiedState, {
      type: 'MOVE',
      index: 9,
    });
    expect(afterOutOfRange).toBe(occupiedState);

    // Move after a win.
    let finished = initialGameState;
    for (const index of [0, 3, 1, 4, 2]) {
      finished = gameReducer(finished, { type: 'MOVE', index });
    }
    const afterGameOver = gameReducer(finished, { type: 'MOVE', index: 5 });
    expect(afterGameOver).toBe(finished);
  });
});
