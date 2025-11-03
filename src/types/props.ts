import { ReactNode, CSSProperties } from 'react';
import { Cell, JupyterNotebook } from './notebook';

// File path input type
export interface NotebookFilePath {
  filePath: string;
}

// Fetch options for file loading
export interface FetchOptions {
  headers?: Record<string, string>;
  timeout?: number;
  credentials?: RequestCredentials;
}

// Main component props
export interface JupiterNotebookViewerProps {
  // Core data
  notebook: JupyterNotebook | string | NotebookFilePath; // Accept parsed object, raw JSON string, or file path
  
  // Styling approach
  className?: string;              // Root container class
  classNames?: ClassNames;         // Granular classes for each element
  styles?: Styles;                 // Inline styles
  theme?: 'light' | 'dark' | Theme; // Predefined or custom theme
  
  // Feature toggles
  showCellNumbers?: boolean;       // Show execution counts (default: true)
  showOutputs?: boolean;           // Toggle output visibility (default: true)
  collapsible?: boolean;           // Allow collapsing cells (default: false)
  
  // Rendering options
  renderMarkdown?: (content: string) => ReactNode;  // Custom markdown renderer
  renderCode?: (code: string, language: string) => ReactNode; // Custom syntax highlighter
  renderImage?: (src: string, alt?: string) => ReactNode; // Custom image renderer
  renderHtml?: (html: string) => ReactNode; // Custom HTML renderer
  renderError?: (error: { ename: string; evalue: string; traceback: string[] }) => ReactNode;
  
  // File loading options (only used when notebook is a file path)
  fetchOptions?: FetchOptions;
  
  // Event handlers
  onCellClick?: (cell: Cell, index: number) => void;
  onError?: (error: Error) => void;
  onFileLoad?: (notebook: JupyterNotebook) => void;
  onFileError?: (error: Error) => void;
  
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

// Predefined themes using JupyterLab CSS variables
export const themes = {
  light: {
    name: 'light',
    colors: {
      background: 'var(--jp-layout-color0, white)',
      backgroundAlt: 'var(--jp-layout-color1, white)',
      text: 'var(--jp-content-font-color0, rgba(0, 0, 0, 1))',
      textSecondary: 'var(--jp-cell-prompt-not-active-font-color, #616161)',
      border: 'var(--jp-border-color0, #bdbdbd)',
      codeBg: 'var(--jp-cell-editor-background, #f5f5f5)',
      codeText: 'var(--jp-content-font-color0, rgba(0, 0, 0, 1))',
      markdownBg: 'var(--jp-layout-color0, white)',
      outputBg: 'var(--jp-layout-color0, white)',
      errorBg: 'var(--jp-error-color3, #ffcdd2)',
      errorText: 'var(--jp-error-color0, #b71c1c)',
      errorBorder: 'var(--jp-error-color1, #d32f2f)',
      stdoutText: 'var(--jp-content-font-color0, rgba(0, 0, 0, 1))',
      stderrText: 'var(--jp-error-color1, #d32f2f)',
      link: 'var(--jp-content-link-color, #0d47a1)',
      linkHover: 'var(--jp-content-link-hover-color, #42a5f5)',
      buttonBg: 'var(--jp-layout-color2, #eee)',
      buttonText: 'var(--jp-content-font-color0, rgba(0, 0, 0, 1))',
      buttonHover: 'var(--jp-layout-color3, #bdbdbd)',
      success: 'var(--jp-success-color1, #388e3c)',
      warning: 'var(--jp-warn-color1, #f57c00)',
      info: 'var(--jp-info-color1, #0097a7)',
    },
    spacing: {
      xs: '2px',
      sm: 'var(--jp-cell-padding, 5px)',
      md: '8px',
      lg: '12px',
      xl: '16px',
      cell: '0px',
      cellPadding: 'var(--jp-cell-padding, 5px)',
      outputPadding: 'var(--jp-cell-padding, 5px)',
    },
    fonts: {
      base: 'var(--jp-content-font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif)',
      code: 'var(--jp-code-font-family, Menlo, Consolas, "DejaVu Sans Mono", monospace)',
      markdown: 'var(--jp-content-font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif)',
    },
    fontSize: {
      xs: '0.75rem',
      sm: 'var(--jp-ui-font-size1, 13px)',
      base: 'var(--jp-content-font-size1, 14px)',
      lg: '1.125rem',
      xl: '1.25rem',
      code: 'var(--jp-code-font-size, 13px)',
    },
    borderRadius: {
      sm: 'var(--jp-border-radius, 2px)',
      md: 'var(--jp-border-radius, 2px)',
      lg: 'var(--jp-border-radius, 2px)',
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
      background: 'var(--jp-layout-color0, #111)',
      backgroundAlt: 'var(--jp-layout-color1, #212121)',
      text: 'var(--jp-content-font-color0, rgba(255, 255, 255, 1))',
      textSecondary: 'var(--jp-cell-prompt-not-active-font-color, #e0e0e0)',
      border: 'var(--jp-border-color0, #616161)',
      codeBg: 'var(--jp-cell-editor-background, #212121)',
      codeText: 'var(--jp-content-font-color0, rgba(255, 255, 255, 1))',
      markdownBg: 'var(--jp-layout-color0, #111)',
      outputBg: 'var(--jp-layout-color1, #212121)',
      errorBg: 'var(--jp-error-color3, #ffcdd2)',
      errorText: 'var(--jp-error-color1, #f44336)',
      errorBorder: 'var(--jp-error-color1, #f44336)',
      stdoutText: 'var(--jp-content-font-color0, rgba(255, 255, 255, 1))',
      stderrText: 'var(--jp-error-color1, #f44336)',
      link: 'var(--jp-content-link-color, #64b5f6)',
      linkHover: 'var(--jp-content-link-hover-color, #42a5f5)',
      buttonBg: 'var(--jp-layout-color2, #424242)',
      buttonText: 'var(--jp-content-font-color0, rgba(255, 255, 255, 1))',
      buttonHover: 'var(--jp-layout-color3, #616161)',
      success: 'var(--jp-success-color1, #4caf50)',
      warning: 'var(--jp-warn-color1, #ff9800)',
      info: 'var(--jp-info-color1, #00bcd4)',
    },
    spacing: {
      xs: '2px',
      sm: 'var(--jp-cell-padding, 5px)',
      md: '8px',
      lg: '12px',
      xl: '16px',
      cell: '0px',
      cellPadding: 'var(--jp-cell-padding, 5px)',
      outputPadding: 'var(--jp-cell-padding, 5px)',
    },
    fonts: {
      base: 'var(--jp-content-font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif)',
      code: 'var(--jp-code-font-family, Menlo, Consolas, "DejaVu Sans Mono", monospace)',
      markdown: 'var(--jp-content-font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif)',
    },
    fontSize: {
      xs: '0.75rem',
      sm: 'var(--jp-ui-font-size1, 13px)',
      base: 'var(--jp-content-font-size1, 14px)',
      lg: '1.125rem',
      xl: '1.25rem',
      code: 'var(--jp-code-font-size, 13px)',
    },
    borderRadius: {
      sm: 'var(--jp-border-radius, 2px)',
      md: 'var(--jp-border-radius, 2px)',
      lg: 'var(--jp-border-radius, 2px)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    },
  },
} as const;

export type PredefinedTheme = keyof typeof themes;