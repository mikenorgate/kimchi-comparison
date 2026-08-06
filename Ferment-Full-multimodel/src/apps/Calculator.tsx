import { useCallback, useEffect, useMemo, useState } from 'react';

type Op = '+' | '−' | '×' | '÷';

interface Pending {
  /** Left-hand operand that was previously entered. */
  left: number;
  /** Operator waiting to be applied when the next operand is entered. */
  op: Op;
}

const OP_FUNCTIONS: Record<Op, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? NaN : a / b),
};

/** Format a number for display, trimming floating-point noise. */
function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) return 'Error';
  // Avoid e-notation for typical calculator ranges.
  if (Math.abs(value) >= 1e16 || (value !== 0 && Math.abs(value) < 1e-9)) {
    return value.toExponential(6);
  }
  // Round to 10 significant digits to clean up FP noise like 0.30000000000000004.
  const rounded = Math.round(value * 1e10) / 1e10;
  const str = rounded.toString();
  return str;
}

/** Normalize a digit/decimal string for display (handles leading zeros, etc.). */
function formatInputString(input: string): string {
  if (input === '') return '0';
  // Strip leading zeros but keep "0." / "0"
  if (input.length > 1 && input.startsWith('0') && !input.startsWith('0.')) {
    return input.replace(/^0+(?=\d)/, '');
  }
  return input;
}

interface ButtonSpec {
  label: string;
  /** Visual variant for the button. */
  variant: 'digit' | 'operator' | 'function';
  /** Action invoked when the button is pressed. */
  action: () => void;
  /** Optional grid span. */
  span?: number;
}

/**
 * Calculator app — standard arithmetic with keyboard support. State
 * holds the current display string, the pending operator, and whether
 * we are about to start a fresh operand.
 */
export function Calculator({ windowId: _windowId }: { windowId: string }): JSX.Element {
  void _windowId;

  const [display, setDisplay] = useState<string>('0');
  const [accumulated, setAccumulated] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  // When true, the next digit replaces the display rather than appending.
  const [replaceOnNext, setReplaceOnNext] = useState<boolean>(true);

  const currentValue = useMemo(() => {
    const n = Number(display);
    return Number.isFinite(n) ? n : 0;
  }, [display]);

  const inputDigit = useCallback(
    (digit: string) => {
      setDisplay((current) => {
        if (replaceOnNext) {
          setReplaceOnNext(false);
          return digit;
        }
        // Cap length to avoid runaway input.
        if (current.replace(/[-.]/g, '').length >= 12) return current;
        if (digit === '0' && current === '0') return current;
        return formatInputString(current + digit);
      });
    },
    [replaceOnNext],
  );

  const inputDecimal = useCallback(() => {
    setDisplay((current) => {
      if (replaceOnNext) {
        setReplaceOnNext(false);
        return '0.';
      }
      if (current.includes('.')) return current;
      return current + '.';
    });
  }, [replaceOnNext]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setAccumulated(null);
    setPending(null);
    setReplaceOnNext(true);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplay((current) => {
      if (current === '0') return current;
      return current.startsWith('-') ? current.slice(1) : `-${current}`;
    });
  }, []);

  const applyPercent = useCallback(() => {
    setDisplay((current) => {
      const n = Number(current);
      if (!Number.isFinite(n)) return '0';
      // Standard calculator semantics: percentage of the accumulated value.
      const base = accumulated ?? 0;
      const result = (n / 100) * base;
      return formatDisplay(result);
    });
  }, [accumulated]);

  const compute = useCallback(
    (left: number, right: number, op: Op): number => {
      const fn = OP_FUNCTIONS[op];
      return fn(left, right);
    },
    [],
  );

  const applyOperator = useCallback(
    (op: Op) => {
      setAccumulated((currentAccumulated) => {
        const right = currentValue;
        if (currentAccumulated !== null && pending && !replaceOnNext) {
          const next = compute(currentAccumulated, right, pending.op);
          setDisplay(formatDisplay(next));
          setPending({ left: next, op });
          setReplaceOnNext(true);
          return next;
        }
        setPending({ left: right, op });
        setReplaceOnNext(true);
        return right;
      });
    },
    [compute, currentValue, pending, replaceOnNext],
  );

  const equals = useCallback(() => {
    if (pending === null) return;
    const result = compute(pending.left, currentValue, pending.op);
    setDisplay(formatDisplay(result));
    setAccumulated(null);
    setPending(null);
    setReplaceOnNext(true);
  }, [compute, currentValue, pending]);

  const buttons: ButtonSpec[][] = useMemo(() => {
    const ac: ButtonSpec = { label: 'AC', variant: 'function', action: clearAll };
    const pm: ButtonSpec = { label: '±', variant: 'function', action: toggleSign };
    const pct: ButtonSpec = { label: '%', variant: 'function', action: applyPercent };
    const div: ButtonSpec = { label: '÷', variant: 'operator', action: () => applyOperator('÷') };
    const mul: ButtonSpec = { label: '×', variant: 'operator', action: () => applyOperator('×') };
    const sub: ButtonSpec = { label: '−', variant: 'operator', action: () => applyOperator('−') };
    const add: ButtonSpec = { label: '+', variant: 'operator', action: () => applyOperator('+') };
    const eq: ButtonSpec = { label: '=', variant: 'operator', action: equals };
    const dot: ButtonSpec = { label: '.', variant: 'digit', action: inputDecimal };
    const digits: ButtonSpec[] = ['7', '8', '9', '4', '5', '6', '1', '2', '3']
      .map((d) => ({ label: d, variant: 'digit' as const, action: () => inputDigit(d) }));
    const zero: ButtonSpec = { label: '0', variant: 'digit', action: () => inputDigit('0') };

    return [
      [ac, pm, pct, div],
      [digits[0], digits[1], digits[2], mul],
      [digits[3], digits[4], digits[5], sub],
      [digits[6], digits[7], digits[8], add],
      [zero, dot, eq],
    ];
  }, [applyOperator, clearAll, equals, inputDecimal, inputDigit, toggleSign, applyPercent]);

  // Keyboard support.
  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent): void => {
      // Ignore key events with modifier keys (Cmd+R etc.) so we don't fight
      // global shortcuts.
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        inputDigit(key);
        return;
      }
      switch (key) {
        case '.':
        case ',':
          event.preventDefault();
          inputDecimal();
          return;
        case '+':
          event.preventDefault();
          applyOperator('+');
          return;
        case '-':
          event.preventDefault();
          applyOperator('−');
          return;
        case '*':
          event.preventDefault();
          applyOperator('×');
          return;
        case '/':
          event.preventDefault();
          applyOperator('÷');
          return;
        case 'Enter':
        case '=':
          event.preventDefault();
          equals();
          return;
        case 'Backspace':
          event.preventDefault();
          setDisplay((current) => {
            if (replaceOnNext || current.length <= 1) return '0';
            const next = current.slice(0, -1);
            return next.length === 0 || next === '-' ? '0' : next;
          });
          return;
        case 'Escape':
        case 'Delete':
        case 'c':
        case 'C':
          event.preventDefault();
          clearAll();
          return;
        case '%':
          event.preventDefault();
          applyPercent();
          return;
        case '_':
          // Shift+- produces "_" on US layouts; treat as ± toggle.
          event.preventDefault();
          toggleSign();
          return;
        default:
          return;
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [
    applyOperator,
    applyPercent,
    clearAll,
    equals,
    inputDecimal,
    inputDigit,
    replaceOnNext,
    toggleSign,
  ]);

  // Local state for showing which operator is "selected" for visual hint.
  const selectedOp = pending && replaceOnNext ? pending.op : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1d1d1f',
        color: '#f5f5f7',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        padding: 12,
        boxSizing: 'border-box',
      }}
    >
      {/* Display */}
      <div
        aria-live="polite"
        aria-label="Calculator display"
        style={{
          flex: '0 0 auto',
          minHeight: 72,
          padding: '12px 16px',
          textAlign: 'right',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: -1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateRows: 'repeat(5, 1fr)',
          gap: 8,
          marginTop: 12,
        }}
      >
        {buttons.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {row.map((btn, colIdx) => {
              const isZero = btn.label === '0' && rowIdx === 4;
              const isSelectedOperator =
                btn.variant === 'operator' && selectedOp === btn.label;
              const style: React.CSSProperties = {
                gridColumn: isZero ? 'span 2 / span 2' : undefined,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontSize: 22,
                fontWeight: 400,
                color: '#ffffff',
                background:
                  btn.variant === 'operator'
                    ? isSelectedOperator
                      ? '#ffffff'
                      : '#ff9500'
                    : btn.variant === 'function'
                    ? '#a5a5a5'
                    : '#333333',
                minHeight: 0,
                padding: 0,
              };
              // Override text color when operator is selected.
              if (btn.variant === 'operator' && isSelectedOperator) {
                style.color = '#ff9500';
              } else if (btn.variant === 'function') {
                style.color = '#1d1d1f';
              }
              return (
                <button
                  key={`${rowIdx}-${colIdx}-${btn.label}`}
                  type="button"
                  onClick={btn.action}
                  aria-label={
                    btn.label === 'AC'
                      ? 'All clear'
                      : btn.label === '±'
                      ? 'Toggle sign'
                      : btn.label === '%'
                      ? 'Percent'
                      : btn.label
                  }
                  style={style}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calculator;
