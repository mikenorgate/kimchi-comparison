import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class FaceTimeApp extends App {
  constructor() {
    super({ id: 'facetime', name: 'FaceTime', width: 480, height: 360, canResize: false, emoji: '📹', iconGradient: ['#34c759', '#248a3d'], iconColor: '#fff' });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'facetime';
    root.innerHTML = `
      <div class="ft-preview">📹</div>
      <input type="text" placeholder="Enter name, email, or number" />
      <div class="ft-buttons">
        <button id="video">Video</button>
        <button id="audio">Audio</button>
      </div>
    `;
    $('#video', root).addEventListener('click', () => alert('Starting video call…'));
    $('#audio', root).addEventListener('click', () => alert('Starting audio call…'));
    return root;
  }
}

registerApp(new FaceTimeApp());
