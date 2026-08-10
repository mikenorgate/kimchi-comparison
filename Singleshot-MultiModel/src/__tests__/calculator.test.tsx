import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Calculator from '../apps/Calculator';
import { useAppDataStore } from '../stores/appDataStore';
import { useWindowStore } from '../stores/windowStore';

function clearAll() {
  localStorage.clear();
}

function resetStores() {
  useAppDataStore.setState({
    calculatorMemory: 0,
    calculatorHistory: [],
    notes: {},
    noteOrder: [],
    terminalHistory: [],
    terminalCwd: 'root',
    safariRecent: [],
  });
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
}

function press(value: string) {
  fireEvent.click(screen.getByTestId(`calc-btn-${value}`));
}

function display(): string {
  return screen.getByTestId('calculator-display').textContent ?? '';
}

function getRoot(): HTMLElement {
  return screen.getByTestId('calculator');
}

beforeEach(() => {
  clearAll();
  resetStores();
});

afterEach(() => {
  clearAll();
  resetStores();
});

describe('Calculator app', () => {
  it('renders with a display of 0', () => {
    render(<Calculator windowId="win-calc-1" />);
    expect(getRoot()).toBeInTheDocument();
    expect(display()).toBe('0');
  });

  it('computes 12 + 7 = 19', () => {
    render(<Calculator windowId="win-calc-2" />);
    const root = getRoot();
    root.focus();

    // Click 1, 2, +, 7, =
    press('1');
    press('2');
    press('+');
    press('7');
    press('=');

    expect(display()).toBe('19');

    // The history should reflect the computation.
    const history = useAppDataStore.getState().calculatorHistory;
    expect(history.length).toBe(1);
    expect(history[0].expression).toBe('12 + 7');
    expect(history[0].result).toBe('19');
  });

  it('clears the display with C', () => {
    render(<Calculator windowId="win-calc-3" />);
    const root = getRoot();
    root.focus();

    press('5');
    press('5');
    expect(display()).toBe('55');

    press('C');
    expect(display()).toBe('0');

    // After clearing, a new computation should start fresh.
    press('3');
    press('+');
    press('4');
    press('=');
    expect(display()).toBe('7');
  });

  it('responds to keyboard input: digits, operators, Enter, Escape, Backspace', () => {
    render(<Calculator windowId="win-calc-4" />);
    const root = getRoot();
    root.focus();

    // Keyboard: 8 + 9 =
    fireEvent.keyDown(root, { key: '8' });
    fireEvent.keyDown(root, { key: '+' });
    fireEvent.keyDown(root, { key: '9' });
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(display()).toBe('17');

    // Clear via Escape.
    fireEvent.keyDown(root, { key: 'Escape' });
    expect(display()).toBe('0');

    // Keyboard: 1 2 3 Backspace Backspace
    fireEvent.keyDown(root, { key: '1' });
    fireEvent.keyDown(root, { key: '2' });
    fireEvent.keyDown(root, { key: '3' });
    expect(display()).toBe('123');
    fireEvent.keyDown(root, { key: 'Backspace' });
    fireEvent.keyDown(root, { key: 'Backspace' });
    expect(display()).toBe('1');

    // Keyboard: Clear via Delete, then 4 * 5 = 20
    fireEvent.keyDown(root, { key: 'Delete' });
    expect(display()).toBe('0');
    fireEvent.keyDown(root, { key: '4' });
    fireEvent.keyDown(root, { key: '*' });
    fireEvent.keyDown(root, { key: '5' });
    fireEvent.keyDown(root, { key: '=' });
    expect(display()).toBe('20');

    // Keyboard division
    fireEvent.keyDown(root, { key: 'Escape' });
    fireEvent.keyDown(root, { key: '1' });
    fireEvent.keyDown(root, { key: '0' });
    fireEvent.keyDown(root, { key: '/' });
    fireEvent.keyDown(root, { key: '2' });
    fireEvent.keyDown(root, { key: '=' });
    expect(display()).toBe('5');
  });

  it('chains operations left-to-right with immediate execution', () => {
    render(<Calculator windowId="win-calc-5" />);
    const root = getRoot();
    root.focus();

    // 10 + 5 - 3 = 12 (immediate execution: 10+5=15, 15-3=12)
    press('1');
    press('0');
    press('+');
    press('5');
    press('-');
    press('3');
    press('=');
    expect(display()).toBe('12');
  });

  it('handles decimal numbers and percentage', () => {
    render(<Calculator windowId="win-calc-6" />);
    const root = getRoot();
    root.focus();

    press('5');
    press('0');
    press('%');
    expect(display()).toBe('0.5');

    press('C');
    press('1');
    press('.');
    press('5');
    press('+');
    press('2');
    press('=');
    expect(display()).toBe('3.5');
  });

  it('handles negation', () => {
    render(<Calculator windowId="win-calc-7" />);
    const root = getRoot();
    root.focus();

    press('5');
    press('±');
    expect(display()).toBe('-5');
    press('±');
    expect(display()).toBe('5');
  });

  it('uses the persisted history from the store', () => {
    // Pre-seed the history so we can confirm the app renders it.
    act(() => {
      useAppDataStore.getState().addCalculatorEntry('2 + 2', '4');
    });
    render(<Calculator windowId="win-calc-8" />);
    const historyEl = screen.getByTestId('calc-history');
    expect(historyEl.textContent).toContain('2 + 2');
    expect(historyEl.textContent).toContain('4');
  });
});
