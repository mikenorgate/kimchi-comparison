import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DesktopShell from "./page";

describe("DesktopShell", () => {
  it("renders the desktop root container", () => {
    render(<DesktopShell />);
    expect(screen.getByTestId("desktop-root")).toBeInTheDocument();
  });

  it("renders the wallpaper background", () => {
    const { container } = render(<DesktopShell />);
    const wallpaper = container.querySelector(".wallpaper");
    expect(wallpaper).not.toBeNull();
  });

  it("renders a heading with the macOS Tahoe title", () => {
    render(<DesktopShell />);
    expect(
      screen.getByRole("heading", { name: /macOS Tahoe/i })
    ).toBeInTheDocument();
  });
});
