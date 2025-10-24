// Main entry point for the library
export { ExampleComponent } from './components/ExampleComponent';
export type { ExampleComponentProps } from './components/ExampleComponent';

// Jupiter Parser components
export { JupiterParser } from './components/JupiterParser';

// Types
export type { 
  JupiterParserProps,
  ClassNames,
  Styles,
  Theme,
  PredefinedTheme 
} from './types/props';

export type {
  JupyterNotebook,
  Cell,
  CodeCell,
  MarkdownCell,
  RawCell,
  Output,
  StreamOutput,
  DisplayDataOutput,
  ExecuteResultOutput,
  ErrorOutput,
  MimeBundle,
  NotebookMetadata,
  CellMetadata,
} from './types/notebook';

// Utilities
export { 
  parseNotebook, 
  isValidNotebook, 
  getNotebookLanguage, 
  countCellsByType 
} from './utils/parseNotebook';

export {
  isCodeCell,
  isMarkdownCell,
  isRawCell,
  isStreamOutput,
  isDisplayDataOutput,
  isExecuteResultOutput,
  isErrorOutput,
  normalizeStringArray,
} from './types/notebook';

// Themes
export { themes } from './types/props';