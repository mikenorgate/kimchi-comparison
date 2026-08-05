import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class ActivityMonitorApp extends App {
  constructor() {
    super({ id: 'activity', name: 'Activity Monitor', width: 720, height: 480, emoji: '📈', iconGradient: ['#2c3e50', '#34495e'], iconColor: '#fff' });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'activity';
    root.innerHTML = `
      <div class="act-header"><span>Process Name</span><span>CPU %</span><span>Memory</span></div>
      <div class="act-list" id="list"></div>
      <div class="act-graphs"><div>CPU History</div><div class="act-graph" id="cpu"></div></div>
    `;
    const list = $('#list', root);
    const procs = ['WindowServer', 'kernel_task', 'mds', 'Safari', 'Finder', 'Mail', 'Music', 'loginwindow'];
    const render = () => {
      list.innerHTML = '';
      procs.forEach(p => {
        const row = document.createElement('div');
        row.className = 'act-row';
        row.innerHTML = `<span>${p}</span><span>${(Math.random() * 15).toFixed(1)}%</span><span>${(Math.random() * 200 + 50).toFixed(1)} MB</span>`;
        list.appendChild(row);
      });
    };
    render();
    const t = setInterval(render, 2000);
    root.dataset.timer = t;
    return root;
  }

  onClose(_w) { if (this.el?.dataset.timer) clearInterval(Number(this.el.dataset.timer)); }
}

registerApp(new ActivityMonitorApp());
