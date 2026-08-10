import AppIcon from './AppIcon.jsx';
import Window from './Window.jsx';
import { useWindows, useWindowActions } from '../contexts/WindowContext.jsx';
import FinderApp from './apps/FinderApp.jsx';
import SafariApp from './apps/SafariApp.jsx';
import MessagesApp from './apps/MessagesApp.jsx';
import MailApp from './apps/MailApp.jsx';
import PhoneApp from './apps/PhoneApp.jsx';
import PhotosApp from './apps/PhotosApp.jsx';
import SettingsApp from './apps/SettingsApp.jsx';
import MusicApp from './apps/MusicApp.jsx';
import CalculatorApp from './apps/CalculatorApp.jsx';
import CalendarApp from './apps/CalendarApp.jsx';
import GamesApp from './apps/GamesApp.jsx';
import JournalApp from './apps/JournalApp.jsx';
import NotesApp from './apps/NotesApp.jsx';

/**
 * WindowManager
 *
 * Reads the open-windows state from WindowContext and renders one
 * `<Window />` per non-minimized window. Wires each window to the
 * corresponding dispatcher action from `useWindowActions()` so the
 * component itself stays a thin presentation layer.
 *
 * The actual app interior is rendered through `<WindowContent />`,
 * which looks up the matching component from `APP_COMPONENTS`. Unknown
 * app ids fall back to a small placeholder.
 */

const APP_TITLES = {
  safari: 'Safari',
  messages: 'Messages',
  phone: 'Phone',
  photos: 'Photos',
  notes: 'Notes',
  calendar: 'Calendar',
  calculator: 'Calculator',
  settings: 'Settings',
  games: 'Games',
  journal: 'Journal',
  music: 'Music',
  mail: 'Mail',
  finder: 'Finder',
};

function getAppTitle(appId) {
  if (typeof appId !== 'string' || appId.length === 0) return '';
  if (Object.prototype.hasOwnProperty.call(APP_TITLES, appId)) {
    return APP_TITLES[appId];
  }
  return appId.charAt(0).toUpperCase() + appId.slice(1);
}

function getAppIcon(appId) {
  return <AppIcon appId={appId} size="sm" />;
}

const APP_COMPONENTS = {
  finder: FinderApp,
  safari: SafariApp,
  messages: MessagesApp,
  mail: MailApp,
  phone: PhoneApp,
  photos: PhotosApp,
  settings: SettingsApp,
  music: MusicApp,
  calculator: CalculatorApp,
  calendar: CalendarApp,
  games: GamesApp,
  journal: JournalApp,
  notes: NotesApp,
};

function WindowContent({ appId }) {
  const Component =
    typeof appId === 'string' ? APP_COMPONENTS[appId] : null;
  if (Component) {
    return (
      <div
        data-testid="window-content"
        data-app-id={appId}
        className="h-full w-full"
      >
        <Component />
      </div>
    );
  }
  return (
    <div
      data-testid="window-content"
      data-app-id={appId}
      className="p-4 text-white/90 text-sm"
    >
      App: {appId}
    </div>
  );
}

function WindowManager({ children }) {
  const { windows, activeAppId } = useWindows();
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    dragWindow,
    resizeWindow,
    setFullscreen,
  } = useWindowActions();

  const visibleWindows = windows.filter((w) => !w.minimized);

  return (
    <>
      {visibleWindows.map((w) => (
        <Window
          key={w.id}
          id={w.id}
          appId={w.appId}
          title={getAppTitle(w.appId)}
          icon={getAppIcon(w.appId)}
          x={w.x}
          y={w.y}
          width={w.width}
          height={w.height}
          zIndex={w.zIndex}
          minimized={w.minimized}
          isActive={w.appId === activeAppId}
          isFullscreen={
            typeof w.isFullscreen === 'boolean'
              ? w.isFullscreen
              : typeof w.previousRect !== 'undefined'
          }
          onFocus={focusWindow}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onFullscreen={(id, isFullscreen) => setFullscreen(id, isFullscreen)}
          onDrag={dragWindow}
          onResize={resizeWindow}
        >
          <WindowContent appId={w.appId} />
        </Window>
      ))}
      {children}
    </>
  );
}

export default WindowManager;
export { WindowContent, getAppTitle, getAppIcon, APP_COMPONENTS };
