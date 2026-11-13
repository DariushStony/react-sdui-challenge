// @vitest-environment node
import { parseSize } from '.';

// TC-U01. Sizes in the legacy payload are strings such as "5MB"; units are powers of 1024 (FR-28).
describe('parseSize', () => {
  it.each([
    ['5MB', 5 * 1024 * 1024],
    ['500KB', 500 * 1024],
    ['1.5MB', 1.5 * 1024 * 1024],
    ['5 mb', 5 * 1024 * 1024],
    ['2GB', 2 * 1024 ** 3],
    ['1024', 1024],
    ['1024B', 1024],
    ['0', 0],
    ['  7kb  ', 7 * 1024],
    ['0.5KB', 512],
  ])('reads %j as %d bytes', (input, bytes) => {
    expect(parseSize(input)).toBe(bytes);
  });

  it('rounds a fractional byte count down', () => {
    expect(parseSize('1.5B')).toBe(1);
  });

  it.each(['abc', '', '   ', '5TB', 'MB', '-5MB', '1.2.3MB', '5 MB MB', '5,5MB'])(
    'rejects %j',
    (input) => {
      expect(parseSize(input)).toBeNull();
    },
  );
});
