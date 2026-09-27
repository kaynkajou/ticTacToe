import { describe, expect, it } from 'vitest';
import { buildStatusMessage } from './status';

describe('buildStatusMessage (D-03, the single status-message builder)', () => {
  it('builds the in-progress turn messages', () => {
    expect(buildStatusMessage({ status: 'in-progress' }, 'X')).toBe("X's turn");
    expect(buildStatusMessage({ status: 'in-progress' }, 'O')).toBe("O's turn");
  });

  it('builds the win messages', () => {
    expect(buildStatusMessage({ status: 'win', winner: 'X', winningLine: [0, 1, 2] }, 'X')).toBe(
      'X wins!',
    );
    expect(buildStatusMessage({ status: 'win', winner: 'O', winningLine: [0, 1, 2] }, 'O')).toBe(
      'O wins!',
    );
  });

  it('builds the draw message using the ASCII apostrophe (U+0027)', () => {
    const message = buildStatusMessage({ status: 'draw' }, 'X');
    expect(message).toBe("It's a draw");
    expect(message.charCodeAt(2)).toBe(39);
  });
});
