import type { Board } from '../engine/types';
import { applyMove, emptyBoard, isLegalMove } from '../engine/board';
import { currentPlayer } from '../engine/player';

export interface GameState {
  readonly board: Board;
  readonly round: number;
}

export type GameAction =
  | { readonly type: 'MOVE'; readonly index: number }
  | { readonly type: 'NEW_ROUND' };

export const initialGameState: GameState = { board: emptyBoard(), round: 0 };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE': {
      if (!isLegalMove(state.board, action.index)) {
        return state;
      }
      return {
        board: applyMove(state.board, action.index, currentPlayer(state.board)),
        round: state.round,
      };
    }
    case 'NEW_ROUND': {
      return { board: emptyBoard(), round: state.round + 1 };
    }
    default:
      return state;
  }
}
