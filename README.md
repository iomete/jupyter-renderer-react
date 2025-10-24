# iomete-jupiter-parser

React component library for IOMETE Jupiter parser.

## Installation

```bash
npm install iomete-jupiter-parser
```

## Usage

```tsx
import { ExampleComponent } from 'iomete-jupiter-parser';

function App() {
  return (
    <ExampleComponent 
      title="Click me" 
      onClick={() => console.log('Clicked!')}
      variant="primary"
    />
  );
}
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

## Project Structure

```
iomete-jupiter-parser/
├── src/
│   ├── index.ts              # Main entry point
│   └── components/           # React components
│       └── ExampleComponent/
│           └── index.tsx
├── dist/                     # Build output (gitignored)
│   ├── cjs/                 # CommonJS build
│   ├── esm/                 # ES Modules build
│   └── index.d.ts           # TypeScript declarations
├── package.json
├── tsconfig.json            # TypeScript configuration
└── rollup.config.js         # Rollup bundler configuration
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