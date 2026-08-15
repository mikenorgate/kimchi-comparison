import { getAppById } from '../../config/apps';
import './StubApp.css';

const STUB_CONTENT = {
  messages: 'Start a new conversation or select a message from the sidebar.',
  facetime: 'Make video and audio calls to friends and family.',
  contacts: 'Manage your contacts and contact groups.',
  reminders: 'Keep track of your tasks and reminders.',
  music: 'Browse your library, playlists, and discover new music.',
  tv: 'Watch your favorite shows and movies.',
  podcasts: 'Discover and subscribe to podcasts.',
  appstore: 'Discover new apps and update your existing ones.',
  news: 'Read the latest stories from your favorite sources.',
  stocks: 'Track market data and your watchlist.',
  books: 'Browse your library and the bookstore.',
  home: 'Control your HomeKit accessories and scenes.',
  weather: 'Current conditions and forecast for your location.',
  clock: 'World clocks, alarms, timers, and stopwatch.',
  wallet: 'Store passes, tickets, cards, and IDs.',
  findmy: 'Locate your devices and friends.',
  phone: 'Make and receive calls on your Mac.',
  journal: 'Reflect on your day with suggested moments.',
  games: 'Discover and play Apple Arcade games.',
  launchpad: 'Launch any installed app from the grid.',
  trash: 'Deleted items appear here until emptied.',
  freeform: 'Collaborate on a flexible canvas with others.',
  gamecenter: 'Track achievements, friends, and multiplayer invites.',
  voicememos: 'Record, play back, and edit voice memos.',
  magnifier: 'Zoom in on nearby text and objects.',
};

export default function StubApp({ appId }) {
  const app = getAppById(appId);
  const description = STUB_CONTENT[appId] || 'App content will be rendered here.';

  return (
    <div className="stub-app" data-testid={`stub-${appId}`}>
      <div className="stub-icon" style={{ background: app?.color || '#8E8E93' }}>
        {app?.name?.[0] || '?'}
      </div>
      <h2 className="stub-title">{app?.name || appId}</h2>
      <p className="stub-description">{description}</p>
      <button className="stub-action" onClick={() => window.alert(`This is a mock stub for ${app?.name || appId}.`)}>
        Open {app?.name || appId}
      </button>
    </div>
  );
}
