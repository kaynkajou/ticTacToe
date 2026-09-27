import type { Mark, Result } from '../engine/types';

/**
 * The single status-message builder (D-03). Every place that shows a turn or
 * result string must go through this function so a future wording change
 * (Phase 3's player-name swap) is a one-spot edit.
 */
export function buildStatusMessage(result: Result, turn: Mark): string {
  switch (result.status) {
    case 'in-progress':
      return `${turn}'s turn`;
    case 'win':
      return `${result.winner} wins!`;
    case 'draw':
      return "It's a draw";
    default: {
      const exhaustiveCheck: never = result;
      return exhaustiveCheck;
    }
  }
}
