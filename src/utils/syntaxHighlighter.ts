import { ReactNode, createElement } from 'react';

// VS Code Dark Modern Python syntax highlighting colors
export const pythonSyntaxColorsDark = {
  keyword: '#C586C0',           // purple - def, if, for, etc.
  string: '#CE9178',            // orange - strings
  comment: '#6A9955',           // green - comments
  number: '#B5CEA8',            // light green - numbers
  operator: '#D4D4D4',          // white - +, -, =, etc.
  function: '#DCDCAA',          // yellow - function names
  variable: '#9CDCFE',          // light blue - variables
  builtin: '#4EC9B0',           // cyan - print, len, etc.
  decorator: '#4EC9B0',         // cyan - @decorator
  className: '#4EC9B0',         // cyan - class names
  default: '#D4D4D4',           // white - default text
  background: '#1E1E1E',        // dark background
};

// VS Code Light Modern Python syntax highlighting colors
export const pythonSyntaxColorsLight = {
  keyword: '#AF00DB',           // purple - def, if, for, etc.
  string: '#A31515',            // red - strings
  comment: '#008000',           // green - comments
  number: '#098658',            // dark green - numbers
  operator: '#000000',          // black - +, -, =, etc.
  function: '#795E26',          // brown - function names
  variable: '#001080',          // dark blue - variables
  builtin: '#267F99',           // teal - print, len, etc.
  decorator: '#267F99',         // teal - @decorator
  className: '#267F99',         // teal - class names
  default: '#000000',           // black - default text
  background: '#FFFFFF',        // light background
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