import type { Board } from '../engine/types';
import { applyMove, emptyBoard, isLegalMove } from '../engine/board';
import { currentPlayer } from '../engine/player';

export interface GameState {
  readonly board: Board;
}

export type GameAction = { readonly type: 'MOVE'; readonly index: number };

export const initialGameState: GameState = { board: emptyBoard() };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE': {
      if (!isLegalMove(state.board, action.index)) {
        return state;
      }
      return { board: applyMove(state.board, action.index, currentPlayer(state.board)) };
    }
    default:
      return state;
  }
}
