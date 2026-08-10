import { useState } from 'react';

const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [shouldReset, setShouldReset] = useState(false);

  const formatNumber = (num) => {
    const n = parseFloat(num);
    if (Number.isNaN(n)) return 'Error';
    return String(Number(n.toFixed(8)));
  };

  const handleNumber = (value) => {
    if (shouldReset) {
      setDisplay(value);
      setExpression(value);
      setShouldReset(false);
    } else {
      const newDisplay = display === '0' ? value : display + value;
      setDisplay(newDisplay);
      setExpression(expression === '0' ? value : expression + value);
    }
  };

  const handleOperator = (op) => {
    const symbol = op === '×' ? '*' : op === '÷' ? '/' : op;
    setShouldReset(false);
    setExpression((prev) => {
      if (prev === '') return display + symbol;
      const last = prev.slice(-1);
      if (['+', '-', '*', '/'].includes(last)) return prev.slice(0, -1) + symbol;
      return prev + symbol;
    });
    setDisplay(op);
  };

  const handleEqual = () => {
    try {
      const result = new Function(`return (${expression})`)();
      const formatted = formatNumber(result);
      setDisplay(String(formatted));
      setExpression(String(formatted));
      setShouldReset(true);
    } catch {
      setDisplay('Error');
      setExpression('');
      setShouldReset(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setShouldReset(false);
  };

  const handleToggleSign = () => {
    if (display === '0') return;
    const val = parseFloat(display);
    if (Number.isNaN(val)) return;
    const next = String(-val);
    setDisplay(next);
    setExpression(expression.replace(new RegExp(`${display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), next));
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    if (Number.isNaN(val)) return;
    const next = String(val / 100);
    setDisplay(next);
    setExpression(expression.replace(new RegExp(`${display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), next));
  };

  const handleDecimal = () => {
    if (shouldReset) {
      setDisplay('0.');
      setExpression('0.');
      setShouldReset(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const buttons = [
    { label: 'AC', handler: handleClear, className: 'bg-gray-300 text-black' },
    { label: '+/-', handler: handleToggleSign, className: 'bg-gray-300 text-black' },
    { label: '%', handler: handlePercent, className: 'bg-gray-300 text-black' },
    { label: '÷', handler: () => handleOperator('÷'), className: 'bg-amber-500 text-white' },
    { label: '7', handler: () => handleNumber('7'), className: 'bg-gray-700 text-white' },
    { label: '8', handler: () => handleNumber('8'), className: 'bg-gray-700 text-white' },
    { label: '9', handler: () => handleNumber('9'), className: 'bg-gray-700 text-white' },
    { label: '×', handler: () => handleOperator('×'), className: 'bg-amber-500 text-white' },
    { label: '4', handler: () => handleNumber('4'), className: 'bg-gray-700 text-white' },
    { label: '5', handler: () => handleNumber('5'), className: 'bg-gray-700 text-white' },
    { label: '6', handler: () => handleNumber('6'), className: 'bg-gray-700 text-white' },
    { label: '-', handler: () => handleOperator('-'), className: 'bg-amber-500 text-white' },
    { label: '1', handler: () => handleNumber('1'), className: 'bg-gray-700 text-white' },
    { label: '2', handler: () => handleNumber('2'), className: 'bg-gray-700 text-white' },
    { label: '3', handler: () => handleNumber('3'), className: 'bg-gray-700 text-white' },
    { label: '+', handler: () => handleOperator('+'), className: 'bg-amber-500 text-white' },
    { label: '0', handler: () => handleNumber('0'), className: 'col-span-2 bg-gray-700 text-white' },
    { label: '.', handler: handleDecimal, className: 'bg-gray-700 text-white' },
    { label: '=', handler: handleEqual, className: 'bg-amber-500 text-white' },
  ];

  return (
    <div data-testid="calculator-app" className="flex h-full w-full flex-col rounded-lg bg-black/80 p-4 text-white backdrop-blur-md">
      <div
        data-testid="calculator-display"
        className="mb-4 flex h-20 items-end justify-end px-2 text-5xl font-light"
        aria-live="polite"
      >
        {display}
      </div>
      <div data-testid="calculator-keypad" className="grid flex-1 grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            data-testid={`calculator-key-${btn.label}`}
            onClick={btn.handler}
            aria-label={btn.label}
            className={`rounded-full text-2xl font-medium transition active:scale-95 ${btn.className}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorApp;
