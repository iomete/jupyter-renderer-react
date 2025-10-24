import { ReactNode } from 'react';
import { CodeCell as CodeCellType } from '../../types/notebook';
import { ClassNames, Styles, Theme } from '../../types/props';
import { cx, getClassName, getStyle, mergeStyles, applyThemeStyles } from '../../utils/styles';
import { getNotebookLanguage } from '../../utils/parseNotebook';
import { highlightPythonCode, getPythonSyntaxColors } from '../../utils/syntaxHighlighter';
import { Output } from './Output';
import { CopyButton } from './CopyButton';

interface CodeCellProps {
  cell: CodeCellType;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  showOutputs: boolean;
  copyable: boolean;
  renderCode?: (code: string, language: string) => ReactNode;
  renderImage?: (src: string, alt?: string) => ReactNode;
  renderHtml?: (html: string) => ReactNode;
  renderError?: (error: { ename: string; evalue: string; traceback: string[] }) => ReactNode;
  onCopy?: (content: string, type: 'code' | 'output') => void;
  maxOutputHeight?: number | string;
  lazyLoad: boolean;
  notebookMetadata?: any;
}

export const CodeCell = ({
  cell,
  theme,
  classNames,
  styles,
  showOutputs,
  copyable,
  renderCode,
  renderImage,
  renderHtml,
  renderError,
  onCopy,
  maxOutputHeight,
  lazyLoad,
  notebookMetadata,
}: CodeCellProps) => {
  const language = getNotebookLanguage({ 
    nbformat: 4, 
    nbformat_minor: 0, 
    metadata: notebookMetadata || {}, 
    cells: [] 
  });
  
  const codeContent = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
  const isDarkTheme = theme.name === 'dark';
  const pythonColors = getPythonSyntaxColors(isDarkTheme);
  
  return (
    <div className={getClassName(classNames, 'cellContent')}>
      {/* Source code */}
      <div style={{ position: 'relative' }}>
        <div
          className={cx(
            getClassName(classNames, 'source'),
            getClassName(classNames, 'sourceCode')
          )}
          style={mergeStyles(
            applyThemeStyles(theme, 'sourceCode'),
            getStyle(styles, 'source'),
            getStyle(styles, 'sourceCode')
          )}
        >
          {renderCode ? (
            renderCode(codeContent, language)
          ) : (
            <pre style={{ 
              margin: 0, 
              overflow: 'auto',
              backgroundColor: pythonColors.background,
              padding: 0
            }}>
              <code data-language={language} style={{ 
                display: 'block',
                padding: '12px',
                backgroundColor: 'inherit'
              }}>
                {language === 'python' ? highlightPythonCode(codeContent, isDarkTheme) : codeContent}
              </code>
            </pre>
          )}
        </div>
        
        {/* Copy button */}
        {copyable && codeContent && (
          <CopyButton
            content={codeContent}
            type="code"
            theme={theme}
            classNames={classNames}
            styles={styles}
            onCopy={onCopy}
          />
        )}
      </div>
      
      {/* Outputs */}
      {showOutputs && cell.outputs.length > 0 && (
        <div
          className={getClassName(classNames, 'outputs')}
          style={mergeStyles(
            { marginTop: theme.spacing.sm },
            getStyle(styles, 'outputs'),
            maxOutputHeight ? {
              maxHeight: typeof maxOutputHeight === 'number' ? `${maxOutputHeight}px` : maxOutputHeight,
              overflowY: 'auto',
            } : undefined
          )}
        >
          {cell.outputs.map((output, index) => (
            <Output
              key={index}
              output={output}
              theme={theme}
              classNames={classNames}
              styles={styles}
              renderImage={renderImage}
              renderHtml={renderHtml}
              renderError={renderError}
              lazyLoad={lazyLoad}
            />
          ))}
        </div>
      )}
    </div>
  );
};