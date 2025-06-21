import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../src/renderer/components/atoms/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600'); // primary variant
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600');

    rerender(<Button variant="outline">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-gray-300');

    rerender(<Button variant="ghost">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-gray-700');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="sm">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Button size="md">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base');

    rerender(<Button size="lg">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('handles fullWidth prop', () => {
    render(<Button fullWidth>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('handles disabled state', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Test</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed', 'opacity-50');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles loading state', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Test</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});