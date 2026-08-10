/* ============================================
   App: TextEdit
   ============================================ */

const TextEdit = {
  documents: {},
  activeDoc: 1,

  getDoc(id) {
    if (!this.documents[id]) {
      this.documents[id] = {
        id,
        content: 'Untitled Document\n\nStart writing your document here.\n\nYou can use the toolbar above to format your text — bold, italic, underline, alignment, and more.\n\nTextEdit in macOS Tahoe supports rich text editing with the all-new Liquid Glass interface.\n\nTry selecting text and clicking the B, I, or U buttons!',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        alignment: 'left',
      };
    }
    return this.documents[id];
  },

  render(container, winData) {
    const doc = this.getDoc(this.activeDoc);
    container.innerHTML = `
      <div class="textedit-app">
        <div class="textedit-toolbar">
          <button class="toolbar-btn" data-cmd="bold" title="Bold (⌘B)"><b>B</b></button>
          <button class="toolbar-btn" data-cmd="italic" title="Italic (⌘I)"><i>I</i></button>
          <button class="toolbar-btn" data-cmd="underline" title="Underline (⌘U)"><u>U</u></button>
          <div style="width:1px;height:20px;background:rgba(255,255,255,0.1);margin:0 4px;"></div>
          <button class="toolbar-btn" data-cmd="justifyLeft" title="Align Left">${Icons.list}</button>
          <button class="toolbar-btn" data-cmd="justifyCenter" title="Align Center">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
          <button class="toolbar-btn" data-cmd="justifyRight" title="Align Right">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
          <div style="width:1px;height:20px;background:rgba(255,255,255,0.1);margin:0 4px;"></div>
          <select class="btn-glass" id="${winData.id}-fontsize" style="padding:4px;">
            <option value="12px">12</option>
            <option value="14px" selected>14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="24px">24</option>
            <option value="32px">32</option>
          </select>
          <select class="btn-glass" id="${winData.id}-fontfamily" style="padding:4px;">
            <option value="Inter, sans-serif">Inter</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'SF Mono', monospace">SF Mono</option>
            <option value="'Times New Roman', serif">Times</option>
            <option value="'Courier New', monospace">Courier</option>
          </select>
          <div style="flex:1"></div>
          <span style="font-size:12px;color:var(--text-secondary);" id="${winData.id}-wordcount">0 words</span>
        </div>
        <div class="textedit-content" contenteditable="true" id="${winData.id}-editor" style="font-family:${doc.fontFamily};font-size:${doc.fontSize};text-align:${doc.alignment};">${doc.content.replace(/\n/g, '<br>')}</div>
      </div>
    `;

    this.attachEvents(winData);
    this.updateWordCount(winData);
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');
    const editor = document.getElementById(`${winData.id}-editor`);

    // Formatting buttons
    container.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd, false, null);
        editor.focus();
        this.updateWordCount(winData);
      });
    });

    // Font size
    const fontSize = document.getElementById(`${winData.id}-fontsize`);
    if (fontSize) {
      fontSize.addEventListener('change', (e) => {
        editor.style.fontSize = e.target.value;
        const doc = this.getDoc(this.activeDoc);
        doc.fontSize = e.target.value;
      });
    }

    // Font family
    const fontFamily = document.getElementById(`${winData.id}-fontfamily`);
    if (fontFamily) {
      fontFamily.addEventListener('change', (e) => {
        editor.style.fontFamily = e.target.value;
        const doc = this.getDoc(this.activeDoc);
        doc.fontFamily = e.target.value;
      });
    }

    // Word count
    if (editor) {
      editor.addEventListener('input', () => {
        this.updateWordCount(winData);
        const doc = this.getDoc(this.activeDoc);
        doc.content = editor.innerText;
      });
    }
  },

  updateWordCount(winData) {
    const editor = document.getElementById(`${winData.id}-editor`);
    const counter = document.getElementById(`${winData.id}-wordcount`);
    if (editor && counter) {
      const text = editor.innerText.trim();
      const words = text ? text.split(/\s+/).length : 0;
      const chars = text.length;
      counter.textContent = `${words} words · ${chars} characters`;
    }
  },
};
