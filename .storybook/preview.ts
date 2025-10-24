import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      story: {
        inline: true,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Components', '*'],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;