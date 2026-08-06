import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

let openCount = 0;

export function openCalculator() {
  openCount++;
  openWindow('calculator', 'Calculator', `
    <div class="calculator">
      <div class="calc-display">0</div>
      <button class="calc-btn fn" data-action="clear">AC</button>
      <button class="calc-btn fn" data-action="sign">+/-</button>
      <button class="calc-btn fn" data-action="percent">%</button>
      <button class="calc-btn op" data-op="/">÷</button>
      <button class="calc-btn" data-num="7">7</button>
      <button class="calc-btn" data-num="8">8</button>
      <button class="calc-btn" data-num="9">9</button>
      <button class="calc-btn op" data-op="*">×</button>
      <button class="calc-btn" data-num="4">4</button>
      <button class="calc-btn" data-num="5">5</button>
      <button class="calc-btn" data-num="6">6</button>
      <button class="calc-btn op" data-op="-">−</button>
      <button class="calc-btn" data-num="1">1</button>
      <button class="calc-btn" data-num="2">2</button>
      <button class="calc-btn" data-num="3">3</button>
      <button class="calc-btn op" data-op="+">+</button>
      <button class="calc-btn wide" data-num="0">0</button>
      <button class="calc-btn" data-num=".">.</button>
      <button class="calc-btn op" data-action="equals">=</button>
    </div>
  `, {
    width: 250, height: 380,
    onMount: (el) => {
      markAppRunning('calculator', true);
      initCalc(el);
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="calculator"]')) markAppRunning('calculator', false);
      });
    }
  });
}

function initCalc(el) {
  const display = el.querySelector('.calc-display');
  let current = '0';
  let previous = null;
  let op = null;
  let resetNext = false;

  const update = () => { display.textContent = current; };

  el.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.dataset.num;
      const operation = btn.dataset.op;
      const action = btn.dataset.action;

      if (num !== undefined) {
        if (current === '0' || resetNext) {
          current = num;
          resetNext = false;
        } else {
          current += num;
        }
      } else if (operation) {
        previous = parseFloat(current);
        op = operation;
        resetNext = true;
      } else if (action === 'clear') {
        current = '0'; previous = null; op = null;
      } else if (action === 'sign') {
        current = String(parseFloat(current) * -1);
      } else if (action === 'percent') {
        current = String(parseFloat(current) / 100);
      } else if (action === 'equals') {
        if (op && previous !== null) {
          const b = parseFloat(current);
          let result = 0;
          switch (op) {
            case '+': result = previous + b; break;
            case '-': result = previous - b; break;
            case '*': result = previous * b; break;
            case '/': result = b === 0 ? 0 : previous / b; break;
          }
          current = String(parseFloat(result.toPrecision(12)));
          previous = null; op = null; resetNext = true;
        }
      }
      update();
    });
  });
}
