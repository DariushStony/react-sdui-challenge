import { useEffect, useRef, useState } from 'react';
import { fileKey } from '../../../core/file-list/file-key';

const isImage = (file: File): boolean => file.type.startsWith('image/');

/**
 * Thumbnail addresses for the image files in a list, keyed by `fileKey`.
 *
 * An address is created once per file and released as soon as its file leaves the list or the
 * component goes away: the browser keeps the whole file in memory for as long as an address to it
 * exists (PRD FR-29).
 */
function useObjectUrls(files: readonly File[]): ReadonlyMap<string, string> {
  const created = useRef(new Map<string, string>());
  const [urls, setUrls] = useState<ReadonlyMap<string, string>>(new Map());

  useEffect(() => {
    const wanted = new Map(files.filter(isImage).map((file) => [fileKey(file), file]));
    for (const [key, url] of created.current) {
      if (!wanted.has(key)) {
        URL.revokeObjectURL(url);
        created.current.delete(key);
      }
    }
    for (const [key, file] of wanted) {
      if (!created.current.has(key)) created.current.set(key, URL.createObjectURL(file));
    }
    setUrls(new Map(created.current));
  }, [files]);

  useEffect(
    () => () => {
      for (const url of created.current.values()) URL.revokeObjectURL(url);
      created.current.clear();
    },
    [],
  );

  return urls;
}

export { useObjectUrls };
