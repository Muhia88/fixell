/* eslint-env jest */
/* global describe, test, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileIcon from '../../src/components/common/ProfileIcon.jsx';

describe('ProfileIcon', () => {
  test('shows initials when provided', () => {
    render(<ProfileIcon initials="AB" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
