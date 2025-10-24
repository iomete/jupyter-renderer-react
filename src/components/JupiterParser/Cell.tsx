import { useState, ReactNode } from 'react';
import { Cell as CellType, isCodeCell } from '../../types/notebook';
import { ClassNames, Styles, Theme } from '../../types/props';
import { cx, getClassName, getStyle, mergeStyles, applyThemeStyles } from '../../utils/styles';
import { CodeCell } from './CodeCell';
import { MarkdownCell } from './MarkdownCell';
import { RawCell } from './RawCell';

interface CellProps {
  cell: CellType;
  index: number;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  showCellNumber: boolean;
  showOutputs: boolean;
  collapsible: boolean;
  copyable: boolean;
  renderMarkdown?: (content: string) => ReactNode;
  renderCode?: (code: string, language: string) => ReactNode;
  renderImage?: (src: string, alt?: string) => ReactNode;
  renderHtml?: (html: string) => ReactNode;
  renderError?: (error: { ename: string; evalue: string; traceback: string[] }) => ReactNode;
  onClick?: () => void;
  onCopy?: (content: string, type: 'code' | 'output') => void;
  maxOutputHeight?: number | string;
  lazyLoad: boolean;
  notebookMetadata?: any;
}

export const Cell = ({
  cell,
  index,
  theme,
  classNames,
  styles,
  showCellNumber,
  showOutputs,
  collapsible,
  copyable,
  renderMarkdown,
  renderCode,
  renderImage,
  renderHtml,
  renderError,
  onClick,
  onCopy,
  maxOutputHeight,
  lazyLoad,
  notebookMetadata,
}: CellProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };
  
  const cellTypeClass = getClassName(classNames, cell.cell_type === 'code' ? 'cellCode' : 
                                                cell.cell_type === 'markdown' ? 'cellMarkdown' : 'cellRaw');
  
  const cellTypeStyle = getStyle(styles, cell.cell_type === 'code' ? 'cellCode' : 
                                         cell.cell_type === 'markdown' ? 'cellMarkdown' : 'cellRaw');
  
  return (
    <div
      className={cx(
        getClassName(classNames, 'cell'),
        cellTypeClass,
        isCollapsed && getClassName(classNames, 'collapsed')
      )}
      style={mergeStyles(
        applyThemeStyles(theme, 'cell'),
        cellTypeStyle,
        getStyle(styles, 'cell'),
        { 
          display: 'flex',
          gap: '12px',
          marginBottom: theme.spacing.cell,
          position: 'relative'
        }
      )}
      onClick={onClick}
    >
      {/* Cell number */}
      {showCellNumber && isCodeCell(cell) && (
        <div
          className={getClassName(classNames, 'cellNumber')}
          style={mergeStyles(
            applyThemeStyles(theme, 'cellNumber'),
            getStyle(styles, 'cellNumber'),
            { cursor: collapsible ? 'pointer' : undefined }
          )}
          onClick={collapsible ? handleCollapse : undefined}
          role={collapsible ? 'button' : undefined}
          aria-expanded={!isCollapsed}
          aria-label={`Cell ${index + 1}, execution count ${cell.execution_count || 'none'}`}
        >
          [{cell.execution_count || ' '}]:
        </div>
      )}
      
      {/* Cell content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {!isCollapsed && (
          <>
            {cell.cell_type === 'code' && (
              <CodeCell
                cell={cell}
                theme={theme}
                classNames={classNames}
                styles={styles}
                showOutputs={showOutputs}
                copyable={copyable}
                renderCode={renderCode}
                renderImage={renderImage}
                renderHtml={renderHtml}
                renderError={renderError}
                onCopy={onCopy}
                maxOutputHeight={maxOutputHeight}
                lazyLoad={lazyLoad}
                notebookMetadata={notebookMetadata}
              />
            )}
            
            {cell.cell_type === 'markdown' && (
              <MarkdownCell
                cell={cell}
                theme={theme}
                classNames={classNames}
                styles={styles}
                renderMarkdown={renderMarkdown}
                copyable={copyable}
                onCopy={onCopy}
              />
            )}
            
            {cell.cell_type === 'raw' && (
              <RawCell
                cell={cell}
                theme={theme}
                classNames={classNames}
                styles={styles}
              />
            )}
          </>
        )}
        
        {/* Collapse button for non-code cells */}
        {collapsible && !isCodeCell(cell) && (
          <button
            className={getClassName(classNames, 'collapseButton')}
            style={mergeStyles(
              applyThemeStyles(theme, 'copyButton'),
              getStyle(styles, 'collapseButton'),
              { 
                position: 'absolute',
                top: '4px',
                right: '4px',
                padding: '2px 8px',
                fontSize: '12px'
              }
            )}
            onClick={handleCollapse}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
        )}
      </div>
    </div>
  );
};