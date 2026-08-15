import { useState, useCallback } from 'react';
import './Calculator.css';

const BUTTONS = [
  { label: 'C', type: 'clear' }, { label: '±', type: 'negate' }, { label: '%', type: 'percent' }, { label: '÷', value: '/', type: 'operator' },
  { label: '7', value: '7', type: 'digit' }, { label: '8', value: '8', type: 'digit' }, { label: '9', value: '9', type: 'digit' }, { label: '×', value: '*', type: 'operator' },
  { label: '4', value: '4', type: 'digit' }, { label: '5', value: '5', type: 'digit' }, { label: '6', value: '6', type: 'digit' }, { label: '−', value: '-', type: 'operator' },
  { label: '1', value: '1', type: 'digit' }, { label: '2', value: '2', type: 'digit' }, { label: '3', value: '3', type: 'digit' }, { label: '+', value: '+', type: 'operator' },
  { label: '0', value: '0', type: 'digit', wide: true }, { label: '.', value: '.', type: 'digit' }, { label: '=', type: 'equals' },
];

function calculateExpression(expression) {
  // Simple arithmetic evaluator supporting +, -, *, /, decimals, and operator precedence.
  if (!expression || /[^0-9+\-*/. ]/.test(expression)) return 'Error';
  try {
    // Tokenize and parse with two-pass precedence: first * and /, then + and -.
    const tokens = expression.match(/\d+\.?\d*|[+\-*/]/g) || [];
    if (tokens.length === 0) return '0';
    const values = [];
    const ops = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (/\d/.test(token)) {
        values.push(parseFloat(token));
      } else {
        while (ops.length && precedence[ops[ops.length - 1]] >= precedence[token]) {
          const op = ops.pop();
          const b = values.pop();
          const a = values.pop();
          if (op === '/' && b === 0) return 'Error';
          values.push(applyOperator(a, b, op));
        }
        ops.push(token);
      }
    }
    while (ops.length) {
      const op = ops.pop();
      const b = values.pop();
      const a = values.pop();
      if (op === '/' && b === 0) return 'Error';
      values.push(applyOperator(a, b, op));
    }
    const result = values[0];
    return Number.isFinite(result) ? String(Number(result.toFixed(8))) : 'Error';
  } catch {
    return 'Error';
  }
}

function applyOperator(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default: return 0;
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [fresh, setFresh] = useState(true);

  const handleButton = useCallback((btn) => {
    if (btn.type === 'clear') {
      setDisplay('0');
      setExpression('');
      setFresh(true);
      return;
    }

    if (btn.type === 'negate') {
      setDisplay((prev) => {
        if (prev === '0' || prev === 'Error') return prev;
        return String(parseFloat(prev) * -1);
      });
      return;
    }

    if (btn.type === 'percent') {
      setDisplay((prev) => {
        if (prev === 'Error') return prev;
        return String(parseFloat(prev) / 100);
      });
      return;
    }

    if (btn.type === 'equals') {
      if (!expression) return;
      const full = expression + display;
      const result = calculateExpression(full);
      setDisplay(result);
      setExpression('');
      setFresh(true);
      return;
    }

    if (btn.type === 'operator') {
      setExpression((prev) => {
        const base = fresh && prev ? prev : prev + display;
        // Replace trailing operator if already present
        return base.replace(/\s*[+\-*/]$/, '') + ' ' + btn.value + ' ';
      });
      setFresh(true);
      return;
    }

    // digit
    setDisplay((prev) => {
      if (prev === 'Error' || fresh) {
        setFresh(false);
        return btn.value;
      }
      if (btn.value === '.' && prev.includes('.')) return prev;
      return prev + btn.value;
    });
  }, [display, expression, fresh]);

  return (
    <div className="calculator" data-testid="calculator-app">
      <div className="calculator-display">
        <div className="calculator-expression">{expression}</div>
        <div className="calculator-result" aria-live="polite" data-testid="calculator-result">{display}</div>
      </div>
      <div className="calculator-pad">
        {BUTTONS.map((btn) => (
          <button
            key={btn.label}
            className={`calculator-button ${btn.type}${btn.wide ? ' wide' : ''}`}
            onClick={() => handleButton(btn)}
            aria-label={btn.label}
            data-key={btn.value || btn.type}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { calculateExpression };
