import { ReactNode } from 'react';
import { 
  Output as OutputType, 
  isStreamOutput, 
  isDisplayDataOutput, 
  isExecuteResultOutput, 
  isErrorOutput 
} from '../../types/notebook';
import { ClassNames, Styles, Theme } from '../../types/props';
import { cx, getClassName, getStyle, mergeStyles, applyThemeStyles } from '../../utils/styles';
import { sanitizeHtml, ansiToHtml } from '../../utils/sanitize';

interface OutputProps {
  output: OutputType;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  renderImage?: (src: string, alt?: string) => ReactNode;
  renderHtml?: (html: string) => ReactNode;
  renderError?: (error: { ename: string; evalue: string; traceback: string[] }) => ReactNode;
  lazyLoad: boolean;
}

export const Output = ({
  output,
  theme,
  classNames,
  styles,
  renderImage,
  renderHtml,
  renderError,
  lazyLoad,
}: OutputProps) => {
  const baseOutputStyle = mergeStyles(
    applyThemeStyles(theme, 'output'),
    getStyle(styles, 'output')
  );
  
  // Stream output (stdout/stderr)
  if (isStreamOutput(output)) {
    const text = Array.isArray(output.text) ? output.text.join('') : output.text;
    const isStderr = output.name === 'stderr';
    
    return (
      <div
        className={cx(
          getClassName(classNames, 'output'),
          getClassName(classNames, 'outputText'),
          isStderr ? getClassName(classNames, 'outputStderr') : getClassName(classNames, 'outputStdout')
        )}
        style={mergeStyles(
          baseOutputStyle,
          applyThemeStyles(theme, 'outputText'),
          isStderr ? applyThemeStyles(theme, 'outputStderr') : applyThemeStyles(theme, 'outputStdout'),
          getStyle(styles, 'outputText'),
          isStderr ? getStyle(styles, 'outputStderr') : getStyle(styles, 'outputStdout')
        )}
      >
        <pre 
          style={{ margin: 0, whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: ansiToHtml(text) }}
        />
      </div>
    );
  }
  
  // Error output
  if (isErrorOutput(output)) {
    if (renderError) {
      return (
        <div className={getClassName(classNames, 'output')} style={baseOutputStyle}>
          {renderError({ ename: output.ename, evalue: output.evalue, traceback: output.traceback })}
        </div>
      );
    }
    
    return (
      <div
        className={cx(
          getClassName(classNames, 'output'),
          getClassName(classNames, 'outputError')
        )}
        style={mergeStyles(
          baseOutputStyle,
          applyThemeStyles(theme, 'outputError'),
          getStyle(styles, 'outputError')
        )}
      >
        <div
          className={getClassName(classNames, 'errorName')}
          style={mergeStyles(
            { fontWeight: 'bold', marginBottom: theme.spacing.xs },
            getStyle(styles, 'errorName')
          )}
        >
          {output.ename}: {output.evalue}
        </div>
        {output.traceback.length > 0 && (
          <div
            className={getClassName(classNames, 'errorTraceback')}
            style={mergeStyles(
              { 
                fontFamily: theme.fonts.code, 
                fontSize: theme.fontSize.sm,
                marginTop: theme.spacing.xs 
              },
              getStyle(styles, 'errorTraceback')
            )}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {output.traceback.map(line => ansiToHtml(line)).join('\n')}
            </pre>
          </div>
        )}
      </div>
    );
  }
  
  // Display data or execute result output
  if (isDisplayDataOutput(output) || isExecuteResultOutput(output)) {
    const data = output.data;
    
    // Render in order of preference
    const renderMimeType = () => {
      // Images
      if (data['image/png']) {
        const src = `data:image/png;base64,${data['image/png']}`;
        const img = renderImage ? renderImage(src, 'Output image') : (
          <img 
            src={src} 
            alt="Output image" 
            style={{ maxWidth: '100%', height: 'auto' }}
            loading={lazyLoad ? 'lazy' : undefined}
          />
        );
        return (
          <div className={getClassName(classNames, 'outputImage')} style={getStyle(styles, 'outputImage')}>
            {img}
          </div>
        );
      }
      
      if (data['image/jpeg']) {
        const src = `data:image/jpeg;base64,${data['image/jpeg']}`;
        const img = renderImage ? renderImage(src, 'Output image') : (
          <img 
            src={src} 
            alt="Output image" 
            style={{ maxWidth: '100%', height: 'auto' }}
            loading={lazyLoad ? 'lazy' : undefined}
          />
        );
        return (
          <div className={getClassName(classNames, 'outputImage')} style={getStyle(styles, 'outputImage')}>
            {img}
          </div>
        );
      }
      
      if (data['image/svg+xml']) {
        const svg = Array.isArray(data['image/svg+xml']) 
          ? data['image/svg+xml'].join('') 
          : data['image/svg+xml'];
        const img = renderImage ? renderImage(`data:image/svg+xml;base64,${btoa(svg)}`, 'Output image') : (
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(svg) }} />
        );
        return (
          <div className={getClassName(classNames, 'outputImage')} style={getStyle(styles, 'outputImage')}>
            {img}
          </div>
        );
      }
      
      // HTML
      if (data['text/html']) {
        const html = Array.isArray(data['text/html']) 
          ? data['text/html'].join('') 
          : data['text/html'];
        
        if (renderHtml) {
          return (
            <div className={getClassName(classNames, 'outputHtml')} style={getStyle(styles, 'outputHtml')}>
              {renderHtml(html)}
            </div>
          );
        }
        
        return (
          <div 
            className={getClassName(classNames, 'outputHtml')}
            style={getStyle(styles, 'outputHtml')}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
          />
        );
      }
      
      // JSON
      if (data['application/json']) {
        return (
          <div
            className={cx(getClassName(classNames, 'outputText'))}
            style={mergeStyles(
              applyThemeStyles(theme, 'outputText'),
              getStyle(styles, 'outputText')
            )}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(data['application/json'], null, 2)}
            </pre>
          </div>
        );
      }
      
      // Plain text (fallback)
      if (data['text/plain']) {
        const text = Array.isArray(data['text/plain']) 
          ? data['text/plain'].join('') 
          : data['text/plain'];
        
        return (
          <div
            className={cx(getClassName(classNames, 'outputText'))}
            style={mergeStyles(
              applyThemeStyles(theme, 'outputText'),
              getStyle(styles, 'outputText')
            )}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {text}
            </pre>
          </div>
        );
      }
      
      // No supported MIME type
      return (
        <div style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }}>
          Unsupported output format
        </div>
      );
    };
    
    return (
      <div
        className={getClassName(classNames, 'output')}
        style={baseOutputStyle}
      >
        {renderMimeType()}
      </div>
    );
  }
  
  // Unknown output type
  return (
    <div
      className={getClassName(classNames, 'output')}
      style={mergeStyles(baseOutputStyle, { color: theme.colors.textSecondary, fontStyle: 'italic' })}
    >
      Unknown output type: {(output as any).output_type}
    </div>
  );
};