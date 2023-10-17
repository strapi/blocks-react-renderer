import * as React from 'react';

import { render } from '@testing-library/react';

import { BlocksRenderer } from '../..';

describe('BlocksRenderer', () => {
  it('should render', () => {
    render(<BlocksRenderer />);
  });
});
