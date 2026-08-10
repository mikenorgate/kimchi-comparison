import { useState } from 'react'

type Operator = '+' | '-' | '×' | '÷'

interface CalcState {
  display: string
  pending: number | null
  operator: Operator | null
  fresh: boolean
}

const compute = (a: number, b: number, op: Operator): number => {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? NaN : a / b
  }
}

const formatDisplay = (value: number): string => {
  if (Number.isNaN(value)) return 'Error'
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10
  return String(rounded)
}

export default function CalculatorApp() {
  const [state, setState] = useState<CalcState>({
    display: '0',
    pending: null,
    operator: null,
    fresh: true,
  })

  const isError = state.display === 'Error'

  const inputDigit = (digit: string) => {
    if (isError) {
      setState({ display: digit === '.' ? '0.' : digit, pending: null, operator: null, fresh: false })
      return
    }
    setState((prev) => {
      if (prev.fresh) {
        return { ...prev, display: digit === '.' ? '0.' : digit, fresh: false }
      }
      if (digit === '.' && prev.display.includes('.')) return prev
      if (prev.display === '0' && digit !== '.') return { ...prev, display: digit }
      return { ...prev, display: prev.display + digit }
    })
  }

  const inputOperator = (op: Operator) => {
    if (isError) return
    setState((prev) => {
      const current = parseFloat(prev.display)
      if (prev.pending !== null && prev.operator !== null && !prev.fresh) {
        const result = compute(prev.pending, current, prev.operator)
        return {
          display: formatDisplay(result),
          pending: Number.isNaN(result) ? null : result,
          operator: Number.isNaN(result) ? null : op,
          fresh: true,
        }
      }
      return {
        ...prev,
        pending: current,
        operator: op,
        fresh: true,
      }
    })
  }

  const handleEquals = () => {
    if (isError) return
    setState((prev) => {
      if (prev.pending === null || prev.operator === null) return prev
      const current = parseFloat(prev.display)
      const result = compute(prev.pending, current, prev.operator)
      return {
        display: formatDisplay(result),
        pending: null,
        operator: null,
        fresh: true,
      }
    })
  }

  const clearAll = () => {
    setState({ display: '0', pending: null, operator: null, fresh: true })
  }

  const toggleSign = () => {
    if (isError) return
    setState((prev) => {
      if (prev.display === '0') return prev
      if (prev.display.startsWith('-')) return { ...prev, display: prev.display.slice(1) }
      return { ...prev, display: '-' + prev.display }
    })
  }

  const percent = () => {
    if (isError) return
    setState((prev) => {
      const current = parseFloat(prev.display)
      return { ...prev, display: formatDisplay(current / 100) }
    })
  }

  const buttonStyle = (accent?: boolean, op?: boolean): React.CSSProperties => ({
    flex: '1 1 0',
    minWidth: 0,
    height: 56,
    borderRadius: 999,
    border: 'none',
    fontSize: 20,
    fontWeight: 500,
    cursor: isError && !accent && !op ? 'default' : 'pointer',
    background: op ? 'var(--accent)' : accent ? 'rgba(255,255,255,0.25)' : 'var(--glass-border-inner)',
    color: op ? '#fff' : 'var(--text-primary)',
  })

  const rows: Array<Array<{ label: string; action: () => void; kind?: 'accent' | 'op' }>> = [
    [
      { label: 'C', action: clearAll, kind: 'accent' },
      { label: '±', action: toggleSign, kind: 'accent' },
      { label: '%', action: percent, kind: 'accent' },
      { label: '÷', action: () => inputOperator('÷'), kind: 'op' },
    ],
    [
      { label: '7', action: () => inputDigit('7') },
      { label: '8', action: () => inputDigit('8') },
      { label: '9', action: () => inputDigit('9') },
      { label: '×', action: () => inputOperator('×'), kind: 'op' },
    ],
    [
      { label: '4', action: () => inputDigit('4') },
      { label: '5', action: () => inputDigit('5') },
      { label: '6', action: () => inputDigit('6') },
      { label: '−', action: () => inputOperator('-'), kind: 'op' },
    ],
    [
      { label: '1', action: () => inputDigit('1') },
      { label: '2', action: () => inputDigit('2') },
      { label: '3', action: () => inputDigit('3') },
      { label: '+', action: () => inputOperator('+'), kind: 'op' },
    ],
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: 8, boxSizing: 'border-box', color: 'var(--text-primary)' }}>
      <div
        data-testid="calc-display"
        style={{
          flex: '0 0 auto',
          minHeight: 96,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '12px 16px',
          fontSize: 56,
          fontWeight: 300,
          overflow: 'hidden',
          color: isError ? '#ff453a' : 'var(--text-primary)',
        }}
      >
        {state.display}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            {row.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                style={buttonStyle(btn.kind === 'accent', btn.kind === 'op')}
              >
                {btn.label}
              </button>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => inputDigit('0')}
            style={{ ...buttonStyle(), flex: '2 1 0' }}
          >
            0
          </button>
          <button onClick={() => inputDigit('.')} style={buttonStyle()}>
            .
          </button>
          <button onClick={handleEquals} style={buttonStyle(false, true)}>
            =
          </button>
        </div>
      </div>
    </div>
  )
}
