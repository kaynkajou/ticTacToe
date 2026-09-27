import type { Board, Result, WinLine } from './types';

/**
 * The 8 winning lines, in this exact order: 3 rows, then 3 columns, then 2
 * diagonals. evaluate() checks them in this order, so a double-line win
 * (two lines completed by the same move) always reports the first match
 * here as winningLine (GAME-05 precision edge).
 */
export const WINNING_LINES: readonly WinLine[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * The single source of truth for game outcome (Pitfall 1/4, CONTEXT "win,
 * then draw, then continue"). Checks every winning line first; only when
 * none matches does it check for a full board (draw), else in-progress.
 * This structure guarantees a win on the 9th move is reported as a win,
 * never a draw, because the win check always runs before the draw check.
 */
export function evaluate(board: Board): Result {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return { status: 'win', winner: mark, winningLine: line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw' };
  }
  return { status: 'in-progress' };
}
