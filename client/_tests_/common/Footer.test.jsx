/* eslint-env jest */
/* global describe, test, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../src/components/common/Footer.jsx';

describe('Footer', () => {
  test('renders copyright text and links', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 Fixell/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
  });
});
