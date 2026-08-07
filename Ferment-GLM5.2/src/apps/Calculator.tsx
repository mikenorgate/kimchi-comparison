import { useCallback, useEffect, useState } from 'react'

import { evaluate, formatResult } from '../lib/calc-engine'

/**
 * Calculator — macOS Tahoe–styled calculator.
 *
 * Tracks the live expression string as the user types or clicks buttons;
 * pressing = evaluates the full expression (correct precedence + chaining)
 * via the calc-engine. Supports + − × ÷, parentheses, unary minus, %,
 * +/- (negate), AC (all clear), ⌫ (backspace), and keyboard input.
 */

type BtnKind = 'digit' | 'op' | 'equals' | 'clear' | 'util' | 'paren'

interface Btn {
  label: string
  value: string
  kind: BtnKind
  variant?: 'accent' | 'fn'
  ariaLabel?: string
}

const BUTTONS: Btn[][] = [
  [
    { label: 'AC', value: 'AC', kind: 'clear', variant: 'fn' },
    { label: '( )', value: '()', kind: 'paren', variant: 'fn' },
    { label: '%', value: '%', kind: 'util', variant: 'fn' },
    { label: '÷', value: '/', kind: 'op', variant: 'accent' },
  ],
  [
    { label: '7', value: '7', kind: 'digit' },
    { label: '8', value: '8', kind: 'digit' },
    { label: '9', value: '9', kind: 'digit' },
    { label: '×', value: '*', kind: 'op', variant: 'accent' },
  ],
  [
    { label: '4', value: '4', kind: 'digit' },
    { label: '5', value: '5', kind: 'digit' },
    { label: '6', value: '6', kind: 'digit' },
    { label: '−', value: '-', kind: 'op', variant: 'accent' },
  ],
  [
    { label: '1', value: '1', kind: 'digit' },
    { label: '2', value: '2', kind: 'digit' },
    { label: '3', value: '3', kind: 'digit' },
    { label: '+', value: '+', kind: 'op', variant: 'accent' },
  ],
  [
    { label: '±', value: '+/-', kind: 'util' },
    { label: '0', value: '0', kind: 'digit' },
    { label: '.', value: '.', kind: 'digit' },
    { label: '=', value: '=', kind: 'equals', variant: 'accent' },
  ],
]

function toExprChar(value: string): string {
  return value
}

export function Calculator() {
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [justEvaluated, setJustEvaluated] = useState(false)

  const press = useCallback((value: string) => {
    setResult(null)

    if (value === 'AC') {
      setExpr('')
      setJustEvaluated(false)
      return
    }

    // After =, decide how to continue.
    if (justEvaluated) {
      // Starting a fresh number / paren resets; an operator continues from result.
      if (value === '=' ) return
      const isOperator = value === '+' || value === '-' || value === '*' || value === '/'
      if (isOperator) {
        const last = formatResult(evaluate(expr))
        setExpr(last + value)
      } else {
        setExpr(value === '()' ? '()' : value)
      }
      setJustEvaluated(false)
      return
    }

    if (value === '=') {
      try {
        const r = evaluate(expr)
        setResult(formatResult(r))
        setJustEvaluated(true)
      } catch {
        setResult('Error')
        setJustEvaluated(true)
      }
      return
    }

    if (value === '()') {
      // Insert '(' if unmatched count is even, else ')'.
      const opens = (expr.match(/\(/g) ?? []).length
      const closes = (expr.match(/\)/g) ?? []).length
      const next = opens <= closes ? '(' : ')'
      setExpr((e) => e + next)
      return
    }

    if (value === '%') {
      // Treat % as "divide by 100" appended to the expression.
      setExpr((e) => e + '/100')
      return
    }

    if (value === '+/-') {
      // Negate the trailing number.
      setExpr((e) => {
        const m = e.match(/(\d*\.?\d*)$/)
        if (!m || !m[1]) return e
        const num = m[1]
        const prefix = e.slice(0, e.length - num.length)
        // Toggle a leading '-' on the trailing number.
        if (prefix.endsWith('-')) return prefix.slice(0, -1) + '+' + num
        return prefix + '-' + num
      })
      return
    }

    setExpr((e) => e + toExprChar(value))
  }, [expr, justEvaluated])

  // Keyboard input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (/^[0-9]$/.test(k)) { press(k); e.preventDefault(); return }
      if (k === '+' || k === '-') { press(k); e.preventDefault(); return }
      if (k === '*') { press('*'); e.preventDefault(); return }
      if (k === '/') { press('/'); e.preventDefault(); return }
      if (k === '.') { press('.'); e.preventDefault(); return }
      if (k === '(' || k === ')') { press('()'); e.preventDefault(); return }
      if (k === 'Enter' || k === '=') { press('='); e.preventDefault(); return }
      if (k === 'Backspace') {
        setExpr((p) => p.slice(0, -1))
        setResult(null)
        e.preventDefault()
        return
      }
      if (k === 'Escape' || k === 'c' || k === 'C') { press('AC'); e.preventDefault(); return }
      if (k === '%') { press('%'); e.preventDefault(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  const display = result ?? (expr || '0')

  return (
    <div
      data-testid="calculator-content"
      className="flex h-full flex-col bg-black/5 p-3"
    >
      {/* Display */}
      <div
        data-testid="calculator-display"
        className="mb-3 flex min-h-[64px] items-end justify-end rounded-xl bg-black/80 px-4 py-3"
      >
        <span
          data-testid="calculator-display-text"
          className="font-mono text-4xl font-light text-white"
        >
          {display}
        </span>
      </div>

      {/* Button grid */}
      <div className="grid flex-1 grid-cols-4 gap-2">
        {BUTTONS.flat().map((btn) => {
          const variantClass =
            btn.variant === 'accent'
              ? 'bg-[var(--accent)] text-white hover:brightness-110'
              : btn.variant === 'fn'
                ? 'bg-black/15 text-black hover:bg-black/20'
                : 'bg-white/80 text-black hover:bg-white'
          return (
            <button
              key={btn.label}
              data-testid={`calc-btn-${btn.value}`}
              data-label={btn.label}
              onClick={() => press(btn.value)}
              aria-label={btn.ariaLabel ?? btn.label}
              className={`flex items-center justify-center rounded-xl text-xl font-medium transition ${variantClass}`}
            >
              {btn.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calculator
