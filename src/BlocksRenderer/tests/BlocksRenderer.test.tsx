import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { BlocksRenderer, type RootNode } from '..';

const content = [
  {
    type: 'heading',
    children: [
      {
        type: 'link',
        url: 'https://test.com',
        children: [{ type: 'text', text: 'A cool website' }],
      },
    ],
  },
  { type: 'paragraph', children: [{ type: 'text', text: 'A simple paragraph' }] },
] as RootNode[];

describe('BlocksRenderer', () => {
  it('should render content using default components', () => {
    render(<BlocksRenderer content={content} />);

    expect(screen.getByText('A simple paragraph')).toBeInTheDocument();
  });

  it('should render content using provided components', () => {
    render(
      <BlocksRenderer
        content={content}
        blocks={{
          paragraph: (props) => <div data-testid="customParagraph">{props.children}</div>,
          link: (props) => <button>{props.children}</button>,
        }}
      />
    );

    // Should use custom components
    expect(screen.getByTestId('customParagraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cool website/i })).toBeInTheDocument();

    // Should still fallback to default components
    expect(screen.getByRole('heading', { name: /cool website/i })).toBeInTheDocument();
  });
});
