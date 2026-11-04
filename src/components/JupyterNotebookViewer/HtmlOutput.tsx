import { Theme } from '../../types/props';

interface HtmlOutputProps {
  /** Sanitized rich HTML, which may contain styles scoped to this frame. */
  html: string;
  theme: Theme;
  lazyLoad: boolean;
}

export const HtmlOutput = ({ html, theme, lazyLoad }: HtmlOutputProps) => {
  const colorScheme = theme.name === 'dark' ? 'dark' : 'light';
  const srcDoc = `<!doctype html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<style>
  :root { color-scheme: ${colorScheme}; }
  body { margin: 8px; font: 14px/1.5 system-ui, sans-serif; overflow-wrap: anywhere; }
  img, svg { max-width: 100%; height: auto; }
  pre { white-space: pre-wrap; }
  table { border-collapse: collapse; }
  th, td { padding: 4px 8px; border: 1px solid GrayText; }
</style></head><body>${html}</body></html>`;

  return (
    <iframe
      title="Notebook HTML output"
      sandbox=""
      referrerPolicy="no-referrer"
      srcDoc={srcDoc}
      loading={lazyLoad ? 'lazy' : undefined}
      style={{ display: 'block', width: '100%', height: '320px', border: 0 }}
    />
  );
};
