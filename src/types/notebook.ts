// Jupyter Notebook Type Definitions
// Based on nbformat 4.x specification

// Main notebook structure
export interface JupyterNotebook {
  nbformat: number;
  nbformat_minor: number;
  metadata: NotebookMetadata;
  cells: Cell[];
}

// Notebook metadata
export interface NotebookMetadata {
  kernelspec?: {
    display_name: string;
    language: string;
    name: string;
  };
  language_info?: {
    name: string;
    version?: string;
    mimetype?: string;
    file_extension?: string;
    pygments_lexer?: string;
    codemirror_mode?: string | { name: string; version: number };
  };
  [key: string]: any; // Allow additional metadata
}

// Cell types
export type Cell = CodeCell | MarkdownCell | RawCell;

export interface BaseCell {
  cell_type: 'code' | 'markdown' | 'raw';
  metadata: CellMetadata;
  source: string | string[];
}

export interface CodeCell extends BaseCell {
  cell_type: 'code';
  execution_count: number | null;
  outputs: Output[];
}

export interface MarkdownCell extends BaseCell {
  cell_type: 'markdown';
}

export interface RawCell extends BaseCell {
  cell_type: 'raw';
}

// Cell metadata
export interface CellMetadata {
  collapsed?: boolean;
  scrolled?: boolean | 'auto';
  deletable?: boolean;
  editable?: boolean;
  format?: string;
  name?: string;
  tags?: string[];
  [key: string]: any; // Allow additional metadata
}

// Output types
export type Output = StreamOutput | DisplayDataOutput | ExecuteResultOutput | ErrorOutput;

export interface BaseOutput {
  output_type: 'stream' | 'display_data' | 'execute_result' | 'error';
}

export interface StreamOutput extends BaseOutput {
  output_type: 'stream';
  name: 'stdout' | 'stderr';
  text: string | string[];
}

export interface DisplayDataOutput extends BaseOutput {
  output_type: 'display_data';
  data: MimeBundle;
  metadata?: {
    [key: string]: any;
  };
}

export interface ExecuteResultOutput extends BaseOutput {
  output_type: 'execute_result';
  execution_count: number;
  data: MimeBundle;
  metadata?: {
    [key: string]: any;
  };
}

export interface ErrorOutput extends BaseOutput {
  output_type: 'error';
  ename: string;
  evalue: string;
  traceback: string[];
}

// MIME type bundle
export interface MimeBundle {
  'text/plain'?: string | string[];
  'text/html'?: string | string[];
  'text/markdown'?: string | string[];
  'text/latex'?: string | string[];
  'application/json'?: any;
  'application/javascript'?: string | string[];
  'image/png'?: string;
  'image/jpeg'?: string;
  'image/gif'?: string;
  'image/svg+xml'?: string | string[];
  'image/bmp'?: string;
  'text/csv'?: string | string[];
  'text/tab-separated-values'?: string | string[];
  [key: string]: any; // Allow additional MIME types
}

// Type guards
export function isCodeCell(cell: Cell): cell is CodeCell {
  return cell.cell_type === 'code';
}

export function isMarkdownCell(cell: Cell): cell is MarkdownCell {
  return cell.cell_type === 'markdown';
}

export function isRawCell(cell: Cell): cell is RawCell {
  return cell.cell_type === 'raw';
}

export function isStreamOutput(output: Output): output is StreamOutput {
  return output.output_type === 'stream';
}

export function isDisplayDataOutput(output: Output): output is DisplayDataOutput {
  return output.output_type === 'display_data';
}

export function isExecuteResultOutput(output: Output): output is ExecuteResultOutput {
  return output.output_type === 'execute_result';
}

export function isErrorOutput(output: Output): output is ErrorOutput {
  return output.output_type === 'error';
}

// Utility type for string arrays
export function normalizeStringArray(source: string | string[]): string {
  return Array.isArray(source) ? source.join('') : source;
}