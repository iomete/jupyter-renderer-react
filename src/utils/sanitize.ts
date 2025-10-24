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
  sanitized = sanitized.replace(/<(\w+)([^>]*)>/gi, (match, tagName, attributes) => {
    const tag = tagName.toLowerCase();
    
    if (!allowedTags.includes(tag)) {
      return '';
    }
    
    // Parse and filter attributes
    const cleanedAttrs = attributes.replace(/(\w+)\s*=\s*["']([^"']+)["']/gi, 
      (attrMatch: string, attrName: string, attrValue: string) => {
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
  // Basic ANSI to HTML conversion
  const ansiColors: Record<string, string> = {
    '30': 'black',
    '31': 'red',
    '32': 'green',
    '33': 'yellow',
    '34': 'blue',
    '35': 'magenta',
    '36': 'cyan',
    '37': 'white',
    '90': 'gray',
    '91': 'lightred',
    '92': 'lightgreen',
    '93': 'lightyellow',
    '94': 'lightblue',
    '95': 'lightmagenta',
    '96': 'lightcyan',
    '97': 'white',
  };
  
  // Remove ANSI escape codes and convert to spans with colors
  return text.replace(/\x1b\[(\d+)m/g, (match, code) => {
    const color = ansiColors[code];
    if (color) {
      return `<span style="color: ${color}">`;
    }
    if (code === '0') {
      return '</span>';
    }
    return '';
  });
}