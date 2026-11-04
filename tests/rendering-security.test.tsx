import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JupiterNotebookViewer } from '../src/components/JupyterNotebookViewer';
import { MarkdownCell } from '../src/components/JupyterNotebookViewer/MarkdownCell';
import { Output } from '../src/components/JupyterNotebookViewer/Output';
import type { JupyterNotebook, Output as NotebookOutput } from '../src/types/notebook';
import { themes } from '../src/types/props';
import { ansiToHtml, sanitizeHtml } from '../src/utils/sanitize';

// These fixtures only set a local sentinel. They never access session data or
// send requests to an external host.
const attack = '<img src=x onerror="window.__notebookXss=1">';
const textAttack = `${attack} & <script>window.__notebookXss=1</script>`;
const svgAttack = '<svg xmlns="http://www.w3.org/2000/svg" onload="window.__notebookXss=1"><script>window.__notebookXss=1</script><foreignObject><img src=x onerror="window.__notebookXss=1"></foreignObject><text>安全 ✓</text></svg>';
const richAttack = `<table><tbody><tr><td>safe table</td></tr></tbody></table>${attack}<a href="java&#x73;cript:window.__notebookXss=1">bad link</a><iframe srcdoc="&lt;script&gt;parent.__notebookXss=1&lt;/script&gt;"></iframe><form action="/change"><input name="x"></form>`;

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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render(node: ReactNode) {
  await act(async () => root.render(node));
  return container;
}

function renderOutput(output: NotebookOutput, overrides: Partial<Parameters<typeof Output>[0]> = {}) {
  return render(<Output output={output} theme={themes.light} lazyLoad={false} {...overrides} />);
}

function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function expectNoExecutableMarkup(node: ParentNode) {
  expect(node.querySelector('script, iframe, object, embed, foreignObject, form, input')).toBeNull();
  for (const element of node.querySelectorAll('*')) {
    for (const attr of element.attributes) {
      expect(attr.name).not.toMatch(/^on/i);
      if (/^(?:href|src|xlink:href)$/i.test(attr.name)) {
        expect(attr.value.replace(/[\u0000-\u0020]/g, '')).not.toMatch(/^(?:javascript|vbscript|data:text\/html):?/i);
      }
    }
  }
}

const outputKinds = ['display_data', 'execute_result'] as const;

describe('plain notebook text', () => {
  for (const name of ['stdout', 'stderr'] as const) {
    for (const asArray of [false, true]) {
      it(`escapes ${name} ${asArray ? 'arrays' : 'strings'} before applying ANSI styles`, async () => {
        const text = `\u001b[1;31m${textAttack}\u001b[0m`;
        await renderOutput({ output_type: 'stream', name, text: asArray ? [text.slice(0, 15), text.slice(15)] : text });
        expect(container.querySelector('pre')?.textContent).toBe(textAttack);
        expect(container.querySelector('img, script')).toBeNull();
        expect(container.querySelector('span[style*="color"]')?.getAttribute('style')).toContain('#cd3131');
        expect(container.querySelector('span[style*="font-weight"]')).not.toBeNull();
      });
    }
  }

  for (const output_type of outputKinds) {
    for (const asArray of [false, true]) {
      it(`escapes ${output_type} text/plain ${asArray ? 'arrays' : 'strings'}`, async () => {
        await renderOutput({ output_type, execution_count: 1, data: { 'text/plain': asArray ? [textAttack.slice(0, 12), textAttack.slice(12)] : textAttack } });
        expect(container.querySelector('pre')?.textContent).toBe(textAttack);
        expectNoExecutableMarkup(container);
        expect(container.querySelector('img')).toBeNull();
      });
    }
  }

  it('escapes error names, values and every traceback line', async () => {
    await renderOutput({ output_type: 'error', ename: attack, evalue: attack, traceback: [`\u001b[31m${textAttack}\u001b[0m`, attack] });
    expect(container.querySelector('pre')?.textContent).toBe(`${textAttack}\n${attack}`);
    expect(container.textContent).toContain(`${attack}: ${attack}`);
    expectNoExecutableMarkup(container);
    expect(container.querySelector('img')).toBeNull();
  });

  it('retains literal entity text instead of decoding it a second time', () => {
    const output = parseHtml(ansiToHtml('&lt;img src=x onerror=alert(1)&gt; <b>literal</b>'));
    expect(output.body.textContent).toBe('&lt;img src=x onerror=alert(1)&gt; <b>literal</b>');
    expect(output.querySelector('img, b')).toBeNull();
  });

  it('renders JSON values through React text escaping', async () => {
    await renderOutput({ output_type: 'display_data', data: { 'application/json': { value: textAttack } } });
    expect(container.querySelector('pre')?.textContent).toBe(JSON.stringify({ value: textAttack }, null, 2));
    expect(container.querySelector('img, script')).toBeNull();
  });
});

describe('Markdown', () => {
  for (const source of [
    attack,
    '<svg onload="window.__notebookXss=1"></svg>',
    '<a href=java&#x73;cript:window.__notebookXss=1>bad</a>',
    '<a href="java\nscript:window.__notebookXss=1">bad</a>',
    '[bad](javascript:alert%281%29)',
    '<iframe srcdoc="&lt;img src=x onerror=parent.__notebookXss=1&gt;"></iframe>',
    '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=window.__notebookXss=1>">',
  ]) {
    it(`removes executable markup from ${source.slice(0, 45)}`, async () => {
      await render(<MarkdownCell cell={{ cell_type: 'markdown', metadata: {}, source }} theme={themes.light} />);
      expectNoExecutableMarkup(container);
      expect(container.querySelector('svg, math')).toBeNull();
    });
  }

  it('removes host-page style and named-property injection', async () => {
    const source = '<style>body { display: none }</style><p id="location" name="cookie" class="overlay" style="position:fixed;inset:0">safe text</p>';
    await render(<MarkdownCell cell={{ cell_type: 'markdown', metadata: {}, source }} theme={themes.light} />);
    const paragraph = container.querySelector('p');
    expect(paragraph?.textContent).toBe('safe text');
    for (const attr of ['id', 'name', 'class', 'style']) expect(paragraph?.hasAttribute(attr)).toBe(false);
    expect(container.querySelector('style')).toBeNull();
  });

  it('keeps headings, tables, links and escaped code', async () => {
    const source = ['# Heading\n\n', '| Column |\n| --- |\n| Value |\n\n', '**Bold** [Docs](https://example.com/docs)\n\n', '```html\n<img src=x onerror=alert(1)>\n```'];
    await render(<MarkdownCell cell={{ cell_type: 'markdown', metadata: {}, source }} theme={themes.light} />);
    expect(container.querySelector('h1')?.textContent).toBe('Heading');
    expect(container.querySelector('td')?.textContent).toBe('Value');
    expect(container.querySelector('strong')?.textContent).toBe('Bold');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com/docs');
    expect(container.querySelector('code')?.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(container.querySelector('img')).toBeNull();
  });

  it('preserves checked and unchecked task-list items as disabled checkboxes', async () => {
    const source = '- [x] Complete\n- [ ] Pending';
    await render(<MarkdownCell cell={{ cell_type: 'markdown', metadata: {}, source }} theme={themes.light} />);
    const checkboxes = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes.map(input => input.checked)).toEqual([true, false]);
    expect(checkboxes.every(input => input.disabled)).toBe(true);
    expect(container.textContent).toContain('Complete');
    expect(container.textContent).toContain('Pending');
  });

  it('makes raw HTML checkboxes inert and removes unsafe attributes', async () => {
    const source = '<input type="CHECKBOX" autofocus onclick="window.__notebookXss=1" onfocus="window.__notebookXss=1" style="position:fixed" name="cookie" form="outside" formaction="/change">';
    await render(<MarkdownCell cell={{ cell_type: 'markdown', metadata: {}, source }} theme={themes.light} />);
    const checkbox = container.querySelector('input')!;
    expect(checkbox).not.toBeNull();
    expect(checkbox.type).toBe('checkbox');
    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(true);
    for (const attr of ['autofocus', 'onclick', 'onfocus', 'style', 'name', 'form', 'formaction']) {
      expect(checkbox.hasAttribute(attr)).toBe(false);
    }
    checkbox.click();
    expect(checkbox.checked).toBe(false);
  });

  it('removes non-checkbox input types and inputs without a type', async () => {
    const source = '<input><input type="text"><input type="password"><input type="hidden"><input type="file"><input type="radio"><input type="submit"><input type="image" src=x onerror="window.__notebookXss=1">';
    await render(<MarkdownCell cell={{ cell_type: 'markdown', metadata: {}, source }} theme={themes.light} />);
    expect(container.querySelector('input')).toBeNull();
    expectNoExecutableMarkup(container);
  });
});

describe('rich notebook outputs', () => {
  for (const mime of ['image/png', 'image/jpeg']) {
    it(`keeps ${mime} data inside a React image attribute`, async () => {
      const value = 'AAAA" onerror="window.__notebookXss=1';
      await renderOutput({ output_type: 'display_data', data: { [mime]: value } });
      expect(container.querySelector('img')?.getAttribute('src')).toBe(`data:${mime};base64,${value}`);
      expect(container.querySelector('img')?.hasAttribute('onerror')).toBe(false);
    });
  }

  it('preserves rich table styling inside the HTML frame', async () => {
    const html = '<div><style>.dataframe td { color: red }</style><table class="dataframe"><tbody><tr><td style="text-align:right">42</td></tr></tbody></table></div>';
    await renderOutput({ output_type: 'display_data', data: { 'text/html': html } });
    const doc = parseHtml(container.querySelector('iframe')!.srcdoc);
    expect(doc.body.querySelector('style')?.textContent).toContain('.dataframe');
    expect(doc.querySelector('table')?.getAttribute('class')).toBe('dataframe');
    expect(doc.querySelector('td')?.getAttribute('style')).toContain('text-align:right');
    expect(container.querySelector('style, table')).toBeNull();
  });

  for (const custom of [false, true]) {
    it(`preserves leading CSS in ${custom ? 'a custom HTML renderer' : 'the HTML iframe'}`, async () => {
      const html = '<style>td { color: green }</style><table><tbody><tr><td onclick="window.__notebookXss=1">42</td></tr></tbody></table>';
      const renderHtml = vi.fn((value: string) => <div data-custom-html>{value}</div>);
      await renderOutput({ output_type: 'display_data', data: { 'text/html': html } }, custom ? { renderHtml } : {});
      const renderedHtml = custom ? renderHtml.mock.calls[0][0] : container.querySelector('iframe')!.srcdoc;
      expect(renderedHtml).toContain('<style>td { color: green }</style>');
      const doc = parseHtml(renderedHtml);
      expect(doc.querySelector('td')?.textContent).toBe('42');
      expect(doc.querySelector('td')?.hasAttribute('onclick')).toBe(false);
      expect(container.querySelector('style, table')).toBeNull();
      if (custom) expect(renderHtml).toHaveBeenCalledOnce();
      else expect(doc.body.querySelector('style')?.textContent).toBe('td { color: green }');
    });
  }

  for (const output_type of outputKinds) {
    for (const asArray of [false, true]) {
      it(`isolates sanitized ${output_type} HTML ${asArray ? 'arrays' : 'strings'}`, async () => {
        await renderOutput({ output_type, execution_count: 1, data: { 'text/html': asArray ? [richAttack.slice(0, 20), richAttack.slice(20)] : richAttack } });
        const iframe = container.querySelector('iframe');
        expect(iframe).not.toBeNull();
        expect(iframe?.getAttribute('sandbox')).toBe('');
        expect(iframe?.getAttribute('referrerpolicy')).toBe('no-referrer');
        expect(iframe?.title).not.toBe('');
        const doc = parseHtml(iframe!.srcdoc);
        expectNoExecutableMarkup(doc.body);
        expect(doc.querySelector('td')?.textContent).toBe('safe table');
        expect(container.querySelector('table')).toBeNull();
        const csp = doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content');
        expect(csp).toContain("default-src 'none'");
        expect(csp).toContain("base-uri 'none'");
        expect(csp).toContain("form-action 'none'");
        expect(csp).toContain('img-src data:');
        expect(csp).not.toContain('allow-scripts');
      });
    }

    it(`sanitizes ${output_type} HTML before calling a custom renderer`, async () => {
      const renderHtml = vi.fn((html: string) => <div data-custom-html>{html}</div>);
      await renderOutput({ output_type, execution_count: 1, data: { 'text/html': richAttack } }, { renderHtml });
      expect(renderHtml).toHaveBeenCalledOnce();
      const doc = parseHtml(renderHtml.mock.calls[0][0]);
      expectNoExecutableMarkup(doc);
      expect(doc.querySelector('td')?.textContent).toBe('safe table');
    });

    it(`renders sanitized ${output_type} SVG as an image, including Unicode`, async () => {
      await renderOutput({ output_type, execution_count: 1, data: { 'image/svg+xml': [svgAttack.slice(0, 70), svgAttack.slice(70)] } });
      expect(container.querySelector('svg')).toBeNull();
      const image = container.querySelector('img');
      expect(image).not.toBeNull();
      expect(image?.src).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
      const doc = parseHtml(decodeURIComponent(image!.src.split(',').slice(1).join(',')));
      expectNoExecutableMarkup(doc);
      expect(doc.querySelector('text')?.textContent).toBe('安全 ✓');
    });
  }

  it('retains SVG plot definitions, styling and internal references for custom image renderers', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 40"><style>.label { fill: red }</style><defs><path id="line" d="M0 0L20 20"/><clipPath id="clip"><rect width="100" height="40"/></clipPath></defs><g clip-path="url(#clip)"><use href="#line"/><use xlink:href="#line"/><text class="label" style="font-size:12px">Chart ✓</text></g></svg>';
    const renderImage = vi.fn((src: string, alt?: string) => <img src={src} alt={alt} />);
    await renderOutput({ output_type: 'display_data', data: { 'image/svg+xml': svg } }, { renderImage });
    expect(renderImage).toHaveBeenCalledOnce();
    const [src, alt] = renderImage.mock.calls[0];
    expect(alt).toBeTruthy();
    const doc = parseHtml(decodeURIComponent(src.split(',').slice(1).join(',')));
    expect(doc.querySelector('style')?.textContent).toContain('.label');
    expect(doc.querySelector('#line')).not.toBeNull();
    expect(doc.querySelector('clipPath#clip')).not.toBeNull();
    expect(doc.querySelectorAll('use')).toHaveLength(2);
    expect(doc.querySelector('use[href="#line"]')).not.toBeNull();
    expect(doc.querySelector('text')?.getAttribute('class')).toBe('label');
    expect(doc.querySelector('text')?.getAttribute('style')).toContain('font-size');
    expect(doc.querySelector('text')?.textContent).toBe('Chart ✓');
  });

  it('sanitizes SVG before a custom image renderer sees it', async () => {
    const renderImage = vi.fn((src: string, alt?: string) => <img src={src} alt={alt} />);
    await renderOutput({ output_type: 'display_data', data: { 'image/svg+xml': svgAttack } }, { renderImage });
    expect(renderImage).toHaveBeenCalledOnce();
    const svg = decodeURIComponent(renderImage.mock.calls[0][0].split(',').slice(1).join(','));
    expectNoExecutableMarkup(parseHtml(svg));
    expect(svg).toContain('安全 ✓');
  });

  it('does not evaluate JavaScript MIME output', async () => {
    await renderOutput({ output_type: 'display_data', data: { 'application/javascript': 'window.__notebookXss=1' } });
    expect(container.textContent).toContain('Unsupported output format');
    expectNoExecutableMarkup(container);
  });
});

describe('notebook previews', () => {
  const notebook: JupyterNotebook = {
    nbformat: 4, nbformat_minor: 5, metadata: {},
    cells: [
      { cell_type: 'markdown', metadata: {}, source: `# Preview\n\n${attack}` },
      { cell_type: 'code', metadata: {}, source: textAttack, execution_count: null, outputs: [{ output_type: 'stream', name: 'stdout', text: textAttack }] },
      { cell_type: 'raw', metadata: {}, source: textAttack },
    ],
  };

  for (const input of ['object', 'JSON', 'file'] as const) {
    it(`renders untrusted ${input} notebooks safely without execution`, async () => {
      if (input === 'file') vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), text: async () => JSON.stringify(notebook) }));
      await render(<JupiterNotebookViewer notebook={input === 'object' ? notebook : input === 'JSON' ? JSON.stringify(notebook) : { filePath: '/security-fixture.ipynb' }} />);
      expect(container.querySelector('h1')?.textContent).toBe('Preview');
      expectNoExecutableMarkup(container);
      expect(container.querySelector('code')?.textContent).toBe(textAttack);
      expect(container.textContent).toContain(textAttack);
      for (const image of container.querySelectorAll('img')) expect(image.hasAttribute('onerror')).toBe(false);
    });
  }

  it('rejects encoded unsafe URLs at the shared sanitizer boundary', () => {
    const doc = parseHtml(sanitizeHtml('<a href=java&#x73;cript:alert(1)>one</a><a href="jav&#9;ascript:alert(1)">two</a><img src=x onerror=alert(1)>'));
    expectNoExecutableMarkup(doc);
    expect(doc.body.textContent).toContain('one');
    expect(doc.body.textContent).toContain('two');
  });
});
