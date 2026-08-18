import type { ComponentType } from "react";
import Calculator from "@/components/apps/calculator/Calculator";
import Calendar from "@/components/apps/calendar/Calendar";
import Finder from "@/components/apps/finder/Finder";
import Mail from "@/components/apps/mail/Mail";
import Notes from "@/components/apps/notes/Notes";
import Photos from "@/components/apps/photos/Photos";
import Safari from "@/components/apps/safari/Safari";
import Settings from "@/components/apps/settings/Settings";
import Terminal from "@/components/apps/terminal/Terminal";

/**
 * Stable, kebab-cased identifier for a desktop app. Used as the key for
 * running-app tracking, the window manager focus map, and routing within
 * each app's UI.
 */
export type AppId =
  | "finder"
  | "safari"
  | "mail"
  | "calendar"
  | "notes"
  | "photos"
  | "settings"
  | "calculator"
  | "terminal";

/**
 * How an app's window body is provided to the window manager.
 *
 * - `sync`: a ready-to-mount React component. Used for the apps that
 *   already ship with a real UI (currently just Finder) so the
 *   window manager can render them directly without any async work.
 * - `lazy`: a function returning a dynamic `import()` promise. Kept
 *   for future code-splitting — apps that haven't been implemented
 *   yet register a placeholder loader so the manager can show a
 *   "loading…" state and avoid bundling their full UI eagerly.
 */
export type AppComponentLoader =
  | { readonly kind: "sync"; readonly Component: ComponentType }
  | {
      readonly kind: "lazy";
      readonly load: () => Promise<{ default: ComponentType }>;
    };

/**
 * Shape of a single desktop application entry. The `component` field
 * tells the window manager how to mount the app's window body; it is
 * optional so registry entries without a real component (yet) can
 * still appear in the Dock and MenuBar.
 */
export interface AppDefinition {
  readonly id: AppId;
  readonly name: string;
  readonly icon: string;
  readonly component?: AppComponentLoader;
}

/**
 * Canonical registry of desktop apps. Order here defines the left-to-right
 * ordering in the Dock. Treat this as the single source of truth: the
 * Dock, Menu Bar, and window manager should all import from here rather
 * than hard-coding app names.
 *
 * Apps that haven't been implemented yet still get an entry so the Dock
 * shows them; their `component` is omitted (or a lazy placeholder) and
 * the window manager renders the app name as a fallback body.
 */
export const APPS: readonly AppDefinition[] = [
  {
    id: "finder",
    name: "Finder",
    icon: "📁",
    component: { kind: "sync", Component: Finder },
  },
  {
    id: "safari",
    name: "Safari",
    icon: "🧭",
    component: { kind: "sync", Component: Safari },
  },
  {
    id: "mail",
    name: "Mail",
    icon: "✉️",
    component: { kind: "sync", Component: Mail },
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "📅",
    component: { kind: "sync", Component: Calendar },
  },
  {
    id: "notes",
    name: "Notes",
    icon: "📝",
    component: { kind: "sync", Component: Notes },
  },
  {
    id: "photos",
    name: "Photos",
    icon: "🌄",
    component: { kind: "sync", Component: Photos },
  },
  {
    id: "settings",
    name: "System Settings",
    icon: "⚙️",
    component: { kind: "sync", Component: Settings },
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: "🧮",
    component: { kind: "sync", Component: Calculator },
  },
  {
    id: "terminal",
    name: "Terminal",
    icon: "⌨️",
    component: { kind: "sync", Component: Terminal },
  },
] as const;

/**
 * Look up an app by id. Returns undefined when no app matches so callers
 * can decide whether to silently ignore or surface an error.
 */
export function getApp(id: AppId): AppDefinition | undefined {
  return APPS.find((app) => app.id === id);
}
