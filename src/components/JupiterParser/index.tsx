import { useState, useEffect, useMemo } from 'react';
import { JupiterParserProps } from '../../types/props';
import { JupyterNotebook } from '../../types/notebook';
import { parseNotebook } from '../../utils/parseNotebook';
import { cx, getTheme, getClassName, getStyle, mergeStyles, applyThemeStyles } from '../../utils/styles';
import { Cell } from './Cell';

export const JupiterParser = ({
  notebook,
  className,
  classNames,
  styles,
  theme = 'light',
  showCellNumbers = true,
  showOutputs = true,
  collapsible = false,
  copyable = true,
  renderMarkdown,
  renderCode,
  renderImage,
  renderHtml,
  renderError,
  onCellClick,
  onCopy,
  onError,
  lazyLoad = false,
  maxOutputHeight,
  virtualScrolling = false,
}: JupiterParserProps) => {
  const [parsedNotebook, setParsedNotebook] = useState<JupyterNotebook | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const themeObject = useMemo(() => getTheme(theme), [theme]);
  
  // Parse notebook
  useEffect(() => {
    try {
      const parsed = parseNotebook(notebook);
      setParsedNotebook(parsed);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to parse notebook');
      setError(error);
      onError?.(error);
    }
  }, [notebook, onError]);
  
  // Error state
  if (error) {
    return (
      <div 
        className={cx(className, getClassName(classNames, 'root'))}
        style={mergeStyles(
          applyThemeStyles(themeObject, 'root'),
          { padding: '20px', textAlign: 'center' },
          getStyle(styles, 'root')
        )}
      >
        <div style={{ color: themeObject.colors.errorText }}>
          <h3>Error parsing notebook</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (!parsedNotebook) {
    return (
      <div 
        className={cx(className, getClassName(classNames, 'root'))}
        style={mergeStyles(
          applyThemeStyles(themeObject, 'root'),
          { padding: '20px', textAlign: 'center' },
          getStyle(styles, 'root')
        )}
      >
        <div>Loading notebook...</div>
      </div>
    );
  }
  
  // Render notebook
  return (
    <div
      className={cx(className, getClassName(classNames, 'root'))}
      style={mergeStyles(
        applyThemeStyles(themeObject, 'root'),
        { padding: '16px' },
        getStyle(styles, 'root')
      )}
    >
      {parsedNotebook.cells.map((cell, index) => (
        <Cell
          key={index}
          cell={cell}
          index={index}
          theme={themeObject}
          classNames={classNames}
          styles={styles}
          showCellNumber={showCellNumbers}
          showOutputs={showOutputs}
          collapsible={collapsible}
          copyable={copyable}
          renderMarkdown={renderMarkdown}
          renderCode={renderCode}
          renderImage={renderImage}
          renderHtml={renderHtml}
          renderError={renderError}
          onClick={onCellClick ? () => onCellClick(cell, index) : undefined}
          onCopy={onCopy}
          maxOutputHeight={maxOutputHeight}
          lazyLoad={lazyLoad}
          notebookMetadata={parsedNotebook.metadata}
        />
      ))}
    </div>
  );
};