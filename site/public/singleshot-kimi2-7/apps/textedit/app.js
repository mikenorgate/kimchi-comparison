import { App, registerApp } from '../../js/appRegistry.js';
import { $, load, save } from '../../js/utils.js';

class TextEditApp extends App {
  constructor() {
    super({ id: 'textedit', name: 'TextEdit', width: 640, height: 480, emoji: '📃', iconGradient: ['#fff', '#f0f0f0'], iconColor: '#333' });
    this.docId = 'untitled';
  }

  getContent(w) {
    const root = document.createElement('div');
    root.className = 'textedit';
    root.innerHTML = `<textarea id="doc" placeholder="Start typing..."></textarea>`;
    const ta = $('#doc', root);
    ta.value = load(`textedit:${w.id}`, '');
    ta.addEventListener('input', () => save(`textedit:${w.id}`, ta.value));
    return root;
  }
}

registerApp(new TextEditApp());
