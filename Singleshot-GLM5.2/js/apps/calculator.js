/* ============================================
   App: Calculator
   ============================================ */

const Calculator = {
  display: '0',
  history: '',
  previousValue: null,
  operator: null,
  waitingForOperand: false,

  render(container, winData) {
    container.innerHTML = `
      <div class="calculator">
        <div class="calc-display">
          <div class="calc-history" id="${winData.id}-history"></div>
          <div id="${winData.id}-display">${this.display}</div>
        </div>
        <div class="calc-buttons" id="${winData.id}-buttons">
          <button class="calc-btn fn" data-action="clear">AC</button>
          <button class="calc-btn fn" data-action="sign">±</button>
          <button class="calc-btn fn" data-action="percent">%</button>
          <button class="calc-btn op" data-op="÷">÷</button>
          <button class="calc-btn" data-num="7">7</button>
          <button class="calc-btn" data-num="8">8</button>
          <button class="calc-btn" data-num="9">9</button>
          <button class="calc-btn op" data-op="×">×</button>
          <button class="calc-btn" data-num="4">4</button>
          <button class="calc-btn" data-num="5">5</button>
          <button class="calc-btn" data-num="6">6</button>
          <button class="calc-btn op" data-op="−">−</button>
          <button class="calc-btn" data-num="1">1</button>
          <button class="calc-btn" data-num="2">2</button>
          <button class="calc-btn" data-num="3">3</button>
          <button class="calc-btn op" data-op="+">+</button>
          <button class="calc-btn zero" data-num="0">0</button>
          <button class="calc-btn" data-action="decimal">.</button>
          <button class="calc-btn op" data-action="equals">=</button>
        </div>
      </div>
    `;

    this.attachEvents(winData);
  },

  attachEvents(winData) {
    const buttons = document.getElementById(`${winData.id}-buttons`);
    if (!buttons) return;

    buttons.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = btn.dataset.num;
        const op = btn.dataset.op;
        const action = btn.dataset.action;

        if (num !== undefined) {
          this.inputNumber(num, winData);
        } else if (op !== undefined) {
          this.inputOperator(op, winData);
        } else if (action) {
          this.handleAction(action, winData);
        }
      });
    });
  },

  inputNumber(num, winData) {
    if (this.waitingForOperand) {
      this.display = num;
      this.waitingForOperand = false;
    } else {
      this.display = this.display === '0' ? num : this.display + num;
    }
    this.updateDisplay(winData);
  },

  inputOperator(op, winData) {
    const current = parseFloat(this.display);

    if (this.previousValue !== null && this.operator && !this.waitingForOperand) {
      const result = this.calculate(this.previousValue, current, this.operator);
      this.display = this.formatNumber(result);
      this.previousValue = result;
    } else {
      this.previousValue = current;
    }

    this.operator = op;
    this.waitingForOperand = true;
    this.history = `${this.formatNumber(this.previousValue)} ${op}`;
    this.updateDisplay(winData);

    // Highlight active operator
    const buttons = document.getElementById(`${winData.id}-buttons`);
    if (buttons) {
      buttons.querySelectorAll('.calc-btn.op').forEach(b => b.classList.remove('active'));
      const activeBtn = buttons.querySelector(`[data-op="${op}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
  },

  handleAction(action, winData) {
    switch (action) {
      case 'clear':
        this.display = '0';
        this.history = '';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        break;
      case 'sign':
        this.display = this.display.startsWith('-') ? this.display.slice(1) : '-' + this.display;
        break;
      case 'percent':
        this.display = this.formatNumber(parseFloat(this.display) / 100);
        break;
      case 'decimal':
        if (this.waitingForOperand) {
          this.display = '0.';
          this.waitingForOperand = false;
        } else if (!this.display.includes('.')) {
          this.display += '.';
        }
        break;
      case 'equals':
        if (this.previousValue !== null && this.operator) {
          const current = parseFloat(this.display);
          const result = this.calculate(this.previousValue, current, this.operator);
          this.history = `${this.formatNumber(this.previousValue)} ${this.operator} ${this.formatNumber(current)} =`;
          this.display = this.formatNumber(result);
          this.previousValue = null;
          this.operator = null;
          this.waitingForOperand = true;
        }
        break;
    }
    this.updateDisplay(winData);

    // Clear active operator highlight
    const buttons = document.getElementById(`${winData.id}-buttons`);
    if (buttons && action === 'equals') {
      buttons.querySelectorAll('.calc-btn.op').forEach(b => b.classList.remove('active'));
    }
  },

  calculate(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 0 : a / b;
      default: return b;
    }
  },

  formatNumber(num) {
    if (!isFinite(num)) return 'Error';
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toFixed(10)).toString();
  },

  updateDisplay(winData) {
    const display = document.getElementById(`${winData.id}-display`);
    const history = document.getElementById(`${winData.id}-history`);
    if (display) display.textContent = this.display;
    if (history) history.textContent = this.history;

    // Adjust font size based on display length
    if (display) {
      const len = this.display.length;
      if (len > 9) display.style.fontSize = '48px';
      else if (len > 7) display.style.fontSize = '56px';
      else display.style.fontSize = '64px';
    }
  },
};
