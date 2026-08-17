import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Calculator } from '@/app/components/apps/Calculator';

describe('Calculator', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the calculator display and keypad', () => {
    render(<Calculator />);
    expect(screen.getByTestId('calculator')).toBeTruthy();
    expect(screen.getByTestId('calc-display')).toBeTruthy();
    expect(screen.getByTestId('calc-1')).toBeTruthy();
    expect(screen.getByTestId('calc-equals')).toBeTruthy();
  });

  it('starts at zero', () => {
    render(<Calculator />);
    expect(screen.getByTestId('calc-display').textContent).toBe('0');
  });

  it('inputs digits', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-1'));
    fireEvent.click(screen.getByTestId('calc-2'));
    fireEvent.click(screen.getByTestId('calc-3'));
    expect(screen.getByTestId('calc-display').textContent).toBe('123');
  });

  it('adds two numbers', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-2'));
    fireEvent.click(screen.getByTestId('calc-add'));
    fireEvent.click(screen.getByTestId('calc-3'));
    fireEvent.click(screen.getByTestId('calc-equals'));
    expect(screen.getByTestId('calc-display').textContent).toBe('5');
  });

  it('subtracts two numbers', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-7'));
    fireEvent.click(screen.getByTestId('calc-subtract'));
    fireEvent.click(screen.getByTestId('calc-4'));
    fireEvent.click(screen.getByTestId('calc-equals'));
    expect(screen.getByTestId('calc-display').textContent).toBe('3');
  });

  it('multiplies two numbers', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-3'));
    fireEvent.click(screen.getByTestId('calc-multiply'));
    fireEvent.click(screen.getByTestId('calc-4'));
    fireEvent.click(screen.getByTestId('calc-equals'));
    expect(screen.getByTestId('calc-display').textContent).toBe('12');
  });

  it('divides two numbers', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-8'));
    fireEvent.click(screen.getByTestId('calc-divide'));
    fireEvent.click(screen.getByTestId('calc-2'));
    fireEvent.click(screen.getByTestId('calc-equals'));
    expect(screen.getByTestId('calc-display').textContent).toBe('4');
  });

  it('clears the display', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-9'));
    fireEvent.click(screen.getByTestId('calc-clear'));
    expect(screen.getByTestId('calc-display').textContent).toBe('0');
  });

  it('chains operations', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-2'));
    fireEvent.click(screen.getByTestId('calc-add'));
    fireEvent.click(screen.getByTestId('calc-3'));
    fireEvent.click(screen.getByTestId('calc-multiply'));
    fireEvent.click(screen.getByTestId('calc-4'));
    fireEvent.click(screen.getByTestId('calc-equals'));
    expect(screen.getByTestId('calc-display').textContent).toBe('20');
  });

  it('shows Error on divide by zero', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-5'));
    fireEvent.click(screen.getByTestId('calc-divide'));
    fireEvent.click(screen.getByTestId('calc-0'));
    fireEvent.click(screen.getByTestId('calc-equals'));
    expect(screen.getByTestId('calc-display').textContent).toBe('Error');
  });

  it('toggles the sign of the current value', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-5'));
    fireEvent.click(screen.getByTestId('calc-sign'));
    expect(screen.getByTestId('calc-display').textContent).toBe('-5');
    fireEvent.click(screen.getByTestId('calc-sign'));
    expect(screen.getByTestId('calc-display').textContent).toBe('5');
  });

  it('converts the current value to a percentage', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByTestId('calc-5'));
    fireEvent.click(screen.getByTestId('calc-0'));
    fireEvent.click(screen.getByTestId('calc-percent'));
    expect(screen.getByTestId('calc-display').textContent).toBe('0.5');
  });
});
