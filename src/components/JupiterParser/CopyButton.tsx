import { useState } from 'react';
import { ClassNames, Styles, Theme } from '../../types/props';
import { getClassName, getStyle, mergeStyles, applyThemeStyles } from '../../utils/styles';

interface CopyButtonProps {
  content: string;
  type: 'code' | 'output';
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  onCopy?: (content: string, type: 'code' | 'output') => void;
}

export const CopyButton = ({
  content,
  type,
  theme,
  classNames,
  styles,
  onCopy,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.(content, type);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        onCopy?.(content, type);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy text:', fallbackErr);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };
  
  return (
    <button
      className={getClassName(classNames, 'copyButton')}
      style={mergeStyles(
        applyThemeStyles(theme, 'copyButton'),
        getStyle(styles, 'copyButton'),
        {
          position: 'absolute',
          top: '8px',
          right: '8px',
          opacity: 0.7,
          transition: 'opacity 0.2s ease, background-color 0.2s ease',
          border: 'none',
          outline: 'none',
          zIndex: 1,
        },
        copied ? {
          backgroundColor: theme.colors.success,
          color: 'white',
        } : undefined
      )}
      onClick={handleCopy}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = theme.colors.buttonHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.backgroundColor = theme.colors.buttonBg;
        }
      }}
      title={copied ? 'Copied!' : `Copy ${type}`}
      aria-label={copied ? 'Copied!' : `Copy ${type}`}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5,15H4a2,2 0,0 1,-2 -2V4a2,2 0,0 1,2 -2H15a2,2 0,0 1,2 2v1"></path>
        </svg>
      )}
    </button>
  );
};