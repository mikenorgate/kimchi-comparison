import { useState, useEffect, useRef } from 'react';
import './MenuBar.css';

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-label="Apple">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const WifiIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-label="Wi-Fi">
    <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-5.27-4.63l1.41 1.41C9.39 13.44 10.64 13 12 13s2.61.44 3.86 1.78l1.41-1.41C16.08 11.62 14.18 11 12 11s-4.08.62-5.27 2.37zm-2.83-2.83l1.41 1.41C7.79 9.36 9.79 8.5 12 8.5s4.21.86 6.69 3.45l1.41-1.41C17.08 7.19 14.68 6.25 12 6.25S6.92 7.19 3.9 10.54z" />
  </svg>
);

const BatteryIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-label="Battery">
    <path d="M17 6H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H7V8h10v8zm2-7h1v6h-1V9z" />
    <rect x="8" y="9" width="8" height="6" rx="1" fill="currentColor" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-label="Spotlight">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const ControlCenterIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-label="Control Center">
    <path d="M4 11h6v2H4zm0-4h10v2H4zm0 8h4v2H4zm9-4h7v2h-7zm0 4h5v2h-5zm0-8h3v2h-3z" />
  </svg>
);

export default function MenuBar({ activeApp = 'Finder', onControlCenterToggle }) {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenu]);

  const appleItems = [
    'About This Mac',
    'System Settings…',
    'App Store…',
    null,
    'Recent Items',
    null,
    'Force Quit…',
    null,
    'Sleep',
    'Restart…',
    'Shut Down…',
  ];

  const appItems = [
    `About ${activeApp}`,
    null,
    'Preferences…',
    'Services',
    null,
    `Hide ${activeApp}`,
    'Hide Others',
    'Show All',
    null,
    `Quit ${activeApp}`,
  ];

  const standardItems = [
    'New Window',
    'New Folder',
    null,
    'Open',
    'Close',
    'Get Info',
    null,
    'Cut',
    'Copy',
    'Paste',
  ];

  function renderDropdown(items) {
    return (
      <div className="menu-dropdown glass-menu">
        {items.map((item, i) =>
          item === null ? (
            <div key={i} className="menu-dropdown-separator" />
          ) : (
            <div key={i} className="menu-dropdown-item">
              <span>{item}</span>
            </div>
          )
        )}
      </div>
    );
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div ref={menuRef} className="menu-bar no-select">
      <div className="menu-bar-left">
        <button
          className={`menu-item apple ${openMenu === 'apple' ? 'active' : ''}`}
          onClick={() => setOpenMenu(openMenu === 'apple' ? null : 'apple')}
        >
          <AppleIcon />
        </button>
        {openMenu === 'apple' && renderDropdown(appleItems)}

        <button
          className={`menu-item active-app ${openMenu === 'app' ? 'active' : ''}`}
          onClick={() => setOpenMenu(openMenu === 'app' ? null : 'app')}
        >
          {activeApp}
        </button>
        {openMenu === 'app' && renderDropdown(appItems)}

        {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map((label) => (
          <button
            key={label}
            className={`menu-item ${openMenu === label ? 'active' : ''}`}
            onClick={() => setOpenMenu(openMenu === label ? null : label)}
          >
            {label}
            {openMenu === label && renderDropdown(standardItems)}
          </button>
        ))}
      </div>

      <div className="menu-bar-right">
        <button className="menu-item icon">
          <WifiIcon />
        </button>
        <button className="menu-item icon">
          <BatteryIcon />
        </button>
        <button className="menu-item icon">
          <SearchIcon />
        </button>
        <button
          className="menu-item icon"
          onClick={onControlCenterToggle}
          aria-label="Control Center"
        >
          <ControlCenterIcon />
        </button>
        <button className="menu-item clock">
          {dateString} {timeString}
        </button>
      </div>
    </div>
  );
}
