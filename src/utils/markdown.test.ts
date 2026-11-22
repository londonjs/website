import { describe, test, expect } from 'vitest';
import { markdownToHtml } from './markdown';

describe('markdownToHtml', () => {
  test('wraps plain text in a paragraph', async () => {
    expect(await markdownToHtml('Hello')).toBe('<p>Hello</p>');
  });

  test('converts bold text', async () => {
    expect(await markdownToHtml('**hi**')).toBe('<p><strong>hi</strong></p>');
  });

  test('converts a bullet list', async () => {
    expect(await markdownToHtml('- a\n- b')).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
  });

  test('converts a link', async () => {
    expect(await markdownToHtml('[a](https://x.com)')).toBe('<p><a href="https://x.com">a</a></p>');
  });

  test('returns an empty string for empty input', async () => {
    expect(await markdownToHtml('')).toBe('');
  });

  test('drops raw HTML', async () => {
    expect(await markdownToHtml('<script>x</script>\n\nhi')).toBe('<p>hi</p>');
  });
});
