import { ReactNode } from 'react';
import { MarkdownCell as MarkdownCellType } from '../../types/notebook';
import { ClassNames, Styles, Theme } from '../../types/props';
import { cx, getClassName, getStyle, mergeStyles, applyThemeStyles } from '../../utils/styles';
import { CopyButton } from './CopyButton';

interface MarkdownCellProps {
  cell: MarkdownCellType;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  renderMarkdown?: (content: string) => ReactNode;
  copyable: boolean;
  onCopy?: (content: string, type: 'code' | 'output') => void;
}

// Basic markdown-to-HTML converter (minimal implementation)
function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/__(.*?)__/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/_(.*?)_/gim, '<em>$1</em>')
    // Code
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/gim, '<br>');
}

export const MarkdownCell = ({
  cell,
  theme,
  classNames,
  styles,
  renderMarkdown,
  copyable,
  onCopy,
}: MarkdownCellProps) => {
  const content = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
  
  const renderContent = () => {
    if (renderMarkdown) {
      return renderMarkdown(content);
    }
    
    // Basic markdown rendering
    const html = simpleMarkdownToHtml(content);
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          lineHeight: '1.6',
          '& h1, & h2, & h3, & h4, & h5, & h6': { marginTop: '1em', marginBottom: '0.5em' },
          '& p': { marginBottom: '1em' },
          '& code': {
            backgroundColor: theme.colors.codeBg,
            padding: '2px 4px',
            borderRadius: theme.borderRadius.sm,
            fontFamily: theme.fonts.code,
            fontSize: '0.9em',
          },
          '& a': {
            color: theme.colors.link,
            textDecoration: 'none',
          },
          '& a:hover': {
            color: theme.colors.linkHover,
            textDecoration: 'underline',
          },
        } as any}
      />
    );
  };
  
  return (
    <div 
      className={getClassName(classNames, 'cellContent')}
      style={{ position: 'relative' }}
    >
      <div
        className={cx(
          getClassName(classNames, 'source'),
          getClassName(classNames, 'sourceMarkdown')
        )}
        style={mergeStyles(
          applyThemeStyles(theme, 'sourceMarkdown'),
          getStyle(styles, 'source'),
          getStyle(styles, 'sourceMarkdown'),
          { padding: theme.spacing.sm }
        )}
      >
        {renderContent()}
      </div>
      
      {/* Copy button */}
      {copyable && content && (
        <CopyButton
          content={content}
          type="code"
          theme={theme}
          classNames={classNames}
          styles={styles}
          onCopy={onCopy}
        />
      )}
    </div>
  );
};