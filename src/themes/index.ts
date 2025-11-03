/**
 * JupyterLab Theme Integration
 * 
 * This module provides utilities for working with JupyterLab themes.
 * Import the appropriate theme CSS file to apply JupyterLab styling.
 */

// Theme CSS imports (these will be loaded when imported)
import './jupyterlab-light.css';
import './jupyterlab-dark.css';

/**
 * Apply a JupyterLab theme by injecting the appropriate CSS variables
 * @param theme - The theme to apply ('light' or 'dark')
 */
export function applyJupyterLabTheme(theme: 'light' | 'dark') {
  // Remove existing theme classes
  document.documentElement.classList.remove('jp-theme-light', 'jp-theme-dark');
  
  // Add the new theme class
  document.documentElement.classList.add(`jp-theme-${theme}`);
  
  // Optional: Set a data attribute for CSS selectors
  document.documentElement.setAttribute('data-jp-theme', theme);
}

/**
 * Get the current JupyterLab theme
 * @returns The current theme ('light' or 'dark') or null if none is set
 */
export function getCurrentJupyterLabTheme(): 'light' | 'dark' | null {
  if (document.documentElement.classList.contains('jp-theme-light')) {
    return 'light';
  }
  if (document.documentElement.classList.contains('jp-theme-dark')) {
    return 'dark';
  }
  return null;
}

/**
 * Toggle between light and dark JupyterLab themes
 * @returns The new theme after toggling
 */
export function toggleJupyterLabTheme(): 'light' | 'dark' {
  const current = getCurrentJupyterLabTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  applyJupyterLabTheme(newTheme);
  return newTheme;
}

/**
 * Initialize JupyterLab theme system with a default theme
 * @param defaultTheme - The default theme to apply if none is set
 */
export function initializeJupyterLabTheme(defaultTheme: 'light' | 'dark' = 'light') {
  const current = getCurrentJupyterLabTheme();
  if (!current) {
    applyJupyterLabTheme(defaultTheme);
  }
}

// Export theme names for convenience
export const JUPYTER_LAB_THEMES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
} as const;

export type JupyterLabTheme = typeof JUPYTER_LAB_THEMES[keyof typeof JUPYTER_LAB_THEMES];