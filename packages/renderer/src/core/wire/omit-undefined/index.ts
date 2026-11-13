type Defined<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
};

/**
 * Removes keys whose value is undefined. The model's optional properties are declared without
 * `| undefined` (exactOptionalPropertyTypes), so a parsed optional value must be left out, not set
 * to undefined. The one cast is safe because the filter and the type say the same thing.
 */
function omitUndefined<T extends Record<string, unknown>>(value: T): Defined<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as Defined<T>;
}

export { omitUndefined };
