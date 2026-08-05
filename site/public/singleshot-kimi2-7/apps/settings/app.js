import { App, registerApp } from '../../js/appRegistry.js';
import { $, $$, load, save, notify } from '../../js/utils.js';

class SettingsApp extends App {
  constructor() {
    super({ id: 'settings', name: 'System Settings', width: 720, height: 520, singleton: true, emoji: '⚙️', iconGradient: ['#bdc3c7', '#7f8c8d'], iconColor: '#fff' });
    this.settings = load('settings', { darkMode: false, accent: '#007aff', wallpaper: 'default' });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'settings';
    root.innerHTML = `
      <aside class="settings-sidebar">
        <div class="settings-search"><input type="text" placeholder="Search" /></div>
        <div class="settings-item active" data-tab="general">⚙️ General</div>
        <div class="settings-item" data-tab="appearance">🎨 Appearance</div>
        <div class="settings-item" data-tab="wallpaper">🖼 Wallpaper</div>
        <div class="settings-item" data-tab="wifi">📶 Wi-Fi</div>
        <div class="settings-item" data-tab="bluetooth">🔵 Bluetooth</div>
        <div class="settings-item" data-tab="users">👤 Users</div>
      </aside>
      <main class="settings-main" id="panel"></main>
    `;

    const panel = $('#panel', root);
    const render = (tab) => {
      panel.innerHTML = '';
      if (tab === 'general') {
        panel.innerHTML = `
          <h2>General</h2>
          <div class="setting-row"><span>About</span><span>macOS Tahoe Web</span></div>
          <div class="setting-row"><span>Software Update</span><span>Up to date</span></div>
          <div class="setting-row"><span>Storage</span><span>256 GB available</span></div>
        `;
      } else if (tab === 'appearance') {
        panel.innerHTML = `
          <h2>Appearance</h2>
          <div class="setting-row"><span>Dark mode</span><label class="toggle"><input type="checkbox" id="dark"><span></span></label></div>
          <div class="setting-row"><span>Accent color</span><input type="color" id="accent" value="${this.settings.accent}"></div>
        `;
        $('#dark', panel).checked = this.settings.darkMode;
        $('#dark', panel).addEventListener('change', (e) => { this.settings.darkMode = e.target.checked; save('settings', this.settings); apply(); });
        $('#accent', panel).addEventListener('input', (e) => { this.settings.accent = e.target.value; save('settings', this.settings); apply(); });
      } else if (tab === 'wallpaper') {
        panel.innerHTML = `
          <h2>Wallpaper</h2>
          <div class="wallpaper-grid">
            <div class="wp-thumb active" data-wp="default" style="background:linear-gradient(135deg,#e0f0ff,#f5e6ff)"></div>
            <div class="wp-thumb" data-wp="ocean" style="background:linear-gradient(135deg,#001f3f,#0074D9)"></div>
            <div class="wp-thumb" data-wp="sunset" style="background:linear-gradient(135deg,#ff9a9e,#fecfef)"></div>
            <div class="wp-thumb" data-wp="mountain" style="background:linear-gradient(135deg,#434343,#000)"></div>
          </div>
        `;
        $$('.wp-thumb', panel).forEach(t => t.addEventListener('click', () => {
          this.settings.wallpaper = t.dataset.wp;
          save('settings', this.settings);
          apply();
        }));
      } else if (tab === 'wifi') {
        panel.innerHTML = `<h2>Wi-Fi</h2><div class="setting-row"><span>Wi-Fi</span><label class="toggle"><input type="checkbox" checked><span></span></label></div><div class="setting-row"><span>HomeNetwork</span><span>Connected</span></div>`;
      } else if (tab === 'bluetooth') {
        panel.innerHTML = `<h2>Bluetooth</h2><div class="setting-row"><span>Bluetooth</span><label class="toggle"><input type="checkbox"><span></span></label></div><div class="setting-row"><span>Magic Mouse</span><span>Connected</span></div>`;
      } else if (tab === 'users') {
        panel.innerHTML = `<h2>Users</h2><div class="setting-row"><span>Current User</span><span>mike</span></div><div class="setting-row"><span>Apple ID</span><span>mike@example.com</span></div>`;
      }
    };

    const apply = () => {
      const wp = $('.wallpaper');
      if (this.settings.wallpaper === 'ocean') wp.style.background = 'linear-gradient(135deg, #001f3f, #0074D9)';
      else if (this.settings.wallpaper === 'sunset') wp.style.background = 'linear-gradient(135deg, #ff9a9e, #fecfef)';
      else if (this.settings.wallpaper === 'mountain') wp.style.background = 'linear-gradient(135deg, #434343, #000)';
      else wp.style.background = '';
      document.documentElement.style.setProperty('--accent', this.settings.accent);
      document.body.classList.toggle('dark', this.settings.darkMode);
      notify('Settings', 'Appearance updated');
    };

    $$('.settings-item', root).forEach(item => item.addEventListener('click', () => {
      $$('.settings-item', root).forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      render(item.dataset.tab);
    }));

    render('general');
    return root;
  }
}

registerApp(new SettingsApp());
