/* eslint-env jest */
/* global describe, test, expect, jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

//mocks the useAuth hook so we can control auth state in tests
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

import { useAuth } from '../../src/hooks/useAuth.js';
import Navbar from '../../src/components/common/Navbar.jsx';

describe('Navbar', () => {
  test('shows Home link when logged out', () => {
    useAuth.mockImplementation(() => ({ isLoggedIn: false, user: null }));

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });

  test('shows protected links when logged in', () => {
    useAuth.mockImplementation(() => ({ isLoggedIn: true, user: { name: 'Tester' }, logout: jest.fn() }));

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/My Listings/i)).toBeInTheDocument();
    expect(screen.getByText(/My Impact/i)).toBeInTheDocument();
  });
});
