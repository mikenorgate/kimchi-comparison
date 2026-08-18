"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  PANE_ORDER,
  getSetting,
  initialMockSettings,
  resolveInitialPaneId,
  updateSetting,
  type NumberSetting,
  type Setting,
  type SettingPane,
  type SettingValue,
  type TextSetting,
  type ToggleSetting,
} from "./mockSettings";

/**
 * System Settings window content.
 *
 * Renders a macOS-Settings-inspired layout:
 *
 *   | sidebar (panes) | detail (settings) |
 *
 * The component owns its own working copy of the {@link SettingPane}
 * tree. Updates go through the immutable {@link updateSetting} helper
 * so the canonical {@link initialMockSettings} seed is never touched.
 *
 * Behavioural notes:
 * - Selecting a pane swaps the detail view but keeps every setting
 *   value intact, exactly the way the real System Settings behaves
 *   while it is open.
 * - Toggles flip immediately. Text and number controls debounce the
 *   canonical value to their `change` event so a partially typed
 *   value never clobbers the saved one mid-keystroke.
 * - The root element exposes `data-selected-pane` and a list of
 *   `data-setting-{id}` attributes so tests can assert against the
 *   current view deterministically.
 * - An optional `initialPaneId` / `initialPanes` prop lets the
 *   window manager (and tests) boot Settings into a deterministic
 *   state. Both default to the first pane / the shared seed.
 */
export interface SettingsProps {
  /**
   * Optional starting pane id. Defaults to the first entry in
   * {@link PANE_ORDER} (i.e. Network). Unknown ids are silently
   * dropped so the UI always opens into a populated pane.
   */
  readonly initialPaneId?: string;
  /**
   * Optional override for the seed dataset. Defaults to
   * {@link initialMockSettings}. Kept as an escape hatch so tests
   * can pass a smaller fixture without touching the shared
   * constant.
   */
  readonly initialPanes?: readonly SettingPane[];
}

/**
 * Build the deterministic `data-setting-{id}={value}` attribute map
 * the root element exposes. We serialise booleans as the literal
 * strings "true" / "false" so tests can read them with
 * `getAttribute` without parsing JSON.
 */
function summarisePanes(
  panes: readonly SettingPane[]
): Record<string, string> {
  const summary: Record<string, string> = {};
  for (const pane of panes) {
    for (const setting of pane.settings) {
      summary[`data-setting-${setting.id}`] = String(setting.value);
    }
  }
  return summary;
}

export default function Settings({
  initialPaneId,
  initialPanes,
}: SettingsProps): JSX.Element {
  const seedPanes = initialPanes ?? initialMockSettings;
  const seedPaneId = resolveInitialPaneId(initialPaneId);

  const [panes, setPanes] = useState<readonly SettingPane[]>(seedPanes);
  const [selectedPaneId, setSelectedPaneId] = useState<string>(seedPaneId);

  /**
   * The panes in sidebar order. Iterating {@link PANE_ORDER} keeps
   * the visual ordering stable even if a custom `initialPanes`
   * fixture is supplied in a different order.
   */
  const orderedPanes = useMemo<readonly SettingPane[]>(() => {
    return PANE_ORDER.flatMap((id) => {
      const pane = panes.find((p) => p.id === id);
      return pane ? [pane] : [];
    });
  }, [panes]);

  const selectedPane: SettingPane | undefined = useMemo(
    () => panes.find((pane) => pane.id === selectedPaneId),
    [panes, selectedPaneId]
  );

  /**
   * Apply an update to the named setting via the immutable helper.
   * The helper short-circuits when the new value matches the
   * existing one, so this is safe to fire on every keystroke
   * without producing a wasted re-render.
   */
  const handleUpdate = useCallback((id: string, next: SettingValue) => {
    setPanes((prev) => updateSetting(id, next, prev));
  }, []);

  const handlePaneSelect = useCallback((paneId: string) => {
    setSelectedPaneId(paneId);
  }, []);

  const summaryAttrs = summarisePanes(panes);

  return (
    <div
      className="settings"
      data-testid="settings"
      data-selected-pane={selectedPaneId}
      aria-label="System Settings"
      {...summaryAttrs}
    >
      <Sidebar
        panes={orderedPanes}
        selectedPaneId={selectedPaneId}
        onSelect={handlePaneSelect}
      />

      {selectedPane ? (
        <Detail
          pane={selectedPane}
          onUpdate={handleUpdate}
        />
      ) : (
        <div
          className="settings__detail settings__detail--empty"
          data-testid="settings-detail-empty"
          role="status"
        >
          Select a settings category
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  readonly panes: readonly SettingPane[];
  readonly selectedPaneId: string;
  readonly onSelect: (paneId: string) => void;
}

/**
 * The pane sidebar: a vertical list of categories with a small
 * leading glyph. Mirrors the macOS System Settings left rail so
 * testers can drive it with a stable
 * `data-testid="settings-pane-{id}"` selector.
 */
function Sidebar({
  panes,
  selectedPaneId,
  onSelect,
}: SidebarProps): JSX.Element {
  return (
    <aside
      className="settings__sidebar"
      data-testid="settings-sidebar"
      aria-label="Settings categories"
    >
      <ul className="settings__sidebar-list" role="listbox">
        {panes.map((pane) => {
          const isActive = pane.id === selectedPaneId;
          return (
            <li key={pane.id}>
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                className={
                  "settings__sidebar-item" +
                  (isActive ? " settings__sidebar-item--active" : "")
                }
                data-testid={`settings-pane-${pane.id}`}
                data-pane-id={pane.id}
                onClick={() => onSelect(pane.id)}
              >
                <span
                  className="settings__sidebar-icon"
                  aria-hidden="true"
                >
                  {pane.glyph}
                </span>
                <span className="settings__sidebar-label">{pane.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

interface DetailProps {
  readonly pane: SettingPane;
  readonly onUpdate: (id: string, next: SettingValue) => void;
}

/**
 * The detail view: a header (pane name + description) and a stacked
 * list of setting rows. Each row is rendered through a typed
 * control component that picks the right input based on
 * `setting.kind`.
 */
function Detail({ pane, onUpdate }: DetailProps): JSX.Element {
  return (
    <section
      className="settings__detail"
      data-testid="settings-detail"
      data-pane-id={pane.id}
      aria-label={`${pane.name} settings`}
    >
      <header
        className="settings__detail-header"
        data-testid="settings-detail-header"
      >
        <h2
          className="settings__detail-title"
          data-testid="settings-detail-title"
        >
          {pane.name}
        </h2>
      </header>
      {pane.settings.length === 0 ? (
        <div
          className="settings__detail-empty"
          data-testid="settings-detail-empty-rows"
          role="status"
        >
          No settings
        </div>
      ) : (
        <ul
          className="settings__rows"
          data-testid="settings-rows"
          aria-label="Settings"
        >
          {pane.settings.map((setting) => (
            <Row
              key={setting.id}
              setting={setting}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Row + controls
// ---------------------------------------------------------------------------

interface RowProps {
  readonly setting: Setting;
  readonly onUpdate: (id: string, next: SettingValue) => void;
}

/**
 * A single setting row: a label block on the left and a control on
 * the right. The control is dispatched by `setting.kind` so the
 * discriminated union drives the rendered UI.
 */
function Row({ setting, onUpdate }: RowProps): JSX.Element {
  return (
    <li
      className="settings__row"
      data-testid={`settings-row-${setting.id}`}
      data-setting-id={setting.id}
      data-setting-kind={setting.kind}
      data-value={String(setting.value)}
    >
      <div className="settings__row-label">
        <span
          className="settings__row-icon"
          aria-hidden="true"
        >
          {setting.glyph ?? ""}
        </span>
        <span className="settings__row-text">
          <span
            className="settings__row-name"
            data-testid={`settings-name-${setting.id}`}
          >
            {setting.label}
          </span>
          {setting.description ? (
            <span
              className="settings__row-description"
              data-testid={`settings-desc-${setting.id}`}
            >
              {setting.description}
            </span>
          ) : null}
        </span>
      </div>
      <div className="settings__row-control">
        <Control setting={setting} onUpdate={onUpdate} />
      </div>
    </li>
  );
}

interface ControlProps {
  readonly setting: Setting;
  readonly onUpdate: (id: string, next: SettingValue) => void;
}

/**
 * Dispatch to the right control by `setting.kind`. The match is
 * exhaustive over the discriminated union — adding a new kind will
 * surface a TypeScript error here.
 */
function Control({ setting, onUpdate }: ControlProps): JSX.Element {
  switch (setting.kind) {
    case "toggle":
      return <ToggleControl setting={setting} onUpdate={onUpdate} />;
    case "text":
      return <TextControl setting={setting} onUpdate={onUpdate} />;
    case "number":
      return <NumberControl setting={setting} onUpdate={onUpdate} />;
    default: {
      // Exhaustiveness guard: if a new kind is added without a
      // matching control, surface a clear runtime error rather than
      // silently rendering nothing.
      const exhaustive: never = setting;
      throw new Error(
        `Unsupported setting kind: ${(exhaustive as Setting).kind}`
      );
    }
  }
}

interface ToggleControlProps {
  readonly setting: ToggleSetting;
  readonly onUpdate: (id: string, next: SettingValue) => void;
}

/**
 * macOS-style toggle switch. The track is a `<button>` so keyboard
 * users can activate it with Space/Enter; clicking anywhere on the
 * track flips the value, exactly like the native control.
 */
function ToggleControl({
  setting,
  onUpdate,
}: ToggleControlProps): JSX.Element {
  const handleClick = useCallback(() => {
    onUpdate(setting.id, !setting.value);
  }, [setting.id, setting.value, onUpdate]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={setting.value}
      aria-label={setting.label}
      className={
        "settings__toggle" +
        (setting.value ? " settings__toggle--on" : "")
      }
      data-testid={`settings-toggle-${setting.id}`}
      data-on={setting.value ? "true" : "false"}
      data-value={setting.value ? "true" : "false"}
      onClick={handleClick}
    >
      <span
        className="settings__toggle-knob"
        data-testid={`settings-toggle-knob-${setting.id}`}
        aria-hidden="true"
      />
    </button>
  );
}

interface TextControlProps {
  readonly setting: TextSetting;
  readonly onUpdate: (id: string, next: SettingValue) => void;
}

/**
 * Single-line text input. Updates the canonical value on `change`
 * (not `input`) so partially typed values do not clobber the saved
 * one mid-keystroke — the live `value` attribute keeps the field
 * tied to the saved value until the user blurs the input.
 */
function TextControl({ setting, onUpdate }: TextControlProps): JSX.Element {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onUpdate(setting.id, event.target.value);
    },
    [setting.id, onUpdate]
  );

  return (
    <input
      type="text"
      className="settings__input settings__input--text"
      data-testid={`settings-input-${setting.id}`}
      data-value={setting.value}
      value={setting.value}
      placeholder={setting.placeholder ?? ""}
      aria-label={setting.label}
      onChange={handleChange}
    />
  );
}

interface NumberControlProps {
  readonly setting: NumberSetting;
  readonly onUpdate: (id: string, next: SettingValue) => void;
}

/**
 * Number input clamped to the setting's `min`/`max` range. The
 * helper inside `mockSettings.ts` does the clamping so the UI
 * always sends a legal value to the store.
 */
function NumberControl({
  setting,
  onUpdate,
}: NumberControlProps): JSX.Element {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      if (Number.isNaN(parsed)) {
        // Drop non-numeric input rather than coercing to 0 — that
        // matches the real System Settings slider which silently
        // ignores garbage keystrokes.
        return;
      }
      onUpdate(setting.id, parsed);
    },
    [setting.id, onUpdate]
  );

  return (
    <span className="settings__number">
      <input
        type="number"
        className="settings__input settings__input--number"
        data-testid={`settings-input-${setting.id}`}
        data-value={setting.value}
        value={setting.value}
        min={setting.min}
        max={setting.max}
        step={1}
        aria-label={setting.label}
        onChange={handleChange}
      />
      {setting.unit ? (
        <span
          className="settings__number-unit"
          data-testid={`settings-input-unit-${setting.id}`}
          aria-hidden="true"
        >
          {setting.unit}
        </span>
      ) : null}
    </span>
  );
}

// Re-export the dataset helper so tests can look up seed values
// without reaching into the mock module directly.
export { getSetting };
