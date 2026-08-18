import { useState, useEffect, useCallback } from 'react'

type Operator = '+' | '-' | '×' | '÷' | null

export function Calculator({ windowId: _windowId }: { windowId: string }) {
  const [display, setDisplay] = useState('0')
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator>(null)
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
    setPrevValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }, [])

  const toggleSign = useCallback(() => {
    if (display !== '0') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)
    }
  }, [display])

  const percent = useCallback(() => {
    const val = parseFloat(display)
    if (!isNaN(val)) {
      setDisplay(String(val / 100))
    }
  }, [display])

  const performCalc = useCallback((a: number, b: number, op: Operator): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }, [])

  const handleOperator = useCallback((nextOp: Operator) => {
    const current = parseFloat(display)
    if (prevValue === null) {
      setPrevValue(current)
    } else if (operator && !waitingForOperand) {
      const result = performCalc(prevValue, current, operator)
      setDisplay(formatNumber(result))
      setPrevValue(result)
    }
    setOperator(nextOp)
    setWaitingForOperand(true)
  }, [display, prevValue, operator, waitingForOperand, performCalc])

  const handleEquals = useCallback(() => {
    if (prevValue !== null && operator && !waitingForOperand) {
      const current = parseFloat(display)
      const result = performCalc(prevValue, current, operator)
      setDisplay(formatNumber(result))
      setPrevValue(null)
      setOperator(null)
      setWaitingForOperand(true)
    }
  }, [display, prevValue, operator, waitingForOperand, performCalc])

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k >= '0' && k <= '9') {
        inputDigit(k)
      } else if (k === '.') {
        inputDecimal()
      } else if (k === '+') {
        handleOperator('+')
      } else if (k === '-') {
        handleOperator('-')
      } else if (k === '*') {
        handleOperator('×')
      } else if (k === '/') {
        e.preventDefault()
        handleOperator('÷')
      } else if (k === 'Enter' || k === '=') {
        e.preventDefault()
        handleEquals()
      } else if (k === 'Escape' || k === 'c' || k === 'C') {
        clear()
      } else if (k === '%') {
        percent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, clear, percent])

  const btnStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: '50%',
    fontSize: 22,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '1',
    fontWeight: 400,
  }

  return (
    <div data-testid="calculator-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 8, gap: 8 }}>
      {/* Display */}
      <div
        data-testid="calc-display"
        style={{
          textAlign: 'right',
          fontSize: 48,
          fontWeight: 300,
          color: 'var(--text-primary)',
          padding: '12px 16px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: 72,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        {display}
      </div>

      {/* Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, flex: 1 }}>
        <button data-testid="calc-clear" onClick={clear} style={{ ...btnStyle, background: '#a5a5a5', color: '#000' }}>AC</button>
        <button data-testid="calc-sign" onClick={toggleSign} style={{ ...btnStyle, background: '#a5a5a5', color: '#000' }}>±</button>
        <button data-testid="calc-percent" onClick={percent} style={{ ...btnStyle, background: '#a5a5a5', color: '#000' }}>%</button>
        <button data-testid="calc-divide" onClick={() => handleOperator('÷')} style={{ ...btnStyle, background: '#ff9f0a', color: 'white' }}>÷</button>

        <button data-testid="calc-7" onClick={() => inputDigit('7')} style={{ ...btnStyle, background: '#333', color: 'white' }}>7</button>
        <button data-testid="calc-8" onClick={() => inputDigit('8')} style={{ ...btnStyle, background: '#333', color: 'white' }}>8</button>
        <button data-testid="calc-9" onClick={() => inputDigit('9')} style={{ ...btnStyle, background: '#333', color: 'white' }}>9</button>
        <button data-testid="calc-multiply" onClick={() => handleOperator('×')} style={{ ...btnStyle, background: '#ff9f0a', color: 'white' }}>×</button>

        <button data-testid="calc-4" onClick={() => inputDigit('4')} style={{ ...btnStyle, background: '#333', color: 'white' }}>4</button>
        <button data-testid="calc-5" onClick={() => inputDigit('5')} style={{ ...btnStyle, background: '#333', color: 'white' }}>5</button>
        <button data-testid="calc-6" onClick={() => inputDigit('6')} style={{ ...btnStyle, background: '#333', color: 'white' }}>6</button>
        <button data-testid="calc-subtract" onClick={() => handleOperator('-')} style={{ ...btnStyle, background: '#ff9f0a', color: 'white' }}>−</button>

        <button data-testid="calc-1" onClick={() => inputDigit('1')} style={{ ...btnStyle, background: '#333', color: 'white' }}>1</button>
        <button data-testid="calc-2" onClick={() => inputDigit('2')} style={{ ...btnStyle, background: '#333', color: 'white' }}>2</button>
        <button data-testid="calc-3" onClick={() => inputDigit('3')} style={{ ...btnStyle, background: '#333', color: 'white' }}>3</button>
        <button data-testid="calc-add" onClick={() => handleOperator('+')} style={{ ...btnStyle, background: '#ff9f0a', color: 'white' }}>+</button>

        <button data-testid="calc-0" onClick={() => inputDigit('0')} style={{ ...btnStyle, background: '#333', color: 'white', gridColumn: 'span 2', borderRadius: 40 }}>0</button>
        <button data-testid="calc-decimal" onClick={inputDecimal} style={{ ...btnStyle, background: '#333', color: 'white' }}>.</button>
        <button data-testid="calc-equals" onClick={handleEquals} style={{ ...btnStyle, background: '#ff9f0a', color: 'white' }}>=</button>
      </div>
    </div>
  )
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return 'Error'
  // Round to avoid floating point artifacts
  const rounded = Math.round(n * 1e10) / 1e10
  if (Number.isInteger(rounded)) return String(rounded)
  return String(rounded)
}
