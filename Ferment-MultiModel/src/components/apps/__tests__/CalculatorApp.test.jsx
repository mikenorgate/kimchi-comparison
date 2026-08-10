import { render, screen, fireEvent } from '@testing-library/react';
import CalculatorApp from '../CalculatorApp';

describe('<CalculatorApp />', () => {
  it('renders the app root, display, and keypad', () => {
    render(<CalculatorApp />);
    expect(screen.getByTestId('calculator-app')).toBeInTheDocument();
    expect(screen.getByTestId('calculator-display')).toBeInTheDocument();
    expect(screen.getByTestId('calculator-keypad')).toBeInTheDocument();
  });

  it('updates the display when digits are clicked', () => {
    render(<CalculatorApp />);
    fireEvent.click(screen.getByTestId('calculator-key-7'));
    fireEvent.click(screen.getByTestId('calculator-key-8'));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('78');
  });

  it('adds two numbers', () => {
    render(<CalculatorApp />);
    fireEvent.click(screen.getByTestId('calculator-key-7'));
    fireEvent.click(screen.getByTestId('calculator-key-+'));
    fireEvent.click(screen.getByTestId('calculator-key-8'));
    fireEvent.click(screen.getByTestId('calculator-key-='));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('15');
  });

  it('subtracts two numbers', () => {
    render(<CalculatorApp />);
    fireEvent.click(screen.getByTestId('calculator-key-9'));
    fireEvent.click(screen.getByTestId('calculator-key--'));
    fireEvent.click(screen.getByTestId('calculator-key-4'));
    fireEvent.click(screen.getByTestId('calculator-key-='));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
  });

  it('multiplies two numbers', () => {
    render(<CalculatorApp />);
    fireEvent.click(screen.getByTestId('calculator-key-6'));
    fireEvent.click(screen.getByTestId('calculator-key-×'));
    fireEvent.click(screen.getByTestId('calculator-key-7'));
    fireEvent.click(screen.getByTestId('calculator-key-='));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('42');
  });

  it('divides two numbers', () => {
    render(<CalculatorApp />);
    fireEvent.click(screen.getByTestId('calculator-key-8'));
    fireEvent.click(screen.getByTestId('calculator-key-÷'));
    fireEvent.click(screen.getByTestId('calculator-key-2'));
    fireEvent.click(screen.getByTestId('calculator-key-='));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('4');
  });

  it('clears the display with AC', () => {
    render(<CalculatorApp />);
    fireEvent.click(screen.getByTestId('calculator-key-7'));
    fireEvent.click(screen.getByTestId('calculator-key-AC'));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
  });

  it('chains operations', () => {
    render(<CalculatorApp />);
    fireEvent.click(screen.getByTestId('calculator-key-5'));
    fireEvent.click(screen.getByTestId('calculator-key-+'));
    fireEvent.click(screen.getByTestId('calculator-key-3'));
    fireEvent.click(screen.getByTestId('calculator-key-+'));
    fireEvent.click(screen.getByTestId('calculator-key-2'));
    fireEvent.click(screen.getByTestId('calculator-key-='));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('10');
  });
});
