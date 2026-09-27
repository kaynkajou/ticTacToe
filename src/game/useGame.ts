import { useReducer } from 'react';
import type { Board, Result } from '../engine/types';
import { isLegalMove } from '../engine/board';
import { currentPlayer } from '../engine/player';
import { gameReducer, initialGameState } from './gameReducer';
import { buildStatusMessage } from './status';

export interface GameView {
  readonly board: Board;
  readonly status: string;
  isCellPlayable(index: number): boolean;
  playCell(index: number): void;
}

export function useGame(): GameView {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { board } = state;
  const turn = currentPlayer(board);
  // Plan 01-02 replaces this constant with evaluate(board); Task 2 proves the
  // path end to end with the game always in progress.
  const result: Result = { status: 'in-progress' };
  const status = buildStatusMessage(result, turn);

  return {
    board,
    status,
    isCellPlayable(index: number): boolean {
      return isLegalMove(board, index);
    },
    playCell(index: number): void {
      dispatch({ type: 'MOVE', index });
    },
  };
}
