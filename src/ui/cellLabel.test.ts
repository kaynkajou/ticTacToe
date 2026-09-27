import { describe, expect, it } from 'vitest';
import { cellLabel } from './cellLabel';

const LABEL_PATTERN = /^Row [1-3], column [1-3], (X|O|empty)(, winning)?$/;

describe('cellLabel (D-04 accessible-label builder)', () => {
  it('produces 9 distinct labels, all matching the D-04 pattern', () => {
    const labels = Array.from({ length: 9 }, (_, index) => cellLabel(index, null));
    expect(new Set(labels).size).toBe(9);
    for (const label of labels) {
      expect(label).toMatch(LABEL_PATTERN);
    }
  });

  it('gives index 1 with X exactly "Row 1, column 2, X"', () => {
    expect(cellLabel(1, 'X')).toBe('Row 1, column 2, X');
  });

  it('gives index 1 with X and isWinning true exactly "Row 1, column 2, X, winning"', () => {
    expect(cellLabel(1, 'X', true)).toBe('Row 1, column 2, X, winning');
  });

  it('ends an empty cell label in ", empty" and never contains null/undefined', () => {
    const label = cellLabel(4, null);
    expect(label.endsWith(', empty')).toBe(true);
    expect(label).not.toContain('null');
    expect(label).not.toContain('undefined');
  });

  it('uses Latin capital X (88) and O (79) char codes', () => {
    expect(cellLabel(0, 'X').charCodeAt(cellLabel(0, 'X').length - 1)).toBe(88);
    expect(cellLabel(0, 'O').charCodeAt(cellLabel(0, 'O').length - 1)).toBe(79);
  });
});
