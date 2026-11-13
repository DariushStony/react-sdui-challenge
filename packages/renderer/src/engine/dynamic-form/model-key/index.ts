import type { FormModel } from '../../../core/model/form-model';

// cyrb53: a small, fast 53-bit string hash. It only has to tell two different forms apart.
function hash(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// Asking about the same object again costs nothing; the hash is computed once per object.
const keys = new WeakMap<FormModel, string>();

/**
 * What identifies a form: a key that is the same for models with the same content and different when
 * the content differs. The form engine uses it as its React key, so it starts over (nothing typed
 * leaks into the next form) when the model changes, and keeps its state when a host merely builds an
 * identical model again.
 */
function modelKey(model: FormModel): string {
  let key = keys.get(model);
  if (key === undefined) {
    key = hash(JSON.stringify(model));
    keys.set(model, key);
  }
  return key;
}

export { modelKey };
