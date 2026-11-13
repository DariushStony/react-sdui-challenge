// @vitest-environment node
import { addFiles } from './add-files';
import { fileKey } from './file-key';
import { removeFile } from './remove-file';

// TC-U22. Selecting files again adds to the list; the same file (name, size, last-modified) is not
// added twice; removing a file lets the same file be added again (FR-27, EC-07, EC-09).
const file = (name: string, size = 10, lastModified = 1) => ({ name, size, lastModified });

describe('fileKey', () => {
  it('differs when the name, the size or the modified time differs', () => {
    const keys = [
      fileKey(file('a.png')),
      fileKey(file('b.png')),
      fileKey(file('a.png', 11)),
      fileKey(file('a.png', 10, 2)),
    ];
    expect(new Set(keys).size).toBe(4);
  });
});

describe('addFiles', () => {
  it('appends new files after the existing ones, in order', () => {
    const result = addFiles([file('a.png')], [file('b.png'), file('c.png')]);
    expect(result.map((f) => f.name)).toEqual(['a.png', 'b.png', 'c.png']);
  });

  it('ignores a file that is already in the list', () => {
    const result = addFiles([file('a.png')], [file('a.png')]);
    expect(result).toHaveLength(1);
  });

  it('ignores a repeat inside one selection', () => {
    const result = addFiles([], [file('a.png'), file('a.png')]);
    expect(result).toHaveLength(1);
  });

  it('keeps a file with the same name but a different size', () => {
    const result = addFiles([file('a.png', 10)], [file('a.png', 20)]);
    expect(result.map((f) => f.size)).toEqual([10, 20]);
  });

  it('does not change the list it was given', () => {
    const current = [file('a.png')];
    addFiles(current, [file('b.png')]);
    expect(current).toHaveLength(1);
  });
});

describe('removeFile', () => {
  it('removes only the file with that key', () => {
    const list = [file('a.png'), file('b.png')];
    expect(removeFile(list, fileKey(file('a.png'))).map((f) => f.name)).toEqual(['b.png']);
  });

  it('lets the same file be added again afterwards', () => {
    const afterRemoval = removeFile([file('a.png')], fileKey(file('a.png')));
    expect(addFiles(afterRemoval, [file('a.png')])).toHaveLength(1);
  });

  it('returns an equal list when the key is not present', () => {
    const list = [file('a.png')];
    expect(removeFile(list, 'missing')).toEqual(list);
  });
});
