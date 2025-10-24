# Development Guide

## Using iomete-jupiter-parser in Console (Local Development)

### Setup

1. **Build the library** (in iomete-jupiter-parser directory):
   ```bash
   npm run build
   ```

2. **Add to Console** (already done):
   ```bash
   cd ../Console
   yarn add file:../iomete-jupiter-parser
   ```

### Development Workflow

1. **Watch Mode** - For active development, run in the parser directory:
   ```bash
   npm run dev
   ```
   This will watch for changes and rebuild automatically.

2. **After making changes**:
   - The library will rebuild automatically if using watch mode
   - In Console, you might need to restart the dev server to see changes:
     ```bash
     yarn dev
     ```

3. **Force Update** - If changes aren't reflected:
   ```bash
   # In Console directory
   yarn upgrade iomete-jupiter-parser
   ```

### Usage Example

```tsx
import { ExampleComponent } from 'iomete-jupiter-parser';

function MyComponent() {
  return (
    <ExampleComponent 
      title="Click me" 
      onClick={() => console.log('Clicked!')}
      variant="primary"
    />
  );
}
```

### Troubleshooting

1. **TypeScript errors**: Make sure to build the library first (`npm run build`)
2. **Module not found**: Try removing node_modules and reinstalling:
   ```bash
   # In Console
   rm -rf node_modules
   yarn install
   ```
3. **Changes not reflecting**: Restart Console dev server

### Publishing to npm

When ready to publish:

1. Update version in package.json
2. Build: `npm run build`
3. Publish: `npm publish`
4. In Console, update to npm version:
   ```bash
   yarn remove iomete-jupiter-parser
   yarn add iomete-jupiter-parser
   ```