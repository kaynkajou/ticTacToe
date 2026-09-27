import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

function getCellButtons(): HTMLElement[] {
  const group = screen.getByRole('group', { name: 'Game board' });
  return within(group).getAllByRole('button');
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
});
