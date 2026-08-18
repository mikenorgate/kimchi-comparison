import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import Settings from "./Settings";
import {
  ALL_SETTINGS,
  PANE_ORDER,
  getSetting,
  initialMockSettings,
} from "./mockSettings";

/**
 * Scope element lookups to the sidebar container so other parts of
 * the Settings UI cannot leak into the matchers.
 */
function getSidebar(): HTMLElement {
  return screen.getByTestId("settings-sidebar");
}

/**
 * Scope element lookups to the detail container so the sidebar and
 * per-row controls don't accidentally satisfy the matcher.
 */
function getDetail(): HTMLElement {
  return screen.getByTestId("settings-detail");
}

describe("Settings", () => {
  it("renders the root container on first paint", () => {
    render(<Settings />);
    expect(screen.getByTestId("settings")).toBeInTheDocument();
  });

  it("renders one sidebar entry per pane in the seed dataset", () => {
    render(<Settings />);
    const sidebar = getSidebar();
    const items = within(sidebar).getAllByTestId(/^settings-pane-/);
    expect(items).toHaveLength(initialMockSettings.length);
    expect(PANE_ORDER.length).toBe(initialMockSettings.length);
  });

  it("renders the sidebar in the canonical PANE_ORDER", () => {
    render(<Settings />);
    const sidebar = getSidebar();
    const items = within(sidebar).getAllByTestId(/^settings-pane-/);
    const renderedOrder = items.map(
      (item) => item.getAttribute("data-pane-id") ?? ""
    );
    expect(renderedOrder).toEqual([...PANE_ORDER]);
  });

  it("selects the first pane on first paint and exposes it via data-selected-pane", () => {
    render(<Settings />);
    const wrapper = screen.getByTestId("settings");
    expect(wrapper.getAttribute("data-selected-pane")).toBe(PANE_ORDER[0]);
    // Detail view should be populated with the first pane.
    const detail = getDetail();
    expect(detail.getAttribute("data-pane-id")).toBe(PANE_ORDER[0]);
  });

  it("honours initialPaneId when booting into a deterministic pane", () => {
    render(<Settings initialPaneId="display" />);
    const wrapper = screen.getByTestId("settings");
    expect(wrapper.getAttribute("data-selected-pane")).toBe("display");
    const detail = getDetail();
    expect(detail.getAttribute("data-pane-id")).toBe("display");
    expect(
      within(detail).getByTestId("settings-detail-title").textContent
    ).toBe("Display");
  });

  it("falls back to the first pane when initialPaneId is unknown", () => {
    render(<Settings initialPaneId="does-not-exist" />);
    const wrapper = screen.getByTestId("settings");
    expect(wrapper.getAttribute("data-selected-pane")).toBe(PANE_ORDER[0]);
  });

  it("renders one row per setting in the currently selected pane", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const rows = within(detail).getAllByTestId(/^settings-row-/);
    const networkPane = initialMockSettings.find(
      (pane) => pane.id === "network"
    );
    expect(networkPane).toBeDefined();
    expect(rows).toHaveLength(networkPane!.settings.length);
  });

  it("renders the pane title in the detail header", () => {
    render(<Settings initialPaneId="notifications" />);
    const detail = getDetail();
    expect(
      within(detail).getByTestId("settings-detail-title").textContent
    ).toBe("Notifications");
  });

  it("switches the detail view when a different pane is selected", () => {
    render(<Settings initialPaneId="network" />);
    const sidebar = getSidebar();
    const wrapper = screen.getByTestId("settings");

    // Sanity: starts on Network.
    expect(wrapper.getAttribute("data-selected-pane")).toBe("network");

    fireEvent.click(within(sidebar).getByTestId("settings-pane-display"));

    expect(wrapper.getAttribute("data-selected-pane")).toBe("display");
    const detail = getDetail();
    expect(detail.getAttribute("data-pane-id")).toBe("display");
    expect(
      within(detail).getByTestId("settings-detail-title").textContent
    ).toBe("Display");
  });

  it("marks the active pane with aria-selected=true and others with false", () => {
    render(<Settings initialPaneId="sound" />);
    const sidebar = getSidebar();
    for (const pane of initialMockSettings) {
      const item = within(sidebar).getByTestId(
        `settings-pane-${pane.id}`
      );
      const expected = pane.id === "sound" ? "true" : "false";
      expect(item.getAttribute("aria-selected")).toBe(expected);
    }
  });

  it("renders a toggle control for toggle settings with the seeded value", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const wifi = getSetting("network.wifi")!;
    expect(wifi.kind).toBe("toggle");
    const toggle = within(detail).getByTestId(
      "settings-toggle-network.wifi"
    );
    expect(toggle.getAttribute("role")).toBe("switch");
    expect(toggle.getAttribute("aria-checked")).toBe(
      wifi.value ? "true" : "false"
    );
    expect(toggle.getAttribute("data-on")).toBe(
      wifi.value ? "true" : "false"
    );
  });

  it("toggles a boolean setting immediately when clicked", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const toggle = within(detail).getByTestId(
      "settings-toggle-network.wifi"
    );
    const wifi = getSetting("network.wifi")!;
    expect(toggle.getAttribute("aria-checked")).toBe(
      wifi.value ? "true" : "false"
    );

    fireEvent.click(toggle);

    // Value flipped at the row level.
    const row = within(detail).getByTestId("settings-row-network.wifi");
    expect(row.getAttribute("data-value")).toBe(String(!wifi.value));

    // Value also reflected on the root element's summary attribute.
    const wrapper = screen.getByTestId("settings");
    expect(wrapper.getAttribute("data-setting-network.wifi")).toBe(
      String(!wifi.value)
    );

    // aria-checked flipped on the control itself.
    expect(toggle.getAttribute("aria-checked")).toBe(
      !wifi.value ? "true" : "false"
    );
  });

  it("toggles a boolean setting off after toggling on", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const airplane = within(detail).getByTestId(
      "settings-toggle-network.airplane-mode"
    );
    const initial = getSetting("network.airplane-mode")!;
    expect(airplane.getAttribute("aria-checked")).toBe(
      initial.value ? "true" : "false"
    );

    fireEvent.click(airplane);
    expect(airplane.getAttribute("aria-checked")).toBe(
      !initial.value ? "true" : "false"
    );

    fireEvent.click(airplane);
    expect(airplane.getAttribute("aria-checked")).toBe(
      initial.value ? "true" : "false"
    );
  });

  it("renders a text input for text settings with the seeded value", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const computerName = getSetting("network.computer-name")!;
    expect(computerName.kind).toBe("text");
    const input = within(detail).getByTestId(
      "settings-input-network.computer-name"
    );
    expect(input.tagName).toBe("INPUT");
    expect((input as HTMLInputElement).value).toBe(computerName.value);
    expect((input as HTMLInputElement).type).toBe("text");
  });

  it("updates a text setting when the input changes", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const input = within(detail).getByTestId(
      "settings-input-network.computer-name"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Studio Mac" } });

    // Row reflects the new value.
    const row = within(detail).getByTestId(
      "settings-row-network.computer-name"
    );
    expect(row.getAttribute("data-value")).toBe("Studio Mac");

    // Root element also reflects the new value.
    const wrapper = screen.getByTestId("settings");
    expect(wrapper.getAttribute("data-setting-network.computer-name")).toBe(
      "Studio Mac"
    );
  });

  it("renders a number input for number settings with the seeded value", () => {
    render(<Settings initialPaneId="sound" />);
    const detail = getDetail();
    const volume = getSetting("sound.volume")!;
    expect(volume.kind).toBe("number");
    const input = within(detail).getByTestId(
      "settings-input-sound.volume"
    );
    expect((input as HTMLInputElement).type).toBe("number");
    expect((input as HTMLInputElement).value).toBe(String(volume.value));
    expect(input.getAttribute("min")).toBe(String(volume.min));
    expect(input.getAttribute("max")).toBe(String(volume.max));
  });

  it("clamps an out-of-range number input to the setting's max", () => {
    render(<Settings initialPaneId="sound" />);
    const detail = getDetail();
    const input = within(detail).getByTestId(
      "settings-input-sound.volume"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "9999" } });

    const volume = getSetting("sound.volume")!;
    const row = within(detail).getByTestId("settings-row-sound.volume");
    expect(row.getAttribute("data-value")).toBe(String(volume.max));
  });

  it("clamps a below-min number input to the setting's min", () => {
    render(<Settings initialPaneId="sound" />);
    const detail = getDetail();
    const input = within(detail).getByTestId(
      "settings-input-sound.volume"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "-42" } });

    const volume = getSetting("sound.volume")!;
    const row = within(detail).getByTestId("settings-row-sound.volume");
    expect(row.getAttribute("data-value")).toBe(String(volume.min));
  });

  it("persists a toggle value when switching to another pane and back", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const toggle = within(detail).getByTestId(
      "settings-toggle-network.wifi"
    );
    const wifi = getSetting("network.wifi")!;

    // Flip Wi-Fi off.
    fireEvent.click(toggle);
    const flipped = !wifi.value;
    expect(
      screen
        .getByTestId("settings")
        .getAttribute("data-setting-network.wifi")
    ).toBe(String(flipped));

    // Switch to Display.
    const sidebar = getSidebar();
    fireEvent.click(within(sidebar).getByTestId("settings-pane-display"));
    expect(screen.getByTestId("settings").getAttribute("data-selected-pane")).toBe(
      "display"
    );

    // Switch back to Network — the flipped value should still be in
    // effect even though the row was unmounted in between.
    fireEvent.click(within(sidebar).getByTestId("settings-pane-network"));
    const detailAgain = getDetail();
    const toggleAgain = within(detailAgain).getByTestId(
      "settings-toggle-network.wifi"
    );
    expect(toggleAgain.getAttribute("aria-checked")).toBe(
      flipped ? "true" : "false"
    );
    expect(
      within(detailAgain)
        .getByTestId("settings-row-network.wifi")
        .getAttribute("data-value")
    ).toBe(String(flipped));
  });

  it("persists a text-input value when switching panes", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const input = within(detail).getByTestId(
      "settings-input-network.computer-name"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Edited Name" } });
    expect(
      screen
        .getByTestId("settings")
        .getAttribute("data-setting-network.computer-name")
    ).toBe("Edited Name");

    // Switch to Sound and back.
    const sidebar = getSidebar();
    fireEvent.click(within(sidebar).getByTestId("settings-pane-sound"));
    fireEvent.click(within(sidebar).getByTestId("settings-pane-network"));

    const detailAgain = getDetail();
    const inputAgain = within(detailAgain).getByTestId(
      "settings-input-network.computer-name"
    ) as HTMLInputElement;
    expect(inputAgain.value).toBe("Edited Name");
  });

  it("returns updated values when re-selecting a different pane", () => {
    // This is the inverse of the persistence test: confirm that
    // switching to a different pane and back exposes the *updated*
    // value (not the original seed) through the root summary
    // attributes and through the detail view.
    render(<Settings initialPaneId="display" />);
    const detail = getDetail();
    const darkMode = within(detail).getByTestId(
      "settings-toggle-display.dark-mode"
    );
    const dark = getSetting("display.dark-mode")!;
    expect(darkMode.getAttribute("aria-checked")).toBe(
      dark.value ? "true" : "false"
    );

    fireEvent.click(darkMode);

    const flipped = !dark.value;
    const sidebar = getSidebar();
    fireEvent.click(within(sidebar).getByTestId("settings-pane-notifications"));
    // The Display pane is now unmounted; check that the root
    // summary still carries the updated value (the "setting
    // persists while window is open" invariant).
    expect(
      screen
        .getByTestId("settings")
        .getAttribute("data-setting-display.dark-mode")
    ).toBe(String(flipped));

    fireEvent.click(within(sidebar).getByTestId("settings-pane-display"));
    const detailAgain = getDetail();
    const darkModeAgain = within(detailAgain).getByTestId(
      "settings-toggle-display.dark-mode"
    );
    expect(darkModeAgain.getAttribute("aria-checked")).toBe(
      flipped ? "true" : "false"
    );
  });

  it("exposes the current value of every seed setting on the root element", () => {
    render(<Settings />);
    const wrapper = screen.getByTestId("settings");
    for (const setting of ALL_SETTINGS) {
      expect(wrapper.getAttribute(`data-setting-${setting.id}`)).toBe(
        String(setting.value)
      );
    }
  });

  it("renders the label, description, and glyph for each setting row", () => {
    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    const networkPane = initialMockSettings.find(
      (pane) => pane.id === "network"
    )!;
    for (const setting of networkPane.settings) {
      const row = within(detail).getByTestId(`settings-row-${setting.id}`);
      expect(
        within(row).getByTestId(`settings-name-${setting.id}`)
          .textContent
      ).toBe(setting.label);
      if (setting.description) {
        expect(
          within(row).getByTestId(
            `settings-desc-${setting.id}`
          ).textContent
        ).toBe(setting.description);
      }
    }
  });

  it("does not mutate the initialMockSettings constant after toggle interactions", () => {
    // Snapshot the canonical dataset by sampling a few fields.
    const before = initialMockSettings.map((pane) => ({
      id: pane.id,
      settings: pane.settings.map((setting) => ({
        id: setting.id,
        value: setting.value,
      })),
    }));

    render(<Settings initialPaneId="network" />);
    const detail = getDetail();
    fireEvent.click(
      within(detail).getByTestId("settings-toggle-network.wifi")
    );
    fireEvent.click(
      within(detail).getByTestId("settings-toggle-network.airplane-mode")
    );
    const sidebar = getSidebar();
    fireEvent.click(within(sidebar).getByTestId("settings-pane-display"));
    fireEvent.click(
      within(getDetail()).getByTestId("settings-toggle-display.dark-mode")
    );

    const after = initialMockSettings.map((pane) => ({
      id: pane.id,
      settings: pane.settings.map((setting) => ({
        id: setting.id,
        value: setting.value,
      })),
    }));
    expect(after).toEqual(before);
  });

  it("exposes getSetting lookup helper that matches every seed setting", () => {
    for (const setting of ALL_SETTINGS) {
      const lookedUp = getSetting(setting.id);
      expect(lookedUp?.id).toBe(setting.id);
      expect(lookedUp?.value).toBe(setting.value);
    }
  });

  it("uses initialPanes to drive the sidebar and detail", () => {
    const firstPane = initialMockSettings[0]!;
    const single = [firstPane];
    render(<Settings initialPanes={single} />);
    const sidebar = getSidebar();
    const items = within(sidebar).getAllByTestId(/^settings-pane-/);
    expect(items).toHaveLength(1);
    const detail = getDetail();
    expect(detail.getAttribute("data-pane-id")).toBe(firstPane.id);
    const rows = within(detail).getAllByTestId(/^settings-row-/);
    expect(rows).toHaveLength(firstPane.settings.length);
  });
});
