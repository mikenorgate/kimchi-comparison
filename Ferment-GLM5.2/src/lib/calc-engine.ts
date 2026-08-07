/**
 * Calculator expression engine.
 *
 * Supports + - × ÷ with correct operator precedence (× ÷ before + -) and
 * left-associative chaining, plus parentheses and unary minus. Implemented
 * with the shunting-yard algorithm → postfix → evaluate, so there is no use
 * of `eval` or the Function constructor.
 *
 * Exported separately from the React component so the logic is unit-testable.
 */

export type Op = '+' | '-' | '*' | '/'

/** Tokenize an expression string into numbers / operators / parens. */
export function tokenize(expr: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (ch === ' ') {
      i++
      continue
    }
    if (/[0-9.]/.test(ch)) {
      let num = ''
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i]
        i++
      }
      tokens.push(num)
      continue
    }
    if (ch === '*' || ch === '/' || ch === '+' || ch === '-' || ch === '(' || ch === ')') {
      tokens.push(ch)
      i++
      continue
    }
    throw new Error(`Unexpected character: ${ch}`)
  }
  return tokens
}

const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }
const RIGHT_ASSOC = new Set<string>() // all our operators are left-associative

/** Convert infix tokens to postfix (Reverse Polish Notation). */
export function toPostfix(tokens: string[]): string[] {
  const output: string[] = []
  const stack: string[] = []
  let prev: string | null = null

  for (const tok of tokens) {
    if (/^[0-9.]/.test(tok)) {
      output.push(tok)
      prev = tok
      continue
    }
    if (tok === '-' && (prev === null || prev === '(' || isOp(prev))) {
      // Unary minus: push a 0 and treat as binary subtraction (0 - x).
      output.push('0')
      stack.push('-')
      prev = '-'
      continue
    }
    if (tok === '(') {
      stack.push(tok)
      prev = tok
      continue
    }
    if (tok === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!)
      }
      if (stack.length === 0) throw new Error('Mismatched parentheses')
      stack.pop() // discard '('
      prev = tok
      continue
    }
    // operator
    while (
      stack.length > 0 &&
      stack[stack.length - 1] !== '(' &&
      (PRECEDENCE[stack[stack.length - 1]] > PRECEDENCE[tok] ||
        (PRECEDENCE[stack[stack.length - 1]] === PRECEDENCE[tok] && !RIGHT_ASSOC.has(tok)))
    ) {
      output.push(stack.pop()!)
    }
    stack.push(tok)
    prev = tok
  }
  while (stack.length > 0) {
    const op = stack.pop()!
    if (op === '(' || op === ')') throw new Error('Mismatched parentheses')
    output.push(op)
  }
  return output
}

function isOp(t: string): boolean {
  return t === '+' || t === '-' || t === '*' || t === '/'
}

function applyOp(op: string, a: number, b: number): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b === 0 ? NaN : a / b
    default: throw new Error(`Unknown operator: ${op}`)
  }
}

/** Evaluate a postfix token list to a number. */
export function evalPostfix(postfix: string[]): number {
  const stack: number[] = []
  for (const tok of postfix) {
    if (isOp(tok)) {
      const b = stack.pop()
      const a = stack.pop()
      if (a === undefined || b === undefined) throw new Error('Malformed expression')
      stack.push(applyOp(tok, a, b))
    } else {
      stack.push(parseFloat(tok))
    }
  }
  if (stack.length !== 1) throw new Error('Malformed expression')
  return stack[0]
}

/** Evaluate an infix expression string end-to-end. */
export function evaluate(expr: string): number {
  return evalPostfix(toPostfix(tokenize(expr)))
}

/** Format a number for display, like macOS Calculator. */
export function formatResult(n: number): string {
  if (!isFinite(n) || isNaN(n)) return 'Error'
  // Trim trailing zeros from a fixed-precision representation.
  const rounded = Math.round(n * 1e10) / 1e10
  if (Number.isInteger(rounded)) return rounded.toString()
  return rounded.toString()
}
