import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";
import {
  PANE_ORDER,
  initialMockSettings,
} from "@/components/apps/settings/mockSettings";

/**
 * Behavioural test for Step 5 of Phase 7: clicking the System Settings
 * Dock icon must mount a Settings window whose body is the real
 * Settings UI (pane sidebar + detail rows), not the placeholder that
 * {@link src/components/window/WindowManager.tsx} falls back to when
 * an app has no registered component.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Settings: click the Settings Dock icon and verify the real Settings
 * UI is present inside the window layer.
 */
describe("System Settings opens from the Dock", () => {
  it("clicking the Settings Dock icon opens a Settings window with the real Settings UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const settingsDockButton = within(dock).getByRole("button", {
      name: getApp("settings")?.name ?? "System Settings",
    });

    // Before launch, Settings is not running.
    expect(settingsDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(settingsDockButton);

    // After launch, the Dock should mark Settings as running.
    expect(settingsDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Settings window frame.
    const layer = screen.getByTestId("window-layer");
    const settingsContent = within(layer).getByTestId("app-content-settings");

    // Inside that frame, the real Settings component must be present
    // (not the window-manager placeholder body).
    expect(within(settingsContent).getByTestId("settings")).toBeInTheDocument();
    expect(
      within(settingsContent).queryByTestId("app-placeholder-settings")
    ).not.toBeInTheDocument();

    // The two regions the user expects from the Settings window:
    // a sidebar listing each pane, and a detail region with the
    // settings for the currently selected pane.
    expect(
      within(settingsContent).getByTestId("settings-sidebar")
    ).toBeInTheDocument();
    expect(
      within(settingsContent).getByTestId("settings-detail")
    ).toBeInTheDocument();
  });

  it("renders one sidebar pane entry per seeded pane in canonical order", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const settingsDockButton = within(dock).getByRole("button", {
      name: getApp("settings")?.name ?? "System Settings",
    });
    fireEvent.click(settingsDockButton);

    const layer = screen.getByTestId("window-layer");
    const settingsContent = within(layer).getByTestId("app-content-settings");
    const sidebar = within(settingsContent).getByTestId("settings-sidebar");

    const paneIds = PANE_ORDER.filter((id) =>
      initialMockSettings.some((pane) => pane.id === id)
    );
    for (const id of paneIds) {
      expect(within(sidebar).getByTestId(`settings-pane-${id}`))
        .toBeInTheDocument();
    }

    // The root element exposes the currently selected pane id.
    const root = within(settingsContent).getByTestId("settings");
    const selected = root.getAttribute("data-selected-pane");
    expect(paneIds).toContain(selected);
  });

  it("selecting a different sidebar pane swaps the detail view to that pane's rows", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const settingsDockButton = within(dock).getByRole("button", {
      name: getApp("settings")?.name ?? "System Settings",
    });
    fireEvent.click(settingsDockButton);

    const layer = screen.getByTestId("window-layer");
    const settingsContent = within(layer).getByTestId("app-content-settings");
    const sidebar = within(settingsContent).getByTestId("settings-sidebar");

    // Pick a non-default pane to switch to (avoid the first entry,
    // which is the boot selection).
    expect(PANE_ORDER.length).toBeGreaterThan(1);
    const targetPaneId = PANE_ORDER[1]!;
    const targetButton = within(sidebar).getByTestId(
      `settings-pane-${targetPaneId}`
    );
    fireEvent.click(targetButton);

    // The root must report the new selection.
    const root = within(settingsContent).getByTestId("settings");
    expect(root.getAttribute("data-selected-pane")).toBe(targetPaneId);

    // The detail region must now include the rows belonging to that
    // pane.
    const detail = within(settingsContent).getByTestId("settings-detail");
    const rows = within(detail).queryAllByTestId(/^settings-row-/);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("flipping a toggle setting updates the value exposed on the Settings root", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const settingsDockButton = within(dock).getByRole("button", {
      name: getApp("settings")?.name ?? "System Settings",
    });
    fireEvent.click(settingsDockButton);

    const layer = screen.getByTestId("window-layer");
    const settingsContent = within(layer).getByTestId("app-content-settings");

    // Find any toggle setting that exists in the seed dataset.
    let toggleId: string | null = null;
    for (const pane of initialMockSettings) {
      for (const setting of pane.settings) {
        if (setting.kind === "toggle") {
          toggleId = setting.id;
          break;
        }
      }
      if (toggleId) break;
    }
    expect(toggleId).not.toBeNull();

    const root = within(settingsContent).getByTestId("settings");
    const before = root.getAttribute(`data-setting-${toggleId}`);
    expect(before).not.toBeNull();

    // The toggle control itself sits inside the detail region of the
    // selected pane; query the whole Settings content for it.
    const toggle = within(settingsContent).getByTestId(
      `settings-toggle-${toggleId}`
    );
    fireEvent.click(toggle);

    const after = root.getAttribute(`data-setting-${toggleId}`);
    expect(after).not.toBeNull();
    expect(after).not.toBe(before);
  });

  it("does not duplicate the Settings window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const settingsDockButton = within(dock).getByRole("button", {
      name: getApp("settings")?.name ?? "System Settings",
    });

    fireEvent.click(settingsDockButton);
    fireEvent.click(settingsDockButton);
    fireEvent.click(settingsDockButton);

    // Exactly one Settings window should exist regardless of how many
    // times the user clicked the icon — Dock clicks on a running app
    // focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-settings")).toHaveLength(
      1
    );
  });
});
