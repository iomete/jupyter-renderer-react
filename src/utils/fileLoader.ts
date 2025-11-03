import { JupyterNotebook } from '../types/notebook';
import { FetchOptions, NotebookFilePath } from '../types/props';
import { parseNotebook } from './parseNotebook';

/**
 * Load a Jupyter notebook from a file path (URL or local path)
 * @param filePath - Path to the .ipynb file (URL or local path)
 * @param options - Fetch options for network requests
 * @returns Promise that resolves to a parsed notebook
 * @throws Error if file cannot be loaded or parsed
 */
export async function loadNotebookFromPath(
  filePath: string,
  options: FetchOptions = {}
): Promise<JupyterNotebook> {
  // Validate file extension
  if (!filePath.toLowerCase().endsWith('.ipynb')) {
    throw new Error(`Invalid file extension. Expected .ipynb file, got: ${filePath}`);
  }

  // Create fetch options with defaults
  const fetchOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
    credentials: options.credentials,
  };

  // Add timeout if specified
  const controller = new AbortController();
  if (options.timeout) {
    setTimeout(() => controller.abort(), options.timeout);
  }
  fetchOptions.signal = controller.signal;

  try {
    // Fetch the file
    const response = await fetch(filePath, fetchOptions);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Notebook file not found: ${filePath}`);
      } else if (response.status === 403) {
        throw new Error(`Access denied to notebook file: ${filePath}`);
      } else {
        throw new Error(
          `Failed to load notebook file: ${response.status} ${response.statusText}`
        );
      }
    }

    // Check content type if available
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
      console.warn(`Unexpected content type for notebook file: ${contentType}`);
    }

    // Get the content as text first
    const content = await response.text();
    
    if (!content.trim()) {
      throw new Error(`Notebook file is empty: ${filePath}`);
    }

    // Parse the notebook content
    try {
      return parseNotebook(content);
    } catch (parseError) {
      throw new Error(
        `Invalid notebook format in file ${filePath}: ${
          parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        }`
      );
    }
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout loading notebook file: ${filePath}`);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error loading notebook file: ${filePath}`);
      }
      
      // Re-throw our custom errors as-is
      throw error;
    }
    
    throw new Error(`Unknown error loading notebook file: ${filePath}`);
  }
}

/**
 * Check if a given input is a file path object
 */
export function isNotebookFilePath(
  input: any
): input is NotebookFilePath {
  return (
    input &&
    typeof input === 'object' &&
    'filePath' in input &&
    typeof input.filePath === 'string' &&
    Object.keys(input).length === 1
  );
}

/**
 * Detect the type of notebook input
 */
export function getNotebookInputType(
  notebook: any
): 'object' | 'string' | 'filePath' {
  if (isNotebookFilePath(notebook)) {
    return 'filePath';
  } else if (typeof notebook === 'string') {
    return 'string';
  } else if (notebook && typeof notebook === 'object') {
    return 'object';
  } else {
    throw new Error('Invalid notebook input type');
  }
}

/**
 * Validate file path format
 */
export function validateFilePath(filePath: string): void {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('File path must be a non-empty string');
  }

  if (!filePath.trim()) {
    throw new Error('File path cannot be empty or whitespace only');
  }

  // Check for common file path issues
  if (filePath.includes('..')) {
    console.warn('File path contains ".." which may indicate path traversal');
  }

  // Validate extension
  if (!filePath.toLowerCase().endsWith('.ipynb')) {
    throw new Error(`File must have .ipynb extension, got: ${filePath}`);
  }
}