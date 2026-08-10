import { describe, it, expect } from 'vitest';
import { calculatorReducer, createInitialState } from '../engine';
import type { CalculatorAction } from '../engine';

// Helper to run a sequence of actions and return the final display
function run(actions: CalculatorAction[]): string {
  let state = createInitialState();
  for (const action of actions) {
    state = calculatorReducer(state, action);
  }
  return state.display;
}

describe('Calculator Engine', () => {
  describe('Basic arithmetic', () => {
    it('adds two numbers', () => {
      expect(run([
        { type: 'digit', value: '2' },
        { type: 'operator', value: '+' },
        { type: 'digit', value: '3' },
        { type: 'equals' },
      ])).toBe('5');
    });

    it('subtracts two numbers', () => {
      expect(run([
        { type: 'digit', value: '9' },
        { type: 'operator', value: '-' },
        { type: 'digit', value: '4' },
        { type: 'equals' },
      ])).toBe('5');
    });

    it('multiplies two numbers', () => {
      expect(run([
        { type: 'digit', value: '6' },
        { type: 'operator', value: '×' },
        { type: 'digit', value: '7' },
        { type: 'equals' },
      ])).toBe('42');
    });

    it('divides two numbers', () => {
      expect(run([
        { type: 'digit', value: '8' },
        { type: 'operator', value: '÷' },
        { type: 'digit', value: '2' },
        { type: 'equals' },
      ])).toBe('4');
    });
  });

  describe('Multi-digit and decimal', () => {
    it('handles multi-digit numbers', () => {
      expect(run([
        { type: 'digit', value: '1' },
        { type: 'digit', value: '2' },
        { type: 'digit', value: '3' },
        { type: 'operator', value: '+' },
        { type: 'digit', value: '4' },
        { type: 'digit', value: '5' },
        { type: 'digit', value: '6' },
        { type: 'equals' },
      ])).toBe('579');
    });

    it('handles decimal numbers', () => {
      expect(run([
        { type: 'digit', value: '3' },
        { type: 'decimal' },
        { type: 'digit', value: '5' },
        { type: 'operator', value: '+' },
        { type: 'digit', value: '2' },
        { type: 'decimal' },
        { type: 'digit', value: '5' },
        { type: 'equals' },
      ])).toBe('6');
    });

    it('does not allow multiple decimal points', () => {
      expect(run([
        { type: 'digit', value: '1' },
        { type: 'decimal' },
        { type: 'digit', value: '5' },
        { type: 'decimal' },
        { type: 'digit', value: '5' },
      ])).toBe('1.55');
    });
  });

  describe('Chained operations', () => {
    it('chains multiple operations (standard calculator logic)', () => {
      // 2 + 3 × 4 = should compute (2+3)=5, then 5×4=20
      expect(run([
        { type: 'digit', value: '2' },
        { type: 'operator', value: '+' },
        { type: 'digit', value: '3' },
        { type: 'operator', value: '×' },
        { type: 'digit', value: '4' },
        { type: 'equals' },
      ])).toBe('20');
    });

    it('shows intermediate result when chaining operators', () => {
      let state = createInitialState();
      state = calculatorReducer(state, { type: 'digit', value: '5' });
      state = calculatorReducer(state, { type: 'operator', value: '+' });
      state = calculatorReducer(state, { type: 'digit', value: '3' });
      state = calculatorReducer(state, { type: 'operator', value: '×' });
      // After pressing ×, display should show the intermediate result (8)
      expect(state.display).toBe('8');
    });
  });

  describe('Special operations', () => {
    it('toggles sign', () => {
      expect(run([
        { type: 'digit', value: '5' },
        { type: 'toggle-sign' },
      ])).toBe('-5');
    });

    it('toggles sign back to positive', () => {
      expect(run([
        { type: 'digit', value: '5' },
        { type: 'toggle-sign' },
        { type: 'toggle-sign' },
      ])).toBe('5');
    });

    it('converts to percent', () => {
      expect(run([
        { type: 'digit', value: '5' },
        { type: 'digit', value: '0' },
        { type: 'percent' },
      ])).toBe('0.5');
    });

    it('clears everything with AC', () => {
      let state = createInitialState();
      state = calculatorReducer(state, { type: 'digit', value: '5' });
      state = calculatorReducer(state, { type: 'operator', value: '+' });
      state = calculatorReducer(state, { type: 'digit', value: '3' });
      state = calculatorReducer(state, { type: 'clear' });
      expect(state.display).toBe('0');
      expect(state.previous).toBeNull();
      expect(state.operator).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('returns Error on division by zero', () => {
      expect(run([
        { type: 'digit', value: '5' },
        { type: 'operator', value: '÷' },
        { type: 'digit', value: '0' },
        { type: 'equals' },
      ])).toBe('Error');
    });

    it('only allows Clear after error', () => {
      let state = createInitialState();
      state = calculatorReducer(state, { type: 'digit', value: '5' });
      state = calculatorReducer(state, { type: 'operator', value: '÷' });
      state = calculatorReducer(state, { type: 'digit', value: '0' });
      state = calculatorReducer(state, { type: 'equals' });
      expect(state.display).toBe('Error');
      expect(state.error).toBe(true);

      // Pressing digits should do nothing
      state = calculatorReducer(state, { type: 'digit', value: '7' });
      expect(state.display).toBe('Error');

      // Clear should reset
      state = calculatorReducer(state, { type: 'clear' });
      expect(state.display).toBe('0');
      expect(state.error).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('does nothing when pressing equals without an operator', () => {
      expect(run([
        { type: 'digit', value: '5' },
        { type: 'equals' },
      ])).toBe('5');
    });

    it('starts new input after equals', () => {
      expect(run([
        { type: 'digit', value: '2' },
        { type: 'operator', value: '+' },
        { type: 'digit', value: '3' },
        { type: 'equals' },
        { type: 'digit', value: '7' },
      ])).toBe('7');
    });

    it('changes operator if pressed without new input', () => {
      let state = createInitialState();
      state = calculatorReducer(state, { type: 'digit', value: '5' });
      state = calculatorReducer(state, { type: 'operator', value: '+' });
      state = calculatorReducer(state, { type: 'operator', value: '×' });
      expect(state.operator).toBe('×');
    });

    it('handles leading zero', () => {
      expect(run([
        { type: 'digit', value: '0' },
        { type: 'digit', value: '5' },
      ])).toBe('5');
    });

    it('handles decimal after zero', () => {
      expect(run([
        { type: 'decimal' },
        { type: 'digit', value: '5' },
      ])).toBe('0.5');
    });

    it('handles floating point rounding (0.1 + 0.2)', () => {
      expect(run([
        { type: 'digit', value: '0' },
        { type: 'decimal' },
        { type: 'digit', value: '1' },
        { type: 'operator', value: '+' },
        { type: 'digit', value: '0' },
        { type: 'decimal' },
        { type: 'digit', value: '2' },
        { type: 'equals' },
      ])).toBe('0.3');
    });
  });
});
