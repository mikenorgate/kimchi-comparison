"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { getApp, type AppId } from "@/lib/apps";

/**
 * Ordered list of standard macOS menu labels rendered between the Apple
 * menu and the system status area. The active app's own menu (when
 * present) is rendered between the Apple menu and these standard ones.
 */
const STANDARD_MENUS = ["File", "Edit", "View", "Window", "Help"] as const;

type StandardMenu = (typeof STANDARD_MENUS)[number];

interface MenuBarProps {
  readonly activeApp: AppId | null;
  readonly openApps: ReadonlySet<AppId>;
}

/**
 * Persistent macOS-style menu bar pinned to the top of the desktop.
 *
 * Left side: Apple menu (with a small dropdown), then the active app
 * name, then the standard File / Edit / View / Window / Help menus.
 * Right side: a clock plus a few system status icons (Wi-Fi, battery,
 * search, control centre) — all rendered as emoji placeholders.
 *
 * Each menu label is interactive: clicking toggles a dropdown panel of
 * placeholder items. Real actions will be wired up by the window
 * manager in a later phase. The component owns the open-menu state so
 * the parent's shell state stays untouched.
 */
export default function MenuBar({
  activeApp,
  openApps,
}: MenuBarProps): JSX.Element {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  // Close any open dropdown when clicking outside the menu bar. We use a
  // native document listener instead of a React portal because the dropdown
  // is rendered inline; a real focus-trapped, portaled menu will replace
  // this in a later phase.
  useEffect(() => {
    if (!openMenu) return;
    const handleDocumentClick = (event: globalThis.MouseEvent): void => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current) return;
      if (!rootRef.current.contains(target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [openMenu]);

  const handleMenuClick = useCallback(
    (label: string) => {
      setOpenMenu((prev) => (prev === label ? null : label));
    },
    []
  );

  const handleMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, label: string) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpenMenu((prev) => (prev === label ? null : label));
      }
    },
    []
  );

  const activeAppName = useMemo(() => {
    if (!activeApp) return null;
    return getApp(activeApp)?.name ?? null;
  }, [activeApp]);

  const clockLabel = useMemo(() => formatClock(new Date()), []);
  const dateLabel = useMemo(() => formatDate(new Date()), []);

  return (
    <header
      ref={rootRef}
      className="menu-bar"
      role="menubar"
      aria-label="Menu bar"
      data-testid="menu-bar"
    >
      <div className="menu-bar__left">
        <div className="menu-bar__menu">
          <button
            type="button"
            className="menu-bar__item menu-bar__item--apple"
            aria-haspopup="menu"
            aria-expanded={openMenu === "apple"}
            aria-label="Apple menu"
            data-testid="menu-bar-apple"
            onClick={() => handleMenuClick("apple")}
            onKeyDown={(event) => handleMenuKeyDown(event, "apple")}
          >
            <span className="menu-bar__apple" aria-hidden="true">
              {/* stylised apple glyph */}
              <svg
                width="14"
                height="17"
                viewBox="0 0 14 17"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.6 9.06c-.02-2.14 1.75-3.17 1.83-3.22-1-1.46-2.55-1.66-3.1-1.69-1.32-.13-2.58.78-3.25.78-.68 0-1.71-.76-2.81-.74-1.45.02-2.78.84-3.53 2.14-1.5 2.6-.38 6.44 1.08 8.55.72 1.04 1.57 2.19 2.69 2.15 1.08-.04 1.49-.7 2.79-.7 1.3 0 1.67.7 2.81.67 1.16-.02 1.89-1.05 2.6-2.09.82-1.2 1.16-2.37 1.18-2.43-.03-.01-2.27-.87-2.29-3.42zM9.4 2.78c.59-.72.99-1.72.88-2.72-.85.04-1.89.57-2.5 1.29-.55.63-1.03 1.65-.9 2.63.95.07 1.92-.48 2.52-1.2z" />
              </svg>
            </span>
          </button>
          {openMenu === "apple" ? (
            <Dropdown label="Apple">
              <DropdownItem label="About This Mac" />
              <DropdownItem label="System Settings…" disabled />
              <DropdownSeparator />
              <DropdownItem label="Sleep" />
              <DropdownItem label="Restart…" disabled />
              <DropdownItem label="Shut Down…" disabled />
              <DropdownSeparator />
              <DropdownItem label="Lock Screen" />
            </Dropdown>
          ) : null}
        </div>

        {activeAppName ? (
          <div className="menu-bar__menu">
            <button
              type="button"
              className="menu-bar__item menu-bar__item--active"
              data-testid="menu-bar-active-app"
              aria-haspopup="menu"
              aria-expanded={openMenu === activeAppName}
              onClick={() => handleMenuClick(activeAppName)}
              onKeyDown={(event) => handleMenuKeyDown(event, activeAppName)}
            >
              <span className="menu-bar__active-name">{activeAppName}</span>
            </button>
            {openMenu === activeAppName ? (
              <Dropdown label={activeAppName}>
                <DropdownItem label={`About ${activeAppName}`} />
                <DropdownSeparator />
                <DropdownItem label="Preferences…" disabled />
                <DropdownItem label="Hide" />
                <DropdownItem
                  label={`Quit ${activeAppName}`}
                  shortcut={
                    activeApp ? `Q while ${activeAppName} is active` : "Q"
                  }
                />
              </Dropdown>
            ) : null}
          </div>
        ) : null}

        {STANDARD_MENUS.map((label) => (
          <MenuLabel
            key={label}
            label={label}
            open={openMenu === label}
            onToggle={handleMenuClick}
            onKeyDown={handleMenuKeyDown}
          />
        ))}
      </div>

      <div className="menu-bar__right" aria-label="System status">
        {openApps.size > 0 ? (
          <span
            className="menu-bar__status"
            data-testid="menu-bar-running-count"
            title={`${openApps.size} app${openApps.size === 1 ? "" : "s"} running`}
            aria-label={`${openApps.size} apps running`}
          >
            <span className="menu-bar__status-glyph" aria-hidden="true">
              ●
            </span>
            <span className="menu-bar__status-count">{openApps.size}</span>
          </span>
        ) : null}

        <StatusIcon
          testId="menu-bar-icon-control-center"
          label="Control Centre"
          glyph={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="4" cy="4" r="1.6" />
              <circle cx="12" cy="4" r="1.6" />
              <circle cx="4" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="8" cy="8" r="1.6" />
            </svg>
          }
        />

        <StatusIcon
          testId="menu-bar-icon-battery"
          label="Battery"
          glyph={
            <svg
              width="22"
              height="12"
              viewBox="0 0 22 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="0.5"
                y="0.5"
                width="18"
                height="11"
                rx="2.5"
                stroke="currentColor"
              />
              <rect x="2" y="2" width="14" height="8" rx="1" fill="currentColor" />
              <rect x="19.5" y="4" width="2" height="4" rx="1" fill="currentColor" />
            </svg>
          }
          badge="87%"
        />

        <StatusIcon
          testId="menu-bar-icon-wifi"
          label="Wi-Fi"
          glyph={
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M8 11.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z" />
              <path d="M3.5 7.1a6.4 6.4 0 0 1 9 0l-1.1 1.1a4.9 4.9 0 0 0-6.8 0L3.5 7.1z" />
              <path d="M0.8 4.4a10 10 0 0 1 14.4 0l-1.1 1.1a8.5 8.5 0 0 0-12.2 0L0.8 4.4z" />
            </svg>
          }
        />

        <StatusIcon
          testId="menu-bar-icon-search"
          label="Spotlight Search"
          glyph={
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M9.5 9.5l3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        <button
          type="button"
          className="menu-bar__clock"
          data-testid="menu-bar-clock"
          aria-label={`${dateLabel} ${clockLabel}`}
          title={`${dateLabel} ${clockLabel}`}
          onClick={closeMenu}
        >
          <span className="menu-bar__clock-date">{dateLabel}</span>
          <span className="menu-bar__clock-time">{clockLabel}</span>
        </button>
      </div>
    </header>
  );
}

interface MenuLabelProps {
  readonly label: StandardMenu;
  readonly open: boolean;
  readonly onToggle: (label: string) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, label: string) => void;
}

function MenuLabel({
  label,
  open,
  onToggle,
  onKeyDown,
}: MenuLabelProps): JSX.Element {
  return (
    <div className="menu-bar__menu">
      <button
        type="button"
        className={`menu-bar__item${open ? " menu-bar__item--open" : ""}`}
        data-testid={`menu-bar-${label.toLowerCase()}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onToggle(label)}
        onKeyDown={(event) => onKeyDown(event, label)}
      >
        <span>{label}</span>
      </button>
      {open ? (
        <Dropdown label={label}>
          {defaultItemsFor(label).map((item) => (
            <DropdownItem
              key={item.label}
              label={item.label}
              disabled={item.disabled}
              shortcut={item.shortcut}
            />
          ))}
        </Dropdown>
      ) : null}
    </div>
  );
}

interface StatusIconProps {
  readonly testId: string;
  readonly label: string;
  readonly glyph: JSX.Element;
  readonly badge?: string;
}

function StatusIcon({ testId, label, glyph, badge }: StatusIconProps): JSX.Element {
  return (
    <span
      className="menu-bar__status menu-bar__status--icon"
      role="img"
      aria-label={label}
      title={label}
      data-testid={testId}
    >
      {glyph}
      {badge ? <span className="menu-bar__status-badge">{badge}</span> : null}
    </span>
  );
}

interface DropdownProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

function Dropdown({ label, children }: DropdownProps): JSX.Element {
  return (
    <div
      className="menu-bar__dropdown"
      role="menu"
      aria-label={`${label} menu`}
      data-testid={`menu-bar-dropdown-${label.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  readonly label: string;
  readonly disabled?: boolean;
  readonly shortcut?: string;
}

function DropdownItem({
  label,
  disabled = false,
  shortcut,
}: DropdownItemProps): JSX.Element {
  return (
    <button
      type="button"
      role="menuitem"
      className={`menu-bar__dropdown-item${disabled ? " menu-bar__dropdown-item--disabled" : ""}`}
      disabled={disabled}
      onClick={disabled ? undefined : (event) => event.stopPropagation()}
    >
      <span className="menu-bar__dropdown-label">{label}</span>
      {shortcut ? (
        <span className="menu-bar__dropdown-shortcut" aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
    </button>
  );
}

function DropdownSeparator(): JSX.Element {
  return <div className="menu-bar__dropdown-separator" role="separator" />;
}

interface DefaultItem {
  readonly label: string;
  readonly disabled?: boolean;
  readonly shortcut?: string;
}

function defaultItemsFor(menu: StandardMenu): readonly DefaultItem[] {
  switch (menu) {
    case "File":
      return [
        { label: "New Window", shortcut: "⌘N" },
        { label: "Open…", shortcut: "⌘O", disabled: true },
        { label: "Close Window", shortcut: "⌘W" },
      ];
    case "Edit":
      return [
        { label: "Undo", shortcut: "⌘Z" },
        { label: "Redo", shortcut: "⇧⌘Z", disabled: true },
        { label: "Cut", shortcut: "⌘X" },
        { label: "Copy", shortcut: "⌘C" },
        { label: "Paste", shortcut: "⌘V" },
        { label: "Select All", shortcut: "⌘A" },
      ];
    case "View":
      return [
        { label: "Enter Full Screen", shortcut: "⌃⌘F" },
        { label: "Zoom In", shortcut: "⌘=" },
        { label: "Zoom Out", shortcut: "⌘-" },
      ];
    case "Window":
      return [
        { label: "Minimize", shortcut: "⌘M" },
        { label: "Zoom" },
        { label: "Bring All to Front" },
      ];
    case "Help":
      return [{ label: "Search", shortcut: "⌘?" }, { label: "macOS Help" }];
    default:
      return [];
  }
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
