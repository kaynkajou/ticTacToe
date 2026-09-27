import type { Ref } from 'react';
import type { Board as BoardValue } from '../engine/types';
import { Cell } from './Cell';
import styles from './Board.module.css';

interface BoardProps {
  board: BoardValue;
  isCellPlayable: (index: number) => boolean;
  onPlay: (index: number) => void;
  firstCellRef?: Ref<HTMLButtonElement>;
}

/**
 * A CSS-grid board of 9 cells in a labelled group. Never a live region, and
 * never a grid/gridcell/row ARIA role. firstCellRef (D-10) is attached to
 * the cell at index 0 only.
 */
export function Board({
  board,
  isCellPlayable,
  onPlay,
  firstCellRef,
}: BoardProps) {
  return (
    <div className={styles.board} role="group" aria-label="Game board">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isPlayable={isCellPlayable(index)}
          onActivate={onPlay}
          ref={index === 0 ? firstCellRef : undefined}
        />
      ))}
    </div>
  );
}
