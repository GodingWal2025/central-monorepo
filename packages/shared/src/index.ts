// @gxo/shared – shared utility package
// Add shared utilities, constants, or helpers here as the project grows.

/**
 * Maps each `T | null` property to `T | undefined`. Ontology objects use `null` to
 * mirror the database; app-side models use optional (`?:`) fields. This keeps them
 * assignable to one another.
 */
export type DeNull<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

/**
 * Shallow-copy an object, converting every `null` value to `undefined`. Use at the
 * boundary where ontology objects become app-side models (which expect optionals).
 */
export function denull<T extends object>(obj: T): DeNull<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = value === null ? undefined : value;
  }
  return out as DeNull<T>;
}
