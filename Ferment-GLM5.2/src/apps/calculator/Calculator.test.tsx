import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Calculator from './Calculator'

afterEach(() => cleanup())

describe('Calculator', () => {
  it('renders with display showing 0', () => {
    render(<Calculator />)
    expect(screen.getByTestId('calc-display').textContent).toBe('0')
  })

  it('computes 7 * 8 = 56', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-7'))
    fireEvent.click(screen.getByTestId('calc-multiply'))
    fireEvent.click(screen.getByTestId('calc-8'))
    fireEvent.click(screen.getByTestId('calc-equals'))

    expect(screen.getByTestId('calc-display').textContent).toBe('56')
  })

  it('shows the expression when computing', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-7'))
    fireEvent.click(screen.getByTestId('calc-multiply'))
    fireEvent.click(screen.getByTestId('calc-8'))
    fireEvent.click(screen.getByTestId('calc-equals'))

    expect(screen.getByTestId('calc-expression').textContent).toBe('7 * 8 =')
  })

  it('clears the display', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-7'))
    fireEvent.click(screen.getByTestId('calc-clear'))
    expect(screen.getByTestId('calc-display').textContent).toBe('0')
  })

  it('supports decimal input', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-3'))
    fireEvent.click(screen.getByTestId('calc-decimal'))
    fireEvent.click(screen.getByTestId('calc-1'))
    fireEvent.click(screen.getByTestId('calc-4'))
    expect(screen.getByTestId('calc-display').textContent).toBe('3.14')
  })

  it('computes addition: 10 + 5 = 15', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-1'))
    fireEvent.click(screen.getByTestId('calc-0'))
    fireEvent.click(screen.getByTestId('calc-add'))
    fireEvent.click(screen.getByTestId('calc-5'))
    fireEvent.click(screen.getByTestId('calc-equals'))
    expect(screen.getByTestId('calc-display').textContent).toBe('15')
  })

  it('computes subtraction: 20 - 8 = 12', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-2'))
    fireEvent.click(screen.getByTestId('calc-0'))
    fireEvent.click(screen.getByTestId('calc-subtract'))
    fireEvent.click(screen.getByTestId('calc-8'))
    fireEvent.click(screen.getByTestId('calc-equals'))
    expect(screen.getByTestId('calc-display').textContent).toBe('12')
  })

  it('computes division: 56 / 8 = 7', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-5'))
    fireEvent.click(screen.getByTestId('calc-6'))
    fireEvent.click(screen.getByTestId('calc-divide'))
    fireEvent.click(screen.getByTestId('calc-8'))
    fireEvent.click(screen.getByTestId('calc-equals'))
    expect(screen.getByTestId('calc-display').textContent).toBe('7')
  })

  it('chains operations: 2 + 3 * 4 = 20', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByTestId('calc-2'))
    fireEvent.click(screen.getByTestId('calc-add'))
    fireEvent.click(screen.getByTestId('calc-3'))
    fireEvent.click(screen.getByTestId('calc-multiply'))
    // After pressing *, the intermediate result 5 is computed
    fireEvent.click(screen.getByTestId('calc-4'))
    fireEvent.click(screen.getByTestId('calc-equals'))
    expect(screen.getByTestId('calc-display').textContent).toBe('20')
  })
})
