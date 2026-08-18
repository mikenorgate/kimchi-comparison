import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";

/**
 * Behavioral test for Step 4 of Phase 3: clicking the Finder Dock icon
 * must mount a Finder window whose content is the real Finder UI
 * (sidebar favorites, breadcrumb, and file list), not just the app's
 * display name.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would after first
 * signing in: click the Finder Dock icon and verify the Finder UI is
 * present inside the window layer.
 */
describe("Finder opens from the Dock", () => {
  it("renders the Finder window content inside the boot Finder window", () => {
    render(<Desktop />);

    const layer = screen.getByTestId("window-layer");
    const finderContent = within(layer).getByTestId("app-content-finder");

    // The Finder component exposes its root via data-testid="finder".
    // Finding it scoped inside `app-content-finder` proves the window
    // manager is mounting the real Finder component (not just the
    // app name as a placeholder body).
    expect(within(finderContent).getByTestId("finder")).toBeInTheDocument();

    // Finder's three main regions should be present.
    expect(within(finderContent).getByTestId("finder-sidebar")).toBeInTheDocument();
    expect(within(finderContent).getByTestId("finder-breadcrumb")).toBeInTheDocument();
    expect(within(finderContent).getByTestId("finder-list")).toBeInTheDocument();
  });

  it("clicking the Finder Dock icon focuses the existing Finder window with Finder content visible", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const finderDockButton = within(dock).getByRole("button", {
      name: getApp("finder")?.name ?? "Finder",
    });
    expect(finderDockButton).toHaveAttribute("data-running", "true");

    fireEvent.click(finderDockButton);

    const layer = screen.getByTestId("window-layer");
    const finderContent = within(layer).getByTestId("app-content-finder");
    expect(within(finderContent).getByTestId("finder")).toBeInTheDocument();

    // Finder should still expose a sidebar with at least one favorite.
    expect(within(finderContent).getByTestId("finder-sidebar")).toBeInTheDocument();
    expect(
      within(finderContent).getByTestId("finder-favorite-Documents")
    ).toBeInTheDocument();

    // Exactly one Finder window should exist — clicking the Dock icon
    // of an already-running app focuses the existing window rather
    // than opening a duplicate.
    expect(within(layer).getAllByTestId("app-content-finder")).toHaveLength(1);
  });

  it("renders a Finder window with breadcrumb reflecting the current folder", () => {
    render(<Desktop />);

    const layer = screen.getByTestId("window-layer");
    const finderContent = within(layer).getByTestId("app-content-finder");
    const breadcrumb = within(finderContent).getByTestId("finder-breadcrumb");

    // Finder defaults to /Documents on first paint, so the breadcrumb
    // must include the root ("Macintosh HD") and the Documents
    // segment.
    const crumbPaths = within(breadcrumb)
      .getAllByTestId("finder-crumb")
      .map((node) => node.getAttribute("data-crumb-path"));
    expect(crumbPaths.length).toBeGreaterThanOrEqual(2);
    expect(crumbPaths[0]).toBe("/");
    expect(crumbPaths).toContain("/Documents");
  });
});
