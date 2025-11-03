import { CSSProperties } from 'react';
import { ClassNames, Styles, Theme, themes } from '../types/props';

/**
 * Combine multiple class names
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get theme object from theme prop
 */
export function getTheme(theme?: 'light' | 'dark' | Theme): Theme {
  if (!theme) {
    return themes.light;
  }
  
  if (typeof theme === 'string') {
    return themes[theme];
  }
  
  return theme;
}

/**
 * Merge multiple style objects
 */
export function mergeStyles(...styles: (CSSProperties | undefined)[]): CSSProperties | undefined {
  const filtered = styles.filter(Boolean);
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return Object.assign({}, ...filtered);
}

/**
 * Get class name from classNames object
 */
export function getClassName(
  classNames: ClassNames | undefined,
  key: keyof ClassNames
): string | undefined {
  return classNames?.[key];
}

/**
 * Get style from styles object
 */
export function getStyle(
  styles: Styles | undefined,
  key: keyof Styles
): CSSProperties | undefined {
  return styles?.[key];
}

/**
 * Apply theme styles to a component
 */
export function applyThemeStyles(theme: Theme, component: string): CSSProperties {
  const baseStyles: Record<string, CSSProperties> = {
    root: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fonts.base,
      fontSize: theme.fontSize.base,
    },
    cell: {
      marginBottom: theme.spacing.cell,
    },
    cellCode: {
      backgroundColor: theme.colors.codeBg,
      padding: theme.spacing.cellPadding,
    },
    cellMarkdown: {
      backgroundColor: theme.colors.markdownBg,
      padding: theme.spacing.cellPadding,
    },
    cellNumber: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.code,
      minWidth: '6ch',
      textAlign: 'left',
      userSelect: 'none',
    },
    sourceCode: {
      backgroundColor: theme.colors.codeBg,
      color: theme.colors.codeText,
      fontFamily: theme.fonts.code,
      fontSize: theme.fontSize.code,
      padding: theme.spacing.sm,
      overflowX: 'auto',
      border: 'none',
    },
    sourceMarkdown: {
      fontFamily: theme.fonts.markdown,
      lineHeight: '1.6',
    },
    output: {
      padding: theme.spacing.outputPadding,
      backgroundColor: theme.colors.outputBg,
    },
    outputText: {
      fontFamily: theme.fonts.code,
      fontSize: theme.fontSize.code,
      whiteSpace: 'pre-wrap',
    },
    outputStdout: {
      color: theme.colors.stdoutText,
    },
    outputStderr: {
      color: theme.colors.stderrText,
    },
    outputError: {
      backgroundColor: theme.colors.errorBg,
      color: theme.colors.errorText,
      padding: theme.spacing.sm,
      fontFamily: theme.fonts.code,
    },
  };
  
  return baseStyles[component] || {};
}