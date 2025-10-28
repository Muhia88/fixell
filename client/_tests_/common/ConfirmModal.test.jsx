/* eslint-env jest */
/* global describe, test, expect, jest */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../../src/components/common/ConfirmModal.jsx';

describe('ConfirmModal', () => {
  test('renders message and calls callbacks', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(<ConfirmModal message="Are you sure?" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

  const cancelBtn = screen.getByText(/Cancel/i);
  const confirmBtn = screen.getByRole('button', { name: /Confirm/i });

    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
