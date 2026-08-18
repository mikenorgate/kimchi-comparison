/**
 * In-memory mock dataset for the System Settings app.
 *
 * Conventions:
 * - Settings are grouped into {@link SettingPane} records. Each pane
 *   acts like a sidebar category in macOS System Settings and owns a
 *   list of {@link Setting} rows.
 * - {@link Setting} is a discriminated union by `kind`:
 *     - `toggle`:  boolean on/off switch with an optional subtitle.
 *     - `text`:    free-form text input (e.g. computer name).
 *     - `number`:  numeric input clamped to a `min`/`max` range.
 *   Keeping the union tagged lets the UI render the right control
 *   without re-inspecting string fields.
 * - {@link initialMockSettings} is a deeply frozen array of panes.
 *   The Settings UI never mutates the seed — it works against a
 *   local React state copy that is updated through {@link updateSetting}
 *   so the seed stays pristine across renders.
 * - {@link PANE_ORDER} declares the canonical sidebar order. The
 *   Settings UI iterates this list directly so the visual ordering
 *   stays stable regardless of how callers reorder the seed.
 */

/** The kind of input control a setting renders. */
export type SettingKind = "toggle" | "text" | "number";

/**
 * Fields common to every setting row. The discriminated union below
 * augments this base with the kind-specific payload.
 */
interface SettingBase {
  /** Stable unique identifier (e.g. "wifi.airplane-mode"). */
  readonly id: string;
  /** Headline shown to the left of the control. */
  readonly label: string;
  /** Optional helper text shown beneath the label. */
  readonly description?: string;
  /** Glyph used as a small leading icon in the row. */
  readonly glyph?: string;
}

/** A boolean on/off setting. */
export interface ToggleSetting extends SettingBase {
  readonly kind: "toggle";
  readonly value: boolean;
}

/** A free-form text setting. */
export interface TextSetting extends SettingBase {
  readonly kind: "text";
  readonly value: string;
  /** Placeholder shown when the text input is empty. */
  readonly placeholder?: string;
}

/** A numeric setting clamped to `[min, max]`. */
export interface NumberSetting extends SettingBase {
  readonly kind: "number";
  readonly value: number;
  readonly min: number;
  readonly max: number;
  /** Optional unit suffix (e.g. "%"). */
  readonly unit?: string;
}

/** Discriminated union over the supported setting kinds. */
export type Setting = ToggleSetting | TextSetting | NumberSetting;

/**
 * A single sidebar pane (e.g. "Wi-Fi", "Display") that owns a list
 * of settings. Panes are rendered as the left rail and dictate
 * which settings appear in the detail view.
 */
export interface SettingPane {
  /** Stable unique identifier (e.g. "network"). */
  readonly id: string;
  /** Display name shown in the sidebar. */
  readonly name: string;
  /** Short unicode glyph used as the sidebar row icon. */
  readonly glyph: string;
  /** Settings belonging to this pane, in render order. */
  readonly settings: readonly Setting[];
}

/**
 * The seed collection of mock settings panes. Five panes cover the
 * categories a System Settings user expects to see on first open,
 * and the variety of `kind` values exercises every control the UI
 * renders.
 */
export const initialMockSettings: readonly SettingPane[] = Object.freeze([
  {
    id: "network",
    name: "Network",
    glyph: "\u{1F4F6}", // 📶
    settings: Object.freeze([
      {
        id: "network.airplane-mode",
        kind: "toggle",
        label: "Airplane Mode",
        description: "Disable wireless radios.",
        glyph: "\u{2708}", // ✈
        value: false,
      },
      {
        id: "network.wifi",
        kind: "toggle",
        label: "Wi-Fi",
        description: "Connect to known wireless networks.",
        glyph: "\u{1F4F6}", // 📶
        value: true,
      },
      {
        id: "network.bluetooth",
        kind: "toggle",
        label: "Bluetooth",
        description: "Available for data transfer and accessories.",
        glyph: "\u{1F4F6}", // not a great bluetooth glyph but consistent
        value: true,
      },
      {
        id: "network.computer-name",
        kind: "text",
        label: "Computer Name",
        description: "The name other computers see on the local network.",
        placeholder: "My Mac",
        glyph: "\u{1F4BB}", // 💻
        value: "Tahoe Desktop",
      },
    ] as readonly Setting[]),
  },
  {
    id: "notifications",
    name: "Notifications",
    glyph: "\u{1F514}", // 🔔
    settings: Object.freeze([
      {
        id: "notifications.allow",
        kind: "toggle",
        label: "Allow Notifications",
        description: "Show banners and alerts from apps.",
        glyph: "\u{1F514}", // 🔔
        value: true,
      },
      {
        id: "notifications.do-not-disturb",
        kind: "toggle",
        label: "Do Not Disturb",
        description: "Silence notifications, calls, and badges.",
        glyph: "\u{1F515}", // 🔕
        value: false,
      },
      {
        id: "notifications.show-previews",
        kind: "toggle",
        label: "Show Previews",
        description: "Reveal message contents on the lock screen.",
        glyph: "\u{1F4AC}", // 💬
        value: true,
      },
    ] as readonly Setting[]),
  },
  {
    id: "sound",
    name: "Sound",
    glyph: "\u{1F50A}", // 🔊
    settings: Object.freeze([
      {
        id: "sound.volume",
        kind: "number",
        label: "Output Volume",
        description: "Adjust speaker and headphone loudness.",
        glyph: "\u{1F50A}", // 🔊
        value: 42,
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        id: "sound.mute",
        kind: "toggle",
        label: "Mute",
        description: "Silence all output until turned off.",
        glyph: "\u{1F507}", // 🔇
        value: false,
      },
    ] as readonly Setting[]),
  },
  {
    id: "display",
    name: "Display",
    glyph: "\u{1F5A5}", // 🖥
    settings: Object.freeze([
      {
        id: "display.dark-mode",
        kind: "toggle",
        label: "Dark Mode",
        description: "Use a dark colour palette for the system.",
        glyph: "\u{1F319}", // 🌙
        value: true,
      },
      {
        id: "display.night-shift",
        kind: "toggle",
        label: "Night Shift",
        description: "Shift display colours toward warmer tones.",
        glyph: "\u{1F305}", // 🌅
        value: false,
      },
      {
        id: "display.brightness",
        kind: "number",
        label: "Brightness",
        description: "Built-in display brightness.",
        glyph: "\u{2600}", // ☀
        value: 70,
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        id: "display.auto-brightness",
        kind: "toggle",
        label: "Auto-Brightness",
        description: "Adjust brightness based on ambient light.",
        glyph: "\u{1F4A1}", // 💡
        value: true,
      },
    ] as readonly Setting[]),
  },
  {
    id: "general",
    name: "General",
    glyph: "\u{2699}", // ⚙
    settings: Object.freeze([
      {
        id: "general.auto-update",
        kind: "toggle",
        label: "Automatic Updates",
        description: "Install system updates as they become available.",
        glyph: "\u{2B07}", // ⬇
        value: true,
      },
      {
        id: "general.analytics",
        kind: "toggle",
        label: "Share Analytics",
        description: "Help Apple improve macOS by sharing anonymous usage data.",
        glyph: "\u{1F4CA}", // 📊
        value: false,
      },
      {
        id: "general.screensaver-wait",
        kind: "number",
        label: "Screen Saver Wait",
        description: "Idle time before the screen saver starts.",
        glyph: "\u{23F2}", // ⏲
        value: 10,
        min: 1,
        max: 60,
        unit: " min",
      },
    ] as readonly Setting[]),
  },
] as readonly SettingPane[]);

/**
 * Canonical order of pane ids. Mirrors the index order of
 * {@link initialMockSettings}; the Settings sidebar iterates this
 * array directly so the visual ordering stays stable even when the
 * seed dataset is later extended.
 */
export const PANE_ORDER: readonly string[] = Object.freeze(
  initialMockSettings.map((pane) => pane.id)
);

/** Flat list of every setting across every pane. */
export const ALL_SETTINGS: readonly Setting[] = Object.freeze(
  initialMockSettings.flatMap((pane) => pane.settings)
);

/**
 * Resolve the initial pane id. Unknown ids fall back to the first
 * declared pane so the Settings UI always opens into a populated
 * state.
 */
export function resolveInitialPaneId(requested: string | undefined): string {
  if (requested && PANE_ORDER.includes(requested)) {
    return requested;
  }
  return PANE_ORDER[0] ?? "";
}

/**
 * Look up a setting by id. Returns `undefined` when the id is unknown
 * so callers can decide how to degrade — typically by silently
 * dropping the update.
 */
export function getSetting(
  id: string,
  panes: readonly SettingPane[] = initialMockSettings
): Setting | undefined {
  for (const pane of panes) {
    const match = pane.settings.find((setting) => setting.id === id);
    if (match) return match;
  }
  return undefined;
}

/**
 * The new value for a setting after an update. Same shape as the
 * input — discriminated by `kind` so callers can match on it
 * without re-inspecting other fields.
 */
export type SettingValue = boolean | string | number;

/**
 * Return an updated panes array with the named setting switched to
 * `next`. Returns the original reference (no allocation) when the
 * setting is missing or already at `next`. The helper is
 * intentionally immutable: each pane rebuilds its `settings` array
 * only when the changed setting belongs to it, and React reconciles
 * the new tree top-down.
 *
 * Numeric values are clamped to the setting's `min`/`max` range so
 * UI input that overshoots never produces an out-of-bounds value.
 */
export function updateSetting(
  id: string,
  next: SettingValue,
  panes: readonly SettingPane[] = initialMockSettings
): readonly SettingPane[] {
  let mutated = false;
  const updated = panes.map((pane) => {
    const idx = pane.settings.findIndex((setting) => setting.id === id);
    if (idx === -1) return pane;
    const current = pane.settings[idx]!;
    const clamped = clampValue(current, next);
    if (valuesEqual(current, clamped)) {
      return pane;
    }
    mutated = true;
    const nextSettings = pane.settings.slice();
    nextSettings[idx] = applyValue(current, clamped);
    return { ...pane, settings: Object.freeze(nextSettings) };
  });
  return mutated ? updated : panes;
}

/**
 * Internal helper: clamp a numeric update to the setting's range.
 * Non-numeric settings pass through unchanged.
 */
function clampValue(setting: Setting, next: SettingValue): SettingValue {
  if (setting.kind === "number" && typeof next === "number") {
    if (Number.isNaN(next)) return setting.value;
    if (next < setting.min) return setting.min;
    if (next > setting.max) return setting.max;
    return next;
  }
  return next;
}

/**
 * Internal helper: build the updated setting object with the new
 * value applied.
 */
function applyValue(setting: Setting, next: SettingValue): Setting {
  switch (setting.kind) {
    case "toggle":
      return { ...setting, value: Boolean(next) };
    case "text":
      return { ...setting, value: String(next) };
    case "number":
      return { ...setting, value: Number(next) };
    default:
      return setting;
  }
}

/**
 * Internal helper: detect "no-op" updates so we can return the
 * original reference and skip a wasted re-render.
 */
function valuesEqual(setting: Setting, next: SettingValue): boolean {
  switch (setting.kind) {
    case "toggle":
      return setting.value === Boolean(next);
    case "text":
      return setting.value === String(next);
    case "number":
      return setting.value === Number(next);
    default:
      return false;
  }
}
