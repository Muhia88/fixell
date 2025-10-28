/* eslint-env jest */
/* global describe, test, expect, jest */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../src/components/common/Button.jsx';

describe('Button', () => {
  test('renders children and handles click', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
