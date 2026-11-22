import { describe, test, expect } from 'vitest';
import { generateSlug } from './slug';

// A timestamp without an offset is read as local time, so the formatted
// date is 2026-11-23 in every time zone (midday UTC is not, from UTC+12).
const DATE = '2026-11-23T12:00:00';

describe('generateSlug', () => {
  test('prefixes the slug with the event date', () => {
    expect(generateSlug(DATE, 'London.js @ Slack')).toBe('2026-11-23-londonjs-slack');
  });

  test('trims surrounding spaces and hyphens and collapses inner whitespace', () => {
    expect(generateSlug(DATE, '  --Hello,   World!--  ')).toBe('2026-11-23-hello-world');
  });

  test('keeps digits and existing hyphens', () => {
    expect(generateSlug(DATE, 'Node 24 & Bun-1.2')).toBe('2026-11-23-node-24-bun-12');
  });

  test('keeps underscores, which count as word characters', () => {
    expect(generateSlug(DATE, 'Snake_case Talk')).toBe('2026-11-23-snake_case-talk');
  });
});
