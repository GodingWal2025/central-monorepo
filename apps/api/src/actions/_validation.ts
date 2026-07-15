// Lightweight input validation for action handlers.
//
// The action registry receives raw, untyped JSON from anonymous clients. These
// helpers keep that input from flowing straight into Prisma writes: `pick` copies
// only an explicit allow-list of columns (blocking mass-assignment of arbitrary
// fields), and the require* helpers reject malformed payloads with a clear 400.

/** Copy only the allow-listed keys that are actually present (skips `undefined`). */
export function pick(source: any, allowed: readonly string[]): any {
  const out: Record<string, any> = {};
  if (!source || typeof source !== 'object') return out;
  for (const key of allowed) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

/** Throw a 400-style error if any required field is missing/empty. */
export function requireFields(data: Record<string, any>, required: readonly string[]): void {
  const missing = required.filter(
    (k) => data[k] === undefined || data[k] === null || data[k] === '',
  );
  if (missing.length > 0) {
    throw new Error(`Missing required field(s): ${missing.join(', ')}`);
  }
}

/** Validate and return a numeric id (used by update/delete actions). */
export function requireId(params: any): number {
  const id = params?.id;
  if (typeof id !== 'number' || !Number.isInteger(id)) {
    throw new Error('A valid numeric "id" is required.');
  }
  return id;
}
