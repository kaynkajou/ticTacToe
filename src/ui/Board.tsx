import type { Ref } from 'react';
import type { Board as BoardValue, WinLine } from '../engine/types';
import { Cell } from './Cell';
import { strikeLineId } from './strikeLine';
import styles from './Board.module.css';

interface BoardProps {
  board: BoardValue;
  isCellPlayable: (index: number) => boolean;
  onPlay: (index: number) => void;
  winningLine: WinLine | null;
  firstCellRef?: Ref<HTMLButtonElement>;
}

/**
 * A CSS-grid board of 9 cells in a labelled group. Never a live region, and
 * never a grid/gridcell/row ARIA role. firstCellRef (D-10) is attached to
 * the cell at index 0 only.
 *
 * When winningLine is set, the three winning cells get isWinning (driving
 * their accessible-name suffix and data-winning), and one aria-hidden
 * strike element is rendered after the cells with data-line identifying
 * its orientation (D-01/D-02) -- decorative for assistive tech, since the
 * cells' own ", winning" labels already carry that meaning.
 */
export function Board({
  board,
  isCellPlayable,
  onPlay,
  winningLine,
  firstCellRef,
}: BoardProps) {
  const winningIndices = winningLine === null ? null : new Set(winningLine);
  return (
    <div className={styles.board} role="group" aria-label="Game board">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isPlayable={isCellPlayable(index)}
          isWinning={winningIndices?.has(index) ?? false}
          onActivate={onPlay}
          ref={index === 0 ? firstCellRef : undefined}
        />
      ))}
      {winningLine !== null && (
        <span
          aria-hidden="true"
          className={styles.strike}
          data-line={strikeLineId(winningLine)}
        />
      )}
    </div>
  );
}
