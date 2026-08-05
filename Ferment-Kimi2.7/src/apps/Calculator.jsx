import { useState } from 'react'

const BUTTONS = [
  { label: 'C', type: 'clear', span: 1 },
  { label: '±', type: 'negate', span: 1 },
  { label: '%', type: 'percent', span: 1 },
  { label: '÷', type: 'operator', value: '/', span: 1 },
  { label: '7', type: 'digit', value: '7', span: 1 },
  { label: '8', type: 'digit', value: '8', span: 1 },
  { label: '9', type: 'digit', value: '9', span: 1 },
  { label: '×', type: 'operator', value: '*', span: 1 },
  { label: '4', type: 'digit', value: '4', span: 1 },
  { label: '5', type: 'digit', value: '5', span: 1 },
  { label: '6', type: 'digit', value: '6', span: 1 },
  { label: '−', type: 'operator', value: '-', span: 1 },
  { label: '1', type: 'digit', value: '1', span: 1 },
  { label: '2', type: 'digit', value: '2', span: 1 },
  { label: '3', type: 'digit', value: '3', span: 1 },
  { label: '+', type: 'operator', value: '+', span: 1 },
  { label: '0', type: 'digit', value: '0', span: 2 },
  { label: '.', type: 'digit', value: '.', span: 1 },
  { label: '=', type: 'equals', span: 1 },
]

export function formatDisplay(value) {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (!Number.isFinite(num)) return 'Error'
  if (Number.isInteger(num)) return String(num)
  return String(parseFloat(num.toPrecision(12)))
}

export function calculate(a, b, op) {
  const left = Number(a)
  const right = Number(b)
  if (Number.isNaN(left) || Number.isNaN(right)) return null
  switch (op) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return right === 0 ? null : left / right
    default:
      return null
  }
}

export function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previous, setPrevious] = useState(null)
  const [operator, setOperator] = useState(null)
  const [resetNext, setResetNext] = useState(false)

  function handleClear() {
    setDisplay('0')
    setPrevious(null)
    setOperator(null)
    setResetNext(false)
  }

  function handleDigit(value) {
    if (resetNext) {
      setDisplay(value)
      setResetNext(false)
      return
    }
    if (display === '0' && value !== '.') {
      setDisplay(value)
    } else if (value === '.' && display.includes('.')) {
      return
    } else {
      setDisplay((prev) => (prev.length >= 12 ? prev : prev + value))
    }
  }

  function handleOperator(nextOp) {
    if (operator && previous !== null && !resetNext) {
      const result = calculate(previous, display, operator)
      if (result === null) {
        handleClear()
        setDisplay('Error')
        setResetNext(true)
        return
      }
      setPrevious(String(result))
      setDisplay(String(result))
    } else {
      setPrevious(display)
    }
    setOperator(nextOp)
    setResetNext(true)
  }

  function handleEquals() {
    if (operator === null || previous === null) return
    const result = calculate(previous, display, operator)
    if (result === null) {
      handleClear()
      setDisplay('Error')
      setResetNext(true)
      return
    }
    setDisplay(String(result))
    setPrevious(null)
    setOperator(null)
    setResetNext(true)
  }

  function handleNegate() {
    const num = Number(display)
    if (Number.isNaN(num)) return
    setDisplay(String(num * -1))
  }

  function handlePercent() {
    const num = Number(display)
    if (Number.isNaN(num)) return
    setDisplay(String(num / 100))
  }

  function handleClick(button) {
    switch (button.type) {
      case 'clear':
        handleClear()
        break
      case 'digit':
        handleDigit(button.value)
        break
      case 'operator':
        handleOperator(button.value)
        break
      case 'equals':
        handleEquals()
        break
      case 'negate':
        handleNegate()
        break
      case 'percent':
        handlePercent()
        break
    }
  }

  return (
    <div data-testid="calculator-app" style={{ padding: 'var(--space-md)', textAlign: 'center', width: '100%' }}>
      <div
        data-testid="calculator-display"
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--font-weight-light)',
          marginBottom: 'var(--space-md)',
          padding: 'var(--space-sm)',
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatDisplay(display)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-sm)' }}>
        {BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            data-testid={`calc-key-${button.label}`}
            onClick={() => handleClick(button)}
            style={{
              gridColumn: button.span > 1 ? `span ${button.span}` : undefined,
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              background:
                button.type === 'operator' || button.type === 'equals'
                  ? 'var(--color-accent)'
                  : button.type === 'clear' || button.type === 'negate' || button.type === 'percent'
                    ? 'var(--color-surface-elevated)'
                    : 'rgba(255,255,255,0.15)',
              color:
                button.type === 'operator' || button.type === 'equals'
                  ? '#fff'
                  : 'var(--color-text)',
              fontSize: 'var(--text-lg)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calculator
