/* main.js — glue: Applications folder sync, first-run seeding, boot start */
(function () {
  const Mac = window.Mac;

  // keep /Applications in sync with the app registry
  function syncApps() {
    const dir = Mac.FS.get('/Applications');
    if (!dir) return;
    let changed = false;
    Object.values(Mac.wm.apps).forEach(a => {
      if (a.hidden) return;
      const name = a.name + '.app';
      if (!dir.children[name]) {
        dir.children[name] = { name, type: 'file', kind: 'app', appId: a.id, content: '', modified: Date.now(), size: 128000 };
        changed = true;
      }
    });
    if (changed) Mac.Bus.emit('fs', '/Applications');
  }
  syncApps();

  // start the machine
  Mac.System.start();
})();
