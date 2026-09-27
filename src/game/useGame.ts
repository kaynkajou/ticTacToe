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
  readonly newRoundRef: RefObject<HTMLButtonElement | null>;
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
  const newRoundRef = useRef<HTMLButtonElement>(null);

  // D-10: after New round clears the board (round > 0 guards the initial
  // mount, including StrictMode's double effect run), move focus to the
  // first cell.
  useEffect(() => {
    if (round > 0) {
      firstCellRef.current?.focus();
    }
  }, [round]);

  // D-08: when the game ends (win or draw), move focus to New round. These
  // two effects (this one, plus the round effect above) are the ONLY places
  // production code moves focus.
  useEffect(() => {
    if (result.status !== 'in-progress') {
      newRoundRef.current?.focus();
    }
  }, [result.status]);

  return {
    board,
    result,
    status,
    firstCellRef,
    newRoundRef,
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
