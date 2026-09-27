import type { Cell } from '../engine/types';

/**
 * D-04 accessible-label builder: "Row {r}, column {c}, {X|O|empty}", with an
 * optional ", winning" suffix. Rows and columns are numbered from 1.
 */
export function cellLabel(index: number, value: Cell, isWinning?: boolean): string {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  const content = value ?? 'empty';
  const winningSuffix = isWinning ? ', winning' : '';
  return `Row ${row}, column ${column}, ${content}${winningSuffix}`;
}
