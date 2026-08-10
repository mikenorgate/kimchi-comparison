/* ============================================
   App: Messages
   ============================================ */

const Messages = {
  conversations: [
    { id: 1, name: 'Sarah Chen', avatar: 'S', color1: '#bf5af2', color2: '#ec4899',
      messages: [
        { text: 'Hey! Did you see the new macOS Tahoe design?', sent: false, time: '9:30 AM' },
        { text: 'Yes! The Liquid Glass effect is incredible', sent: true, time: '9:32 AM' },
        { text: 'I know right? The translucency is so smooth', sent: false, time: '9:33 AM' },
        { text: 'Are we still on for the design review tomorrow?', sent: false, time: '9:34 AM' },
        { text: 'Yes, 2 PM right?', sent: true, time: '9:35 AM' },
        { text: 'Perfect! I\'ll have the mockups ready', sent: false, time: '9:36 AM' },
        { text: 'Sounds great! 👍', sent: true, time: '9:37 AM' },
      ],
    },
    { id: 2, name: 'John Smith', avatar: 'J', color1: '#0a84ff', color2: '#5e5ce6',
      messages: [
        { text: 'The Q3 budget is approved', sent: false, time: '8:15 AM' },
        { text: 'Awesome! When can we start the new project?', sent: true, time: '8:20 AM' },
        { text: 'Monday works for me', sent: false, time: '8:22 AM' },
      ],
    },
    { id: 3, name: 'Family Group', avatar: 'F', color1: '#30d158', color2: '#64d2ff',
      messages: [
        { text: 'Don\'t forget Sunday dinner!', sent: false, time: 'Yesterday' },
        { text: 'I\'ll be there with dessert 🍰', sent: true, time: 'Yesterday' },
        { text: 'Can\'t wait to see everyone', sent: false, time: 'Yesterday' },
      ],
    },
    { id: 4, name: 'Lisa Park', avatar: 'L', color1: '#ff9f0a', color2: '#ff453a',
      messages: [
        { text: 'Lunch on Tuesday?', sent: false, time: 'Aug 7' },
        { text: 'Sounds great! The ramen place?', sent: true, time: 'Aug 7' },
        { text: 'Yes! 12:30?', sent: false, time: 'Aug 7' },
      ],
    },
    { id: 5, name: 'Mike T.', avatar: 'M', color1: '#ff2d55', color2: '#bf5af2',
      messages: [
        { text: 'Check out this article I found', sent: false, time: 'Aug 5' },
        { text: 'Oh interesting, send me the link?', sent: true, time: 'Aug 5' },
      ],
    },
  ],
  activeConversation: 1,

  render(container, winData) {
    container.innerHTML = `
      <div class="messages-app">
        <div class="messages-sidebar">
          <div class="window-toolbar">
            <button class="toolbar-btn" title="New Message">${Icons.add}</button>
            <div style="flex:1"></div>
            <button class="toolbar-btn" title="Search">🔍</button>
          </div>
          ${this.conversations.map(c => this.renderConversationItem(c)).join('')}
        </div>
        <div class="messages-main" id="${winData.id}-main">
          ${this.renderConversation(this.conversations.find(c => c.id === this.activeConversation))}
        </div>
      </div>
    `;

    this.attachEvents(winData);
  },

  renderConversationItem(conv) {
    const lastMsg = conv.messages[conv.messages.length - 1];
    return `
      <div class="messages-conversation-item ${conv.id === this.activeConversation ? 'active' : ''}" data-id="${conv.id}">
        <div class="messages-avatar" style="background:linear-gradient(135deg,${conv.color1},${conv.color2});">${conv.avatar}</div>
        <div class="conv-info">
          <div class="conv-name">
            ${conv.name}
            <span class="conv-time">${lastMsg.time}</span>
          </div>
          <div class="conv-preview">${lastMsg.text}</div>
        </div>
      </div>
    `;
  },

  renderConversation(conv) {
    if (!conv) return '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);">Select a conversation</div>';
    return `
      <div class="messages-header">
        <div class="messages-avatar" style="width:32px;height:32px;font-size:14px;background:linear-gradient(135deg,${conv.color1},${conv.color2});">${conv.avatar}</div>
        ${conv.name}
      </div>
      <div class="messages-body" id="msg-body">
        ${conv.messages.map(m => `
          <div class="message-bubble ${m.sent ? 'sent' : 'received'}">${m.text}</div>
          <div style="font-size:10px;color:var(--text-tertiary);text-align:${m.sent ? 'right' : 'left'};margin-bottom:4px;">${m.time}</div>
        `).join('')}
      </div>
      <div class="messages-input-bar">
        <input type="text" class="messages-input" placeholder="iMessage" id="msg-input" autocomplete="off">
        <button class="messages-send-btn" id="msg-send">↑</button>
      </div>
    `;
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');

    // Conversation selection
    container.querySelectorAll('.messages-conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        this.activeConversation = parseInt(item.dataset.id);
        this.render(container, winData);
        // Focus input
        setTimeout(() => {
          const input = document.getElementById('msg-input');
          if (input) input.focus();
        }, 50);
      });
    });

    // Send message
    const sendBtn = document.getElementById('msg-send');
    const input = document.getElementById('msg-input');

    if (sendBtn && input) {
      const sendMessage = () => {
        const text = input.value.trim();
        if (!text) return;
        const conv = this.conversations.find(c => c.id === this.activeConversation);
        if (conv) {
          conv.messages.push({ text, sent: true, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) });
          input.value = '';
          this.render(container, winData);
          // Auto-scroll
          const body = document.getElementById('msg-body');
          if (body) body.scrollTop = body.scrollHeight;

          // Simulated reply
          setTimeout(() => {
            const replies = [
              'That sounds great! 👍',
              'Haha, I agree!',
              'Let me think about that...',
              'Interesting point!',
              'Talk to you later!',
              'Can we discuss this tomorrow?',
              'Sounds good to me!',
              'I\'ll get back to you on that.',
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            conv.messages.push({ text: reply, sent: false, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) });
            this.render(container, winData);
            const body2 = document.getElementById('msg-body');
            if (body2) body2.scrollTop = body2.scrollHeight;
          }, 1500 + Math.random() * 1500);
        }
      };

      sendBtn.addEventListener('click', sendMessage);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    }

    // Auto-scroll on load
    const body = document.getElementById('msg-body');
    if (body) body.scrollTop = body.scrollHeight;
  },
};
