import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast Component', () => {
  const defaultProps = {
    message: 'Test message',
    type: 'success',
    isVisible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render toast message when visible', () => {
    render(<Toast {...defaultProps} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('should not render when not visible', () => {
    render(<Toast {...defaultProps} isVisible={false} />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  test('should apply correct CSS classes for different types', () => {
    const { rerender } = render(<Toast {...defaultProps} type="success" />);
    let toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveClass('bg-green-500');

    rerender(<Toast {...defaultProps} type="error" />);
    toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveClass('bg-red-500');

    rerender(<Toast {...defaultProps} type="warning" />);
    toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveClass('bg-yellow-500');

    rerender(<Toast {...defaultProps} type="info" />);
    toastElement = screen.getByText('Test message').closest('div');
    expect(toastElement).toHaveClass('bg-blue-500');
  });

  test('should call onClose when close button is clicked', () => {
    render(<Toast {...defaultProps} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('should auto-close after timeout', async () => {
    jest.useFakeTimers();
    
    render(<Toast {...defaultProps} autoClose={true} duration={3000} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
    
    jest.useRealTimers();
  });

  test('should not auto-close when autoClose is false', async () => {
    jest.useFakeTimers();
    
    render(<Toast {...defaultProps} autoClose={false} duration={3000} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(3000);
    
    // Wait a bit to ensure onClose is not called
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  test('should handle long messages gracefully', () => {
    const longMessage = 'This is a very long message that should be displayed properly in the toast component without breaking the layout or causing any issues with the user interface';
    
    render(<Toast {...defaultProps} message={longMessage} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  test('should handle empty message', () => {
    render(<Toast {...defaultProps} message="" />);
    
    // Should still render the toast container even with empty message
    const toastContainer = screen.getByRole('alert');
    expect(toastContainer).toBeInTheDocument();
  });

  test('should have proper accessibility attributes', () => {
    render(<Toast {...defaultProps} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveAttribute('aria-live', 'polite');
  });

  test('should handle keyboard navigation for close button', () => {
    render(<Toast {...defaultProps} />);
    
    const closeButton = screen.getByRole('button');
    
    // Focus the close button
    closeButton.focus();
    expect(closeButton).toHaveFocus();
    
    // Press Enter to close
    fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});