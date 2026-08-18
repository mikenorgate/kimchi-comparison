import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { APPS, getApp, type AppId } from "@/lib/apps";

/**
 * The jsdom viewport is 1024x768 by default. Override per-test where
 * needed; the maximized-rect computation reads window.innerWidth /
 * innerHeight at call time.
 */
const ORIGINAL_INNER_WIDTH = window.innerWidth;
const ORIGINAL_INNER_HEIGHT = window.innerHeight;

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
}

beforeEach(() => {
  setViewport(1280, 800);
});

afterEach(() => {
  setViewport(ORIGINAL_INNER_WIDTH, ORIGINAL_INNER_HEIGHT);
  vi.restoreAllMocks();
});

/**
 * These tests exercise the full Desktop composition (WindowManager +
 * Dock + MenuBar) to verify that Phase 2 step 4's integration works:
 *
 * - Clicking a Dock icon opens a window for that app.
 * - The MenuBar's active-app label tracks the focused window's app.
 * - Re-clicking a Dock icon for an already-running app focuses (and
 *   un-minimizes) the existing window rather than opening a duplicate.
 * - Closing/focusing windows updates both Dock running indicators and
 *   the MenuBar active-app label in lockstep.
 *
 * The Desktop boots with an initial Finder window seeded by the
 * WindowManager, so we account for that in assertions.
 */

describe("Desktop <-> WindowManager integration", () => {
  it("boots with a Finder window and marks Finder as the active MenuBar app", () => {
    render(<Desktop />);
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getByTestId("app-content-finder")).toBeInTheDocument();
    const active = screen.getByTestId("menu-bar-active-app");
    expect(active).toHaveTextContent(getApp("finder")?.name ?? "Finder");
  });

  it("clicking a Dock icon opens a window for that app and updates the MenuBar", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const safariButton = within(dock).getByRole("button", { name: "Safari" });
    expect(safariButton).toHaveAttribute("data-running", "false");

    fireEvent.click(safariButton);

    // The new window must now exist in the window layer.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getByTestId("app-content-safari")).toBeInTheDocument();

    // The MenuBar's active-app label should reflect the focused window.
    const active = screen.getByTestId("menu-bar-active-app");
    expect(active).toHaveTextContent(getApp("safari")?.name ?? "Safari");

    // And the Dock icon for Safari should now be flagged as running.
    expect(safariButton).toHaveAttribute("data-running", "true");
  });

  it("re-clicking an already-running Dock icon focuses the existing window instead of opening a duplicate", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const mailButton = within(dock).getByRole("button", { name: "Mail" });

    fireEvent.click(mailButton);
    fireEvent.click(mailButton);
    fireEvent.click(mailButton);

    // Exactly one Mail window should exist regardless of how many times
    // we clicked the icon.
    const layer = screen.getByTestId("window-layer");
    const mailFrames = within(layer).getAllByTestId("app-content-mail");
    expect(mailFrames).toHaveLength(1);

    // The MenuBar should show Mail as the active app.
    const active = screen.getByTestId("menu-bar-active-app");
    expect(active).toHaveTextContent(getApp("mail")?.name ?? "Mail");
  });

  it("opening multiple apps marks each as running in the Dock and tracks them in the MenuBar counter", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");

    // Open three apps; Finder is already running from boot.
    fireEvent.click(within(dock).getByRole("button", { name: "Calendar" }));
    fireEvent.click(within(dock).getByRole("button", { name: "Notes" }));
    fireEvent.click(within(dock).getByRole("button", { name: "Terminal" }));

    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getByTestId("app-content-finder")).toBeInTheDocument();
    expect(within(layer).getByTestId("app-content-calendar")).toBeInTheDocument();
    expect(within(layer).getByTestId("app-content-notes")).toBeInTheDocument();
    expect(within(layer).getByTestId("app-content-terminal")).toBeInTheDocument();

    // Four apps running now (Finder + 3 launched).
    expect(
      within(dock).getByRole("button", { name: "Calendar" })
    ).toHaveAttribute("data-running", "true");
    expect(
      within(dock).getByRole("button", { name: "Notes" })
    ).toHaveAttribute("data-running", "true");
    expect(
      within(dock).getByRole("button", { name: "Terminal" })
    ).toHaveAttribute("data-running", "true");

    // The MenuBar counter shows 4 (Finder boot + 3 launched).
    const counter = screen.getByTestId("menu-bar-running-count");
    expect(counter).toHaveTextContent("4");
    expect(counter).toHaveAttribute("aria-label", "4 apps running");

    // The most recently launched app (Terminal) should be active.
    const active = screen.getByTestId("menu-bar-active-app");
    expect(active).toHaveTextContent(getApp("terminal")?.name ?? "Terminal");
  });

  it("closing the focused window reassigns the MenuBar's active app to another open window", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    // Open two apps on top of the boot Finder.
    fireEvent.click(within(dock).getByRole("button", { name: "Safari" }));
    fireEvent.click(within(dock).getByRole("button", { name: "Notes" }));

    // Notes is the most recently focused — close it.
    const notesFrame = within(layer)
      .getByTestId("app-content-notes")
      .closest('[data-testid^="managed-window-"]') as HTMLElement;
    fireEvent.click(within(notesFrame).getByTestId("window-close"));

    // Notes window must be gone.
    expect(within(layer).queryByTestId("app-content-notes")).toBeNull();
    // The Notes Dock icon should no longer be running.
    expect(
      within(dock).getByRole("button", { name: "Notes" })
    ).toHaveAttribute("data-running", "false");

    // The MenuBar's active-app label should now reflect the next
    // most-recently-focused open window (Safari).
    const active = screen.getByTestId("menu-bar-active-app");
    expect(active).toHaveTextContent(getApp("safari")?.name ?? "Safari");
  });

  it("focusing a different window updates the MenuBar active-app label", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    // Open two apps on top of Finder.
    fireEvent.click(within(dock).getByRole("button", { name: "Safari" }));
    fireEvent.click(within(dock).getByRole("button", { name: "Photos" }));

    // Photos is active right now.
    expect(screen.getByTestId("menu-bar-active-app")).toHaveTextContent(
      getApp("photos")?.name ?? "Photos"
    );

    // Click on the Finder frame to focus it.
    const finderFrame = within(layer)
      .getByTestId("app-content-finder")
      .closest('[data-testid^="managed-window-"]') as HTMLElement;
    fireEvent.pointerDown(finderFrame, { pointerId: 1, button: 0 });

    // The MenuBar should now show Finder as active.
    expect(screen.getByTestId("menu-bar-active-app")).toHaveTextContent(
      getApp("finder")?.name ?? "Finder"
    );
  });

  it("minimizing the focused window hides it from the layer but keeps it in the running set", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    fireEvent.click(within(dock).getByRole("button", { name: "Mail" }));
    // Mail is active and visible.
    expect(within(layer).getByTestId("app-content-mail")).toBeInTheDocument();

    const mailFrame = within(layer)
      .getByTestId("app-content-mail")
      .closest('[data-testid^="managed-window-"]') as HTMLElement;
    fireEvent.click(within(mailFrame).getByTestId("window-minimize"));

    // The Mail window should be hidden from the DOM.
    expect(within(layer).queryByTestId("app-content-mail")).toBeNull();

    // But Mail is still "running" (Dock indicator on, running counter
    // still includes it).
    expect(
      within(dock).getByRole("button", { name: "Mail" })
    ).toHaveAttribute("data-running", "true");
    expect(screen.getByTestId("menu-bar-running-count")).toHaveTextContent(
      "2"
    );

    // The active app should have fallen back to Finder (the boot
    // window) once Mail was minimized.
    expect(screen.getByTestId("menu-bar-active-app")).toHaveTextContent(
      getApp("finder")?.name ?? "Finder"
    );
  });

  it("clicking a minimized app's Dock icon restores and focuses the existing window", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    // Open Calendar, then minimize it via its traffic light.
    fireEvent.click(within(dock).getByRole("button", { name: "Calendar" }));
    const calFrame = within(layer)
      .getByTestId("app-content-calendar")
      .closest('[data-testid^="managed-window-"]') as HTMLElement;
    fireEvent.click(within(calFrame).getByTestId("window-minimize"));

    expect(within(layer).queryByTestId("app-content-calendar")).toBeNull();

    // Click the Calendar Dock icon again — should focus (restore) the
    // existing window instead of opening a duplicate.
    fireEvent.click(within(dock).getByRole("button", { name: "Calendar" }));

    const restoredFrames = within(layer).getAllByTestId(
      "app-content-calendar"
    );
    expect(restoredFrames).toHaveLength(1);
    expect(screen.getByTestId("menu-bar-active-app")).toHaveTextContent(
      getApp("calendar")?.name ?? "Calendar"
    );
  });

  it("keeps Dock running indicators and MenuBar counter in sync as windows open and close", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    // Initially: Finder only (1 running).
    expect(screen.getByTestId("menu-bar-running-count")).toHaveTextContent(
      "1"
    );

    // Open Safari, then close it. Counter should return to 1.
    fireEvent.click(within(dock).getByRole("button", { name: "Safari" }));
    expect(screen.getByTestId("menu-bar-running-count")).toHaveTextContent(
      "2"
    );
    expect(
      within(dock).getByRole("button", { name: "Safari" })
    ).toHaveAttribute("data-running", "true");

    const safariFrame = within(layer)
      .getByTestId("app-content-safari")
      .closest('[data-testid^="managed-window-"]') as HTMLElement;
    fireEvent.click(within(safariFrame).getByTestId("window-close"));

    expect(within(layer).queryByTestId("app-content-safari")).toBeNull();
    expect(
      within(dock).getByRole("button", { name: "Safari" })
    ).toHaveAttribute("data-running", "false");
    expect(screen.getByTestId("menu-bar-running-count")).toHaveTextContent(
      "1"
    );
  });

  it("falls back to the default active app (Finder) when all windows close", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    // Close the boot Finder window.
    const finderFrame = within(layer)
      .getByTestId("app-content-finder")
      .closest('[data-testid^="managed-window-"]') as HTMLElement;
    fireEvent.click(within(finderFrame).getByTestId("window-close"));

    expect(within(layer).queryByTestId("app-content-finder")).toBeNull();

    // No apps are running.
    expect(screen.queryByTestId("menu-bar-running-count")).toBeNull();

    // The MenuBar's active-app label should fall back to Finder so
    // the shell always has a foreground app name to display.
    const active = screen.getByTestId("menu-bar-active-app");
    expect(active).toHaveTextContent(getApp("finder")?.name ?? "Finder");

    // Clicking any Dock icon after the desktop is bare should open a
    // fresh window and bring the corresponding app to the front.
    fireEvent.click(within(dock).getByRole("button", { name: "Calculator" }));
    expect(within(layer).getByTestId("app-content-calculator")).toBeInTheDocument();
    expect(screen.getByTestId("menu-bar-active-app")).toHaveTextContent(
      getApp("calculator")?.name ?? "Calculator"
    );
  });

  it("renders every Dock app's launch path through the manager (covers all registered apps)", () => {
    // Walk the registry: for each app, opening it via the Dock must
    // surface its window in the layer and mark its Dock icon as
    // running. We unmount between iterations so the state stays
    // isolated.
    const samples: AppId[] = APPS.map((a) => a.id);
    for (const id of samples) {
      const { unmount } = render(<Desktop />);
      const dock = screen.getByTestId("dock");
      const layer = screen.getByTestId("window-layer");

      fireEvent.click(within(dock).getByRole("button", { name: getApp(id)?.name ?? id }));

      expect(within(layer).getByTestId(`app-content-${id}`)).toBeInTheDocument();
      expect(
        within(dock).getByRole("button", { name: getApp(id)?.name ?? id })
      ).toHaveAttribute("data-running", "true");

      unmount();
    }
  });

  it("does not throw when launching an app whose window is open but minimized", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    // Open Settings, minimize it, then re-click its Dock icon.
    fireEvent.click(within(dock).getByRole("button", { name: "System Settings" }));
    const settingsFrame = within(layer)
      .getByTestId("app-content-settings")
      .closest('[data-testid^="managed-window-"]') as HTMLElement;
    fireEvent.click(within(settingsFrame).getByTestId("window-minimize"));

    expect(within(layer).queryByTestId("app-content-settings")).toBeNull();

    // Should focus (restore) without throwing or opening a duplicate.
    expect(() =>
      fireEvent.click(within(dock).getByRole("button", { name: "System Settings" }))
    ).not.toThrow();

    const settingsFrames = within(layer).getAllByTestId(
      "app-content-settings"
    );
    expect(settingsFrames).toHaveLength(1);
    expect(screen.getByTestId("menu-bar-active-app")).toHaveTextContent(
      getApp("settings")?.name ?? "System Settings"
    );
  });

  it("the Dock launching flow is idempotent across rapid consecutive clicks", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const layer = screen.getByTestId("window-layer");

    // Rapid-fire clicks on the same icon should never open duplicate
    // windows for the same app.
    const terminalButton = within(dock).getByRole("button", { name: "Terminal" });
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(terminalButton);
    }

    expect(within(layer).getAllByTestId("app-content-terminal")).toHaveLength(
      1
    );
    expect(terminalButton).toHaveAttribute("data-running", "true");
  });

  it("re-rendering the desktop preserves the existing window manager state", () => {
    const { rerender } = render(<Desktop />);
    const dock = screen.getByTestId("dock");
    fireEvent.click(within(dock).getByRole("button", { name: "Photos" }));

    expect(
      within(dock).getByRole("button", { name: "Photos" })
    ).toHaveAttribute("data-running", "true");

    // Re-render (simulating a parent update). State must persist.
    act(() => {
      rerender(<Desktop />);
    });

    expect(
      within(dock).getByRole("button", { name: "Photos" })
    ).toHaveAttribute("data-running", "true");
    expect(screen.getByTestId("menu-bar-active-app")).toHaveTextContent(
      getApp("photos")?.name ?? "Photos"
    );
  });
});
