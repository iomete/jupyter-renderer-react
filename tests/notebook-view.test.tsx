import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JupiterNotebookViewer } from '../src/components/JupyterNotebookViewer';
import { parseNotebook } from '../src/utils/parseNotebook';
import { loadNotebookFromPath } from '../src/utils/fileLoader';
import type { JupyterNotebook } from '../src/types/notebook';

// Isolate the loading boundary so assertions compare the exact source passed to
// inspection. json-source.test.tsx covers the real JSON renderer and its folds.
vi.mock('../src/components/JupyterNotebookViewer/JsonSource', () => ({
  JsonSource: ({ source, className, style }: { source: string; className?: string; style?: React.CSSProperties }) => (
    <pre data-testid="json-source" className={className} style={style}>{source}</pre>
  ),
}));

const source = `{
  "nbformat": 4,
  "nbformat_minor": 5,
  "metadata": {"custom": "retain me"},
  "cells": [{
    "cell_type": "code",
    "metadata": {},
    "source": ["print('hello')", "\\n"],
    "execution_count": null,
    "outputs": [{"output_type":"stream","name":"stdout","text":["hello","\\n"]}]
  }]
}`;

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
}

function inspectSource() {
  return container.querySelector('[data-testid="json-source"]')?.textContent;
}

function response(text = source) {
  return { ok: true, headers: new Headers({ 'content-type': 'application/json' }), text: async () => text };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

describe('controlled notebook representation', () => {
  it('defaults to the notebook and lets the host switch views without an internal action', async () => {
    await render(<JupiterNotebookViewer notebook={source} />);
    expect(container.textContent).toContain("print('hello')");
    expect(inspectSource()).toBeUndefined();
    expect(container.querySelector('button')).toBeNull();

    await render(<JupiterNotebookViewer notebook={source} view="json" />);
    expect(inspectSource()).toBe(source);

    await render(<JupiterNotebookViewer notebook={source} view="notebook" />);
    expect(inspectSource()).toBeUndefined();
    expect(container.textContent).toContain("print('hello')");
  });

  it('retains the input object before normalization and does not mutate frozen callers', async () => {
    const notebook = freeze(JSON.parse(source) as JupyterNotebook);
    const original = JSON.stringify(notebook);
    await render(<JupiterNotebookViewer notebook={notebook} />);
    expect(container.textContent).toContain('hello');
    await render(<JupiterNotebookViewer notebook={notebook} view="json" />);
    expect(JSON.parse(inspectSource()!)).toEqual(JSON.parse(source));
    expect(JSON.stringify(notebook)).toBe(original);
    expect(Array.isArray(notebook.cells[0].source)).toBe(true);
  });

  it('retains exact input text, including numeric spelling and whitespace', async () => {
    const original = source.replace('"retain me"', '9007199254740993');
    await render(<JupiterNotebookViewer notebook={original} />);
    await render(<JupiterNotebookViewer notebook={original} view="json" />);
    expect(inspectSource()).toBe(original);
  });

  it.each(['{"cells": [', '', '{"nbformat":3,"cells":[]}', '{"nbformat":4,"cells":[{"cell_type":"unknown"}]}'])(
    'keeps rejected source inspectable: %s', async invalid => {
      const onError = vi.fn();
      await render(<JupiterNotebookViewer notebook={invalid} onError={onError} />);
      expect(container.textContent).toContain('Error parsing notebook');
      await render(<JupiterNotebookViewer notebook={invalid} view="json" onError={onError} />);
      expect(inspectSource()).toBe(invalid);
      expect(onError).toHaveBeenCalledTimes(1);
    },
  );

  it('passes JSON-specific styling through while preserving root styling', async () => {
    await render(<JupiterNotebookViewer notebook={source} view="json" className="host" classNames={{ root: 'root-slot', jsonSource: 'source-slot' }} styles={{ root: { padding: 7 }, jsonSource: { maxHeight: 200 } }} />);
    expect(container.firstElementChild?.classList.contains('host')).toBe(true);
    expect(container.firstElementChild?.classList.contains('root-slot')).toBe(true);
    expect(container.querySelector<HTMLElement>('.root-slot')?.style.padding).toBe('7px');
    expect(container.querySelector<HTMLElement>('.source-slot')?.style.maxHeight).toBe('200px');
  });
});

describe('loaded source lifecycle', () => {
  it('reuses one fetch across modes, equivalent options, and callback identities', async () => {
    const fetch = vi.fn().mockResolvedValue(response());
    vi.stubGlobal('fetch', fetch);
    const onFileLoad = vi.fn();
    await render(<JupiterNotebookViewer notebook={{ filePath: '/example.ipynb' }} fetchOptions={{ headers: { B: '2', A: '1' } }} onFileLoad={onFileLoad} />);
    expect(onFileLoad).toHaveBeenCalledTimes(1);
    expect(onFileLoad.mock.calls[0][0].cells[0].source).toBe("print('hello')\n");

    await render(<JupiterNotebookViewer notebook={{ filePath: '/example.ipynb' }} view="json" fetchOptions={{ headers: { A: '1', B: '2' } }} onFileLoad={() => {}} />);
    expect(inspectSource()).toBe(source);
    expect(fetch).toHaveBeenCalledTimes(1);
    await render(<JupiterNotebookViewer notebook={{ filePath: '/example.ipynb' }} fetchOptions={{ headers: { B: '2', A: '1' } }} />);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not restart a pending fetch when the view changes and calls the latest callback', async () => {
    const pending = deferred<ReturnType<typeof response>>();
    const fetch = vi.fn().mockReturnValue(pending.promise);
    vi.stubGlobal('fetch', fetch);
    const oldCallback = vi.fn(), newCallback = vi.fn();
    await render(<JupiterNotebookViewer notebook={{ filePath: '/pending.ipynb' }} onFileLoad={oldCallback} />);
    await render(<JupiterNotebookViewer notebook={{ filePath: '/pending.ipynb' }} view="json" onFileLoad={newCallback} />);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(false);
    await act(async () => pending.resolve(response()));
    expect(inspectSource()).toBe(source);
    expect(oldCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalledTimes(1);
  });

  it('retains malformed fetched text for inspection without refetching', async () => {
    const invalid = '{"nbformat":4,"cells":[';
    const fetch = vi.fn().mockResolvedValue(response(invalid));
    vi.stubGlobal('fetch', fetch);
    const onFileError = vi.fn();
    await render(<JupiterNotebookViewer notebook={{ filePath: '/broken.ipynb' }} onFileError={onFileError} />);
    expect(container.textContent).toContain('Error parsing notebook');
    await render(<JupiterNotebookViewer notebook={{ filePath: '/broken.ipynb' }} view="json" onFileError={onFileError} />);
    expect(inspectSource()).toBe(invalid);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onFileError).toHaveBeenCalledTimes(1);
  });

  it('hides the previous source while a new file loads and ignores obsolete responses', async () => {
    const first = deferred<ReturnType<typeof response>>();
    const second = deferred<ReturnType<typeof response>>();
    const fetch = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    vi.stubGlobal('fetch', fetch);
    const onFileLoad = vi.fn();
    await render(<JupiterNotebookViewer notebook={{ filePath: '/first.ipynb' }} view="json" onFileLoad={onFileLoad} />);
    await render(<JupiterNotebookViewer notebook={{ filePath: '/second.ipynb' }} view="json" onFileLoad={onFileLoad} />);
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    const next = source.replace('retain me', 'second file');
    await act(async () => second.resolve(response(next)));
    expect(inspectSource()).toBe(next);
    await act(async () => first.resolve(response()));
    expect(inspectSource()).toBe(next);
    expect(onFileLoad).toHaveBeenCalledTimes(1);
  });

  it('does not show a previously loaded source after a different file fails', async () => {
    const pending = deferred<{ ok: boolean; status: number; statusText: string }>();
    const fetch = vi.fn().mockResolvedValueOnce(response()).mockReturnValueOnce(pending.promise);
    vi.stubGlobal('fetch', fetch);
    await render(<JupiterNotebookViewer notebook={{ filePath: '/first.ipynb' }} view="json" />);
    expect(inspectSource()).toBe(source);
    await render(<JupiterNotebookViewer notebook={{ filePath: '/missing.ipynb' }} view="json" />);
    expect(inspectSource()).toBeUndefined();
    expect(container.textContent).toContain('Loading notebook');
    await act(async () => pending.resolve({ ok: false, status: 404, statusText: 'Not found' }));
    expect(inspectSource()).toBeUndefined();
    expect(container.textContent).toContain('Notebook file not found');
  });

  it('reloads when request options actually change', async () => {
    const fetch = vi.fn().mockResolvedValue(response());
    vi.stubGlobal('fetch', fetch);
    await render(<JupiterNotebookViewer notebook={{ filePath: '/example.ipynb' }} view="json" fetchOptions={{ credentials: 'omit' }} />);
    await render(<JupiterNotebookViewer notebook={{ filePath: '/example.ipynb' }} view="json" fetchOptions={{ credentials: 'include' }} />);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].credentials).toBe('include');
  });
});

describe('source-preserving parsing compatibility', () => {
  it('normalizes a separate model without changing the public parser input', () => {
    const original = freeze(JSON.parse(source) as JupyterNotebook);
    const parsed = parseNotebook(original);
    expect(parsed).not.toBe(original);
    expect(parsed.cells[0].source).toBe("print('hello')\n");
    expect(original).toEqual(JSON.parse(source));
  });

  it('keeps the public file loader returning a parsed notebook', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()));
    const parsed = await loadNotebookFromPath('/example.ipynb');
    expect(parsed.cells[0].source).toBe("print('hello')\n");
    expect(parsed.metadata.custom).toBe('retain me');
  });
});
