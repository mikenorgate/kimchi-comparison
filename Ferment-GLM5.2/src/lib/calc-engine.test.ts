import { describe, expect, it } from 'vitest'
import { evaluate, formatResult, tokenize, toPostfix } from './calc-engine'

/**
 * calc-engine — pure arithmetic evaluation with correct precedence,
 * left-associative chaining, parentheses, and unary minus.
 */

describe('tokenize', () => {
  it('splits numbers and operators', () => {
    expect(tokenize('1+2')).toEqual(['1', '+', '2'])
    expect(tokenize('3.5 * 2')).toEqual(['3.5', '*', '2'])
  })
})

describe('precedence and chaining', () => {
  it('respects × before +', () => {
    expect(evaluate('1+2*3')).toBe(7)
  })
  it('respects ÷ before -', () => {
    expect(evaluate('10-6/2')).toBe(7)
  })
  it('left-associative subtraction', () => {
    expect(evaluate('10-3-2')).toBe(5)
  })
  it('left-associative division', () => {
    expect(evaluate('100/5/2')).toBe(10)
  })
  it('chains a series of operations', () => {
    expect(evaluate('2+3*4-1')).toBe(13)
  })
})

describe('parentheses', () => {
  it('overrides precedence', () => {
    expect(evaluate('(1+2)*3')).toBe(9)
  })
  it('nested', () => {
    expect(evaluate('((2+3)*2)')).toBe(10)
  })
})

describe('unary minus', () => {
  it('leading negative number', () => {
    expect(evaluate('-5+3')).toBe(-2)
  })
  it('after an operator', () => {
    expect(evaluate('2*-3')).toBe(-6)
  })
})

describe('division edge cases', () => {
  it('division by zero yields NaN', () => {
    expect(isNaN(evaluate('1/0'))).toBe(true)
  })
})

describe('formatResult', () => {
  it('trims trailing zeros', () => {
    expect(formatResult(2)).toBe('2')
    expect(formatResult(2.5)).toBe('2.5')
    expect(formatResult(1 / 3)).toBe('0.3333333333')
  })
  it('errors display as Error', () => {
    expect(formatResult(NaN)).toBe('Error')
    expect(formatResult(Infinity)).toBe('Error')
  })
})

describe('toPostfix', () => {
  it('produces correct RPN order', () => {
    expect(toPostfix(tokenize('1+2*3'))).toEqual(['1', '2', '3', '*', '+'])
  })
})
