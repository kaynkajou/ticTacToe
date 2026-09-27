import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { run as axe } from 'axe-core';
import { App } from './App';

function getCellButtons(): HTMLElement[] {
  const group = screen.getByRole('group', { name: 'Game board' });
  return within(group).getAllByRole('button');
}

async function playMoves(
  user: UserEvent,
  cells: HTMLElement[],
  order: readonly number[],
): Promise<void> {
  for (const index of order) {
    const cell = cells[index];
    if (!cell) {
      throw new Error(`expected cell at index ${index}`);
    }
    await user.click(cell);
  }
}

describe('App (winning line strike and labels)', () => {
  it('a winning row is struck through and its cells are labelled winning', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const cells = getCellButtons();

    // X: 0 (Row1,col1), 1 (Row1,col2), 2 (Row1,col3) -- top row. O: 3, 4.
    await playMoves(user, cells, [0, 3, 1, 4, 2]);

    expect(
      screen.getByRole('button', { name: 'Row 1, column 1, X, winning' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Row 1, column 2, X, winning' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Row 1, column 3, X, winning' }),
    ).toBeInTheDocument();

    const group = screen.getByRole('group', { name: 'Game board' });
    expect(group.querySelectorAll('[data-winning="true"]')).toHaveLength(3);

    const strikeElements = group.querySelectorAll('[data-line]');
    expect(strikeElements).toHaveLength(1);
    expect(strikeElements[0]).toHaveAttribute('data-line', 'row-1');
    expect(strikeElements[0]).toHaveAttribute('aria-hidden', 'true');

    const winningIndices = new Set([0, 1, 2]);
    for (const [index, cell] of cells.entries()) {
      if (winningIndices.has(index)) {
        continue;
      }
      expect(cell.getAttribute('aria-label')).not.toContain('winning');
    }

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
