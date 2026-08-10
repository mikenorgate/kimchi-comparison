/**
 * Calculator — macOS Tahoe Calculator app.
 *
 * Features:
 * - Display showing current value
 * - Digit buttons 0-9, decimal point
 * - Operators: +, -, ×, ÷
 * - Equals, Clear (AC), ± (toggle sign), % (percent)
 * - Keyboard input: 0-9, +, -, *, /, Enter/=, Escape (clear), Backspace
 * - Powered by the pure-function arithmetic engine
 */

import { useReducer, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { calculatorReducer, createInitialState, type CalculatorAction } from './engine';

interface CalculatorProps {
  appId: string;
}

const BUTTONS: Array<{
  label: string;
  action: CalculatorAction;
  className: string;
  testId: string;
}> = [
  { label: 'AC', action: { type: 'clear' }, className: 'bg-black/10 dark:bg-white/15 text-black dark:text-white', testId: 'calc-clear' },
  { label: '±', action: { type: 'toggle-sign' }, className: 'bg-black/10 dark:bg-white/15 text-black dark:text-white', testId: 'calc-sign' },
  { label: '%', action: { type: 'percent' }, className: 'bg-black/10 dark:bg-white/15 text-black dark:text-white', testId: 'calc-percent' },
  { label: '÷', action: { type: 'operator', value: '÷' }, className: 'bg-[#ff9f0a] text-white', testId: 'calc-divide' },
  { label: '7', action: { type: 'digit', value: '7' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-7' },
  { label: '8', action: { type: 'digit', value: '8' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-8' },
  { label: '9', action: { type: 'digit', value: '9' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-9' },
  { label: '×', action: { type: 'operator', value: '×' }, className: 'bg-[#ff9f0a] text-white', testId: 'calc-multiply' },
  { label: '4', action: { type: 'digit', value: '4' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-4' },
  { label: '5', action: { type: 'digit', value: '5' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-5' },
  { label: '6', action: { type: 'digit', value: '6' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-6' },
  { label: '−', action: { type: 'operator', value: '-' }, className: 'bg-[#ff9f0a] text-white', testId: 'calc-subtract' },
  { label: '1', action: { type: 'digit', value: '1' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-1' },
  { label: '2', action: { type: 'digit', value: '2' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-2' },
  { label: '3', action: { type: 'digit', value: '3' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-3' },
  { label: '+', action: { type: 'operator', value: '+' }, className: 'bg-[#ff9f0a] text-white', testId: 'calc-add' },
  { label: '0', action: { type: 'digit', value: '0' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white col-span-2', testId: 'calc-0' },
  { label: '.', action: { type: 'decimal' }, className: 'bg-black/8 dark:bg-white/10 text-black dark:text-white', testId: 'calc-decimal' },
  { label: '=', action: { type: 'equals' }, className: 'bg-[#ff9f0a] text-white', testId: 'calc-equals' },
];

export function Calculator({ appId: _appId }: CalculatorProps) {
  const [state, dispatch] = useReducer(calculatorReducer, undefined, createInitialState);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent) => {
    const key = e.key;

    // Digits 0-9
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      dispatch({ type: 'digit', value: key });
      return;
    }

    // Decimal point
    if (key === '.') {
      e.preventDefault();
      dispatch({ type: 'decimal' });
      return;
    }

    // Operators
    if (key === '+') { e.preventDefault(); dispatch({ type: 'operator', value: '+' }); return; }
    if (key === '-') { e.preventDefault(); dispatch({ type: 'operator', value: '-' }); return; }
    if (key === '*') { e.preventDefault(); dispatch({ type: 'operator', value: '×' }); return; }
    if (key === '/') { e.preventDefault(); dispatch({ type: 'operator', value: '÷' }); return; }

    // Equals
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      dispatch({ type: 'equals' });
      return;
    }

    // Clear
    if (key === 'Escape') {
      e.preventDefault();
      dispatch({ type: 'clear' });
      return;
    }

    // Percent
    if (key === '%') {
      e.preventDefault();
      dispatch({ type: 'percent' });
      return;
    }

    // Backspace — acts as clear for simplicity
    if (key === 'Backspace') {
      e.preventDefault();
      dispatch({ type: 'clear' });
      return;
    }
  }, []);

  // Display formatting: truncate long numbers
  const displayValue = state.display;

  return (
    <div
      className="flex flex-col h-full w-full p-3 gap-3"
      data-testid="calculator-root"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Display */}
      <div className="flex items-end justify-end px-4 py-6" data-testid="calculator-display-container">
        <span
          className="text-5xl font-light text-black dark:text-white tabular-nums truncate"
          data-testid="calculator-display"
        >
          {displayValue}
        </span>
      </div>

      {/* Button grid */}
      <div className="grid grid-cols-4 gap-2 flex-1" data-testid="calculator-buttons">
        {BUTTONS.map((btn) => (
          <button
            key={btn.testId}
            className={`rounded-full flex items-center justify-center text-xl font-medium transition-opacity hover:opacity-80 active:opacity-60 ${btn.className}`}
            onClick={() => dispatch(btn.action)}
            data-testid={btn.testId}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
