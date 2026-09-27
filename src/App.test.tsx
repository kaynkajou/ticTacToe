import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { run as axe } from 'axe-core';
import { App } from './App';

function getCellButtons(): HTMLElement[] {
  const group = screen.getByRole('group', { name: 'Game board' });
  return within(group).getAllByRole('button');
}

describe('App (end-to-end hot-seat turn path through the real engine)', () => {
  it('plays alternating turns through the real engine', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent("X's turn");

    const cells = getCellButtons();
    const firstCell = cells[0];
    const centerCell = cells[4];
    if (!firstCell || !centerCell) {
      throw new Error('expected 9 cell buttons');
    }

    await user.click(firstCell);
    expect(firstCell).toHaveAccessibleName('Row 1, column 1, X');
    expect(screen.getByRole('status')).toHaveTextContent("O's turn");
    expect(firstCell).toHaveAttribute('aria-disabled', 'true');

    await user.click(centerCell);
    expect(centerCell).toHaveAccessibleName('Row 2, column 2, O');
    expect(screen.getByRole('status')).toHaveTextContent("X's turn");
  });

  it('ignores an occupied cell activated by click, Enter or Space', async () => {
    const user = userEvent.setup();
    render(<App />);

    const cells = getCellButtons();
    const firstCell = cells[0];
    if (!firstCell) {
      throw new Error('expected 9 cell buttons');
    }

    await user.click(firstCell); // X now at Row 1, column 1

    const statusElement = screen.getByRole('status');
    const namesBefore = cells.map((cell) => cell.getAttribute('aria-label'));
    const statusBefore = statusElement.textContent;

    const observer = new MutationObserver(() => undefined);
    observer.observe(statusElement, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    await user.click(firstCell);
    firstCell.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    const mutations = observer.takeRecords();
    observer.disconnect();

    expect(mutations).toHaveLength(0);
    const namesAfter = cells.map((cell) => cell.getAttribute('aria-label'));
    expect(namesAfter).toEqual(namesBefore);
    expect(statusElement.textContent).toBe(statusBefore);
    expect(firstCell).toHaveFocus();
    expect(firstCell).not.toHaveAttribute('disabled');
  });

  it('renders 9 row-major cells with D-04 labels and one polite live region', async () => {
    const user = userEvent.setup();
    render(<App />);

    const cells = getCellButtons();
    expect(cells).toHaveLength(9);
    for (let row = 1; row <= 3; row++) {
      for (let column = 1; column <= 3; column++) {
        const index = (row - 1) * 3 + (column - 1);
        expect(cells[index]).toHaveAccessibleName(
          `Row ${row}, column ${column}, empty`,
        );
      }
    }

    const liveRegionsBefore = document.querySelectorAll('[aria-live]');
    expect(liveRegionsBefore).toHaveLength(1);
    expect(liveRegionsBefore[0]).toHaveAttribute('aria-live', 'polite');
    expect(liveRegionsBefore[0]).toHaveAttribute('id', 'game-status');
    const statusNodeBefore = liveRegionsBefore[0];

    const firstCell = cells[0];
    if (!firstCell) {
      throw new Error('expected 9 cell buttons');
    }
    await user.click(firstCell);

    const liveRegionsAfter = document.querySelectorAll('[aria-live]');
    expect(liveRegionsAfter).toHaveLength(1);
    expect(liveRegionsAfter[0]).toBe(statusNodeBefore);

    expect(document.querySelector('[role="grid"]')).toBeNull();
    expect(document.querySelector('[role="gridcell"]')).toBeNull();
    expect(document.querySelector('[role="row"]')).toBeNull();
  });

  it('has no axe violations mid-game', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    const cells = getCellButtons();
    const firstCell = cells[0];
    const secondCell = cells[1];
    if (!firstCell || !secondCell) {
      throw new Error('expected 9 cell buttons');
    }
    await user.click(firstCell);
    await user.click(secondCell);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
