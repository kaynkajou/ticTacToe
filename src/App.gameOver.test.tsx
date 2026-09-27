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

async function expectBoardLocked(
  user: UserEvent,
  cells: HTMLElement[],
): Promise<void> {
  const status = screen.getByRole('status');
  const namesBefore = cells.map((cell) => cell.getAttribute('aria-label'));
  const statusBefore = status.textContent;

  for (const cell of cells) {
    expect(cell).toHaveAttribute('aria-disabled', 'true');
    expect(cell).not.toHaveAttribute('disabled');
    cell.focus();
    expect(cell).toHaveFocus();
  }

  const target = cells[0];
  if (!target) {
    throw new Error('expected at least one cell');
  }
  await user.click(target);
  target.focus();
  await user.keyboard('{Enter}');
  await user.keyboard(' ');

  const namesAfter = cells.map((cell) => cell.getAttribute('aria-label'));
  expect(namesAfter).toEqual(namesBefore);
  expect(status.textContent).toBe(statusBefore);
}

describe('App (game-over outcomes through the real engine)', () => {
  it('a completed top row ends the game', async () => {
    const user = userEvent.setup();
    render(<App />);

    const cells = getCellButtons();
    // X: 0 (Row1,col1), 1 (Row1,col2), 2 (Row1,col3) -- top row
    // O: 3 (Row2,col1), 4 (Row2,col2)
    const moveOrder = [0, 3, 1, 4, 2];
    for (const index of moveOrder) {
      const cell = cells[index];
      if (!cell) {
        throw new Error(`expected cell at index ${index}`);
      }
      await user.click(cell);
    }

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('X wins!');

    const remainingCell = cells[5];
    if (!remainingCell) {
      throw new Error('expected cell at index 5');
    }
    expect(remainingCell).toHaveAccessibleName('Row 2, column 3, empty');
    await user.click(remainingCell);
    expect(remainingCell).toHaveAccessibleName('Row 2, column 3, empty');
    expect(status).toHaveTextContent('X wins!');

    for (const cell of cells) {
      expect(cell).toHaveAttribute('aria-disabled', 'true');
      expect(cell).not.toHaveAttribute('disabled');
      cell.focus();
      expect(cell).toHaveFocus();
    }
  });

  it('O wins on the middle row', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    await playMoves(user, cells, [0, 3, 1, 4, 8, 5]);

    expect(screen.getByRole('status')).toHaveTextContent('O wins!');
  });

  it('a full board with no line is a draw', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    await playMoves(user, cells, [0, 1, 2, 4, 3, 5, 7, 6, 8]);

    expect(screen.getByRole('status')).toHaveTextContent("It's a draw");
    for (const cell of cells) {
      expect(cell.textContent).toMatch(/^[XO]$/);
    }
  });

  it('a line completed on the 9th move is a win, not a draw', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    await playMoves(user, cells, [0, 1, 2, 3, 5, 4, 7, 6, 8]);

    expect(screen.getByRole('status')).toHaveTextContent('X wins!');
    for (const cell of cells) {
      expect(cell.textContent).toMatch(/^[XO]$/);
    }
  });

  it('the board locks after a result', async () => {
    const drawUser = userEvent.setup();
    const { unmount: unmountDraw } = render(<App />);
    const drawCells = getCellButtons();
    await playMoves(drawUser, drawCells, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
    await expectBoardLocked(drawUser, drawCells);
    unmountDraw();

    const winUser = userEvent.setup();
    render(<App />);
    const winCells = getCellButtons();
    await playMoves(winUser, winCells, [0, 3, 1, 4, 2]);
    await expectBoardLocked(winUser, winCells);
  });

  it('announces the result in the same single live region', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cells = getCellButtons();

    const status = screen.getByRole('status');
    await playMoves(user, cells, [0, 3, 1, 4]);

    // Accumulate via the callback itself, not only observer.takeRecords():
    // the observer's own queued microtask can drain the pending-record queue
    // before a synchronous takeRecords() call gets a turn, since `await`
    // already yields at least one microtask checkpoint. Flushing a microtask
    // tick after each action and merging any residual with takeRecords()
    // makes the read deterministic either way.
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver((records) => {
      mutations.push(...records);
    });
    observer.observe(status, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    const finalCell = cells[2];
    if (!finalCell) {
      throw new Error('expected cell at index 2');
    }
    await user.click(finalCell);
    await Promise.resolve();
    mutations.push(...observer.takeRecords());

    expect(mutations.length).toBeGreaterThanOrEqual(1);

    expect(document.body.contains(status)).toBe(true);
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('X wins!');

    const liveRegions = document.querySelectorAll('[aria-live]');
    expect(liveRegions).toHaveLength(1);
    expect(liveRegions[0]).toHaveAttribute('aria-live', 'polite');

    mutations.length = 0;
    const lockedCell = cells[5];
    if (!lockedCell) {
      throw new Error('expected cell at index 5');
    }
    await user.click(lockedCell);
    await Promise.resolve();
    mutations.push(...observer.takeRecords());

    expect(mutations).toHaveLength(0);
    observer.disconnect();
  });

  it('has no axe violations in the win and draw states', async () => {
    const winUser = userEvent.setup();
    const { container: winContainer, unmount: unmountWin } = render(<App />);
    const winCells = getCellButtons();
    await playMoves(winUser, winCells, [0, 3, 1, 4, 2]);
    const winResults = await axe(winContainer);
    expect(winResults).toHaveNoViolations();
    unmountWin();

    const drawUser = userEvent.setup();
    const { container: drawContainer } = render(<App />);
    const drawCells = getCellButtons();
    await playMoves(drawUser, drawCells, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
    const drawResults = await axe(drawContainer);
    expect(drawResults).toHaveNoViolations();
  });
});
