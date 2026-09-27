import { useReducer } from 'react';
import type { Board, Result } from '../engine/types';
import { isLegalMove } from '../engine/board';
import { currentPlayer } from '../engine/player';
import { evaluate } from '../engine/rules';
import { gameReducer, initialGameState } from './gameReducer';
import { buildStatusMessage } from './status';

export interface GameView {
  readonly board: Board;
  readonly result: Result;
  readonly status: string;
  isCellPlayable(index: number): boolean;
  playCell(index: number): void;
}

export function useGame(): GameView {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { board } = state;
  const turn = currentPlayer(board);
  const result = evaluate(board);
  const status = buildStatusMessage(result, turn);

  return {
    board,
    result,
    status,
    isCellPlayable(index: number): boolean {
      return isLegalMove(board, index);
    },
    playCell(index: number): void {
      dispatch({ type: 'MOVE', index });
    },
  };
}
