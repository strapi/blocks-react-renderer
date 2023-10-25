import * as React from 'react';

import { render as renderRTL, screen } from '@testing-library/react';

import { Text } from '../';
import { ComponentsProvider } from '../../BlocksRenderer';

const render = (ui: React.ReactElement) =>
  renderRTL(ui, {
    wrapper: ComponentsProvider,
  });

describe('Text', () => {
  it('renders text without modifiers', () => {
    render(<Text text="My text" />);
    expect(screen.getByText('My text')).toBeInTheDocument();
  });

  it('renders text with enabled modifiers', () => {
    render(<Text text="My text" bold italic underline strikethrough code />);

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
    // @ts-expect-error unknown is an invalid prop
    render(<Text text="My text" bold={false} unknown />);

    const text = screen.getByText('My text');
    expect(text).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    expect(text.closest('strong')).not.toBeInTheDocument();
  });
});
