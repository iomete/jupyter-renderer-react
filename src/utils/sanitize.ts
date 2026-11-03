import createDOMPurify, { type Config } from 'dompurify';

// Keep the policy independent of hooks or configuration installed by consumers.
const purifier = createDOMPurify();

if (purifier.isSupported) {
  purifier.addHook('afterSanitizeAttributes', (node) => {
    // Marked emits disabled checkboxes for task lists. Retain their state while
    // rejecting other controls and making even raw checkbox markup inert.
    if (node.tagName === 'INPUT') {
      if (node.getAttribute('type')?.toLowerCase() === 'checkbox') {
        node.setAttribute('disabled', '');
      } else {
        node.remove();
      }
    }
  });
}

function sanitize(markup: string, config: Config): string {
  // DOMPurify needs a supported DOM. Never fall back to inserting raw markup.
  if (!purifier.isSupported) return escapeHtml(markup);
  return purifier.sanitize(markup, { ...config, RETURN_TRUSTED_TYPE: false });
}

/** HTML rendered in the parent document must not introduce styles or named nodes. */
export function sanitizeMarkdownHtml(html: string): string {
  return sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'button', 'textarea', 'select', 'option'],
    FORBID_ATTR: ['style', 'class', 'id', 'name', 'autofocus', 'form', 'formaction'],
  });
}

/** Rich output HTML. Preserve plot/table styling; render only in an isolated frame. */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    // Notebook fragments often start with plot/table CSS. Keep it in the body
    // of the isolated preview instead of losing it during document parsing.
    FORCE_BODY: true,
    USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
    ADD_TAGS: ['use'],
    FORBID_TAGS: ['form', 'input', 'button', 'textarea', 'select', 'option'],
  });
}

/** SVG styling and internal references are safe within an image, never inline. */
export function sanitizeSvg(svg: string): string {
  return sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
    FORBID_TAGS: ['foreignObject'],
  });
}

/** Escape literal text without requiring a browser DOM. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Convert ANSI escape codes to HTML
 */
export function ansiToHtml(text: string): string {
  // ANSI color mapping with proper CSS colors
  const ansiColors: Record<string, string> = {
    // Standard colors (30-37)
    '30': '#000000', // black
    '31': '#cd3131', // red
    '32': '#00A250', // green  
    '33': '#e5e510', // yellow
    '34': '#0451a5', // blue
    '35': '#bc05bc', // magenta
    '36': '#0598bc', // cyan
    '37': '#e5e5e5', // white
    
    // Bright colors (90-97)
    '90': '#666666', // bright black (gray)
    '91': '#f14c4c', // bright red
    '92': '#007427', // bright green (for bold)
    '93': '#f5f543', // bright yellow
    '94': '#3b8eea', // bright blue
    '95': '#d670d6', // bright magenta
    '96': '#29b8db', // bright cyan
    '97': '#ffffff', // bright white
  };
  
  // Escape notebook text before adding our own, fixed ANSI formatting tags.
  let result = escapeHtml(text);
  let openTags = 0;
  
  // Handle various ANSI escape sequence formats:
  // \x1b[0;31m, \x1b[31m, [0;31m, [31m, etc.
  result = result.replace(/(?:\x1b\[|\[)([0-9;]+)m/g, (_, codes) => {
    const codeList = codes.split(';');
    let html = '';
    
    for (const code of codeList) {
      if (code === '0') {
        // Reset - close all open spans
        html += '</span>'.repeat(openTags);
        openTags = 0;
      } else if (code === '1') {
        // Bold
        html += '<span style="font-weight: bold;">';
        openTags++;
      } else if (code === '4') {
        // Underline
        html += '<span style="text-decoration: underline;">';
        openTags++;
      } else if (ansiColors[code]) {
        // Color
        html += `<span style="color: ${ansiColors[code]};">`;
        openTags++;
      }
    }
    
    return html;
  });
  
  // Close any remaining open tags
  result += '</span>'.repeat(openTags);
  
  return result;
}
