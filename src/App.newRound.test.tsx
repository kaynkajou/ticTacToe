import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

function getCellButtons(): HTMLElement[] {
  const group = screen.getByRole('group', { name: 'Game board' });
  return within(group).getAllByRole('button');
}

function getNewRoundButton(): HTMLElement {
  return screen.getByRole('button', { name: 'New round' });
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
