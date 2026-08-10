// Calculator — fully functional standard calculator.
export const windowConfig = { width: 320, height: 460 };

let display = '0';
let prev = null;
let op = null;
let waiting = false;
let history = '';

export function mount(el) {
  reset();
  el.innerHTML = `
    <div class="calc">
      <div class="calc-display">
        <div class="calc-prev" data-prev></div>
        <div data-disp>0</div>
      </div>
      <div class="calc-keys"></div>
    </div>
  `;
  const keys = [
    {l:'AC',c:'fn',a:'clear'},{l:'±',c:'fn',a:'neg'},{l:'%',c:'fn',a:'pct'},{l:'÷',c:'op',a:'div'},
    {l:'7',a:'7'},{l:'8',a:'8'},{l:'9',a:'9'},{l:'×',c:'op',a:'mul'},
    {l:'4',a:'4'},{l:'5',a:'5'},{l:'6',a:'6'},{l:'−',c:'op',a:'sub'},
    {l:'1',a:'1'},{l:'2',a:'2'},{l:'3',a:'3'},{l:'+',c:'op',a:'add'},
    {l:'0',a:'0',wide:true},{l:'.',a:'dot'},{l:'=',c:'op',a:'eq'},
  ];
  const keypad = el.querySelector('.calc-keys');
  keypad.innerHTML = keys.map(k => `<button class="calc-key ${k.c||''} ${k.wide?'wide':''}" data-a="${k.a}">${k.l}</button>`).join('');
  const disp = el.querySelector('[data-disp]');
  const prevEl = el.querySelector('[data-prev]');

  function paint() {
    disp.textContent = formatNum(display);
    prevEl.textContent = history;
    // size font down for long numbers
    const len = disp.textContent.length;
    disp.style.fontSize = len > 9 ? '32px' : len > 7 ? '40px' : '48px';
  }

  function input(a) {
    if (a >= '0' && a <= '9') {
      if (waiting || display === '0') { display = a; waiting = false; }
      else display = (display + a).slice(0, 12);
    } else if (a === 'dot') {
      if (waiting) { display = '0.'; waiting = false; }
      else if (!display.includes('.')) display += '.';
    } else if (a === 'clear') { reset(); }
    else if (a === 'neg') { display = display.startsWith('-') ? display.slice(1) : (display === '0' ? '0' : '-'+display); }
    else if (a === 'pct') { display = String(parseFloat(display) / 100); }
    else if (['add','sub','mul','div'].includes(a)) {
      if (op && !waiting) compute();
      prev = parseFloat(display);
      op = a;
      waiting = true;
      history = `${formatNum(String(prev))} ${sym(a)}`;
    } else if (a === 'eq') {
      compute();
      op = null;
    }
    paint();
  }

  function compute() {
    if (op == null || prev == null) return;
    const cur = parseFloat(display);
    let r;
    if (op === 'add') r = prev + cur;
    else if (op === 'sub') r = prev - cur;
    else if (op === 'mul') r = prev * cur;
    else if (op === 'div') r = cur === 0 ? 0 : prev / cur;
    history = `${formatNum(String(prev))} ${sym(op)} ${formatNum(String(cur))} =`;
    display = String(+r.toFixed(10));
    prev = r;
    waiting = true;
  }

  keypad.querySelectorAll('.calc-key').forEach(k => k.addEventListener('click', () => input(k.dataset.a)));
  paint();

  // keyboard support
  const onKey = (e) => {
    if (!el.closest('.window.active')) return;
    const k = e.key;
    if (k >= '0' && k <= '9') input(k);
    else if (k === '.') input('dot');
    else if (k === '+') input('add');
    else if (k === '-') input('sub');
    else if (k === '*') input('mul');
    else if (k === '/') { e.preventDefault(); input('div'); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); input('eq'); }
    else if (k === 'Escape' || k === 'c' || k === 'C') input('clear');
    else if (k === '%') input('pct');
  };
  document.addEventListener('keydown', onKey);
}

function reset() { display='0'; prev=null; op=null; waiting=false; history=''; }
function sym(a) { return {add:'+',sub:'−',mul:'×',div:'÷'}[a] || ''; }
function formatNum(s) {
  const n = parseFloat(s);
  if (!isFinite(n)) return 'Error';
  if (s.length <= 12) return s;
  return n.toPrecision(10).replace(/\.?0+$/,'');
}
