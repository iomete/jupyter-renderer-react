// Main entry point for the library

// Jupiter Parser components
export { JupiterNotebookViewer } from './components/JupyterNotebookViewer';

// Types
export type { 
  JupiterNotebookViewerProps,
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
  countCellsByType,
  parseNotebookFromFile,
  validateNotebookContent,
  getNotebookSummary
} from './utils/parseNotebook';

export {
  loadNotebookFromPath,
  isNotebookFilePath,
  getNotebookInputType,
  validateFilePath
} from './utils/fileLoader';

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