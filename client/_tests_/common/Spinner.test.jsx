/* eslint-env jest */
/* global describe, test, expect */
import React from 'react';
import { render } from '@testing-library/react';
import Spinner from '../../src/components/common/Spinner.jsx';

describe('Spinner', () => {
  test('renders with aria-busy', () => {
    render(<Spinner />);
    //checks for aria-busy attribute placed on the container
  const container = document.querySelector('[aria-busy]');
    expect(container).toBeTruthy();
  });
});
