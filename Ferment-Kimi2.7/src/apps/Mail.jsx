import { useState } from 'react';
import './Mail.css';

const MAILBOXES = [
  { id: 'inbox', label: 'Inbox', count: 4, icon: 'inbox' },
  { id: 'sent', label: 'Sent', count: 0, icon: 'sent' },
  { id: 'drafts', label: 'Drafts', count: 1, icon: 'draft' },
  { id: 'trash', label: 'Trash', count: 0, icon: 'trash' },
  { id: 'junk', label: 'Junk', count: 2, icon: 'junk' },
];

const MOCK_MESSAGES = {
  inbox: [
    {
      id: 'm1',
      sender: 'Apple',
      subject: 'Your macOS Tahoe preview is ready',
      preview: 'Welcome to the next generation of Mac. Liquid Glass is here.',
      date: '10:23 AM',
      read: false,
      body: 'Hi there,\n\nYour exclusive preview of macOS Tahoe is now available. Experience Liquid Glass, the redesigned Dock, and powerful new ways to work.\n\n— The Apple Team',
    },
    {
      id: 'm2',
      sender: 'Tim Cook',
      subject: 'Keynote rehearsal',
      preview: 'Let us run through the opening sequence one more time.',
      date: 'Yesterday',
      read: true,
      body: 'Team,\n\nPlease join me in the rehearsal room at 9 AM to finalize the keynote flow.\n\nThanks,\nTim',
    },
    {
      id: 'm3',
      sender: 'GitHub',
      subject: 'Security alert for your repository',
      preview: 'We noticed a new authentication token was added.',
      date: 'Yesterday',
      read: false,
      body: 'Hello,\n\nA new personal access token was added to your account. If this was not you, please review your settings immediately.\n\nGitHub Security',
    },
    {
      id: 'm4',
      sender: 'Newsletter',
      subject: 'This week in design',
      preview: 'Liquid Glass, spatial typography, and more.',
      date: 'Mon',
      read: true,
      body: 'Weekly design digest:\n\n- Liquid Glass principles\n- New Safari tab design\n- Spotlight shortcuts\n\nEnjoy!',
    },
  ],
  drafts: [
    {
      id: 'd1',
      sender: 'Me',
      subject: 'Project update',
      preview: 'Here is the latest on the Tahoe recreation...',
      date: '10:00 AM',
      read: true,
      body: 'Hi team,\n\nHere is the latest update on the macOS Tahoe web recreation project. We have completed the desktop shell and window manager.\n\nBest,\nMe',
    },
  ],
  junk: [
    {
      id: 'j1',
      sender: 'Claim Prize',
      subject: 'You have won a free Mac!',
      preview: 'Click here to claim your prize now.',
      date: 'Mon',
      read: false,
      body: 'This message was automatically moved to Junk.',
    },
    {
      id: 'j2',
      sender: 'Unknown Sender',
      subject: 'Important invoice attached',
      preview: 'Open the attachment to review.',
      date: 'Sun',
      read: false,
      body: 'This message was automatically moved to Junk.',
    },
  ],
  sent: [],
  trash: [],
};

function MailboxIcon({ icon }) {
  return <div className={`mail-icon mail-icon-${icon}`} />;
}

export default function Mail() {
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [search, setSearch] = useState('');

  const messagesForBox = messages[selectedMailbox] || [];
  const selectedMessage = messagesForBox.find((m) => m.id === selectedMessageId);

  const handleSelectMessage = (id) => {
    setSelectedMessageId(id);
    setMessages((prev) => ({
      ...prev,
      [selectedMailbox]: prev[selectedMailbox].map((m) =>
        m.id === id ? { ...m, read: true } : m
      ),
    }));
  };

  const handleDelete = () => {
    if (!selectedMessageId) return;
    setMessages((prev) => ({
      ...prev,
      [selectedMailbox]: prev[selectedMailbox].filter((m) => m.id !== selectedMessageId),
    }));
    setSelectedMessageId(null);
  };

  const filteredMessages = messagesForBox.filter(
    (m) =>
      m.sender.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mail">
      <div className="mail-toolbar">
        <div className="mail-toolbar-left">
          <button className="mail-tool-button" aria-label="New message">✎</button>
          <button
            className="mail-tool-button"
            onClick={handleDelete}
            aria-label="Delete message"
          >
            🗑
          </button>
        </div>
        <input
          type="text"
          className="mail-search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search mail"
        />
      </div>
      <div className="mail-body">
        <aside className="mail-sidebar">
          {MAILBOXES.map((box) => (
            <button
              key={box.id}
              className={`mail-mailbox ${selectedMailbox === box.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedMailbox(box.id);
                setSelectedMessageId(null);
              }}
            >
              <MailboxIcon icon={box.icon} />
              <span className="mail-mailbox-label">{box.label}</span>
              {box.count > 0 && <span className="mail-mailbox-count">{box.count}</span>}
            </button>
          ))}
        </aside>
        <div className="mail-list">
          {filteredMessages.length === 0 ? (
            <div className="mail-empty">No messages</div>
          ) : (
            filteredMessages.map((message) => (
              <button
                key={message.id}
                className={`mail-message ${selectedMessageId === message.id ? 'selected' : ''} ${
                  message.read ? 'read' : 'unread'
                }`}
                onClick={() => handleSelectMessage(message.id)}
              >
                <div className="mail-message-row">
                  <span className="mail-message-sender">{message.sender}</span>
                  <span className="mail-message-date">{message.date}</span>
                </div>
                <div className="mail-message-subject">{message.subject}</div>
                <div className="mail-message-preview">{message.preview}</div>
              </button>
            ))
          )}
        </div>
        <main className="mail-reading">
          {selectedMessage ? (
            <div className="mail-reading-content">
              <div className="mail-reading-header">
                <h2 className="mail-reading-subject">{selectedMessage.subject}</h2>
                <div className="mail-reading-meta">
                  <span className="mail-reading-sender">{selectedMessage.sender}</span>
                  <span className="mail-reading-date">{selectedMessage.date}</span>
                </div>
              </div>
              <div className="mail-reading-body">{selectedMessage.body}</div>
              <div className="mail-reading-actions">
                <button className="mail-reply-button">Reply</button>
                <button className="mail-reply-button secondary">Reply All</button>
                <button className="mail-reply-button secondary">Forward</button>
              </div>
            </div>
          ) : (
            <div className="mail-empty-state">
              <span className="mail-empty-icon">✉</span>
              <p>Select a message to read</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
