/* eslint-env jest */
/* global describe, test, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../../src/components/common/Card.jsx';

describe('Card', () => {
  test('renders children content', () => {
    render(<Card>Inner</Card>);
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });
});
