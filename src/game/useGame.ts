import { useEffect, useReducer, useRef, type RefObject } from 'react';
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
  readonly firstCellRef: RefObject<HTMLButtonElement | null>;
  isCellPlayable(index: number): boolean;
  playCell(index: number): void;
  newRound(): void;
}

export function useGame(): GameView {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { board, round } = state;
  const turn = currentPlayer(board);
  const result = evaluate(board);
  const status = buildStatusMessage(result, turn);
  const firstCellRef = useRef<HTMLButtonElement>(null);

  // D-10: after New round clears the board (round > 0 guards the initial
  // mount, including StrictMode's double effect run), move focus to the
  // first cell.
  useEffect(() => {
    if (round > 0) {
      firstCellRef.current?.focus();
    }
  }, [round]);

  return {
    board,
    result,
    status,
    firstCellRef,
    isCellPlayable(index: number): boolean {
      return isLegalMove(board, index);
    },
    playCell(index: number): void {
      dispatch({ type: 'MOVE', index });
    },
    newRound(): void {
      dispatch({ type: 'NEW_ROUND' });
    },
  };
}
