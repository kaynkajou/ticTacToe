import type { Ref } from 'react';
import type { Cell as CellValue } from '../engine/types';
import { cellLabel } from './cellLabel';
import styles from './Cell.module.css';

interface CellProps {
  index: number;
  value: CellValue;
  isPlayable: boolean;
  onActivate: (index: number) => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * A single native-button cell (D-05, Pattern 4). Occupied/unplayable cells
 * carry aria-disabled, never the native disabled attribute, so they stay
 * focusable. Enter/Space activate a native button for free.
 *
 * React 19 ref-as-prop: `ref` is an ordinary prop, no forwardRef wrapper.
 */
export function Cell({ index, value, isPlayable, onActivate, ref }: CellProps) {
  return (
    <button
      ref={ref}
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
