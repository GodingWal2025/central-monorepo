import { expect, test } from 'vitest';
import { isBatchCodeValid } from '../src/rules/batchCodeMatching';

test('isBatchCodeValid correctly validates codes', () => {
  expect(isBatchCodeValid('ABC-123', 'abc-123')).toBe(true);
  expect(isBatchCodeValid('ABC-123', 'XYZ-999')).toBe(false);
  expect(isBatchCodeValid('', '')).toBe(false);
});
