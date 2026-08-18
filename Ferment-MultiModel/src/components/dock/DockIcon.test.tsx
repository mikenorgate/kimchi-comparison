import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DockIcon from "./DockIcon";
import type { AppDefinition } from "@/lib/apps";

const sampleApp: AppDefinition = {
  id: "finder",
  name: "Finder",
  icon: "📁",
};

describe("DockIcon", () => {
  it("renders the app name as a tooltip and accessible label", () => {
    render(
      <DockIcon app={sampleApp} running={false} onLaunch={() => undefined} />
    );
    const button = screen.getByRole("button", { name: "Finder" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Finder");
  });

  it("renders the icon glyph from the app registry entry", () => {
    const { container } = render(
      <DockIcon app={sampleApp} running={false} onLaunch={() => undefined} />
    );
    const glyph = container.querySelector(".dock-icon__glyph");
    expect(glyph).not.toBeNull();
    expect(glyph?.textContent).toBe("📁");
  });

  it("invokes onLaunch with the app id when clicked", () => {
    const onLaunch = vi.fn();
    render(<DockIcon app={sampleApp} running={false} onLaunch={onLaunch} />);
    fireEvent.click(screen.getByRole("button", { name: "Finder" }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
    expect(onLaunch).toHaveBeenCalledWith("finder");
  });

  it("marks the icon as running and shows the indicator dot", () => {
    const { container } = render(
      <DockIcon app={sampleApp} running={true} onLaunch={() => undefined} />
    );
    const button = screen.getByRole("button", { name: "Finder" });
    expect(button).toHaveAttribute("data-running", "true");
    expect(button.className).toContain("dock-icon--running");
    const indicator = container.querySelector(".dock-icon__indicator--on");
    expect(indicator).not.toBeNull();
  });

  it("omits the running state when the app is not open", () => {
    const { container } = render(
      <DockIcon app={sampleApp} running={false} onLaunch={() => undefined} />
    );
    const button = screen.getByRole("button", { name: "Finder" });
    expect(button).toHaveAttribute("data-running", "false");
    const indicator = container.querySelector(".dock-icon__indicator--on");
    expect(indicator).toBeNull();
  });
});
