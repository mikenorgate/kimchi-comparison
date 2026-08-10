import { useMemo, useState } from 'react';
import { Search, PhoneOff, PhoneIncoming, PhoneOutgoing, Voicemail } from 'lucide-react';

/**
 * PhoneApp
 *
 * Three-tab Phone window modelled after macOS / iOS Phone:
 *
 *   - Recents   : chronological list of mock calls with name, number,
 *                 time and direction (incoming / outgoing / missed).
 *   - Contacts  : searchable list of mock contacts rendered with avatar
 *                 initials.
 *   - Voicemail : list of mock voicemails with caller, time and duration.
 *
 * A search/filter input sits above the Recents and Contacts lists and
 * narrows the visible rows by name or number.
 *
 * Pure UI mock. No persistence. Mock data is co-located in this file.
 *
 * Props:
 *   - className (string, optional): extra classes appended to the root.
 */

const RECORDS = [
  {
    id: 'r1',
    name: 'Ada Lovelace',
    number: '+1 (555) 010-1001',
    timestamp: 'Today, 9:41 AM',
    type: 'incoming',
  },
  {
    id: 'r2',
    name: 'Grace Hopper',
    number: '+1 (555) 010-1002',
    timestamp: 'Today, 8:15 AM',
    type: 'outgoing',
  },
  {
    id: 'r3',
    name: 'Unknown Caller',
    number: '+1 (555) 010-1999',
    timestamp: 'Yesterday, 6:42 PM',
    type: 'missed',
  },
  {
    id: 'r4',
    name: 'Alan Turing',
    number: '+1 (555) 010-1003',
    timestamp: 'Yesterday, 2:08 PM',
    type: 'incoming',
  },
  {
    id: 'r5',
    name: 'Katherine Johnson',
    number: '+1 (555) 010-1004',
    timestamp: 'Mon, 11:22 AM',
    type: 'outgoing',
  },
  {
    id: 'r6',
    name: 'Linus Torvalds',
    number: '+1 (555) 010-1005',
    timestamp: 'Sun, 4:30 PM',
    type: 'missed',
  },
];

const CONTACTS = [
  { id: 'c1', name: 'Ada Lovelace', number: '+1 (555) 010-1001' },
  { id: 'c2', name: 'Grace Hopper', number: '+1 (555) 010-1002' },
  { id: 'c3', name: 'Alan Turing', number: '+1 (555) 010-1003' },
  { id: 'c4', name: 'Katherine Johnson', number: '+1 (555) 010-1004' },
  { id: 'c5', name: 'Linus Torvalds', number: '+1 (555) 010-1005' },
  { id: 'c6', name: 'Margaret Hamilton', number: '+1 (555) 010-1006' },
  { id: 'c7', name: 'Donald Knuth', number: '+1 (555) 010-1007' },
  { id: 'c8', name: 'Barbara Liskov', number: '+1 (555) 010-1008' },
];

const VOICEMAILS = [
  {
    id: 'v1',
    caller: 'Ada Lovelace',
    timestamp: 'Today, 9:38 AM',
    duration: '0:24',
  },
  {
    id: 'v2',
    caller: 'Grace Hopper',
    timestamp: 'Yesterday, 5:15 PM',
    duration: '1:02',
  },
  {
    id: 'v3',
    caller: 'Unknown',
    timestamp: 'Sun, 7:45 PM',
    duration: '0:08',
  },
  {
    id: 'v4',
    caller: 'Alan Turing',
    timestamp: 'Sat, 10:01 AM',
    duration: '0:47',
  },
];

const TABS = [
  { id: 'recents', label: 'Recents', testId: 'phone-recents-tab' },
  { id: 'contacts', label: 'Contacts', testId: 'phone-contacts-tab' },
  { id: 'voicemail', label: 'Voicemail', testId: 'phone-voicemail-tab' },
];

const AVATAR_PALETTE = [
  'bg-rose-500/80',
  'bg-amber-500/80',
  'bg-emerald-500/80',
  'bg-sky-500/80',
  'bg-violet-500/80',
  'bg-fuchsia-500/80',
  'bg-teal-500/80',
];

function getInitials(name) {
  if (typeof name !== 'string' || name.length === 0) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pickAvatarClass(id, palette) {
  if (typeof id !== 'string' || palette.length === 0) return palette[0];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

function normalize(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function recordMatches(record, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    normalize(record.name).includes(q) ||
    normalize(record.number).includes(q)
  );
}

function contactMatches(contact, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    normalize(contact.name).includes(q) ||
    normalize(contact.number).includes(q)
  );
}

function getCallTypeMeta(type) {
  if (type === 'incoming') {
    return {
      label: 'Incoming',
      icon: PhoneIncoming,
      iconClass: 'text-emerald-400',
      indicatorClass: 'bg-emerald-500/80',
    };
  }
  if (type === 'outgoing') {
    return {
      label: 'Outgoing',
      icon: PhoneOutgoing,
      iconClass: 'text-sky-400',
      indicatorClass: 'bg-sky-500/80',
    };
  }
  return {
    label: 'Missed',
    icon: PhoneOff,
    iconClass: 'text-rose-400',
    indicatorClass: 'bg-rose-500/80',
  };
}

function PhoneApp({ className }) {
  const [activeTab, setActiveTab] = useState('recents');
  const [query, setQuery] = useState('');

  const filteredRecords = useMemo(
    () => RECORDS.filter((r) => recordMatches(r, query.trim())),
    [query],
  );

  const filteredContacts = useMemo(
    () => CONTACTS.filter((c) => contactMatches(c, query.trim())),
    [query],
  );

  function handleTabChange(tabId) {
    setActiveTab(tabId);
  }

  function handleQueryChange(event) {
    setQuery(event.target.value);
  }

  const showSearch = activeTab === 'recents' || activeTab === 'contacts';
  const rootClassName = [
    'flex',
    'flex-col',
    'h-full',
    'w-full',
    'text-white/90',
    'text-sm',
    'overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-testid="phone-app"
      data-app-id="phone"
      data-active-tab={activeTab}
      className={rootClassName}
    >
      <div
        data-testid="phone-tabs"
        role="tablist"
        aria-label="Phone sections"
        className="flex border-b border-white/10 bg-white/5"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const tabClassName = [
            'flex-1',
            'py-2',
            'text-center',
            'text-xs',
            'font-medium',
            'uppercase',
            'tracking-wide',
            'transition-colors',
            'cursor-pointer',
            isActive
              ? 'text-white border-b-2 border-sky-400'
              : 'text-white/60 hover:text-white/85 border-b-2 border-transparent',
          ].join(' ');
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={tab.testId}
              data-tab-id={tab.id}
              data-active={isActive ? 'true' : 'false'}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.id)}
              className={tabClassName}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {showSearch ? (
        <div className="px-3 py-2 border-b border-white/10 bg-white/5">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 flex items-center pl-2 text-white/50"
            >
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              data-testid="phone-search-input"
              aria-label="Search"
              placeholder="Search"
              value={query}
              onChange={handleQueryChange}
              className="w-full bg-white/10 text-white placeholder-white/50 rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            />
          </label>
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'recents' ? (
          <RecentsList records={filteredRecords} query={query} />
        ) : null}

        {activeTab === 'contacts' ? (
          <ContactsList contacts={filteredContacts} query={query} />
        ) : null}

        {activeTab === 'voicemail' ? <VoicemailList voicemails={VOICEMAILS} /> : null}
      </div>
    </div>
  );
}

function RecentsList({ records, query }) {
  if (records.length === 0) {
    return (
      <div
        data-testid="phone-recents-empty"
        className="px-4 py-10 text-center text-white/60 text-sm"
      >
        {query ? `No recent calls match "${query}".` : 'No recent calls.'}
      </div>
    );
  }
  return (
    <ul
      data-testid="phone-recents-list"
      aria-label="Recent calls"
      className="divide-y divide-white/10"
    >
      {records.map((record) => {
        const meta = getCallTypeMeta(record.type);
        const Icon = meta.icon;
        return (
          <li
            key={record.id}
            data-testid="phone-recents-item"
            data-call-type={record.type}
            data-call-id={record.id}
            className="flex items-center gap-3 px-3 py-2 hover:bg-white/10"
          >
            <span
              aria-hidden="true"
              className={[
                'flex',
                'items-center',
                'justify-center',
                'w-9',
                'h-9',
                'rounded-full',
                'shrink-0',
                meta.indicatorClass,
              ].join(' ')}
            >
              <Icon className="w-4 h-4 text-white" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{record.name}</div>
              <div
                className={[
                  'text-xs',
                  'truncate',
                  record.type === 'missed' ? 'text-rose-300' : 'text-white/70',
                ].join(' ')}
              >
                {meta.label} - {record.number}
              </div>
            </div>
            <div className="text-[10px] uppercase tracking-wide text-white/60 shrink-0">
              {record.timestamp}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ContactsList({ contacts, query }) {
  if (contacts.length === 0) {
    return (
      <div
        data-testid="phone-contacts-empty"
        className="px-4 py-10 text-center text-white/60 text-sm"
      >
        {query ? `No contacts match "${query}".` : 'No contacts.'}
      </div>
    );
  }
  return (
    <ul
      data-testid="phone-contacts-list"
      aria-label="Contacts"
      className="divide-y divide-white/10"
    >
      {contacts.map((contact) => {
        const avatarClass = pickAvatarClass(contact.id, AVATAR_PALETTE);
        const initials = getInitials(contact.name);
        return (
          <li
            key={contact.id}
            data-testid="phone-contact-item"
            data-contact-id={contact.id}
            className="flex items-center gap-3 px-3 py-2 hover:bg-white/10"
          >
            <span
              aria-hidden="true"
              className={[
                'flex',
                'items-center',
                'justify-center',
                'w-9',
                'h-9',
                'rounded-full',
                'text-xs',
                'font-semibold',
                'text-white',
                'shrink-0',
                avatarClass,
              ].join(' ')}
            >
              {initials}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{contact.name}</div>
              <div className="text-xs text-white/70 truncate">{contact.number}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function VoicemailList({ voicemails }) {
  if (voicemails.length === 0) {
    return (
      <div
        data-testid="phone-voicemail-empty"
        className="px-4 py-10 text-center text-white/60 text-sm"
      >
        No voicemails.
      </div>
    );
  }
  return (
    <ul
      data-testid="phone-voicemail-list"
      aria-label="Voicemails"
      className="divide-y divide-white/10"
    >
      {voicemails.map((voicemail) => (
        <li
          key={voicemail.id}
          data-testid="phone-voicemail-item"
          data-voicemail-id={voicemail.id}
          className="flex items-center gap-3 px-3 py-2 hover:bg-white/10"
        >
          <span
            aria-hidden="true"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-violet-500/80 shrink-0"
          >
            <Voicemail className="w-4 h-4 text-white" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{voicemail.caller}</div>
            <div className="text-xs text-white/70 truncate">
              Voicemail - {voicemail.duration}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wide text-white/60 shrink-0">
            {voicemail.timestamp}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default PhoneApp;
export { PhoneApp, RECORDS, CONTACTS, VOICEMAILS, TABS };
