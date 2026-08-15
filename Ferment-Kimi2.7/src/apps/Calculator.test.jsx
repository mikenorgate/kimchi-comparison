import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calculator, { calculateExpression } from './Calculator';

describe('Calculator', () => {
  it('displays digits when clicked', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByLabelText('1'));
    fireEvent.click(screen.getByLabelText('2'));
    fireEvent.click(screen.getByLabelText('3'));
    expect(screen.getByTestId('calculator-result')).toHaveTextContent('123');
  });

  it('computes a basic arithmetic expression', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByLabelText('7'));
    fireEvent.click(screen.getByLabelText('+'));
    fireEvent.click(screen.getByLabelText('8'));
    fireEvent.click(screen.getByLabelText('='));
    expect(screen.getByTestId('calculator-result')).toHaveTextContent('15');
  });

  it('clears the display', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByLabelText('9'));
    fireEvent.click(screen.getByLabelText('C'));
    expect(screen.getByTestId('calculator-result')).toHaveTextContent('0');
  });

  it('evaluates expressions with correct precedence', () => {
    expect(calculateExpression('2 + 3 * 4')).toBe('14');
    expect(calculateExpression('10 - 6 / 2')).toBe('7');
    expect(calculateExpression('3 / 0')).toBe('Error');
  });
});
