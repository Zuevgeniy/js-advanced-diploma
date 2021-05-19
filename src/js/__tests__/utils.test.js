import { calcTileType } from '../utils';

test.each([
  [0, 'top-left'],
  [1, 'top'],
  [2, 'top-right'],
  [3, 'left'],
  [4, 'center'],
  [5, 'right'],
  [6, 'bottom-left'],
  [7, 'bottom'],
  [8, 'bottom-right'],
])(
  ('should return correct position'),
  (tile, expected) => {
    const result = calcTileType(tile, 3);
    expect(result).toBe(expected);
  },
);
