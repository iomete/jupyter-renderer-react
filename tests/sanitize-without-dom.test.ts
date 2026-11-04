// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ansiToHtml, escapeHtml, sanitizeHtml } from '../src/utils/sanitize';

describe('rendering without a browser DOM', () => {
  it('fails closed when HTML cannot be sanitized', () => {
    const untrusted = '<img src=x onerror=alert(1)> & <b>text</b>';
    expect(sanitizeHtml(untrusted)).toBe(escapeHtml(untrusted));
    expect(sanitizeHtml(untrusted)).not.toContain('<img');
  });

  it('escapes plain text without relying on document', () => {
    expect(escapeHtml('<img> & text')).toBe('&lt;img&gt; &amp; text');
    expect(ansiToHtml('\u001b[31m<img> & text\u001b[0m')).toContain('&lt;img&gt; &amp; text');
    expect(ansiToHtml('\u001b[31m<img> & text\u001b[0m')).not.toContain('<img>');
  });
});
