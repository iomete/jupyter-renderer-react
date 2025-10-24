import { JupyterNotebook } from '../types/notebook';

/**
 * Parse a Jupyter notebook from JSON string or object
 * @param notebook - Raw JSON string or parsed notebook object
 * @returns Parsed and validated notebook object
 * @throws Error if notebook is invalid
 */
export function parseNotebook(notebook: string | JupyterNotebook): JupyterNotebook {
  let parsed: any;
  
  // Parse if string
  if (typeof notebook === 'string') {
    try {
      parsed = JSON.parse(notebook);
    } catch (error) {
      throw new Error(`Invalid JSON in notebook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    parsed = notebook;
  }
  
  // Validate required fields
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Notebook must be an object');
  }
  
  if (typeof parsed.nbformat !== 'number') {
    throw new Error('Notebook must have a numeric nbformat field');
  }
  
  if (parsed.nbformat < 4) {
    throw new Error(`Unsupported notebook format version: ${parsed.nbformat}. Only version 4 and above are supported.`);
  }
  
  if (!Array.isArray(parsed.cells)) {
    throw new Error('Notebook must have a cells array');
  }
  
  // Ensure metadata exists
  if (!parsed.metadata || typeof parsed.metadata !== 'object') {
    parsed.metadata = {};
  }
  
  // Validate and normalize cells
  parsed.cells = parsed.cells.map((cell: any, index: number) => {
    if (!cell || typeof cell !== 'object') {
      throw new Error(`Cell at index ${index} must be an object`);
    }
    
    if (!['code', 'markdown', 'raw'].includes(cell.cell_type)) {
      throw new Error(`Cell at index ${index} has invalid cell_type: ${cell.cell_type}`);
    }
    
    // Ensure metadata exists
    if (!cell.metadata || typeof cell.metadata !== 'object') {
      cell.metadata = {};
    }
    
    // Normalize source to string
    if (Array.isArray(cell.source)) {
      cell.source = cell.source.join('');
    } else if (typeof cell.source !== 'string') {
      cell.source = String(cell.source || '');
    }
    
    // Handle code cells
    if (cell.cell_type === 'code') {
      // Ensure execution_count is null or number
      if (cell.execution_count !== null && typeof cell.execution_count !== 'number') {
        cell.execution_count = null;
      }
      
      // Ensure outputs array exists
      if (!Array.isArray(cell.outputs)) {
        cell.outputs = [];
      }
      
      // Validate outputs
      cell.outputs = cell.outputs.map((output: any, outputIndex: number) => {
        if (!output || typeof output !== 'object') {
          throw new Error(`Output at cell ${index}, output ${outputIndex} must be an object`);
        }
        
        if (!['stream', 'display_data', 'execute_result', 'error'].includes(output.output_type)) {
          throw new Error(`Output at cell ${index}, output ${outputIndex} has invalid output_type: ${output.output_type}`);
        }
        
        // Normalize text in stream outputs
        if (output.output_type === 'stream') {
          if (Array.isArray(output.text)) {
            output.text = output.text.join('');
          } else if (typeof output.text !== 'string') {
            output.text = String(output.text || '');
          }
        }
        
        // Normalize traceback in error outputs
        if (output.output_type === 'error' && !Array.isArray(output.traceback)) {
          output.traceback = [];
        }
        
        return output;
      });
    }
    
    return cell;
  });
  
  return parsed as JupyterNotebook;
}

/**
 * Check if a value is a valid Jupyter notebook
 */
export function isValidNotebook(value: any): value is JupyterNotebook {
  try {
    parseNotebook(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the primary language of the notebook
 */
export function getNotebookLanguage(notebook: JupyterNotebook): string {
  const kernelLanguage = notebook.metadata?.kernelspec?.language;
  const languageInfo = notebook.metadata?.language_info?.name;
  
  return kernelLanguage || languageInfo || 'python';
}

/**
 * Count cells by type
 */
export function countCellsByType(notebook: JupyterNotebook): {
  total: number;
  code: number;
  markdown: number;
  raw: number;
} {
  const counts = {
    total: notebook.cells.length,
    code: 0,
    markdown: 0,
    raw: 0,
  };
  
  for (const cell of notebook.cells) {
    counts[cell.cell_type]++;
  }
  
  return counts;
}