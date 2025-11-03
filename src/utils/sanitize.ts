/**
 * Simple HTML sanitizer for basic safety without external dependencies
 * This is a basic implementation - for production use, consider DOMPurify
 */

// Allowed HTML tags for basic formatting
const ALLOWED_TAGS = [
  'p', 'div', 'span', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 'code', 'pre',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a', 'img',
  'blockquote', 'sub', 'sup',
];

// Allowed attributes for specific tags
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'title'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
  span: ['style'], // Allow style attribute for ANSI color spans
  '*': ['class', 'id'], // Allow class and id on all tags
};

// Dangerous patterns to remove
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<link\b[^>]*>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
  /data:text\/html/gi,
  /vbscript:/gi,
];

/**
 * Basic HTML sanitizer
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string,
  options: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    stripTags?: boolean;
  } = {}
): string {
  if (!html) return '';
  
  // If stripTags is true, remove all HTML
  if (options.stripTags) {
    return html.replace(/<[^>]+>/g, '');
  }
  
  let sanitized = html;
  
  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Parse allowed tags and attributes
  const allowedTags = options.allowedTags || ALLOWED_TAGS;
  const allowedAttrs = options.allowedAttributes || ALLOWED_ATTRIBUTES;
  
  // Build regex for allowed tags
  const tagNames = allowedTags.join('|');
  const tagRegex = new RegExp(`<(/?)(?!(${tagNames})\\b)[^>]+>`, 'gi');
  
  // Remove disallowed tags
  sanitized = sanitized.replace(tagRegex, '');
  
  // Clean attributes
  sanitized = sanitized.replace(/<(\w+)([^>]*)>/gi, (_, tagName, attributes) => {
    const tag = tagName.toLowerCase();
    
    if (!allowedTags.includes(tag)) {
      return '';
    }
    
    // Parse and filter attributes
    const cleanedAttrs = attributes.replace(/(\w+)\s*=\s*["']([^"']+)["']/gi, 
      (_: string, attrName: string, attrValue: string) => {
        const attr = attrName.toLowerCase();
        const allowedForTag = [...(allowedAttrs[tag] || []), ...(allowedAttrs['*'] || [])];
        
        if (!allowedForTag.includes(attr)) {
          return '';
        }
        
        // Additional checks for specific attributes
        if (attr === 'href' || attr === 'src') {
          // Ensure URLs are safe
          if (attrValue.match(/^(javascript|vbscript|data:text\/html)/i)) {
            return '';
          }
        }
        
        return `${attr}="${attrValue}"`;
      }
    );
    
    return `<${tag}${cleanedAttrs ? ' ' + cleanedAttrs : ''}>`;
  });
  
  return sanitized;
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
  
  let result = text;
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