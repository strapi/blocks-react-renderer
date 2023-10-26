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

  it('renders quotes', () => {
    render(
      <Block
        content={{
          type: 'quote',
          children: [{ type: 'text', text: 'A quote' }],
        }}
      />
    );

    const quote = screen.getByText('A quote');
    expect(quote).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(quote.closest('blockquote')).toBeInTheDocument();
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

  it('renders flat lists', () => {
    render(
      <Block
        content={{
          type: 'list',
          format: 'unordered',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'text', text: 'Item 1' }],
            },
            {
              type: 'list-item',
              children: [{ type: 'text', text: 'Item 2' }],
            },
          ],
        }}
      />
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Item 1');
    expect(items[1]).toHaveTextContent('Item 2');
  });

  it('renders nested lists', () => {
    render(
      <Block
        content={{
          type: 'list',
          format: 'ordered',
          children: [
            {
              type: 'list',
              format: 'unordered',
              children: [
                { type: 'list-item', children: [{ type: 'text', text: 'Nested item 1' }] },
              ],
            },
          ],
        }}
      />
    );

    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getByRole('listitem')).toHaveTextContent('Nested item 1');
  });

  it('renders images', () => {
    render(
      <Block
        content={{
          type: 'image',
          image: {
            name: 'test',
            alternativeText: 'Test',
            caption: 'Test',
            width: 100,
            height: 100,
            formats: {},
            hash: 'test',
            ext: 'jpg',
            mime: 'image/jpeg',
            url: 'https://test.com/test.jpg',
          },
        }}
      />
    );

    const image = screen.getByRole('img', { name: /test/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://test.com/test.jpg');
    expect(image).toHaveAttribute('alt', 'Test');
  });
});
