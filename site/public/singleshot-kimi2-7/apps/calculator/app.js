import { App, registerApp } from '../../js/appRegistry.js';
import { $, $$ } from '../../js/utils.js';

class CalculatorApp extends App {
  constructor() {
    super({ id: 'calculator', name: 'Calculator', width: 280, height: 420, canResize: false, emoji: '🧮', iconGradient: ['#ff9500', '#ff5e3a'], iconColor: '#fff' });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'calculator';
    root.innerHTML = `
      <div class="calc-display" id="disp">0</div>
      <div class="calc-pad">
        <button data-a="AC">AC</button><button data-a="±">±</button><button data-a="%">%</button><button class="op" data-a="/">÷</button>
        <button data-a="7">7</button><button data-a="8">8</button><button data-a="9">9</button><button class="op" data-a="*">×</button>
        <button data-a="4">4</button><button data-a="5">5</button><button data-a="6">6</button><button class="op" data-a="-">−</button>
        <button data-a="1">1</button><button data-a="2">2</button><button data-a="3">3</button><button class="op" data-a="+">+</button>
        <button class="zero" data-a="0">0</button><button data-a=".">.</button><button class="op" data-a="=">=</button>
      </div>
    `;

    const disp = $('#disp', root);
    let current = '0', prev = null, op = null, reset = false;

    const update = () => disp.textContent = current;

    $$('button', root).forEach(btn => btn.addEventListener('click', () => {
      const a = btn.dataset.a;
      if (/[0-9]/.test(a)) {
        if (reset || current === '0') { current = a; reset = false; }
        else current += a;
      } else if (a === '.') {
        if (!current.includes('.')) current += '.';
      } else if (a === 'AC') {
        current = '0'; prev = null; op = null;
      } else if (a === '±') {
        current = String(-parseFloat(current));
      } else if (a === '%') {
        current = String(parseFloat(current) / 100);
      } else if (['+','-','*','/'].includes(a)) {
        prev = parseFloat(current); op = a; reset = true;
      } else if (a === '=' && op !== null) {
        const now = parseFloat(current);
        let res = 0;
        switch (op) {
          case '+': res = prev + now; break;
          case '-': res = prev - now; break;
          case '*': res = prev * now; break;
          case '/': res = now === 0 ? NaN : prev / now; break;
        }
        current = String(res); op = null; prev = null; reset = true;
      }
      update();
    }));

    return root;
  }
}

registerApp(new CalculatorApp());
