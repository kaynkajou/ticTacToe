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

function getNewRoundButton(): HTMLElement {
  return screen.getByRole('button', { name: 'New round' });
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

function expectNoWinningCue(): void {
  const group = screen.getByRole('group', { name: 'Game board' });
  expect(group.querySelectorAll('[data-line]')).toHaveLength(0);
  expect(group.querySelectorAll('[data-winning]')).toHaveLength(0);

  const cells = getCellButtons();
  for (const cell of cells) {
    expect(cell.getAttribute('aria-label')).not.toContain('winning');
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

  it('a diagonal win strikes diag-down', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    // X: 0 (Row1,col1), 4 (Row2,col2), 8 (Row3,col3) -- diag-down. O: 1, 2.
    await playMoves(user, cells, [0, 1, 4, 2, 8]);

    const group = screen.getByRole('group', { name: 'Game board' });
    const strikeElements = group.querySelectorAll('[data-line]');
    expect(strikeElements).toHaveLength(1);
    expect(strikeElements[0]).toHaveAttribute('data-line', 'diag-down');

    expect(
      screen.getByRole('button', { name: 'Row 1, column 1, X, winning' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Row 2, column 2, X, winning' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Row 3, column 3, X, winning' }),
    ).toBeInTheDocument();
  });

  it('no strike line or winning label during play, in a draw, or after New round', async () => {
    // Mid-game after 3 moves.
    {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      const cells = getCellButtons();
      await playMoves(user, cells, [0, 1, 2]);
      expectNoWinningCue();
      unmount();
    }

    // A draw.
    {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      const cells = getCellButtons();
      await playMoves(user, cells, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
      expect(screen.getByRole('status')).toHaveTextContent("It's a draw");
      expectNoWinningCue();
      unmount();
    }

    // A top-row win, followed by New round.
    {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      const cells = getCellButtons();
      await playMoves(user, cells, [0, 3, 1, 4, 2]);
      await user.click(getNewRoundButton());
      expectNoWinningCue();
      unmount();
    }
  });

  it('the strike line is not focusable and leaves Tab order unchanged', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    await playMoves(user, cells, [0, 3, 1, 4, 2]);

    const group = screen.getByRole('group', { name: 'Game board' });
    const strikeElements = group.querySelectorAll('[data-line]');
    expect(strikeElements).toHaveLength(1);
    expect(strikeElements[0]).not.toHaveAttribute('tabindex');

    // Reset focus to document.body: body isn't natively focusable in
    // jsdom, so a direct document.body.focus() call is a no-op when
    // something else already holds focus.
    (document.activeElement as HTMLElement | null)?.blur();

    const cellsAfterWin = getCellButtons();
    for (const cell of cellsAfterWin) {
      await user.tab();
      expect(document.activeElement).toBe(cell);
    }
    await user.tab();
    expect(document.activeElement).toBe(getNewRoundButton());
  });
});
