import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Dock from "./Dock";
import { APPS, type AppId } from "@/lib/apps";

describe("Dock", () => {
  it("renders a nav element with the Dock test id", () => {
    render(<Dock openApps={new Set()} onLaunchApp={() => undefined} />);
    const nav = screen.getByTestId("dock");
    expect(nav).toBeInTheDocument();
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("aria-label", "Dock");
  });

  it("renders one button per registered app", () => {
    render(<Dock openApps={new Set()} onLaunchApp={() => undefined} />);
    for (const app of APPS) {
      expect(
        screen.getByRole("button", { name: app.name })
      ).toBeInTheDocument();
    }
    // Sanity-check the registry size matches what we render.
    expect(screen.getAllByRole("button")).toHaveLength(APPS.length);
  });

  it("forwards a click on an app icon to onLaunchApp with the correct id", () => {
    const onLaunchApp = vi.fn();
    render(<Dock openApps={new Set()} onLaunchApp={onLaunchApp} />);
    fireEvent.click(screen.getByRole("button", { name: "Safari" }));
    expect(onLaunchApp).toHaveBeenCalledTimes(1);
    expect(onLaunchApp).toHaveBeenCalledWith("safari");
  });

  it("marks icons as running when their id is in openApps", () => {
    const open = new Set<AppId>(["finder", "mail"]);
    const { container } = render(
      <Dock openApps={open} onLaunchApp={() => undefined} />
    );
    const runningButtons = container.querySelectorAll(
      ".dock-icon[data-running='true']"
    );
    expect(runningButtons).toHaveLength(2);

    const finder = screen.getByRole("button", { name: "Finder" });
    const mail = screen.getByRole("button", { name: "Mail" });
    expect(finder).toHaveAttribute("data-running", "true");
    expect(mail).toHaveAttribute("data-running", "true");

    const safari = screen.getByRole("button", { name: "Safari" });
    expect(safari).toHaveAttribute("data-running", "false");
  });

  it("renders a running indicator dot only for running apps", () => {
    const open = new Set<AppId>(["calculator"]);
    const { container } = render(
      <Dock openApps={open} onLaunchApp={() => undefined} />
    );
    const onIndicators = container.querySelectorAll(
      ".dock-icon__indicator--on"
    );
    expect(onIndicators).toHaveLength(1);
    // Confirm it lives beneath the calculator wrapper.
    const calcButton = screen.getByRole("button", { name: "Calculator" });
    const wrapper = calcButton.parentElement as HTMLElement;
    expect(wrapper.querySelector(".dock-icon__indicator--on")).not.toBeNull();
  });
});
