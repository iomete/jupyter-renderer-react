import type { Meta, StoryObj } from '@storybook/react';

const WelcomeComponent = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🚀 iomete-jupiter-parser</h1>
      
      <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#666', marginBottom: '30px' }}>
        Welcome to the <strong>iomete-jupiter-parser</strong> component library!
      </p>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>✨ Features</h2>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li>🚀 <strong>Modern React Components</strong> - Built with TypeScript and modern React patterns</li>
          <li>📦 <strong>Tree-shakable</strong> - Import only what you need</li>
          <li>🎨 <strong>Customizable</strong> - Easy to style and adapt to your needs</li>
          <li>📚 <strong>Well Documented</strong> - Comprehensive Storybook documentation</li>
          <li>✅ <strong>Type Safe</strong> - Full TypeScript support</li>
        </ul>
      </div>

      <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>🚀 Quick Start</h3>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '14px',
          border: '1px solid #ddd'
        }}>
{`npm install iomete-jupiter-parser

import { ExampleComponent } from 'iomete-jupiter-parser';

function App() {
  return (
    <ExampleComponent 
      title="Hello World" 
      onClick={() => console.log('Clicked!')}
      variant="primary"
    />
  );
}`}
        </pre>
      </div>

      <p style={{ color: '#666', fontSize: '16px' }}>
        👈 Explore the components in the sidebar to see what's available and how to use them.
      </p>
    </div>
  );
};

const meta: Meta<typeof WelcomeComponent> = {
  title: 'Introduction/Welcome',
  component: WelcomeComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Welcome to the iomete-jupiter-parser component library',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {};