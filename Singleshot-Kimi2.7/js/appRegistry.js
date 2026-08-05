export const apps = {};

export function registerApp(app) {
  apps[app.id] = app;
}

export function getApp(id) { return apps[id]; }
export function allApps() { return Object.values(apps); }

// Base app class with common lifecycle
export class App {
  constructor(opts) {
    Object.assign(this, {
      width: 800,
      height: 500,
      minWidth: 240,
      minHeight: 160,
      canResize: true,
      showInDock: true,
      showInLaunchpad: true,
      singleton: false,
      ...opts
    });
  }

  createWindow(state) {
    return {
      id: `${this.id}-${Date.now()}`,
      appId: this.id,
      title: this.name,
      width: this.width,
      height: this.height,
      x: 60 + (state.windowOffset % 10) * 24,
      y: 60 + (state.windowOffset % 10) * 24,
      z: ++state.maxZ,
      minimized: false,
      maximized: false,
      focused: true
    };
  }

  render(_w, container) {
    container.innerHTML = '';
    container.appendChild(this.getContent(_w));
  }

  getContent(_w) {
    const el = document.createElement('div');
    el.textContent = `${this.name} is loading…`;
    return el;
  }

  onFocus(_w) {}
  onBlur(_w) {}
  onClose(_w) {}
}
