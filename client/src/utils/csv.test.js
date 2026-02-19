import { describe, it, expect } from 'vitest';
import { escapeCsv } from './csv';

describe('escapeCsv', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeCsv(null)).toBe('');
    expect(escapeCsv(undefined)).toBe('');
  });

  it('returns value as-is when no special chars', () => {
    expect(escapeCsv('hello')).toBe('hello');
    expect(escapeCsv('Correct')).toBe('Correct');
  });

  it('wraps in quotes when value contains comma', () => {
    expect(escapeCsv('a,b')).toBe('"a,b"');
  });

  it('wraps in quotes when value contains newline', () => {
    expect(escapeCsv('line1\nline2')).toBe('"line1\nline2"');
  });

  it('escapes double quotes by doubling them', () => {
    expect(escapeCsv('say "hi"')).toBe('"say ""hi"""');
  });

  it('handles multiple special chars', () => {
    expect(escapeCsv('a,b "quoted"')).toBe('"a,b ""quoted"""');
  });
});
