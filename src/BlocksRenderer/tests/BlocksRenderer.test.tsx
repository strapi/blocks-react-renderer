import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { BlocksRenderer, type RootNode } from '..';

const content = [
  {
    type: 'heading',
    level: 1,
    children: [
      {
        type: 'link',
        url: 'https://test.com',
        children: [{ type: 'text', text: 'A cool website' }],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { type: 'text', text: 'A simple paragraph' },
      { type: 'text', text: 'with bold text', bold: true },
      { type: 'text', text: ' and bold underlines', bold: true, underline: true },
    ],
  },
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
        modifiers={{
          bold: (props) => <b data-testid="customBold">{props.children}</b>,
        }}
      />
    );

    // Should use custom block components
    expect(screen.getByTestId('customParagraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cool website/i })).toBeInTheDocument();

    // Should still fallback to default components
    expect(screen.getByRole('heading', { name: /cool website/i })).toBeInTheDocument();

    // Should use custom modifier components
    const boldTag = screen.getAllByTestId('customBold');
    expect(boldTag).toHaveLength(2);
    expect(boldTag[0]).toHaveTextContent(/with bold text/i);
    expect(boldTag[1]).toHaveTextContent(/and bold underlines/i);

    // Should still fallback to default components
    // eslint-disable-next-line testing-library/no-node-access
    const underlineTag = document.querySelector('u');
    expect(underlineTag).toHaveTextContent(/and bold underlines/i);
  });
});
