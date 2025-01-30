/* eslint-disable testing-library/no-node-access */

import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { BlocksRenderer, type RootNode } from '../src/BlocksRenderer';

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
  describe('Props', () => {
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
      const underlineTag = document.querySelector('u');
      expect(underlineTag).toHaveTextContent(/and bold underlines/i);
    });
  });

  describe('Blocks', () => {
    it('renders paragraphs with text split across children', () => {
      render(
        <BlocksRenderer
          content={[
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'A paragraph' },
                { type: 'text', text: ' with bold', bold: true },
              ],
            },
          ]}
        />
      );

      const paragraph = screen.getByText('A paragraph').closest('p');
      expect(paragraph).toHaveTextContent('A paragraph with bold');
    });

    it('renders a br when there is an empty paragraph', () => {
      render(
        <BlocksRenderer
          content={[
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'First paragraph' }],
            },
            // empty paragraph
            {
              type: 'paragraph',
              children: [{ type: 'text', text: '' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Second paragraph' }],
            },
          ]}
        />
      );

      const brElement = screen.getByText('First paragraph').nextElementSibling;
      expect(brElement).toBeInTheDocument();
      expect(brElement?.tagName).toBe('BR');
    });

    it('renders paragraphs with line breaks', () => {
      render(
        <BlocksRenderer
          content={[
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'First line\nSecond line' }],
            },
          ]}
        />
      );

      const paragraph = screen.getByText(/First line/).closest('p');
      const paragraphParts = paragraph?.innerHTML?.split('<br>');
      expect(paragraphParts).toEqual(['First line', 'Second line']);
    });

    it('renders quotes', () => {
      render(
        <BlocksRenderer
          content={[
            {
              type: 'quote',
              children: [{ type: 'text', text: 'A quote' }],
            },
          ]}
        />
      );

      const quote = screen.getByText('A quote');
      expect(quote).toBeInTheDocument();
      expect(quote.closest('blockquote')).toBeInTheDocument();
    });

    it('renders code blocks', () => {
      render(
        <BlocksRenderer
          content={[{ type: 'code', children: [{ type: 'text', text: 'my code' }] }]}
        />
      );

      const code = screen.getByText('my code');
      expect(code).toBeInTheDocument();
      expect(code.closest('code')).toBeInTheDocument();
      expect(code.closest('pre')).toBeInTheDocument();
    });

    it('renders links', () => {
      render(
        <BlocksRenderer
          content={[
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: 'https://test.com',
                  children: [{ type: 'text', text: 'A link' }],
                },
              ],
            },
          ]}
        />
      );

      expect(screen.getByRole('link', { name: /a link/i })).toBeInTheDocument();
    });

    it('renders flat lists', () => {
      render(
        <BlocksRenderer
          content={[
            {
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
            },
          ]}
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
        <BlocksRenderer
          content={[
            {
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
            },
          ]}
        />
      );

      expect(screen.getAllByRole('list')).toHaveLength(2);
      expect(screen.getByRole('listitem')).toHaveTextContent('Nested item 1');
    });

    it('renders images', () => {
      render(
        <BlocksRenderer
          content={[
            {
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
                size: 100,
                provider: 'local',
                createdAt: '2021-01-01',
                updatedAt: '2021-01-01',
              },
              children: [{ type: 'text', text: '' }],
            },
          ]}
        />
      );

      const image = screen.getByRole('img', { name: /test/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://test.com/test.jpg');
      expect(image).toHaveAttribute('alt', 'Test');
    });

    it('handles missing block components', () => {
      const originalWarn = console.warn;
      console.warn = jest.fn();

      render(
        <BlocksRenderer
          content={[
            // @ts-expect-error unknown does not exist
            { type: 'unknown', children: [{ type: 'text', text: 'Should not appear' }] },
            // @ts-expect-error unknown does not exist
            { type: 'unknown', children: [{ type: 'text', text: 'Should not appear' }] },
            // @ts-expect-error unknown2 does not exist
            { type: 'unknown2', children: [{ type: 'text', text: 'Should not appear' }] },
          ]}
        />
      );

      expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledWith(
        '[@strapi/block-react-renderer] No component found for block type "unknown"'
      );
      expect(console.warn).toHaveBeenCalledWith(
        '[@strapi/block-react-renderer] No component found for block type "unknown2"'
      );

      console.warn = originalWarn;
    });
  });

  describe('Modifiers', () => {
    it('renders text without modifiers', () => {
      render(
        <BlocksRenderer
          content={[{ type: 'paragraph', children: [{ type: 'text', text: 'My text' }] }]}
        />
      );
      expect(screen.getByText('My text')).toBeInTheDocument();
    });

    it('renders text with enabled modifiers', () => {
      render(
        <BlocksRenderer
          content={[
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'My text',
                  bold: true,
                  italic: true,
                  underline: true,
                  strikethrough: true,
                  code: true,
                },
              ],
            },
          ]}
        />
      );

      const text = screen.getByText('My text');
      expect(text).toBeInTheDocument();

      /* eslint-disable testing-library/no-node-access */
      expect(text.closest('strong')).toBeInTheDocument();
      expect(text.closest('em')).toBeInTheDocument();
      expect(text.closest('u')).toBeInTheDocument();
      expect(text.closest('del')).toBeInTheDocument();
      expect(text.closest('code')).toBeInTheDocument();
      /* eslint-enable testing-library/no-node-access */
    });

    it('ignores disabled or unknown modifiers', () => {
      const originalWarn = console.warn;
      console.warn = jest.fn();

      render(
        <BlocksRenderer
          content={[
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'My text',
                  bold: false,
                  // @ts-expect-error unknown is an invalid prop
                  unknown: true,
                },
              ],
            },
          ]}
        />
      );

      const text = screen.getByText('My text');
      expect(text).toBeInTheDocument();

      expect(text.closest('strong')).not.toBeInTheDocument();

      console.warn = originalWarn;
    });

    it('handles missing modifier components', () => {
      const originalWarn = console.warn;
      console.warn = jest.fn();

      render(
        <BlocksRenderer
          content={[
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'My paragraph',
                  // @ts-expect-error unknown is an invalid modifier
                  unknown: true,
                },
                {
                  type: 'text',
                  text: 'Still my paragraph',
                  unknown: true,
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'My other paragraph',
                  // @ts-expect-error unknown is an invalid modifier
                  unknown: true,
                  unknown2: true,
                },
              ],
            },
          ]}
        />
      );

      expect(screen.getByText(/my paragraph/i)).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledWith(
        '[@strapi/block-react-renderer] No component found for modifier "unknown"'
      );
      expect(console.warn).toHaveBeenCalledWith(
        '[@strapi/block-react-renderer] No component found for modifier "unknown2"'
      );

      console.warn = originalWarn;
    });

    it('parses code blocks to plain text', () => {
      render(
        <BlocksRenderer
          content={[
            {
              type: 'code',
              children: [
                {
                  type: 'text',
                  text: 'const a = 1;',
                },
                {
                  type: 'link',
                  url: 'https://test.com',
                  children: [{ type: 'text', text: 'const b = 2;', bold: true }],
                },
              ],
            },
          ]}
          blocks={{
            code: (props) => (
              <pre>
                <code>{props.plainText}</code>
              </pre>
            ),
          }}
        />
      );

      expect(screen.getByText('const a = 1;const b = 2;')).toBeInTheDocument();
    });
  });
});
