import { useCallback, useEffect, useRef, useState } from 'react';
import { Delete, History as HistoryIcon } from 'lucide-react';
import { useAppDataStore } from '../stores/appDataStore';
import { useWindowStore } from '../stores/windowStore';

interface CalculatorProps {
  windowId: string;
}

type Operator = '+' | '-' | '×' | '÷';

const BUTTONS: Array<{ label: string; value: string; tone?: 'fn' | 'op' | 'eq'; wide?: boolean }> = [
  { label: 'C', value: 'C', tone: 'fn' },
  { label: '±', value: '±', tone: 'fn' },
  { label: '%', value: '%', tone: 'fn' },
  { label: '÷', value: '÷', tone: 'op' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '×', value: '×', tone: 'op' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '−', value: '-', tone: 'op' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '+', value: '+', tone: 'op' },
  { label: '0', value: '0', wide: true },
  { label: '.', value: '.' },
  { label: '=', value: '=', tone: 'eq' },
];

function compute(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? NaN : a / b;
  }
}

function formatNumber(value: string): string {
  if (value === '' || value === '-') return value;
  if (value.endsWith('.')) return value;
  // Avoid breaking on very long intermediate results.
  const num = Number(value);
  if (!Number.isFinite(num)) return 'Error';
  return String(num);
}

export default function Calculator({ windowId }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastExpression, setLastExpression] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  const history = useAppDataStore((s) => s.calculatorHistory);
  const addEntry = useAppDataStore((s) => s.addCalculatorEntry);
  const setWindowTitle = useWindowStore((s) => s.setTitle);

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay((d) => (d === '0' ? digit : d + digit));
      }
    },
    [waitingForOperand],
  );

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    setDisplay((d) => (d.includes('.') ? d : `${d}.`));
  }, [waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPrevious(null);
    setOperator(null);
    setWaitingForOperand(false);
    setLastExpression('');
  }, []);

  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    setDisplay((d) => {
      if (d.length <= 1 || (d.length === 2 && d.startsWith('-'))) return '0';
      return d.slice(0, -1);
    });
  }, [waitingForOperand]);

  const negate = useCallback(() => {
    setDisplay((d) => {
      if (d === '0' || d === 'Error') return d;
      return d.startsWith('-') ? d.slice(1) : `-${d}`;
    });
  }, []);

  const percent = useCallback(() => {
    setDisplay((d) => {
      const n = Number(d);
      if (!Number.isFinite(n)) return 'Error';
      return String(n / 100);
    });
  }, []);

  const runEquals = useCallback(() => {
    if (operator === null || previous === null) return;
    const current = Number(display);
    if (!Number.isFinite(current)) {
      setDisplay('Error');
      return;
    }
    const result = compute(previous, current, operator);
    const resultStr = Number.isFinite(result) ? String(result) : 'Error';
    const expression = `${formatNumber(String(previous))} ${operator} ${formatNumber(display)}`;
    setDisplay(resultStr);
    setLastExpression(`${expression} =`);
    addEntry(expression, resultStr);
    setPrevious(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, operator, previous, addEntry]);

  const handleOperator = useCallback(
    (next: Operator) => {
      const current = Number(display);
      if (!Number.isFinite(current)) {
        setDisplay('Error');
        return;
      }
      if (operator !== null && previous !== null && !waitingForOperand) {
        // Immediate execution of the pending operation before chaining.
        const result = compute(previous, current, operator);
        const resultStr = Number.isFinite(result) ? String(result) : 'Error';
        const expression = `${formatNumber(String(previous))} ${operator} ${formatNumber(display)}`;
        setLastExpression(`${expression} =`);
        addEntry(expression, resultStr);
        setDisplay(resultStr);
        setPrevious(result);
      } else {
        setPrevious(current);
      }
      setOperator(next);
      setWaitingForOperand(true);
    },
    [display, operator, previous, waitingForOperand, addEntry],
  );

  const press = useCallback(
    (value: string) => {
      if (/^[0-9]$/.test(value)) {
        inputDigit(value);
        return;
      }
      switch (value) {
        case '.':
          inputDot();
          return;
        case 'C':
          clearAll();
          return;
        case '±':
          negate();
          return;
        case '%':
          percent();
          return;
        case '+':
        case '-':
        case '×':
        case '÷':
          handleOperator(value);
          return;
        case '=':
          runEquals();
          return;
        case 'Backspace':
          backspace();
          return;
      }
    },
    [backspace, clearAll, handleOperator, inputDigit, inputDot, negate, percent, runEquals],
  );

  // Wire up keyboard support on the root element so the app responds whenever
  // its window has focus.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const handler = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input (none exist, but be safe).
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key >= '0' && e.key <= '9') {
        press(e.key);
        e.preventDefault();
        return;
      }
      switch (e.key) {
        case '+':
        case '-':
        case '*':
          press(e.key === '*' ? '×' : e.key);
          e.preventDefault();
          return;
        case '/':
          press('÷');
          e.preventDefault();
          return;
        case '.':
        case ',':
          press('.');
          e.preventDefault();
          return;
        case 'Enter':
        case '=':
          press('=');
          e.preventDefault();
          return;
        case 'Escape':
        case 'Delete':
          press('C');
          e.preventDefault();
          return;
        case 'Backspace':
          press('Backspace');
          e.preventDefault();
          return;
        case '%':
          press('%');
          e.preventDefault();
          return;
      }
    };
    node.addEventListener('keydown', handler);
    // Make sure the calculator can receive keyboard events.
    if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
    return () => node.removeEventListener('keydown', handler);
  }, [press]);

  // Update window title with the current display so the chrome shows it.
  useEffect(() => {
    const label = display === 'Error' ? 'Calculator' : `Calculator — ${display}`;
    setWindowTitle(windowId, label);
  }, [display, windowId, setWindowTitle]);

  const showExpression = lastExpression || (operator && previous !== null
    ? `${formatNumber(String(previous))} ${operator}`
    : '');

  return (
    <div
      ref={rootRef}
      data-testid="calculator"
      data-window-id={windowId}
      className="flex h-full flex-col bg-neutral-100 text-neutral-900 select-none outline-none"
      tabIndex={0}
    >
      <div className="flex flex-col gap-1 px-4 pt-4 pb-2 bg-neutral-100">
        <div
          data-testid="calculator-expression"
          className="h-4 text-right text-xs text-neutral-500 truncate"
        >
          {showExpression}
        </div>
        <div
          data-testid="calculator-display"
          className="text-right text-4xl font-light tracking-tight tabular-nums truncate"
        >
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-3 pb-3 pt-1 bg-neutral-100">
        {BUTTONS.map((btn) => {
          const base =
            'h-12 rounded-full text-lg font-medium transition active:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400';
          const tone =
            btn.tone === 'op'
              ? 'bg-orange-500 text-white hover:bg-orange-400'
              : btn.tone === 'eq'
                ? 'bg-orange-500 text-white hover:bg-orange-400'
                : btn.tone === 'fn'
                  ? 'bg-neutral-300 text-neutral-900 hover:bg-neutral-200'
                  : 'bg-white text-neutral-900 hover:bg-neutral-50 shadow-sm';
          const wide = btn.wide ? 'col-span-2 justify-start pl-5' : '';
          return (
            <button
              key={btn.value}
              type="button"
              data-testid={`calc-btn-${btn.value}`}
              data-label={btn.label}
              onClick={() => press(btn.value)}
              className={`${base} ${tone} ${wide}`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 border-t border-neutral-200 bg-white px-3 py-2 overflow-y-auto">
        <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 mb-1">
          <HistoryIcon className="h-3.5 w-3.5" />
          <span>History</span>
          <button
            type="button"
            data-testid="calc-backspace"
            onClick={backspace}
            className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-neutral-500 hover:bg-neutral-100"
            aria-label="Backspace"
          >
            <Delete className="h-3.5 w-3.5" />
            <span>Backspace</span>
          </button>
        </div>
        {history.length === 0 ? (
          <div className="text-xs text-neutral-400 italic">No calculations yet.</div>
        ) : (
          <ul data-testid="calc-history" className="space-y-1 text-sm">
            {history.slice(0, 10).map((entry) => (
              <li key={entry.id} className="flex justify-between gap-2">
                <span className="text-neutral-700 truncate">{entry.expression}</span>
                <span className="font-medium tabular-nums text-neutral-900">{entry.result}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
