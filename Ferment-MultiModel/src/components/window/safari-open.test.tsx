import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";

/**
 * Behavioral test for Step 3 of Phase 4: clicking the Safari Dock icon
 * must mount a Safari window whose content is the real Safari UI
 * (toolbar, address bar, web-view area), not just the app's display
 * name.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Safari: click the Safari Dock icon and verify the Safari UI is
 * present inside the window layer.
 */
describe("Safari opens from the Dock", () => {
  it("clicking the Safari Dock icon opens a Safari window with the real Safari UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const safariDockButton = within(dock).getByRole("button", {
      name: getApp("safari")?.name ?? "Safari",
    });

    // Before launch, Safari is not running.
    expect(safariDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(safariDockButton);

    // After launch, the Dock should mark Safari as running.
    expect(safariDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Safari window frame.
    const layer = screen.getByTestId("window-layer");
    const safariContent = within(layer).getByTestId("app-content-safari");

    // Inside that frame, the real Safari component must be present
    // (not just the app name as a placeholder body).
    expect(within(safariContent).getByTestId("safari")).toBeInTheDocument();

    // The three regions the user expects from the Safari window UI:
    // a toolbar (chrome buttons + address bar), an address bar input,
    // and a web-view area that hosts the sandboxed iframe.
    expect(
      within(safariContent).getByTestId("safari-toolbar")
    ).toBeInTheDocument();
    expect(
      within(safariContent).getByTestId("safari-address")
    ).toBeInTheDocument();
    expect(
      within(safariContent).getByTestId("safari-webview")
    ).toBeInTheDocument();

    // The address bar must have a non-empty default URL on first
    // paint so the window looks "live" the moment it appears.
    const addressBar = within(safariContent).getByTestId(
      "safari-address"
    ) as HTMLInputElement;
    expect(addressBar.value).not.toBe("");

    // The web-view area should expose its current URL via
    // `data-webview-url`, mirroring the address bar value.
    const webview = within(safariContent).getByTestId("safari-webview");
    expect(webview.getAttribute("data-webview-url")).toBe(addressBar.value);
  });

  it("does not duplicate the Safari window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const safariDockButton = within(dock).getByRole("button", {
      name: getApp("safari")?.name ?? "Safari",
    });

    fireEvent.click(safariDockButton);
    fireEvent.click(safariDockButton);
    fireEvent.click(safariDockButton);

    // Exactly one Safari window should exist regardless of how many
    // times the user clicked the icon — Dock clicks on a running app
    // focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-safari")).toHaveLength(1);
  });

  it("committing a new URL via the address bar updates the Safari window's web-view", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const safariDockButton = within(dock).getByRole("button", {
      name: getApp("safari")?.name ?? "Safari",
    });
    fireEvent.click(safariDockButton);

    const layer = screen.getByTestId("window-layer");
    const safariContent = within(layer).getByTestId("app-content-safari");
    const addressBar = within(safariContent).getByTestId(
      "safari-address"
    ) as HTMLInputElement;

    const originalUrl = addressBar.value;
    const targetUrl = "https://duckduckgo.com";

    // Sanity check: the test fixture should not collide with the
    // target URL we're about to navigate to.
    expect(originalUrl).not.toBe(targetUrl);

    fireEvent.change(addressBar, { target: { value: targetUrl } });
    expect(addressBar.value).toBe(targetUrl);

    fireEvent.keyDown(addressBar, { key: "Enter" });

    // After committing, both the input value and the web-view's
    // `data-webview-url` must reflect the new URL.
    expect(addressBar.value).toBe(targetUrl);
    const webview = within(safariContent).getByTestId("safari-webview");
    expect(webview.getAttribute("data-webview-url")).toBe(targetUrl);
  });
});
