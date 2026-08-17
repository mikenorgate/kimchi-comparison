'use client';

import { useState } from 'react';

const MAX_DIGITS = 9;

type Op = '+' | '-' | '*' | '/' | null;

function formatDisplay(value: string) {
  if (value === 'Error') return value;
  if (value.length > MAX_DIGITS) {
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return value;
    return num.toPrecision(MAX_DIGITS).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1');
  }
  return value;
}

function evaluate(left: string, right: string, op: Op): string {
  const a = parseFloat(left);
  const b = parseFloat(right);
  if (Number.isNaN(a) || Number.isNaN(b) || !op) return 'Error';

  let result = 0;
  switch (op) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '*':
      result = a * b;
      break;
    case '/':
      result = b === 0 ? Number.NaN : a / b;
      break;
  }

  if (!Number.isFinite(result)) return 'Error';
  return String(result);
}

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState<string | null>(null);
  const [operation, setOperation] = useState<Op>(null);
  const [fresh, setFresh] = useState(false);

  const clear = () => {
    setDisplay('0');
    setPrevious(null);
    setOperation(null);
    setFresh(false);
  };

  const inputDigit = (digit: string) => {
    if (fresh) {
      setDisplay(digit);
      setFresh(false);
    } else {
      setDisplay(display === '0' ? digit : `${display}${digit}`);
    }
  };

  const inputDecimal = () => {
    if (fresh) {
      setDisplay('0.');
      setFresh(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(`${display}.`);
    }
  };

  const inputOperation = (op: Op) => {
    if (previous && operation && !fresh) {
      const result = evaluate(previous, display, operation);
      setDisplay(result);
      setPrevious(result);
    } else {
      setPrevious(display);
    }
    setOperation(op);
    setFresh(true);
  };

  const calculate = () => {
    if (!previous || !operation) return;
    const result = evaluate(previous, display, operation);
    setDisplay(result);
    setPrevious(null);
    setOperation(null);
    setFresh(true);
  };

  const toggleSign = () => {
    if (display === '0') return;
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`);
  };

  const percent = () => {
    const num = parseFloat(display);
    if (Number.isNaN(num)) return;
    setDisplay(String(num / 100));
  };

  const buttons: { label: string; type: 'default' | 'accent' | 'muted'; action: () => void; testId: string }[] = [
    { label: 'AC', type: 'muted', action: clear, testId: 'calc-clear' },
    { label: '+/-', type: 'muted', action: toggleSign, testId: 'calc-sign' },
    { label: '%', type: 'muted', action: percent, testId: 'calc-percent' },
    { label: '÷', type: 'accent', action: () => inputOperation('/'), testId: 'calc-divide' },
    { label: '7', type: 'default', action: () => inputDigit('7'), testId: 'calc-7' },
    { label: '8', type: 'default', action: () => inputDigit('8'), testId: 'calc-8' },
    { label: '9', type: 'default', action: () => inputDigit('9'), testId: 'calc-9' },
    { label: '×', type: 'accent', action: () => inputOperation('*'), testId: 'calc-multiply' },
    { label: '4', type: 'default', action: () => inputDigit('4'), testId: 'calc-4' },
    { label: '5', type: 'default', action: () => inputDigit('5'), testId: 'calc-5' },
    { label: '6', type: 'default', action: () => inputDigit('6'), testId: 'calc-6' },
    { label: '-', type: 'accent', action: () => inputOperation('-'), testId: 'calc-subtract' },
    { label: '1', type: 'default', action: () => inputDigit('1'), testId: 'calc-1' },
    { label: '2', type: 'default', action: () => inputDigit('2'), testId: 'calc-2' },
    { label: '3', type: 'default', action: () => inputDigit('3'), testId: 'calc-3' },
    { label: '+', type: 'accent', action: () => inputOperation('+'), testId: 'calc-add' },
    { label: '0', type: 'default', action: () => inputDigit('0'), testId: 'calc-0' },
    { label: '.', type: 'default', action: inputDecimal, testId: 'calc-dot' },
    { label: '=', type: 'accent', action: calculate, testId: 'calc-equals' },
  ];

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center p-4"
      style={{ background: 'var(--window-bg)' }}
      data-testid="calculator"
    >
      <div
        className="w-72 overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: 'var(--window-bg)', borderColor: 'var(--window-border)' }}
      >
        <div
          className="flex h-24 items-end justify-end px-4 pb-3 text-5xl font-light"
          style={{ color: 'var(--foreground)' }}
          data-testid="calc-display"
        >
          {formatDisplay(display)}
        </div>
        <div className="grid grid-cols-4 gap-px" style={{ background: 'var(--window-border)' }}>
          {buttons.map((btn) => (
            <button
              key={btn.testId}
              data-testid={btn.testId}
              onClick={btn.action}
              className={`h-16 text-xl font-medium transition-colors active:brightness-90 ${
                btn.label === '0' ? 'col-span-2' : ''
              } ${
                btn.type === 'accent'
                  ? 'bg-accent text-accent-foreground'
                  : btn.type === 'muted'
                  ? 'bg-foreground/10 text-foreground'
                  : 'bg-background text-foreground'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
