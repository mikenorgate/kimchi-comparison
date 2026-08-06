import { useEffect, useState } from 'react';
import './calculator.css';

type Op = '+' | '-' | '×' | '÷' | null;

export default function Calculator(_props: { windowId: string }) {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [overwrite, setOverwrite] = useState(true);

  const inputDigit = (d: string) => {
    setDisplay((prev) => {
      if (overwrite) return d === '.' ? '0.' : d;
      if (d === '.' && prev.includes('.')) return prev;
      if (prev === '0' && d !== '.') return d;
      return prev + d;
    });
    setOverwrite(false);
  };

  const compute = (a: number, b: number, operator: Op): number => {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const chooseOp = (nextOp: Op) => {
    const current = parseFloat(display);
    if (stored !== null && op && !overwrite) {
      const result = compute(stored, current, op);
      setStored(result);
      setDisplay(String(roundClean(result)));
    } else {
      setStored(current);
    }
    setOp(nextOp);
    setOverwrite(true);
  };

  const roundClean = (n: number) => Math.round(n * 1e10) / 1e10;

  const equals = () => {
    if (op === null || stored === null) return;
    const current = parseFloat(display);
    const result = compute(stored, current, op);
    setDisplay(String(roundClean(result)));
    setStored(null);
    setOp(null);
    setOverwrite(true);
  };

  const clear = () => {
    setDisplay('0');
    setStored(null);
    setOp(null);
    setOverwrite(true);
  };

  const toggleSign = () => setDisplay((d) => (d.startsWith('-') ? d.slice(1) : d === '0' ? d : '-' + d));
  const percent = () => setDisplay((d) => String(roundClean(parseFloat(d) / 100)));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDigit('.');
      else if (e.key === '+') chooseOp('+');
      else if (e.key === '-') chooseOp('-');
      else if (e.key === '*') chooseOp('×');
      else if (e.key === '/') chooseOp('÷');
      else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Escape') clear();
      else if (e.key === 'Backspace') setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const btn = (label: string, onClick: () => void, cls = '') => (
    <button className={`calc-btn ${cls}`} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <div className="calculator">
      <div className="calc-display">{display}</div>
      <div className="calc-grid">
        {btn('AC', clear, 'calc-func')}
        {btn('±', toggleSign, 'calc-func')}
        {btn('%', percent, 'calc-func')}
        {btn('÷', () => chooseOp('÷'), 'calc-op')}

        {btn('7', () => inputDigit('7'))}
        {btn('8', () => inputDigit('8'))}
        {btn('9', () => inputDigit('9'))}
        {btn('×', () => chooseOp('×'), 'calc-op')}

        {btn('4', () => inputDigit('4'))}
        {btn('5', () => inputDigit('5'))}
        {btn('6', () => inputDigit('6'))}
        {btn('-', () => chooseOp('-'), 'calc-op')}

        {btn('1', () => inputDigit('1'))}
        {btn('2', () => inputDigit('2'))}
        {btn('3', () => inputDigit('3'))}
        {btn('+', () => chooseOp('+'), 'calc-op')}

        {btn('0', () => inputDigit('0'), 'calc-zero')}
        {btn('.', () => inputDigit('.'))}
        {btn('=', equals, 'calc-op')}
      </div>
    </div>
  );
}
