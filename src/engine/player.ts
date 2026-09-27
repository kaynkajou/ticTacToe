import type { Board, Mark } from './types';

export function currentPlayer(board: Board, firstPlayer: Mark = 'X'): Mark {
  const moveCount = board.filter((cell) => cell !== null).length;
  const other: Mark = firstPlayer === 'X' ? 'O' : 'X';
  return moveCount % 2 === 0 ? firstPlayer : other;
}
