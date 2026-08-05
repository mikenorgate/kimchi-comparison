import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Calculator, formatDisplay, calculate } from './Calculator'

describe('Calculator', () => {
  it('renders display and keys', () => {
    render(<Calculator />)
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0')
    expect(screen.getByTestId('calc-key-1')).toBeInTheDocument()
    expect(screen.getByTestId('calc-key-+')).toBeInTheDocument()
    expect(screen.getByTestId('calc-key-=')).toBeInTheDocument()
  })

  it('performs addition', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-key-7'))
    fireEvent.click(screen.getByTestId('calc-key-+'))
    fireEvent.click(screen.getByTestId('calc-key-3'))
    fireEvent.click(screen.getByTestId('calc-key-='))
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('10')
  })

  it('performs subtraction', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-key-9'))
    fireEvent.click(screen.getByTestId('calc-key-−'))
    fireEvent.click(screen.getByTestId('calc-key-4'))
    fireEvent.click(screen.getByTestId('calc-key-='))
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('5')
  })

  it('performs multiplication', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-key-6'))
    fireEvent.click(screen.getByTestId('calc-key-×'))
    fireEvent.click(screen.getByTestId('calc-key-7'))
    fireEvent.click(screen.getByTestId('calc-key-='))
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('42')
  })

  it('performs division', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-key-8'))
    fireEvent.click(screen.getByTestId('calc-key-÷'))
    fireEvent.click(screen.getByTestId('calc-key-2'))
    fireEvent.click(screen.getByTestId('calc-key-='))
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('4')
  })

  it('clears display', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-key-5'))
    fireEvent.click(screen.getByTestId('calc-key-C'))
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0')
  })

  it('formatDisplay formats numbers', () => {
    expect(formatDisplay('10')).toBe('10')
    expect(formatDisplay('10.5')).toBe('10.5')
    expect(formatDisplay(null)).toBe('0')
    expect(formatDisplay('not')).toBe('Error')
  })

  it('calculate handles operators', () => {
    expect(calculate('3', '7', '+')).toBe(10)
    expect(calculate('9', '4', '-')).toBe(5)
    expect(calculate('6', '7', '*')).toBe(42)
    expect(calculate('8', '2', '/')).toBe(4)
    expect(calculate('8', '0', '/')).toBeNull()
  })
})
