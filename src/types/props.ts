import { ReactNode, CSSProperties } from 'react';
import { Cell, JupyterNotebook } from './notebook';

// Main component props
export interface JupiterParserProps {
  // Core data
  notebook: JupyterNotebook | string; // Accept both parsed object or raw JSON string
  
  // Styling approach
  className?: string;              // Root container class
  classNames?: ClassNames;         // Granular classes for each element
  styles?: Styles;                 // Inline styles
  theme?: 'light' | 'dark' | Theme; // Predefined or custom theme
  
  // Feature toggles
  showCellNumbers?: boolean;       // Show execution counts (default: true)
  showOutputs?: boolean;           // Toggle output visibility (default: true)
  collapsible?: boolean;           // Allow collapsing cells (default: false)
  copyable?: boolean;              // Show copy buttons for code (default: true)
  
  // Rendering options
  renderMarkdown?: (content: string) => ReactNode;  // Custom markdown renderer
  renderCode?: (code: string, language: string) => ReactNode; // Custom syntax highlighter
  renderImage?: (src: string, alt?: string) => ReactNode; // Custom image renderer
  renderHtml?: (html: string) => ReactNode; // Custom HTML renderer
  renderError?: (error: { ename: string; evalue: string; traceback: string[] }) => ReactNode;
  
  // Event handlers
  onCellClick?: (cell: Cell, index: number) => void;
  onCopy?: (content: string, type: 'code' | 'output') => void;
  onError?: (error: Error) => void;
  
  // Performance
  lazyLoad?: boolean;              // Lazy load large outputs (default: false)
  maxOutputHeight?: number | string; // Limit output height with scroll
  virtualScrolling?: boolean;      // Use virtual scrolling for large notebooks
}

// ClassNames approach for CSS modules/Tailwind
export interface ClassNames {
  root?: string;
  cell?: string;
  cellCode?: string;
  cellMarkdown?: string;
  cellRaw?: string;
  cellNumber?: string;
  cellContent?: string;
  source?: string;
  sourceCode?: string;
  sourceMarkdown?: string;
  outputs?: string;
  output?: string;
  outputText?: string;
  outputStdout?: string;
  outputStderr?: string;
  outputImage?: string;
  outputHtml?: string;
  outputError?: string;
  errorName?: string;
  errorValue?: string;
  errorTraceback?: string;
  copyButton?: string;
  collapseButton?: string;
  collapsed?: string;
}

// Styles approach for inline styles/CSS-in-JS
export interface Styles {
  root?: CSSProperties;
  cell?: CSSProperties;
  cellCode?: CSSProperties;
  cellMarkdown?: CSSProperties;
  cellRaw?: CSSProperties;
  cellNumber?: CSSProperties;
  cellContent?: CSSProperties;
  source?: CSSProperties;
  sourceCode?: CSSProperties;
  sourceMarkdown?: CSSProperties;
  outputs?: CSSProperties;
  output?: CSSProperties;
  outputText?: CSSProperties;
  outputStdout?: CSSProperties;
  outputStderr?: CSSProperties;
  outputImage?: CSSProperties;
  outputHtml?: CSSProperties;
  outputError?: CSSProperties;
  errorName?: CSSProperties;
  errorValue?: CSSProperties;
  errorTraceback?: CSSProperties;
  copyButton?: CSSProperties;
  collapseButton?: CSSProperties;
}

// Theme approach
export interface Theme {
  name?: string;
  colors: {
    background: string;
    backgroundAlt: string;
    text: string;
    textSecondary: string;
    border: string;
    codeBg: string;
    codeText: string;
    markdownBg: string;
    outputBg: string;
    errorBg: string;
    errorText: string;
    errorBorder: string;
    stdoutText: string;
    stderrText: string;
    link: string;
    linkHover: string;
    buttonBg: string;
    buttonText: string;
    buttonHover: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    cell: string;
    cellPadding: string;
    outputPadding: string;
  };
  fonts: {
    base: string;
    code: string;
    markdown: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    code: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Predefined themes
export const themes = {
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      backgroundAlt: '#f8f9fa',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
      codeBg: '#f8f9fa',
      codeText: '#212529',
      markdownBg: '#ffffff',
      outputBg: '#ffffff',
      errorBg: '#f8d7da',
      errorText: '#721c24',
      errorBorder: '#f5c6cb',
      stdoutText: '#212529',
      stderrText: '#dc3545',
      link: '#0066cc',
      linkHover: '#0052a3',
      buttonBg: '#e9ecef',
      buttonText: '#495057',
      buttonHover: '#dee2e6',
      success: '#28a745',
      warning: '#ffc107',
      info: '#17a2b8',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      cell: '1rem',
      cellPadding: '1rem',
      outputPadding: '0.75rem',
    },
    fonts: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      code: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      markdown: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      code: '0.875rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#1e1e1e',
      backgroundAlt: '#252526',
      text: '#cccccc',
      textSecondary: '#8b8b8b',
      border: '#3e3e42',
      codeBg: '#1e1e1e',
      codeText: '#d4d4d4',
      markdownBg: '#1e1e1e',
      outputBg: '#252526',
      errorBg: '#5a1d1d',
      errorText: '#f48771',
      errorBorder: '#6e2e2e',
      stdoutText: '#cccccc',
      stderrText: '#f48771',
      link: '#4fc3f7',
      linkHover: '#29b6f6',
      buttonBg: '#3e3e42',
      buttonText: '#cccccc',
      buttonHover: '#505055',
      success: '#4ec9b0',
      warning: '#ce9178',
      info: '#569cd6',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      cell: '1rem',
      cellPadding: '1rem',
      outputPadding: '0.75rem',
    },
    fonts: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      code: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      markdown: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      code: '0.875rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    },
  },
} as const;

export type PredefinedTheme = keyof typeof themes;