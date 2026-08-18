import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Window from "./Window";

describe("Window", () => {
  it("renders the title bar with the provided title", () => {
    render(<Window title="Finder">contents</Window>);
    expect(screen.getByTestId("window-titlebar")).toBeInTheDocument();
    const title = screen.getByTestId("window-title");
    expect(title).toHaveTextContent("Finder");
  });

  it("renders the three traffic-light buttons with descriptive labels", () => {
    render(<Window title="Finder">contents</Window>);
    expect(
      screen.getByRole("button", { name: "Close window" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Minimize window" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Maximize window" })
    ).toBeInTheDocument();

    const lights = screen.getByTestId("window-lights");
    expect(lights.querySelectorAll("button")).toHaveLength(3);
  });

  it("invokes onClose, onMinimize and onMaximize when the lights are clicked", () => {
    const onClose = vi.fn();
    const onMinimize = vi.fn();
    const onMaximize = vi.fn();

    render(
      <Window
        title="Finder"
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      >
        contents
      </Window>
    );

    fireEvent.click(screen.getByRole("button", { name: "Close window" }));
    fireEvent.click(screen.getByRole("button", { name: "Minimize window" }));
    fireEvent.click(screen.getByRole("button", { name: "Maximize window" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onMinimize).toHaveBeenCalledTimes(1);
    expect(onMaximize).toHaveBeenCalledTimes(1);
  });

  it("renders children inside the content slot", () => {
    render(
      <Window title="Notes">
        <p>first note</p>
        <button>action</button>
      </Window>
    );
    const body = screen.getByTestId("window-body");
    expect(body).toBeInTheDocument();
    expect(body).toHaveTextContent("first note");
    expect(
      within(body).getByRole("button", { name: "action" })
    ).toBeInTheDocument();
  });

  it("applies the active visual state by default", () => {
    render(<Window title="Finder">x</Window>);
    const frame = screen.getByTestId("window");
    expect(frame).toHaveAttribute("data-active", "true");
    expect(frame.className).toContain("window--active");
    expect(frame.className).not.toContain("window--inactive");

    const close = screen.getByTestId("window-close");
    expect(close.className).not.toContain("window__light--inactive");
  });

  it("applies the inactive visual state when isActive is false", () => {
    render(
      <Window title="Finder" isActive={false}>
        x
      </Window>
    );
    const frame = screen.getByTestId("window");
    expect(frame).toHaveAttribute("data-active", "false");
    expect(frame.className).toContain("window--inactive");
    expect(frame.className).not.toContain("window--active");

    for (const testId of ["window-close", "window-minimize", "window-maximize"]) {
      const light = screen.getByTestId(testId);
      expect(light.className).toContain("window__light--inactive");
    }
  });

  it("renders the optional app icon next to the title", () => {
    render(
      <Window title="Finder" icon={<span data-testid="app-glyph">📁</span>}>
        contents
      </Window>
    );
    const icon = screen.getByTestId("window-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveTextContent("📁");
  });

  it("omits the icon slot when no icon prop is provided", () => {
    render(<Window title="Finder">contents</Window>);
    expect(screen.queryByTestId("window-icon")).toBeNull();
  });

  it("uses the title as the accessible label by default", () => {
    render(<Window title="Calculator">x</Window>);
    expect(screen.getByTestId("window")).toHaveAttribute(
      "aria-label",
      "Calculator"
    );
  });

  it("applies width and height props to the frame", () => {
    render(
      <Window title="Finder" width={420} height={280}>
        x
      </Window>
    );
    const frame = screen.getByTestId("window") as HTMLElement;
    expect(frame.style.width).toBe("420px");
    expect(frame.style.height).toBe("280px");
  });
});
