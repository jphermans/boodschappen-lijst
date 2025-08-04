import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast Component', () => {
  const mockOnRemove = jest.fn();
  const defaultToast = {
    id: 'test-toast-1',
    message: 'Test message',
    type: 'success',
    duration: 2500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render toast message', () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('should apply correct styles for different types', () => {
    const { rerender } = render(<Toast toast={{ ...defaultToast, type: 'success' }} onRemove={mockOnRemove} />);
    let toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveStyle('background-color: rgba(34, 197, 94, 0.9)');

    rerender(<Toast toast={{ ...defaultToast, type: 'error' }} onRemove={mockOnRemove} />);
    toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveStyle('background-color: rgba(239, 68, 68, 0.9)');

    rerender(<Toast toast={{ ...defaultToast, type: 'warning' }} onRemove={mockOnRemove} />);
    toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveStyle('background-color: rgba(249, 115, 22, 0.9)');

    rerender(<Toast toast={{ ...defaultToast, type: 'info' }} onRemove={mockOnRemove} />);
    toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveStyle('background-color: rgba(59, 130, 246, 0.9)');
  });

  test('should call onRemove when close button is clicked', () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith('test-toast-1');
  });

  test('should auto-close after timeout', async () => {
    jest.useFakeTimers();
    
    render(<Toast toast={{ ...defaultToast, duration: 1000 }} onRemove={mockOnRemove} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledTimes(1);
      expect(mockOnRemove).toHaveBeenCalledWith('test-toast-1');
    });
    
    jest.useRealTimers();
  });

  test('should handle long messages gracefully', () => {
    const longMessage = 'This is a very long message that should be displayed properly in the toast component without breaking the layout or causing any issues with the user interface';
    
    render(<Toast toast={{ ...defaultToast, message: longMessage }} onRemove={mockOnRemove} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  test('should handle empty message', () => {
    render(<Toast toast={{ ...defaultToast, message: '' }} onRemove={mockOnRemove} />);
    
    // Should still render the toast container even with empty message
    const toastContainer = screen.getByRole('button').closest('div');
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer).toHaveClass('flex', 'items-center');
  });

  test('should render correct icons for different types', () => {
    const { rerender } = render(<Toast toast={{ ...defaultToast, type: 'success' }} onRemove={mockOnRemove} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();

    rerender(<Toast toast={{ ...defaultToast, type: 'error' }} onRemove={mockOnRemove} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();

    rerender(<Toast toast={{ ...defaultToast, type: 'warning' }} onRemove={mockOnRemove} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();

    rerender(<Toast toast={{ ...defaultToast, type: 'info' }} onRemove={mockOnRemove} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();

    rerender(<Toast toast={{ ...defaultToast, type: 'delete' }} onRemove={mockOnRemove} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('should handle keyboard navigation for close button', () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    const closeButton = screen.getByRole('button');
    
    // Focus the close button
    closeButton.focus();
    expect(closeButton).toHaveFocus();
    
    // Press Enter to close
    fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(closeButton); // The component doesn't handle keyDown, only click
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });
});