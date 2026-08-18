import { useState, useEffect, useCallback } from 'react'

/**
 * Calculator app — macOS-style calculator with digit buttons, operators,
 * equals, clear, decimal. Displays current expression and result.
 * Supports keyboard input for digits and operators.
 */
export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [previous, setPrevious] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }, [display, waitingForOperand])

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }, [display, waitingForOperand])

  const clear = useCallback(() => {
    setDisplay('0')
    setExpression('')
    setPrevious(null)
    setOperator(null)
    setWaitingForOperand(false)
  }, [])

  const calculate = useCallback((a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b === 0 ? 0 : a / b
      default: return b
    }
  }, [])

  const handleOperator = useCallback((nextOp: string) => {
    const inputValue = parseFloat(display)
    if (previous === null) {
      setPrevious(inputValue)
      setExpression(`${inputValue} ${nextOp}`)
    } else if (operator && !waitingForOperand) {
      const result = calculate(previous, inputValue, operator)
      setPrevious(result)
      setDisplay(String(result))
      setExpression(`${result} ${nextOp}`)
    } else {
      setExpression(`${previous} ${nextOp}`)
    }
    setOperator(nextOp)
    setWaitingForOperand(true)
  }, [display, previous, operator, waitingForOperand, calculate])

  const handleEquals = useCallback(() => {
    if (operator && previous !== null) {
      const inputValue = parseFloat(display)
      const result = calculate(previous, inputValue, operator)
      setExpression(`${previous} ${operator} ${inputValue} =`)
      setDisplay(String(result))
      setPrevious(null)
      setOperator(null)
      setWaitingForOperand(true)
    }
  }, [display, previous, operator, calculate])

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // Only handle when calculator window is focused
      const win = target.closest('[data-testid="window-frame"]')
      const calcWin = win?.querySelector('[data-app-id="calculator"]')
      if (!calcWin) return

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key)
      } else if (e.key === '.') {
        inputDecimal()
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault()
        handleOperator(e.key)
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        handleEquals()
      } else if (e.key === 'Escape') {
        clear()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, clear])

  const buttons = [
    { label: 'C', action: clear, testId: 'calc-clear', style: { background: '#a5a5a5', color: '#000' } },
    { label: '±', action: () => setDisplay(String(parseFloat(display) * -1)), testId: 'calc-negate', style: { background: '#a5a5a5', color: '#000' } },
    { label: '%', action: () => setDisplay(String(parseFloat(display) / 100)), testId: 'calc-percent', style: { background: '#a5a5a5', color: '#000' } },
    { label: '÷', action: () => handleOperator('/'), testId: 'calc-divide', style: { background: '#ff9f0a', color: '#fff' } },
    { label: '7', action: () => inputDigit('7'), testId: 'calc-7', style: {} },
    { label: '8', action: () => inputDigit('8'), testId: 'calc-8', style: {} },
    { label: '9', action: () => inputDigit('9'), testId: 'calc-9', style: {} },
    { label: '×', action: () => handleOperator('*'), testId: 'calc-multiply', style: { background: '#ff9f0a', color: '#fff' } },
    { label: '4', action: () => inputDigit('4'), testId: 'calc-4', style: {} },
    { label: '5', action: () => inputDigit('5'), testId: 'calc-5', style: {} },
    { label: '6', action: () => inputDigit('6'), testId: 'calc-6', style: {} },
    { label: '−', action: () => handleOperator('-'), testId: 'calc-subtract', style: { background: '#ff9f0a', color: '#fff' } },
    { label: '1', action: () => inputDigit('1'), testId: 'calc-1', style: {} },
    { label: '2', action: () => inputDigit('2'), testId: 'calc-2', style: {} },
    { label: '3', action: () => inputDigit('3'), testId: 'calc-3', style: {} },
    { label: '+', action: () => handleOperator('+'), testId: 'calc-add', style: { background: '#ff9f0a', color: '#fff' } },
    { label: '0', action: () => inputDigit('0'), testId: 'calc-0', style: { gridColumn: 'span 2' } },
    { label: '.', action: inputDecimal, testId: 'calc-decimal', style: {} },
    { label: '=', action: handleEquals, testId: 'calc-equals', style: { background: '#ff9f0a', color: '#fff' } },
  ]

  return (
    <div
      data-testid="calculator"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1c1c1e',
        padding: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Display */}
      <div
        style={{
          color: '#fff',
          textAlign: 'right',
          padding: '16px 12px',
          marginBottom: '8px',
        }}
      >
        <div data-testid="calc-expression" style={{ fontSize: '14px', opacity: 0.5, minHeight: '18px' }}>
          {expression}
        </div>
        <div data-testid="calc-display" style={{ fontSize: '48px', fontWeight: '300' }}>
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          flex: 1,
        }}
      >
        {buttons.map((btn) => (
          <button
            key={btn.testId}
            data-testid={btn.testId}
            onClick={btn.action}
            style={{
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: '400',
              background: btn.style.background || '#333333',
              color: btn.style.color || '#fff',
              ...(btn.label === '0' ? { borderRadius: '28px' } : {}),
              ...btn.style,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
