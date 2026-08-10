/**
 * Quick-math evaluation for Spotlight.
 *
 * Lives in a separate .ts module (not the Spotlight component file) so oxlint's
 * `react/only-export-components` rule stays happy — the component file may
 * only export components.
 */

/**
 * Evaluate a simple arithmetic expression safely (no eval).
 * Supports + - × ÷ * / and parens. Returns null if not a math query.
 */
export function evaluateMath(input: string): number | null {
  const q = input.trim()
  if (!q) return null
  // Only treat as math if it's digits/operators/parens/spaces/dots.
  if (!/^[\d\s+\-*/().×÷]+$/.test(q)) return null
  // Must contain at least one operator and one digit.
  if (!/\d/.test(q) || !/[+\-*/×÷]/.test(q)) return null
  // Convert pretty operators.
  const normalized = q.replace(/×/g, '*').replace(/÷/g, '/')
  try {
    const result = safeEval(normalized)
    if (result === null || !Number.isFinite(result)) return null
    // Round to avoid float noise.
    return Math.round(result * 1e10) / 1e10
  } catch {
    return null
  }
}

/** Tiny shunting-yard evaluator for + - * / and parens. */
function safeEval(expr: string): number | null {
  const tokens = expr.match(/(\d+\.?\d*)|([+\-*/()])/g)
  if (!tokens) return null

  const output: (number | string)[] = []
  const ops: string[] = []
  const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

  for (const t of tokens) {
    if (/^\d/.test(t)) {
      output.push(parseFloat(t))
    } else if (t === '(') {
      ops.push(t)
    } else if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        const op = ops.pop()
        if (op) output.push(op)
      }
      ops.pop() // remove '('
    } else {
      while (
        ops.length &&
        ops[ops.length - 1] !== '(' &&
        (prec[ops[ops.length - 1]] ?? 0) >= (prec[t] ?? 0)
      ) {
        const op = ops.pop()
        if (op) output.push(op)
      }
      ops.push(t)
    }
  }
  while (ops.length) {
    const op = ops.pop()
    if (op) output.push(op)
  }

  const stack: number[] = []
  for (const tok of output) {
    if (typeof tok === 'number') {
      stack.push(tok)
    } else {
      const b = stack.pop()
      const a = stack.pop()
      if (a === undefined || b === undefined) return null
      switch (tok) {
        case '+': stack.push(a + b); break
        case '-': stack.push(a - b); break
        case '*': stack.push(a * b); break
        case '/': stack.push(b === 0 ? NaN : a / b); break
        default: return null
      }
    }
  }
  return stack.length === 1 ? (stack[0] ?? null) : null
}
