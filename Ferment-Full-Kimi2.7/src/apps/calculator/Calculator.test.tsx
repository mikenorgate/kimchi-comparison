import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Calculator } from './Calculator'

function clickSequence(labels: string[]) {
  return async () => {
    for (const label of labels) {
      await userEvent.click(screen.getByTestId(label))
    }
  }
}

describe('Calculator', () => {
  beforeEach(() => {
    render(<Calculator />)
  })

  it('renders a display and digit buttons', () => {
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0')
    expect(screen.getByTestId('calc-1')).toBeInTheDocument()
    expect(screen.getByTestId('calc-add')).toBeInTheDocument()
    expect(screen.getByTestId('calc-equals')).toBeInTheDocument()
  })

  it('inputs digits into the display', async () => {
    await clickSequence(['calc-1', 'calc-2', 'calc-3'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('123')
  })

  it('adds two numbers', async () => {
    await clickSequence(['calc-2', 'calc-add', 'calc-3', 'calc-equals'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('5')
  })

  it('subtracts two numbers', async () => {
    await clickSequence(['calc-9', 'calc-subtract', 'calc-4', 'calc-equals'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('5')
  })

  it('multiplies two numbers', async () => {
    await clickSequence(['calc-6', 'calc-multiply', 'calc-7', 'calc-equals'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('42')
  })

  it('divides two numbers', async () => {
    await clickSequence(['calc-8', 'calc-divide', 'calc-2', 'calc-equals'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('4')
  })

  it('shows Error for division by zero', async () => {
    await clickSequence(['calc-1', 'calc-divide', 'calc-0', 'calc-equals'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('Error')
  })

  it('clears the display with AC', async () => {
    await clickSequence(['calc-5', 'calc-clear'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0')
    expect(screen.getByTestId('calculator-previous')).toHaveTextContent('')
  })

  it('supports chained operations', async () => {
    await clickSequence(['calc-1', 'calc-add', 'calc-2', 'calc-add', 'calc-3', 'calc-equals'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('6')
  })

  it('supports decimals', async () => {
    await clickSequence(['calc-1', 'calc-decimal', 'calc-5', 'calc-add', 'calc-2', 'calc-decimal', 'calc-5', 'calc-equals'])()
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('4')
  })
})
