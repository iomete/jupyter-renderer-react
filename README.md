# jupyter-renderer-react

React component library for rendering Jupyter notebooks with syntax highlighting and markdown support.

## Installation

```bash
npm install jupyter-renderer-react
```

## Usage

The `JupiterParser` component supports three different ways to provide notebook data:

### Method 1: Parsed Notebook Object

```tsx
import { JupyterNotebookViewer } from 'jupyter-renderer-react';

function App() {
  const notebook = {
    cells: [
      {
        cell_type: "markdown",
        metadata: {},
        source: "# My Jupyter Notebook"
      },
      {
        cell_type: "code",
        execution_count: 1,
        metadata: {},
        source: "print('Hello, World!')",
        outputs: [
          {
            output_type: "stream",
            name: "stdout",
            text: "Hello, World!\n"
          }
        ]
      }
    ],
    metadata: {},
    nbformat: 4,
    nbformat_minor: 4
  };

  return (
    <JupyterNotebookViewer 
      notebook={notebook}
      theme="light"
      showCellNumbers={true}
      showOutputs={true}
      collapsible={true}
      copyable={true}
    />
  );
}
```

### Method 2: JSON String

```tsx
import { JupiterParser } from 'jupyter-renderer-react';

function App() {
  const notebookJSON = `{
    "cells": [...],
    "metadata": {},
    "nbformat": 4,
    "nbformat_minor": 4
  }`;

  return (
    <JupiterParser 
      notebook={notebookJSON}
      theme="light"
    />
  );
}
```

### Method 3: File Path (NEW!)

```tsx
import { JupiterParser } from 'jupyter-renderer-react';

function App() {
  return (
    <JupiterParser
      notebook={{ filePath: "https://example.com/notebook.ipynb" }}
      theme="light"
      showCellNumbers={true}
      showOutputs={true}
      onFileLoad={(notebook) => {
        console.log("Notebook loaded successfully:", notebook);
      }}
      onFileError={(error) => {
        console.error("Failed to load notebook:", error);
      }}
      fetchOptions={{
        headers: { 'Authorization': 'Bearer token' },
        timeout: 10000
      }}
    />
  );
}
```

### Local File Example

```tsx
// For local development or when serving files
<JupiterParser 
  notebook={{ filePath: "/path/to/notebook.ipynb" }}
  theme="light"
/>
```

## Features

- **Syntax Highlighting**: Code cells with proper syntax highlighting for multiple languages
- **Markdown Rendering**: Full markdown support for markdown cells
- **Output Display**: Support for various output types (text, images, errors, etc.)
- **Dark/Light Theme**: Built-in theme support
- **Copy to Clipboard**: Copy button for code cells
- **Collapsible Cells**: Optional collapsing of cell content
- **Cell Numbers**: Display execution count for code cells
- **TypeScript Support**: Full TypeScript definitions included
- **File Loading**: Direct loading from URLs or file paths
- **Error Handling**: Comprehensive error handling for file loading and parsing

## Notebook and JSON views

Set `view="json"` to inspect a notebook's underlying JSON. The default,
`view="notebook"`, keeps the existing rendered notebook with code and saved
outputs. View selection is controlled by the consuming application; the renderer
does not add a button or toolbar.

Place a **View JSON** / **View notebook** button at the right of your existing file
header, using your application's UI-library Button. For example, in an app that
already uses shadcn/Tailwind:

```tsx
import { useState } from 'react';
import {
  JupiterNotebookViewer,
  type JupiterNotebookViewerProps,
  type NotebookView,
} from '@iomete/jupyter-renderer-react';
import { Button } from '@/components/ui/button'; // Your application's Button

export function NotebookPanel({ notebook }: Pick<JupiterNotebookViewerProps, 'notebook'>) {
  const [view, setView] = useState<NotebookView>('notebook');

  return (
    <section>
      <div className="flex items-center justify-end pb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setView(current => current === 'notebook' ? 'json' : 'notebook')}
        >
          {view === 'notebook' ? 'View JSON' : 'View notebook'}
        </Button>
      </div>
      <JupiterNotebookViewer notebook={notebook} view={view} />
    </section>
  );
}
```

The application supplies the Button and its styles. This package does not require
shadcn or Tailwind. The JSON surface follows the viewer's `theme` and can be
customized with `classNames.jsonSource` and `styles.jsonSource`.

JSON inspection is read-only, with syntax colors and keyboard-accessible folding
for nested data and long values such as embedded images. JSON strings and fetched
files are retained before notebook normalization. Object inputs are serialized
before rendering and are not mutated; their original file whitespace is not
available. Valid JSON is displayed with readable formatting, while invalid JSON
is shown as its original text.

The JSON view remains available if the source loaded but notebook parsing fails.
Switching views reuses the loaded source without another fetch. Downloads and
exports are outside this API.

See **Components / JupyterNotebookViewer / JSON view** in Storybook for
examples of host-owned controls, JSON-first rendering, themes, large payloads, and
invalid-source inspection.

## Error Handling

The component provides robust error handling for different scenarios:

```tsx
<JupiterParser 
  notebook={{ filePath: "https://example.com/notebook.ipynb" }}
  onFileLoad={(notebook) => {
    console.log("Loaded notebook with", notebook.cells.length, "cells");
  }}
  onFileError={(error) => {
    // Handle file loading errors (network, 404, etc.)
    if (error.message.includes('not found')) {
      console.error("Notebook file not found");
    } else if (error.message.includes('Network error')) {
      console.error("Network issue, try again later");
    } else {
      console.error("File loading error:", error.message);
    }
  }}
  onError={(error) => {
    // Handle parsing errors
    console.error("Notebook parsing error:", error.message);
  }}
/>
```

## Best Practices

1. **Always handle errors** when loading files from external sources
2. **Use timeout** for network requests to prevent hanging
3. **Validate file extensions** before passing to the component
4. **Provide fallback content** for when loading fails
5. **Use proper CORS headers** when loading from different domains

```tsx
// Good practice example
<JupiterParser 
  notebook={{ filePath: url }}
  fetchOptions={{
    timeout: 10000,
    headers: { 'Accept': 'application/json' }
  }}
  onFileError={(error) => {
    setErrorMessage(`Failed to load notebook: ${error.message}`);
    setShowFallback(true);
  }}
/>
```

## Rendering untrusted notebooks

Notebook previews render saved Markdown and outputs without executing notebook
code. Treat shared, imported, and Git notebooks as untrusted input.

The built-in renderers apply these protections:

- Markdown is parsed with Marked, then sanitized with DOMPurify using an HTML-only
  policy. Embedded scripts, event handlers, unsafe URLs, styles, and named DOM
  properties are removed before insertion into the page.
- Stdout, stderr, plain-text outputs, and tracebacks are escaped before ANSI
  formatting is added. Text that resembles HTML remains literal text.
- Rich HTML outputs are sanitized and displayed in a 320px-high, scrollable
  `sandbox=""` iframe. The frame has no script or same-origin permissions, uses
  `no-referrer`, and applies a CSP that blocks scripts, external resources, forms,
  and base URLs. Inline styles and embedded data images remain available for
  tables and plots. Output HTML cannot inherit the host application's CSS.
- SVG outputs are sanitized and rendered as image data URLs. Plot styles,
  internal references, and Unicode labels are preserved inside the image;
  SVG is never inserted directly into the host document.
- When a supported browser DOM is unavailable, sanitization fails closed by
  escaping markup instead of returning untrusted HTML.

Custom renderers are trusted application code and replace the corresponding
built-in protection. `renderMarkdown`, `renderCode`, and `renderError` receive
untrusted source; escape text and sanitize any HTML they generate. `renderHtml`
receives sanitized rich HTML, including styles, and must preserve isolation with
a sandboxed iframe. Do not grant that iframe `allow-scripts` or
`allow-same-origin`. `renderImage` receives sanitized SVG image URLs; render them
with an image element rather than decoding and inserting SVG into the page.

JavaScript MIME outputs are not executed. Interactive HTML widgets, external
resources inside HTML outputs, and raw Markdown styling are intentionally
restricted. Keep DOMPurify current and rebuild this package when updating it;
the published bundles include the sanitizer.

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Security regression tests

```bash
npm test
```

The tests cover rendering sinks, encoded unsafe URLs, text escaping, sandbox
attributes and CSP, SVG plot compatibility, custom-renderer inputs, and notebook
loading from objects, JSON strings, and file paths. Use `npm run test:watch` while
developing.

### Development with watch mode

```bash
npm run dev
```

### Storybook

View and develop components in isolation:

```bash
npm run storybook
```

Open http://localhost:6006 to view the component library.

### Build Storybook

```bash
npm run build-storybook
```

## Component Props

| Prop              | Type                | Default   | Description                           |
| ----------------- | ------------------- | --------- | ------------------------------------- |
| `notebook`        | `JupyterNotebook`   | required  | The Jupyter notebook object to render |
| `view`           | `'notebook' \| 'json'` | `'notebook'` | Controlled rendered notebook or read-only JSON view |
| `theme`           | `'light' \| 'dark'` | `'light'` | Color theme for the renderer          |
| `showCellNumbers` | `boolean`           | `true`    | Show execution count for code cells   |
| `showOutputs`     | `boolean`           | `true`    | Show cell outputs                     |
| `collapsible`     | `boolean`           | `false`   | Allow cells to be collapsed           |
| `copyable`        | `boolean`           | `true`    | Show copy button for code cells       |

## Project Structure

```
jupyter-renderer-react/
├── src/
│   ├── index.ts                      # Main entry point
│   └── components/                   # React components
│       └── JupyterNotebookViewer/    # Main renderer component
│           ├── index.tsx             # Main component
│           ├── Cell.tsx              # Cell wrapper
│           ├── CodeCell.tsx          # Code cell renderer
│           ├── MarkdownCell.tsx      # Markdown cell renderer
│           ├── Output.tsx            # Output renderer
│           └── CopyButton.tsx        # Copy functionality
```

## Technology Stack

- **Build Tool**: Rollup - Optimized for library bundling with excellent tree-shaking
- **Language**: TypeScript - For type safety and better developer experience
- **Module Formats**: Both ESM and CommonJS for maximum compatibility
- **React**: Peer dependency to avoid version conflicts
- **Storybook**: Component development and documentation environment

## Publishing to npm

1. Update version in package.json
2. Build the project: `npm run build`
3. Publish: `npm publish`

## Next Steps

- ✅ Set up Storybook for component development
- Add testing framework (Vitest/Jest)
- Add linting and formatting (ESLint/Prettier)
- Set up CI/CD pipeline
- Add more component examples