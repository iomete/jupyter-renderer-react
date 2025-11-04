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

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

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
| `theme`           | `'light' \| 'dark'` | `'light'` | Color theme for the renderer          |
| `showCellNumbers` | `boolean`           | `true`    | Show execution count for code cells   |
| `showOutputs`     | `boolean`           | `true`    | Show cell outputs                     |
| `collapsible`     | `boolean`           | `false`   | Allow cells to be collapsed           |
| `copyable`        | `boolean`           | `true`    | Show copy button for code cells       |

