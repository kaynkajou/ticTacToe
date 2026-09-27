export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = readonly Cell[]; // always length 9, index = row * 3 + col (row-major)
export type WinLine = readonly [number, number, number];
export type Result =
  | { readonly status: 'in-progress' }
  | { readonly status: 'win'; readonly winner: Mark; readonly winningLine: WinLine }
  | { readonly status: 'draw' };
