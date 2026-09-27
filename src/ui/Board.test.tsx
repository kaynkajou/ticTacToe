import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Board } from './Board';
import { strikeLineId } from './strikeLine';
import { WINNING_LINES } from '../engine/rules';
import type { Board as BoardValue, WinLine } from '../engine/types';

const EXPECTED_IDS = [
  'row-1',
  'row-2',
  'row-3',
  'col-1',
  'col-2',
  'col-3',
  'diag-down',
  'diag-up',
] as const;

const CASES = WINNING_LINES.map(
  (line, index) => [EXPECTED_IDS[index], line] as const,
);

function buildBoardForLine(line: WinLine): BoardValue {
  const board: ('X' | null)[] = Array(9).fill(null);
  for (const index of line) {
    board[index] = 'X';
  }
  return board;
}

function emptyBoard(): BoardValue {
  return Array(9).fill(null);
}

describe('Board (winning line orientations)', () => {
  it.each(CASES)(
    'draws the %s strike line across its three cells',
    (id, line) => {
      const board = buildBoardForLine(line);
      render(
        <Board
          board={board}
          isCellPlayable={() => false}
          onPlay={() => {}}
          winningLine={line}
        />,
      );

      const group = screen.getByRole('group', { name: 'Game board' });
      const strikeElements = group.querySelectorAll('[data-line]');
      expect(strikeElements).toHaveLength(1);
      expect(strikeElements[0]).toHaveAttribute('data-line', id);
      expect(strikeElements[0]).toHaveAttribute('aria-hidden', 'true');

      const winningIndices = new Set<number>(line);
      const buttons = within(group).getAllByRole('button');
      let winningCount = 0;
      buttons.forEach((button, index) => {
        if (winningIndices.has(index)) {
          winningCount += 1;
          expect(button).toHaveAttribute('data-winning', 'true');
          expect(button.getAttribute('aria-label')).toMatch(/, winning$/);
        } else {
          expect(button).not.toHaveAttribute('data-winning');
          expect(button.getAttribute('aria-label')).not.toContain('winning');
        }
      });
      expect(winningCount).toBe(3);
    },
  );

  it('renders no strike line and no winning cells when winningLine is null', () => {
    render(
      <Board
        board={emptyBoard()}
        isCellPlayable={() => false}
        onPlay={() => {}}
        winningLine={null}
      />,
    );

    const group = screen.getByRole('group', { name: 'Game board' });
    expect(group.querySelectorAll('[data-line]')).toHaveLength(0);
    expect(group.querySelectorAll('[data-winning]')).toHaveLength(0);
  });

  it('strikeLineId rejects a non-winning line', () => {
    expect(() => strikeLineId([0, 1, 3])).toThrow();
  });
});
