import * as React from 'react';

import { render as renderRTL, screen } from '@testing-library/react';

import { Block } from '../';
import { ComponentsProvider } from '../../BlocksRenderer';

const render = (ui: React.ReactElement) =>
  renderRTL(ui, {
    wrapper: ComponentsProvider,
  });

describe('Block', () => {
  it('renders text split across children', () => {
    render(
      <Block
        content={{
          type: 'paragraph',
          children: [
            { type: 'text', text: 'A paragraph' },
            { type: 'text', text: ' with bold', bold: true },
          ],
        }}
      />
    );

    // eslint-disable-next-line testing-library/no-node-access
    const paragraph = screen.getByText('A paragraph').closest('p');
    expect(paragraph).toHaveTextContent('A paragraph with bold');
  });

  it('renders links', () => {
    render(
      <Block
        content={{
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://test.com',
              children: [{ type: 'text', text: 'A link' }],
            },
          ],
        }}
      />
    );

    expect(screen.getByRole('link', { name: /a link/i })).toBeInTheDocument();
  });
});
