import { describe, it, expect } from 'vitest'
import { evaluateMath } from '@/lib/spotlight-math'

/**
 * Tests for the Spotlight quick-math evaluator.
 *
 * Success criterion #4 calls out "quick math (2+2→4)". This asserts the
 * evaluator handles basic arithmetic, decimals, operator precedence, the
 * ×/÷ glyph aliases, division-by-zero (returns null, not NaN/Infinity), and
 * non-math input (returns null).
 */
describe('evaluateMath (Spotlight quick-math)', () => {
  it('computes 2+2 = 4', () => {
    expect(evaluateMath('2+2')).toBe(4)
  })

  it('computes subtraction and multiplication', () => {
    expect(evaluateMath('10-3')).toBe(7)
    expect(evaluateMath('6*7')).toBe(42)
  })

  it('supports × and ÷ glyph aliases', () => {
    expect(evaluateMath('6×7')).toBe(42)
    expect(evaluateMath('20÷4')).toBe(5)
  })

  it('respects operator precedence', () => {
    // 2 + 3 * 4 = 14, not 20
    expect(evaluateMath('2+3*4')).toBe(14)
  })

  it('handles parentheses', () => {
    expect(evaluateMath('(2+3)*4')).toBe(20)
  })

  it('handles decimals', () => {
    expect(evaluateMath('1.5+2.5')).toBe(4)
  })

  it('returns null for division by zero', () => {
    expect(evaluateMath('5÷0')).toBeNull()
    expect(evaluateMath('5/0')).toBeNull()
  })

  it('returns null for non-math input', () => {
    expect(evaluateMath('hello')).toBeNull()
    expect(evaluateMath('')).toBeNull()
    expect(evaluateMath('safari')).toBeNull()
  })

  it('returns null for input with no operator', () => {
    // A bare number is not "math" — needs an operator.
    expect(evaluateMath('42')).toBeNull()
  })
})
