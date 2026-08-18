import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "./Desktop";
import { APPS, getApp } from "@/lib/apps";

describe("Desktop", () => {
  it("renders the desktop root container with the wallpaper", () => {
    const { container } = render(<Desktop />);
    expect(screen.getByTestId("desktop-root")).toBeInTheDocument();
    expect(container.querySelector(".wallpaper")).not.toBeNull();
  });

  it("renders the MenuBar and Dock together", () => {
    render(<Desktop />);
    // MenuBar at the top of the viewport.
    const menuBar = screen.getByTestId("menu-bar");
    expect(menuBar).toBeInTheDocument();
    expect(menuBar.tagName).toBe("HEADER");

    // Dock at the bottom, exposing one button per registered app. We
    // scope the button lookup to the Dock so it cannot collide with
    // the MenuBar's active-app menu button, which has matching text.
    const dock = screen.getByTestId("dock");
    expect(dock).toBeInTheDocument();
    expect(dock.tagName).toBe("NAV");

    for (const app of APPS) {
      expect(
        within(dock).getByRole("button", { name: app.name })
      ).toBeInTheDocument();
    }
    expect(
      within(dock).getAllByRole("button").length
    ).toBeGreaterThanOrEqual(APPS.length);
  });

  it("renders a window-layer slot ready for the future window manager", () => {
    render(<Desktop />);
    const layer = screen.getByTestId("window-layer");
    expect(layer).toBeInTheDocument();
    expect(layer).toHaveAttribute("aria-label", "Desktop window layer");
  });

  it("clicking a Dock icon updates the active app shown in the MenuBar", () => {
    render(<Desktop />);

    // Sanity-check: shell boots with Finder as the default active app.
    const initialActive = screen.getByTestId("menu-bar-active-app");
    const finderName = getApp("finder")?.name ?? "Finder";
    expect(initialActive).toHaveTextContent(finderName);

    // Click the Safari icon in the Dock. This should propagate through
    // the shared shell state and re-render the MenuBar with Safari as
    // the active app.
    const dock = screen.getByTestId("dock");
    const safariButton = within(dock).getByRole("button", { name: "Safari" });
    fireEvent.click(safariButton);

    const updatedActive = screen.getByTestId("menu-bar-active-app");
    const safariName = getApp("safari")?.name ?? "Safari";
    expect(updatedActive).toHaveTextContent(safariName);

    // And the running-app counter in the MenuBar should now reflect
    // both open apps (Finder + Safari).
    const counter = screen.getByTestId("menu-bar-running-count");
    expect(counter).toHaveTextContent("2");
    expect(counter).toHaveAttribute("aria-label", "2 apps running");

    // The Safari Dock icon should now be flagged as running, and Finder
    // should still be flagged as running since it was the default open
    // app at boot.
    expect(safariButton).toHaveAttribute("data-running", "true");
    const finderButton = within(dock).getByRole("button", { name: "Finder" });
    expect(finderButton).toHaveAttribute("data-running", "true");
  });

  it("re-clicking the same Dock icon keeps the active app set to that icon", () => {
    render(<Desktop />);
    const dock = screen.getByTestId("dock");
    const calculatorButton = within(dock).getByRole("button", {
      name: "Calculator",
    });
    fireEvent.click(calculatorButton);
    fireEvent.click(calculatorButton);

    const active = screen.getByTestId("menu-bar-active-app");
    const calcName = getApp("calculator")?.name ?? "Calculator";
    expect(active).toHaveTextContent(calcName);
    expect(calculatorButton).toHaveAttribute("data-running", "true");
  });
});
