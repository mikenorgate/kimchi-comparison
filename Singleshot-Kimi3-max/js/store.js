/* store.js — persistence + global settings */
(function () {
  const Mac = window.Mac;

  Mac.loadJSON = (k, fallback) => {
    try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  };
  Mac.saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

  const DEFAULTS = {
    theme: 'auto',            // light | dark | auto
    accent: 'Blue',
    wallpaper: 'tahoe',
    wifi: true, wifiNetwork: 'HomeNet 5G',
    bluetooth: true,
    airdrop: true,
    focus: false,             // Do Not Disturb
    brightness: 1.0,
    volume: 0.6,
    battery: 87, charging: true,
    dockSize: 54,
    dockMag: true, dockMagScale: 1.65,
    dockAutohide: false,
    dockPos: 'bottom',        // bottom | left | right
    dockPinned: ['finder', 'launchpad', 'safari', 'messages', 'mail', 'maps', 'photos', 'facetime', 'notes', 'reminders', 'calendar', 'music', 'podcasts', 'tv', 'appstore', 'settings'],
    username: 'Mike',
    bmBar: true,              // Safari bookmarks bar
    finderPathBar: true, finderStatusBar: true,
    warnBeforeEmptyTrash: true,
  };

  let s = Object.assign({}, DEFAULTS, Mac.loadJSON('mac.settings', {}));
  Mac.Settings = {
    get: k => s[k],
    all: () => Object.assign({}, s),
    set(k, v) {
      s[k] = v;
      Mac.saveJSON('mac.settings', s);
      Mac.Bus.emit('setting:' + k, v);
      Mac.Bus.emit('settings', k);
    },
    reset() { s = Object.assign({}, DEFAULTS); Mac.saveJSON('mac.settings', s); }
  };
})();
