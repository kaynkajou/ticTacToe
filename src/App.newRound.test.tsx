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

async function expectFreshBoard(): Promise<void> {
  const cells = getCellButtons();
  for (const cell of cells) {
    expect(cell).toHaveAccessibleName(/, empty$/);
  }
  expect(screen.getByRole('status')).toHaveTextContent("X's turn");
  const topLeftCell = screen.getByRole('button', {
    name: 'Row 1, column 1, empty',
  });
  expect(topLeftCell).toHaveFocus();
}

/**
 * Plays a move order using Tab/Enter only, starting from document.body.
 * Tracks the logical tab position so backward moves (e.g. 3 then 1) use
 * shift+Tab, and forward moves use plain Tab.
 */
async function playMovesByKeyboard(
  user: UserEvent,
  order: readonly number[],
): Promise<void> {
  let current = -1; // -1 represents "before cell 0" (document.body)
  for (const target of order) {
    const delta = target - current;
    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        await user.tab();
      }
    } else {
      for (let i = 0; i < -delta; i++) {
        await user.tab({ shift: true });
      }
    }
    await user.keyboard('{Enter}');
    current = target;
  }
}

async function expectTabOrderVisitsCellsThenNewRound(
  user: UserEvent,
  newRoundButton: HTMLElement,
): Promise<void> {
  // Reset focus to document.body: body isn't natively focusable in jsdom,
  // so a direct document.body.focus() call is a no-op when something else
  // already holds focus. Blurring the current element returns focus to the
  // body the same way a real browser does when nothing else claims it.
  (document.activeElement as HTMLElement | null)?.blur();
  for (let row = 1; row <= 3; row++) {
    for (let column = 1; column <= 3; column++) {
      await user.tab();
      const expectedIndex = (row - 1) * 3 + (column - 1);
      const cells = getCellButtons();
      expect(document.activeElement).toBe(cells[expectedIndex]);
    }
  }
  await user.tab();
  expect(document.activeElement).toBe(newRoundButton);
}

describe('App (New round mid-game)', () => {
  it('New round mid-game clears the board and focuses Row 1, column 1', async () => {
    const user = userEvent.setup();
    render(<App />);

    const cells = getCellButtons();
    const firstMove = cells[0];
    const secondMove = cells[4];
    if (!firstMove || !secondMove) {
      throw new Error('expected 9 cell buttons');
    }
    await user.click(firstMove);
    await user.click(secondMove);

    const newRoundButton = getNewRoundButton();
    await user.click(newRoundButton);

    const cellsAfter = getCellButtons();
    for (const cell of cellsAfter) {
      expect(cell).toHaveAccessibleName(/, empty$/);
      expect(cell).toHaveAttribute('aria-disabled', 'false');
    }

    expect(screen.getByRole('status')).toHaveTextContent("X's turn");

    const topLeftCell = screen.getByRole('button', {
      name: 'Row 1, column 1, empty',
    });
    expect(topLeftCell).toHaveFocus();
  });
});

describe('App (New round: game-over focus, description, and edge cases)', () => {
  it('focus moves to New round after a win and its description is the result', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Top-row win: X plays 0, 1, 2; O plays 3, 4.
    await playMovesByKeyboard(user, [0, 3, 1, 4, 2]);

    const newRoundButton = getNewRoundButton();
    expect(newRoundButton).toHaveFocus();
    expect(newRoundButton).toHaveAccessibleDescription('X wins!');

    await user.keyboard('{Enter}');

    expect(screen.getByRole('status')).toHaveTextContent("X's turn");
    const cellsAfter = getCellButtons();
    for (const cell of cellsAfter) {
      expect(cell).toHaveAccessibleName(/, empty$/);
    }
    const topLeftCell = screen.getByRole('button', {
      name: 'Row 1, column 1, empty',
    });
    expect(topLeftCell).toHaveFocus();
  });

  it('focus moves to New round after a draw', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    await playMoves(user, cells, [0, 1, 2, 4, 3, 5, 7, 6, 8]);

    const newRoundButton = getNewRoundButton();
    expect(newRoundButton).toHaveFocus();
    expect(newRoundButton).toHaveAccessibleDescription("It's a draw");
  });

  it('New round is always enabled and follows the cells in Tab order', async () => {
    const user = userEvent.setup();
    render(<App />);
    const newRoundButton = getNewRoundButton();

    function expectAlwaysEnabled(): void {
      expect(newRoundButton).not.toHaveAttribute('disabled');
      expect(newRoundButton).not.toHaveAttribute('aria-disabled');
      expect(newRoundButton).not.toBeDisabled();
    }

    // Empty board.
    expectAlwaysEnabled();
    await expectTabOrderVisitsCellsThenNewRound(user, newRoundButton);

    // Mid-game (after 2 moves).
    const cells = getCellButtons();
    await user.click(cells[0] as HTMLElement);
    await user.click(cells[3] as HTMLElement);
    expectAlwaysEnabled();

    // Finish the game as a win.
    await user.click(cells[1] as HTMLElement);
    await user.click(cells[4] as HTMLElement);
    await user.click(cells[2] as HTMLElement);
    expectAlwaysEnabled();

    // After a result.
    await expectTabOrderVisitsCellsThenNewRound(user, newRoundButton);
  });

  it('New round works at 0 moves, mid-game and after a result', async () => {
    // 0 moves.
    {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      await user.click(getNewRoundButton());
      await expectFreshBoard();
      unmount();
    }

    // Mid-game.
    {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      const cells = getCellButtons();
      await playMoves(user, cells, [0, 4]);
      await user.click(getNewRoundButton());
      await expectFreshBoard();
      unmount();
    }

    // After a result.
    {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      const cells = getCellButtons();
      await playMoves(user, cells, [0, 3, 1, 4, 2]);
      await user.click(getNewRoundButton());
      await expectFreshBoard();
      unmount();
    }
  });

  it('pressing New round twice still leaves an empty board with focus on the first cell', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    await playMoves(user, cells, [0, 4]);
    await user.click(getNewRoundButton());
    await user.click(getNewRoundButton());

    await expectFreshBoard();
  });

  it('the status stays the same single live region across New round', async () => {
    const user = userEvent.setup();
    render(<App />);
    const statusBefore = screen.getByRole('status');

    const cells = getCellButtons();
    await playMoves(user, cells, [0, 4]);
    await user.click(getNewRoundButton());

    const statusAfter = screen.getByRole('status');
    expect(statusAfter).toBe(statusBefore);

    const liveRegions = document.querySelectorAll('[aria-live]');
    expect(liveRegions).toHaveLength(1);
    expect(liveRegions[0]).toHaveAttribute('aria-live', 'polite');
  });

  it('has no axe violations after a result and after New round', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const cells = getCellButtons();

    await playMoves(user, cells, [0, 3, 1, 4, 2]);
    const resultsAfterWin = await axe(container);
    expect(resultsAfterWin).toHaveNoViolations();

    await user.click(getNewRoundButton());
    const resultsAfterNewRound = await axe(container);
    expect(resultsAfterNewRound).toHaveNoViolations();
  });
});
