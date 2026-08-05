import { useState, useCallback } from 'react'

type Operator = '+' | '-' | '*' | '/' | null

export function Calculator() {
  const [previous, setPrevious] = useState<string>('')
  const [current, setCurrent] = useState<string>('0')
  const [operator, setOperator] = useState<Operator>(null)
  const [overwrite, setOverwrite] = useState<boolean>(false)

  const clear = useCallback(() => {
    setPrevious('')
    setCurrent('0')
    setOperator(null)
    setOverwrite(false)
  }, [])

  const inputDigit = useCallback((digit: string) => {
    if (overwrite) {
      setCurrent(digit)
      setOverwrite(false)
      return
    }
    if (current === '0') {
      setCurrent(digit)
    } else {
      setCurrent(current + digit)
    }
  }, [current, overwrite])

  const inputDecimal = useCallback(() => {
    if (overwrite) {
      setCurrent('0.')
      setOverwrite(false)
      return
    }
    if (!current.includes('.')) {
      setCurrent(current + '.')
    }
  }, [current, overwrite])

  const toggleSign = useCallback(() => {
    if (current === '0') return
    if (current.startsWith('-')) {
      setCurrent(current.slice(1))
    } else {
      setCurrent('-' + current)
    }
  }, [current])

  const percentage = useCallback(() => {
    const value = parseFloat(current)
    if (Number.isNaN(value)) return
    setCurrent(String(value / 100))
  }, [current])

  const compute = useCallback((prev: string, curr: string, op: Operator): string => {
    const prevValue = parseFloat(prev)
    const currValue = parseFloat(curr)
    if (Number.isNaN(prevValue) || Number.isNaN(currValue) || !op) return curr

    let result = 0
    switch (op) {
      case '+':
        result = prevValue + currValue
        break
      case '-':
        result = prevValue - currValue
        break
      case '*':
        result = prevValue * currValue
        break
      case '/':
        if (currValue === 0) return 'Error'
        result = prevValue / currValue
        break
      default:
        return curr
    }

    return String(result).length > 12 ? result.toExponential(6) : String(result)
  }, [])

  const chooseOperator = useCallback((nextOperator: Operator) => {
    if (operator && !overwrite) {
      const result = compute(previous, current, operator)
      setCurrent(result)
      setPrevious(result)
    } else {
      setPrevious(current)
    }
    setOperator(nextOperator)
    setOverwrite(true)
  }, [operator, overwrite, previous, current, compute])

  const calculate = useCallback(() => {
    if (!operator) return
    const result = compute(previous, current, operator)
    setCurrent(result)
    setPrevious('')
    setOperator(null)
    setOverwrite(true)
  }, [previous, current, operator, compute])

  const display = current
  const operatorDisplay = operator || ''

  const btnBase = 'h-14 rounded-full text-xl font-medium transition-transform active:scale-95 focus:outline-none'
  const btnNumber = `${btnBase} bg-tahoe-glass text-tahoe-text hover:bg-white/20`
  const btnOperation = `${btnBase} bg-tahoe-accent text-white hover:brightness-110`
  const btnUtility = `${btnBase} bg-tahoe-text-secondary text-tahoe-text hover:bg-white/30`

  return (
    <div className="flex flex-col h-full bg-tahoe-glass/50 p-3 rounded-tahoe select-none" data-testid="calculator">
      <div className="flex-1 flex flex-col items-end justify-end px-2 pb-4">
        <div className="text-tahoe-text-secondary text-sm h-6" data-testid="calculator-previous">
          {previous} {operatorDisplay}
        </div>
        <div className="text-tahoe-text text-5xl font-light break-all" data-testid="calculator-display">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button className={btnUtility} onClick={clear} data-testid="calc-clear">AC</button>
        <button className={btnUtility} onClick={toggleSign} data-testid="calc-sign">+/-</button>
        <button className={btnUtility} onClick={percentage} data-testid="calc-percent">%</button>
        <button className={operator === '/' ? btnOperation + ' ring-2 ring-white/50' : btnOperation} onClick={() => chooseOperator('/')} data-testid="calc-divide">÷</button>

        <button className={btnNumber} onClick={() => inputDigit('7')} data-testid="calc-7">7</button>
        <button className={btnNumber} onClick={() => inputDigit('8')} data-testid="calc-8">8</button>
        <button className={btnNumber} onClick={() => inputDigit('9')} data-testid="calc-9">9</button>
        <button className={operator === '*' ? btnOperation + ' ring-2 ring-white/50' : btnOperation} onClick={() => chooseOperator('*')} data-testid="calc-multiply">×</button>

        <button className={btnNumber} onClick={() => inputDigit('4')} data-testid="calc-4">4</button>
        <button className={btnNumber} onClick={() => inputDigit('5')} data-testid="calc-5">5</button>
        <button className={btnNumber} onClick={() => inputDigit('6')} data-testid="calc-6">6</button>
        <button className={operator === '-' ? btnOperation + ' ring-2 ring-white/50' : btnOperation} onClick={() => chooseOperator('-')} data-testid="calc-subtract">−</button>

        <button className={btnNumber} onClick={() => inputDigit('1')} data-testid="calc-1">1</button>
        <button className={btnNumber} onClick={() => inputDigit('2')} data-testid="calc-2">2</button>
        <button className={btnNumber} onClick={() => inputDigit('3')} data-testid="calc-3">3</button>
        <button className={operator === '+' ? btnOperation + ' ring-2 ring-white/50' : btnOperation} onClick={() => chooseOperator('+')} data-testid="calc-add">+</button>

        <button className={btnNumber + ' col-span-2'} onClick={() => inputDigit('0')} data-testid="calc-0">0</button>
        <button className={btnNumber} onClick={inputDecimal} data-testid="calc-decimal">.</button>
        <button className={btnOperation} onClick={calculate} data-testid="calc-equals">=</button>
      </div>
    </div>
  )
}
