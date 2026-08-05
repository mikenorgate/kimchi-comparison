import { describe, it, expect } from 'vitest'
import { normalizeUrl } from './Safari'

describe('Security — input surfaces', () => {
  it('Safari normalizeUrl rejects javascript: and data: protocol payloads', () => {
    expect(normalizeUrl('javascript:alert(1)')).not.toContain('javascript')
    expect(normalizeUrl('data:text/html,<script>alert(1)</script>')).not.toContain('data:')
  })

  it('normalizeUrl strips http(s) and www but preserves allowed hostnames', () => {
    expect(normalizeUrl('https://www.example.com')).toBe('example.com')
    expect(normalizeUrl('example.com')).toBe('example.com')
  })

  it('Calculator does not use eval-style evaluation', () => {
    const code = 'src/apps/Calculator.jsx'
    // We verify the switch-based arithmetic helpers are present instead of eval.
    const fs = require('node:fs')
    const source = fs.readFileSync(code, 'utf8')
    expect(source).not.toMatch(/\beval\b/)
    expect(source).toContain("case '+'")
    expect(source).toContain("case '-'")
  })
})
