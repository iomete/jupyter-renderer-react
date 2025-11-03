import { ReactNode, createElement } from 'react';

export const pythonSyntaxColorsDark = {
  keyword: 'var(--jp-mirror-editor-keyword-color, #4caf50)',
  string: 'var(--jp-mirror-editor-string-color, #ff7070)',
  comment: 'var(--jp-mirror-editor-comment-color, #408080)',
  number: 'var(--jp-mirror-editor-number-color, #66bb6a)',
  operator: 'var(--jp-mirror-editor-operator-color, #d48fff)',
  function: 'var(--jp-mirror-editor-def-color, #1e88e5)',
  variable: 'var(--jp-mirror-editor-variable-color, #e0e0e0)',
  builtin: 'var(--jp-mirror-editor-builtin-color, #43a047)',
  decorator: 'var(--jp-mirror-editor-builtin-color, #43a047)',
  className: 'var(--jp-mirror-editor-builtin-color, #43a047)',
  default: 'var(--jp-content-font-color0, rgba(255, 255, 255, 1))',
  background: 'var(--jp-cell-editor-background, #212121)',
  border: 'var(--jp-border-color0, #616161)',
};

export const pythonSyntaxColorsLight = {
  keyword: 'var(--jp-mirror-editor-keyword-color, #008000)',
  string: 'var(--jp-mirror-editor-string-color, #ba2121)',
  comment: 'var(--jp-mirror-editor-comment-color, #408080)',
  number: 'var(--jp-mirror-editor-number-color, #080)',
  operator: 'var(--jp-mirror-editor-operator-color, #7800c2)',
  function: 'var(--jp-mirror-editor-def-color, #00f)',
  variable: 'var(--jp-mirror-editor-variable-color, #212121)',
  builtin: 'var(--jp-mirror-editor-builtin-color, #008000)',
  decorator: 'var(--jp-mirror-editor-builtin-color, #008000)',
  className: 'var(--jp-mirror-editor-builtin-color, #008000)',
  default: 'var(--jp-content-font-color0, rgba(0, 0, 0, 1))',
  background: 'var(--jp-cell-editor-background, #f5f5f5)',
  border: 'var(--jp-border-color0, #bdbdbd)',
};

// Python keywords
const keywords = new Set([
  'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
  'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
  'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
  'True', 'False', 'None'
]);

// Python built-in functions
const builtins = new Set([
  'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes', 'callable',
  'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod',
  'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr',
  'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance',
  'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min',
  'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'range',
  'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod',
  'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip', '__import__'
]);

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'variable' | 'builtin' | 'decorator' | 'className' | 'default';
  value: string;
  start: number;
  end: number;
}

export function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    // Skip whitespace but preserve it
    if (/\s/.test(char)) {
      const start = i;
      while (i < code.length && /\s/.test(code[i])) {
        i++;
      }
      tokens.push({
        type: 'default',
        value: code.slice(start, i),
        start,
        end: i
      });
      continue;
    }

    // Comments
    if (char === '#') {
      const start = i;
      while (i < code.length && code[i] !== '\n') {
        i++;
      }
      tokens.push({
        type: 'comment',
        value: code.slice(start, i),
        start,
        end: i
      });
      continue;
    }

    // Strings (single and double quotes, including triple quotes)
    if (char === '"' || char === "'") {
      const quote = char;
      const start = i;
      i++; // Skip opening quote
      
      // Check for triple quotes
      const isTriple = code.slice(i, i + 2) === quote + quote;
      if (isTriple) {
        i += 2; // Skip the other two quotes
        // Find closing triple quotes
        while (i < code.length - 2) {
          if (code.slice(i, i + 3) === quote + quote + quote) {
            i += 3;
            break;
          }
          i++;
        }
      } else {
        // Single/double quoted string
        while (i < code.length && code[i] !== quote) {
          if (code[i] === '\\') {
            i += 2; // Skip escaped character
          } else {
            i++;
          }
        }
        if (i < code.length) i++; // Skip closing quote
      }
      
      tokens.push({
        type: 'string',
        value: code.slice(start, i),
        start,
        end: i
      });
      continue;
    }

    // Numbers
    if (/\d/.test(char) || (char === '.' && /\d/.test(code[i + 1]))) {
      const start = i;
      while (i < code.length && /[\d.eE+-]/.test(code[i])) {
        i++;
      }
      tokens.push({
        type: 'number',
        value: code.slice(start, i),
        start,
        end: i
      });
      continue;
    }

    // Operators and punctuation
    if (/[+\-*/%=<>!&|^~()[\]{},.:;]/.test(char)) {
      const start = i;
      // Handle multi-character operators
      if (i < code.length - 1) {
        const twoChar = code.slice(i, i + 2);
        if (['==', '!=', '<=', '>=', '//', '**', '<<', '>>', '&&', '||', '+=', '-=', '*=', '/='].includes(twoChar)) {
          i += 2;
        } else {
          i++;
        }
      } else {
        i++;
      }
      tokens.push({
        type: 'operator',
        value: code.slice(start, i),
        start,
        end: i
      });
      continue;
    }

    // Decorators
    if (char === '@') {
      const start = i;
      i++; // Skip @
      while (i < code.length && /[a-zA-Z0-9_.]/.test(code[i])) {
        i++;
      }
      tokens.push({
        type: 'decorator',
        value: code.slice(start, i),
        start,
        end: i
      });
      continue;
    }

    // Identifiers (keywords, functions, variables, etc.)
    if (/[a-zA-Z_]/.test(char)) {
      const start = i;
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        i++;
      }
      const value = code.slice(start, i);
      
      let type: Token['type'] = 'default';
      
      if (keywords.has(value)) {
        type = 'keyword';
      } else if (builtins.has(value)) {
        type = 'builtin';
      } else {
        // Check if it's followed by '(' (function call)
        let j = i;
        while (j < code.length && /\s/.test(code[j])) j++;
        if (j < code.length && code[j] === '(') {
          type = 'function';
        } else {
          // Check if it starts with capital letter (class name convention)
          if (/^[A-Z]/.test(value)) {
            type = 'className';
          } else {
            type = 'variable';
          }
        }
      }
      
      tokens.push({
        type,
        value,
        start,
        end: i
      });
      continue;
    }

    // Default case - single character
    tokens.push({
      type: 'default',
      value: char,
      start: i,
      end: i + 1
    });
    i++;
  }

  return tokens;
}

export function highlightPythonCode(code: string, isDark: boolean = true): ReactNode[] {
  const tokens = tokenizePython(code);
  const colors = isDark ? pythonSyntaxColorsDark : pythonSyntaxColorsLight;
  
  return tokens.map((token, index) => {
    const color = colors[token.type];
    
    if (token.type === 'default' && token.value.trim() === '') {
      // Preserve whitespace as-is
      return token.value;
    }
    
    return createElement(
      'span',
      {
        key: index,
        style: {
          color,
          fontWeight: token.type === 'keyword' ? 'bold' : 'normal',
        }
      },
      token.value
    );
  });
}

// Helper function to get the appropriate color scheme
export function getPythonSyntaxColors(isDark: boolean = true) {
  return isDark ? pythonSyntaxColorsDark : pythonSyntaxColorsLight;
}