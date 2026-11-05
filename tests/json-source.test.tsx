import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JsonSource } from '../src/components/JupyterNotebookViewer/JsonSource';
import { themes } from '../src/types/props';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function render(source: string, options: Partial<Parameters<typeof JsonSource>[0]> = {}) {
  await act(async () => root.render(<JsonSource source={source} theme={themes.light} {...options} />));
}

async function toggle(details: HTMLDetailsElement, open: boolean) {
  await act(async () => {
    details.open = open;
    details.dispatchEvent(new Event('toggle', { bubbles: false }));
  });
}

function findDetails(label: string) {
  return Array.from(container.querySelectorAll<HTMLDetailsElement>('details')).find(details =>
    details.querySelector(':scope > summary')?.textContent?.includes(label),
  )!;
}

describe('JSON source inspection', () => {
  it('retains source arrays, duplicate keys and precise numeric spellings', async () => {
    await render('{"source":["first\\n","second"],"revision":9007199254740993,"revision":1e+12,"missing":null}');

    const text = container.textContent!;
    expect(text).toContain('"source": [');
    expect(text).toContain('"first\\n"');
    expect(text).toContain('"second"');
    expect(text).toContain('9007199254740993');
    expect(text).toContain('1e+12');
    expect(text.match(/"revision"/g)).toHaveLength(2);
    expect(text).toContain('null');
  });

  it('treats keys and values as text even when they contain HTML', async () => {
    const html = '<script>window.__jsonSourceTest = 1</script><img src=x onerror=alert(1)>';
    await render(JSON.stringify({ [html]: html, entities: '&lt;b&gt;literal&lt;/b&gt;' }));

    expect(container.textContent).toContain(html);
    expect(container.textContent).toContain('&lt;b&gt;literal&lt;/b&gt;');
    expect(container.querySelector('script, img, b')).toBeNull();
  });

  it('lazily expands and collapses complete embedded image strings', async () => {
    const image = 'iVBORw0KGgo'.repeat(1500);
    await render(JSON.stringify({ 'image/png': image }));
    const details = findDetails('"image/png"');

    expect(details.open).toBe(false);
    expect(details.querySelector('pre')).toBeNull();
    expect(container.textContent).not.toContain(image);
    await toggle(details, true);
    expect(details.querySelector('pre')?.textContent).toBe(JSON.stringify(image));
    await toggle(details, false);
    expect(details.querySelector('pre')).toBeNull();
  });

  it('does not mount entries in a large collapsed array', async () => {
    await render(JSON.stringify({ cells: Array.from({ length: 25 }, (_, index) => `cell-${index}`) }));
    const details = findDetails('"cells"');

    expect(details.open).toBe(false);
    expect(container.textContent).not.toContain('cell-24');
    await toggle(details, true);
    expect(container.textContent).toContain('cell-24');
  });

  it('shows malformed input verbatim without interpreting markup', async () => {
    const source = '  {\n "source": "<img src=x onerror=alert(1)>"\n';
    await render(source);

    expect(container.querySelector('pre')?.textContent).toBe(source);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('details')).toBeNull();
  });

  it('renders JSON primitives and empty containers', async () => {
    for (const source of ['null', 'true', 'false', '42', '"text"', '{}', '[]']) {
      await render(source);
      expect(container.textContent).toBe(source);
    }
  });

  it('falls back to source text for pathological nesting', async () => {
    const source = '['.repeat(2000) + '0' + ']'.repeat(2000);
    await render(source);

    expect(container.querySelector('pre')?.textContent).toBe(source);
    expect(container.querySelector('details')).toBeNull();
  });

  it('resets folded content when the source changes', async () => {
    const first = 'a'.repeat(1000);
    const second = 'b'.repeat(1000);
    await render(JSON.stringify({ data: first }));
    await toggle(findDetails('"data"'), true);
    expect(container.textContent).toContain(first);

    await render(JSON.stringify({ data: second }));
    expect(findDetails('"data"').open).toBe(false);
    expect(container.textContent).not.toContain(first);
    expect(container.textContent).not.toContain(second);
  });

  it('exposes an accessible root and applies caller styling', async () => {
    await render('{"ok":true}', { className: 'application-json', style: { padding: 24, borderRadius: 8 } });
    const region = container.querySelector<HTMLElement>('[role="region"]')!;

    expect(region.getAttribute('aria-label')).toBe('Notebook JSON source');
    expect(region.classList.contains('application-json')).toBe(true);
    expect(region.style.padding).toBe('24px');
    expect(region.style.borderRadius).toBe('8px');
  });
});
