import { expect, test } from 'vitest';
import { validatePhotoQuality } from '../src/rules/photoQuality';

test('validatePhotoQuality validates correctly', () => {
  expect(validatePhotoQuality(150000, false)).toBe(true);
  expect(validatePhotoQuality(50000, false)).toBe(false); // too small
  expect(validatePhotoQuality(150000, true)).toBe(false); // blurry
});
