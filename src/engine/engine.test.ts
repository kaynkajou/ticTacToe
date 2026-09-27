import { describe, expect, it } from 'vitest';
import type { Board, Cell, Mark } from './types';
import { applyMove, emptyBoard, IllegalMoveError, isLegalMove } from './board';
import { currentPlayer } from './player';
import { evaluate, WINNING_LINES } from './rules';

/**
 * Test-local helper (not exported): maps a whitespace-separated layout
 * string of 'X', 'O' and '.' into a 9-cell Board, row-major. Throws unless
 * exactly 9 cells result, so a typo in a test fixture fails loudly.
 */
function boardOf(layout: string): Board {
  const chars = layout.replace(/\s+/g, '').split('');
  if (chars.length !== 9) {
    throw new Error(
      `boardOf: expected exactly 9 cells, got ${chars.length} from "${layout}"`,
    );
  }
  return chars.map((char): Cell => {
    if (char === 'X' || char === 'O') {
      return char;
    }
    if (char === '.') {
      return null;
    }
    throw new Error(`boardOf: invalid cell character "${char}"`);
  });
}

describe('evaluate', () => {
  const winCases: ReadonlyArray<
    readonly [readonly [number, number, number], Mark]
  > = WINNING_LINES.flatMap((line) =>
    (['X', 'O'] as const).map((mark) => [line, mark] as const),
  );

  it.each(winCases)(
    'detects a win on every one of the 8 winning lines (line=%o, mark=%s)',
    (line, mark) => {
      const board = emptyBoard() as Cell[];
      for (const index of line) {
        board[index] = mark;
      }
      const result = evaluate(board);
      expect(result.status).toBe('win');
      if (result.status === 'win') {
        expect(result.winner).toBe(mark);
        expect(result.winningLine).toEqual(line);
      }
    },
  );

  it('win on the 9th move is a win, not a draw', () => {
    const board = boardOf('XOX OOX OXX');
    const result = evaluate(board);
    expect(result.status).toBe('win');
    if (result.status === 'win') {
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([2, 5, 8]);
    }
    expect(board.every((cell) => cell !== null)).toBe(true);
  });

  it('full board with no line is a draw', () => {
    const board = boardOf('XOX XOO OXX');
    expect(evaluate(board)).toEqual({ status: 'draw' });
  });

  it('reports in-progress for the empty board and a single-mark board', () => {
    expect(evaluate(emptyBoard())).toEqual({ status: 'in-progress' });
    expect(evaluate(boardOf('X........'.slice(0, 9)))).toEqual({
      status: 'in-progress',
    });
  });

  it('reports in-progress with 4 marks and a win with the earliest possible 5th mark', () => {
    const fourMarks = boardOf('XX. OO. ...');
    expect(evaluate(fourMarks)).toEqual({ status: 'in-progress' });

    const fiveMarks = boardOf('XXX OO. ...');
    const result = evaluate(fiveMarks);
    expect(result.status).toBe('win');
    if (result.status === 'win') {
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 1, 2]);
    }
  });

  it('evaluates near-miss boards as in-progress', () => {
    expect(evaluate(boardOf('XX. .X. ...'))).toEqual({
      status: 'in-progress',
    });
    expect(evaluate(boardOf('XXO ... ...'))).toEqual({
      status: 'in-progress',
    });
  });

  it('reports the double-line win using the first matching line in WINNING_LINES order', () => {
    const board = boardOf('XXX XOO XOO');
    const result = evaluate(board);
    expect(result.status).toBe('win');
    if (result.status === 'win') {
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 1, 2]);
    }
  });

  it('gives the same result for the same final board regardless of move order', () => {
    const applyInOrder = (order: readonly number[]): Board => {
      let board: Board = emptyBoard();
      for (const index of order) {
        board = applyMove(board, index, currentPlayer(board));
      }
      return board;
    };

    const boardA = applyInOrder([0, 3, 1, 4, 2]);
    const boardB = applyInOrder([2, 4, 1, 3, 0]);

    expect(evaluate(boardA)).toEqual(evaluate(boardB));
  });
});

describe('WINNING_LINES', () => {
  it('has length 8, each line ascending, in the specified order', () => {
    expect(WINNING_LINES).toHaveLength(8);
    expect(WINNING_LINES).toEqual([
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]);
    for (const [a, b, c] of WINNING_LINES) {
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThan(c);
    }
  });
});

describe('currentPlayer', () => {
  it('derives the current player from the board', () => {
    expect(currentPlayer(emptyBoard())).toBe('X');

    let board: Board = emptyBoard();
    const expectedTurns: Mark[] = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
    for (let index = 0; index < 9; index += 1) {
      expect(currentPlayer(board)).toBe(expectedTurns[index]);
      board = applyMove(board, index, currentPlayer(board));
    }

    expect(currentPlayer(emptyBoard(), 'O')).toBe('O');
  });
});

describe('isLegalMove and applyMove', () => {
  it('rejects an occupied cell', () => {
    const board = boardOf('X........'.slice(0, 9));
    expect(isLegalMove(board, 0)).toBe(false);
    expect(() => applyMove(board, 0, 'O')).toThrowError(IllegalMoveError);
    try {
      applyMove(board, 0, 'O');
      expect.fail('expected applyMove to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalMoveError);
      expect((error as IllegalMoveError).reason).toBe('occupied');
    }
  });

  it('rejects out-of-range and non-integer indices', () => {
    const board = emptyBoard();
    const invalidIndices = [-1, 9, 1.5, NaN, Infinity];
    for (const index of invalidIndices) {
      expect(isLegalMove(board, index)).toBe(false);
      try {
        applyMove(board, index, 'X');
        expect.fail(`expected applyMove(${index}) to throw`);
      } catch (error) {
        expect(error).toBeInstanceOf(IllegalMoveError);
        expect((error as IllegalMoveError).reason).toBe('out-of-range');
      }
    }
  });

  it('rejects any move after game over', () => {
    // Top row already won by X; index 3 is empty.
    const board = boardOf('XXX ... ...');
    expect(evaluate(board).status).toBe('win');
    expect(isLegalMove(board, 3)).toBe(false);
    try {
      applyMove(board, 3, 'O');
      expect.fail('expected applyMove to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalMoveError);
      expect((error as IllegalMoveError).reason).toBe('game-over');
    }
  });

  it('does not mutate the input board', () => {
    const board = Object.freeze([...emptyBoard()]) as Board;
    const next = applyMove(board, 4, 'X');

    expect(next).not.toBe(board);
    expect(board.every((cell) => cell === null)).toBe(true);
    expect(next[4]).toBe('X');
  });
});
