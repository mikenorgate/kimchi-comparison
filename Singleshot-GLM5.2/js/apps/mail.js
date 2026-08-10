/* ============================================
   App: Mail
   ============================================ */

const Mail = {
  folders: [
    { name: 'Inbox', icon: '📥', count: 12, system: true },
    { name: 'VIP', icon: '⭐', count: 2, system: true },
    { name: 'Flagged', icon: '🚩', count: 3, system: true },
    { name: 'Drafts', icon: '📝', count: 1, system: true },
    { name: 'Sent', icon: '📤', count: 0, system: true },
    { name: 'Junk', icon: '🗑', count: 4, system: true },
    { name: 'Trash', icon: '🗑', count: 0, system: true },
  ],
  accounts: [
    { name: 'iCloud', address: 'mike@icloud.com', icon: '☁️' },
    { name: 'Gmail', address: 'mike@gmail.com', icon: '📧' },
    { name: 'Work', address: 'mike@company.com', icon: '💼' },
  ],

  emails: [
    { id: 1, folder: 'Inbox', sender: 'Apple', senderEmail: 'no-reply@apple.com', subject: 'Welcome to macOS Tahoe', preview: 'Discover the all-new Liquid Glass interface and exciting features in macOS Tahoe...', body: 'Dear Mike,\n\nWelcome to macOS Tahoe! The all-new Liquid Glass interface brings a stunning, translucent design that adapts dynamically to your content.\n\nNew features include:\n• Redesigned Spotlight with AI-powered search\n• Enhanced Continuity across all your devices\n• Updated System Settings\n• New dynamic wallpapers\n• Improved privacy controls\n\nWe hope you enjoy exploring everything macOS Tahoe has to offer.\n\nBest regards,\nThe Apple Team', time: '9:42 AM', date: 'Today', unread: true, starred: true, account: 'iCloud' },
    { id: 2, folder: 'Inbox', sender: 'GitHub', senderEmail: 'noreply@github.com', subject: '[PR #847] Review requested: Feature/tahoe-ui', preview: 'Sarah has requested your review on pull request #847. The PR adds the Liquid Glass component library...', body: 'Hi Mike,\n\nSarah has requested your review on pull request #847.\n\nTitle: Feature/tahoe-ui\nDescription: Adds the Liquid Glass component library with full window management, menu system, and 15+ apps.\n\nFiles changed: 28\n+2,847 additions\n-342 deletions\n\nReview the PR at: https://github.com/company/project/pull/847\n\n— GitHub', time: '8:15 AM', date: 'Today', unread: true, starred: false, account: 'Gmail' },
    { id: 3, folder: 'Inbox', sender: 'Sarah Chen', senderEmail: 'sarah@company.com', subject: 'Re: Design Review Tomorrow', preview: 'Thanks for the notes! I\'ve updated the mockups based on your feedback. The new glass effect...', body: 'Hi Mike,\n\nThanks for the notes! I\'ve updated the mockups based on your feedback.\n\nThe new glass effect looks much better with the increased blur radius. I also adjusted the accent colors as you suggested.\n\nCan we meet 15 minutes before the review to sync up? I have a few questions about the dock magnification.\n\nLet me know!\n\nBest,\nSarah', time: '7:30 AM', date: 'Today', unread: true, starred: false, account: 'Work' },
    { id: 4, folder: 'Inbox', sender: 'Medium Daily', senderEmail: 'noreply@medium.com', subject: 'Your daily digest: 5 stories you might like', preview: 'Based on your reading history, we think you\'ll enjoy these stories about design, technology...', body: 'Your daily digest from Medium:\n\n1. "The Future of UI Design" - How translucent interfaces are changing the way we interact with technology\n\n2. "Building a macOS App in 2026" - A comprehensive guide using the latest SwiftUI features\n\n3. "The Psychology of Color in Design" - Understanding how color choices affect user behavior\n\n4. "Liquid Glass: Apple\'s Boldest Design Language Yet" - A deep dive into the design philosophy\n\n5. "Why Skeuomorphism is Making a Comeback" - The return of tactile, realistic UI elements\n\nHappy reading!', time: 'Yesterday', date: 'Aug 9', unread: false, starred: false, account: 'Gmail' },
    { id: 5, folder: 'Inbox', sender: 'Amazon', senderEmail: 'no-reply@amazon.com', subject: 'Your order has shipped', preview: 'Your order containing "USB-C Hub, 7-in-1 Adapter" has shipped and is on its way...', body: 'Your order has shipped!\n\nOrder #112-8472930-5638201\n\nItem: USB-C Hub, 7-in-1 Adapter\nQuantity: 1\nPrice: $34.99\n\nShipping Address:\nMike\n123 Main St\nCupertino, CA 95014\n\nEstimated Delivery: August 12, 2026\n\nTrack your package at: https://amazon.com/track', time: 'Yesterday', date: 'Aug 9', unread: false, starred: false, account: 'Gmail' },
    { id: 6, folder: 'Inbox', sender: 'John Smith', senderEmail: 'john@company.com', subject: 'Q3 Budget Approval', preview: 'Hi Mike, I\'ve reviewed the Q3 budget proposal and everything looks good on my end. We can proceed...', body: 'Hi Mike,\n\nI\'ve reviewed the Q3 budget proposal and everything looks good on my end. We can proceed with the allocations as discussed in last week\'s meeting.\n\nKey allocations:\n• Engineering: 45%\n• Design: 20%\n• Marketing: 15%\n• Operations: 20%\n\nI\'ll need your final sign-off by EOD Friday so we can submit to finance.\n\nThanks,\nJohn', time: 'Aug 8', date: 'Aug 8', unread: false, starred: true, account: 'Work' },
    { id: 7, folder: 'Inbox', sender: 'Netflix', senderEmail: 'info@netflix.com', subject: 'New on Netflix: August 2026', preview: 'Check out what\'s new this month! From action-packed thrillers to heartwarming dramas...', body: 'What\'s New on Netflix - August 2026\n\n🎬 Featured This Month:\n\n• "The Last Frontier" - A sci-fi epic about humanity\'s first colony on Mars\n• "Midnight in Paris" (Director\'s Cut) - Updated version of the beloved classic\n• "The Code" - A thriller about a hacker who discovers a global conspiracy\n\n📺 New Series:\n\n• "Silicon Dreams" - A drama about startup culture in the AI era\n• "The Glass House" - Reality TV meets architecture\n\nHappy streaming!', time: 'Aug 7', date: 'Aug 7', unread: false, starred: false, account: 'Gmail' },
    { id: 8, folder: 'Inbox', sender: 'Lisa Park', senderEmail: 'lisa@company.com', subject: 'Lunch next week?', preview: 'Hey Mike! It\'s been a while since we caught up. Want to grab lunch next Tuesday? I heard that new...', body: 'Hey Mike!\n\nIt\'s been a while since we caught up. Want to grab lunch next Tuesday? I heard that new ramen place downtown is really good.\n\nLet me know if that works or if another day is better!\n\nCheers,\nLisa', time: 'Aug 7', date: 'Aug 7', unread: false, starred: false, account: 'Work' },
  ],

  activeFolder: 'Inbox',
  activeEmail: 1,

  render(container, winData) {
    const emails = this.emails.filter(e => e.folder === this.activeFolder);
    const activeEmail = this.emails.find(e => e.id === this.activeEmail);

    container.innerHTML = `
      <div class="mail-app">
        <div class="mail-sidebar">
          <div style="padding:8px;margin-bottom:4px;">
            <button class="btn-accent" style="width:100%;" id="${winData.id}-compose">✎ New Message</button>
          </div>
          <div class="sidebar-section">Mailboxes</div>
          ${this.folders.map(f => `
            <div class="sidebar-item ${f.name === this.activeFolder ? 'active' : ''}" data-folder="${f.name}">
              <span style="font-size:14px;width:16px;text-align:center;">${f.icon}</span>
              ${f.name}
              ${f.count > 0 ? `<span style="margin-left:auto;background:var(--accent-blue);color:#fff;font-size:10px;border-radius:10px;padding:1px 6px;font-weight:600;">${f.count}</span>` : ''}
            </div>
          `).join('')}
          <div class="sidebar-section">Accounts</div>
          ${this.accounts.map(a => `
            <div class="sidebar-item" style="cursor:pointer;">
              <span style="font-size:14px;width:16px;text-align:center;">${a.icon}</span>
              ${a.name}
            </div>
          `).join('')}
        </div>
        <div class="mail-list" id="${winData.id}-list">
          <div class="window-toolbar">
            <span style="font-size:14px;font-weight:600;">${this.activeFolder}</span>
            <div style="flex:1"></div>
            <button class="toolbar-btn" title="Filter">🔍</button>
          </div>
          ${emails.map(email => this.renderMailItem(email)).join('')}
        </div>
        <div class="mail-preview" id="${winData.id}-preview">
          ${activeEmail ? this.renderEmailPreview(activeEmail) : '<div style="text-align:center;color:var(--text-secondary);padding:40px;">Select an email to preview</div>'}
        </div>
      </div>
    `;

    this.attachEvents(winData);
  },

  renderMailItem(email) {
    return `
      <div class="mail-item ${email.id === this.activeEmail ? 'active' : ''} ${email.unread ? 'unread' : ''}" data-id="${email.id}">
        <div class="mail-sender">
          <span>${email.sender}</span>
          <span class="mail-time">${email.time}</span>
        </div>
        <div class="mail-subject">
          ${email.starred ? '<span style="color:#ffd60a;">★</span> ' : ''}${email.subject}
        </div>
        <div class="mail-preview-text">${email.preview}</div>
      </div>
    `;
  },

  renderEmailPreview(email) {
    const bodyHtml = email.body.split('\n').map(line => {
      if (line.trim().startsWith('•')) return `<div style="padding-left:16px;">${line}</div>`;
      return line;
    }).join('<br>');

    return `
      <div>
        <div style="display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:0.5px solid rgba(255,255,255,0.08);">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent-blue),var(--accent-purple));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;">
            ${email.sender[0]}
          </div>
          <div>
            <div style="font-size:14px;font-weight:600;">${email.sender}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${email.senderEmail}</div>
          </div>
          <div style="flex:1"></div>
          <span style="font-size:12px;color:var(--text-secondary);">${email.date} ${email.time}</span>
          <button class="toolbar-btn" title="Reply">↩</button>
          <button class="toolbar-btn" title="Forward">↪</button>
          <button class="toolbar-btn" title="Delete">🗑</button>
        </div>
        <h1 style="font-size:20px;font-weight:600;margin:16px 0;">${email.subject}</h1>
        <div style="font-size:14px;line-height:1.6;color:var(--text-primary);">${bodyHtml}</div>
        <div style="margin-top:24px;display:flex;gap:8px;">
          <button class="btn-accent">Reply</button>
          <button class="btn-glass">Reply All</button>
          <button class="btn-glass">Forward</button>
        </div>
      </div>
    `;
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');

    // Folder navigation
    container.querySelectorAll('.sidebar-item[data-folder]').forEach(item => {
      item.addEventListener('click', () => {
        this.activeFolder = item.dataset.folder;
        this.render(container, winData);
      });
    });

    // Email selection
    container.querySelectorAll('.mail-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        this.activeEmail = id;
        const email = this.emails.find(e => e.id === id);
        if (email) email.unread = false;
        this.render(container, winData);
      });
    });

    // Compose
    const compose = document.getElementById(`${winData.id}-compose`);
    if (compose) {
      compose.addEventListener('click', () => {
        Tahoe.showNotification('Mail', 'New message composer would open here');
      });
    }
  },
};
