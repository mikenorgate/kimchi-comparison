import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Calculator } from './calculator'

function getDisplay(): string {
  return screen.getByTestId('calc-display').textContent ?? ''
}

describe('Calculator', () => {
  beforeEach(() => {
    render(<Calculator windowId="w1" />)
  })

  it('renders the calculator with display and buttons', () => {
    expect(screen.getByTestId('calculator-root')).toBeInTheDocument()
    expect(screen.getByTestId('calc-display')).toBeInTheDocument()
    expect(getDisplay()).toBe('0')
  })

  it('renders all digit buttons 0-9', () => {
    for (const d of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(screen.getByTestId(`calc-${d}`)).toBeInTheDocument()
    }
  })

  it('renders operator buttons (+, −, ×, ÷)', () => {
    expect(screen.getByTestId('calc-add')).toBeInTheDocument()
    expect(screen.getByTestId('calc-subtract')).toBeInTheDocument()
    expect(screen.getByTestId('calc-multiply')).toBeInTheDocument()
    expect(screen.getByTestId('calc-divide')).toBeInTheDocument()
  })

  it('renders clear, sign toggle, percent, decimal, equals buttons', () => {
    expect(screen.getByTestId('calc-clear')).toBeInTheDocument()
    expect(screen.getByTestId('calc-sign')).toBeInTheDocument()
    expect(screen.getByTestId('calc-percent')).toBeInTheDocument()
    expect(screen.getByTestId('calc-decimal')).toBeInTheDocument()
    expect(screen.getByTestId('calc-equals')).toBeInTheDocument()
  })

  it('inputs digits to build a number', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-1')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-2')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-3')) })
    expect(getDisplay()).toBe('123')
  })

  it('replaces leading zero', () => {
    expect(getDisplay()).toBe('0')
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    expect(getDisplay()).toBe('5')
  })

  it('adds two numbers correctly', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-add')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-3')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-equals')) })
    expect(getDisplay()).toBe('8')
  })

  it('subtracts two numbers correctly', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-9')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-subtract')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-4')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-equals')) })
    expect(getDisplay()).toBe('5')
  })

  it('multiplies two numbers correctly', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-6')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-multiply')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-7')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-equals')) })
    expect(getDisplay()).toBe('42')
  })

  it('divides two numbers correctly', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-8')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-0')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-divide')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-4')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-equals')) })
    expect(getDisplay()).toBe('20')
  })

  it('clears the display with AC', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-add')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-clear')) })
    expect(getDisplay()).toBe('0')
  })

  it('toggles sign', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-sign')) })
    expect(getDisplay()).toBe('-5')
    act(() => { fireEvent.click(screen.getByTestId('calc-sign')) })
    expect(getDisplay()).toBe('5')
  })

  it('computes percent', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-0')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-percent')) })
    expect(getDisplay()).toBe('0.5')
  })

  it('inputs decimal point', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-decimal')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-3')) })
    expect(getDisplay()).toBe('5.3')
  })

  it('does not allow multiple decimal points', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-decimal')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-decimal')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-3')) })
    expect(getDisplay()).toBe('5.3')
  })

  it('chains operations (5 + 3 × 2 = 16)', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-add')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-3')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-multiply')) })
    // After pressing ×, the intermediate 5+3=8 should be computed
    act(() => { fireEvent.click(screen.getByTestId('calc-2')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-equals')) })
    expect(getDisplay()).toBe('16')
  })

  it('handles division by zero gracefully', () => {
    act(() => { fireEvent.click(screen.getByTestId('calc-5')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-divide')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-0')) })
    act(() => { fireEvent.click(screen.getByTestId('calc-equals')) })
    expect(getDisplay()).toBe('0')
  })

  it('supports keyboard digit input', () => {
    act(() => { fireEvent.keyDown(window, { key: '7' }) })
    act(() => { fireEvent.keyDown(window, { key: '3' }) })
    expect(getDisplay()).toBe('73')
  })

  it('supports keyboard operator and equals', () => {
    act(() => { fireEvent.keyDown(window, { key: '4' }) })
    act(() => { fireEvent.keyDown(window, { key: '+' }) })
    act(() => { fireEvent.keyDown(window, { key: '6' }) })
    act(() => { fireEvent.keyDown(window, { key: 'Enter' }) })
    expect(getDisplay()).toBe('10')
  })

  it('supports keyboard clear (Escape)', () => {
    act(() => { fireEvent.keyDown(window, { key: '5' }) })
    act(() => { fireEvent.keyDown(window, { key: 'Escape' }) })
    expect(getDisplay()).toBe('0')
  })

  it('supports keyboard subtraction', () => {
    act(() => { fireEvent.keyDown(window, { key: '9' }) })
    act(() => { fireEvent.keyDown(window, { key: '-' }) })
    act(() => { fireEvent.keyDown(window, { key: '3' }) })
    act(() => { fireEvent.keyDown(window, { key: '=' }) })
    expect(getDisplay()).toBe('6')
  })

  it('supports keyboard multiplication (*)', () => {
    act(() => { fireEvent.keyDown(window, { key: '3' }) })
    act(() => { fireEvent.keyDown(window, { key: '*' }) })
    act(() => { fireEvent.keyDown(window, { key: '4' }) })
    act(() => { fireEvent.keyDown(window, { key: 'Enter' }) })
    expect(getDisplay()).toBe('12')
  })

  it('supports keyboard division (/)', () => {
    act(() => { fireEvent.keyDown(window, { key: '8' }) })
    act(() => { fireEvent.keyDown(window, { key: '/' }) })
    act(() => { fireEvent.keyDown(window, { key: '2' }) })
    act(() => { fireEvent.keyDown(window, { key: 'Enter' }) })
    expect(getDisplay()).toBe('4')
  })

  it('supports keyboard decimal (.)', () => {
    act(() => { fireEvent.keyDown(window, { key: '5' }) })
    act(() => { fireEvent.keyDown(window, { key: '.' }) })
    act(() => { fireEvent.keyDown(window, { key: '5' }) })
    expect(getDisplay()).toBe('5.5')
  })
})
