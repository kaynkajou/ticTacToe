import { WINNING_LINES } from '../engine/rules';
import type { WinLine } from '../engine/types';

/**
 * One id per entry in WINNING_LINES, in the same order: 3 rows, 3 columns,
 * then the two diagonals (down: 0,4,8; up: 2,4,6). Drives both the CSS
 * selector for the strike element's geometry (data-line) and, indirectly,
 * this module's own lookup below.
 */
export type StrikeLineId =
  | 'row-1'
  | 'row-2'
  | 'row-3'
  | 'col-1'
  | 'col-2'
  | 'col-3'
  | 'diag-down'
  | 'diag-up';

const STRIKE_LINE_IDS: readonly StrikeLineId[] = [
  'row-1',
  'row-2',
  'row-3',
  'col-1',
  'col-2',
  'col-3',
  'diag-down',
  'diag-up',
];

/**
 * Maps a winning line to its orientation id, by finding the matching entry
 * in WINNING_LINES (same order as STRIKE_LINE_IDS above). Throws for any
 * line that is not one of the 8 winning lines -- a malformed winningLine
 * can never render a misleading strike (T-1-09).
 */
export function strikeLineId(line: WinLine): StrikeLineId {
  const index = WINNING_LINES.findIndex(
    (candidate) =>
      candidate[0] === line[0] &&
      candidate[1] === line[1] &&
      candidate[2] === line[2],
  );
  const id = index === -1 ? undefined : STRIKE_LINE_IDS[index];
  if (id === undefined) {
    throw new Error(`strikeLineId: not a winning line: [${line.join(', ')}]`);
  }
  return id;
}
