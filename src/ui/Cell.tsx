import type { Cell as CellValue } from '../engine/types';
import { cellLabel } from './cellLabel';
import styles from './Cell.module.css';

interface CellProps {
  index: number;
  value: CellValue;
  isPlayable: boolean;
  onActivate: (index: number) => void;
}

/**
 * A single native-button cell (D-05, Pattern 4). Occupied/unplayable cells
 * carry aria-disabled, never the native disabled attribute, so they stay
 * focusable. Enter/Space activate a native button for free.
 */
export function Cell({ index, value, isPlayable, onActivate }: CellProps) {
  return (
    <button
      type="button"
      className={styles.cell}
      aria-label={cellLabel(index, value)}
      aria-disabled={!isPlayable}
      onClick={() => {
        if (isPlayable) {
          onActivate(index);
        }
      }}
    >
      {value}
    </button>
  );
}
