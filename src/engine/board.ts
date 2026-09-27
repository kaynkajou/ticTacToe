import type { Board, Cell, Mark } from './types';
import { evaluate } from './rules';

export const BOARD_SIZE = 9;

export type IllegalMoveReason = 'out-of-range' | 'game-over' | 'occupied';

export class IllegalMoveError extends Error {
  readonly reason: IllegalMoveReason;
  readonly index: number;

  constructor(reason: IllegalMoveReason, index: number) {
    super(`Illegal move at index ${index}: ${reason}`);
    this.name = 'IllegalMoveError';
    this.reason = reason;
    this.index = index;
  }
}

export function emptyBoard(): Board {
  return new Array<Cell>(BOARD_SIZE).fill(null);
}

export function isLegalMove(board: Board, index: number): boolean {
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < BOARD_SIZE &&
    board[index] === null &&
    evaluate(board).status === 'in-progress'
  );
}

export function applyMove(board: Board, index: number, mark: Mark): Board {
  if (!Number.isInteger(index) || index < 0 || index >= BOARD_SIZE) {
    throw new IllegalMoveError('out-of-range', index);
  }
  if (evaluate(board).status !== 'in-progress') {
    throw new IllegalMoveError('game-over', index);
  }
  if (board[index] !== null) {
    throw new IllegalMoveError('occupied', index);
  }
  const next = [...board];
  next[index] = mark;
  return next;
}
