import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import MenuBar from "./MenuBar";
import { APPS, getApp, type AppId } from "@/lib/apps";

const STANDARD_MENUS = ["File", "Edit", "View", "Window", "Help"] as const;

describe("MenuBar", () => {
  it("renders the menubar with the correct role and aria-label", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    const menuBar = screen.getByTestId("menu-bar");
    expect(menuBar).toBeInTheDocument();
    expect(menuBar.tagName).toBe("HEADER");
    expect(menuBar).toHaveAttribute("role", "menubar");
    expect(menuBar).toHaveAttribute("aria-label", "Menu bar");
  });

  it("renders the Apple menu with its accessible label", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    const apple = screen.getByTestId("menu-bar-apple");
    expect(apple).toBeInTheDocument();
    expect(apple).toHaveAttribute("aria-label", "Apple menu");
    expect(apple).toHaveAttribute("aria-haspopup", "menu");
  });

  it("displays the active app name looked up from the registry", () => {
    render(<MenuBar activeApp="safari" openApps={new Set<AppId>(["safari"])} />);
    const activeLabel = screen.getByTestId("menu-bar-active-app");
    const expected = getApp("safari")?.name ?? "Safari";
    expect(activeLabel).toHaveTextContent(expected);
  });

  it("renders all five standard menus (File, Edit, View, Window, Help)", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    for (const label of STANDARD_MENUS) {
      expect(
        screen.getByTestId(`menu-bar-${label.toLowerCase()}`)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: new RegExp(`^${label}$`) })
      ).toBeInTheDocument();
    }
  });

  it("omits the active app label when there is no active app", () => {
    const { container } = render(
      <MenuBar activeApp={null} openApps={new Set<AppId>()} />
    );
    expect(
      container.querySelector("[data-testid='menu-bar-active-app']")
    ).toBeNull();
  });

  it("renders the clock with a date and time", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    const clock = screen.getByTestId("menu-bar-clock");
    expect(clock).toBeInTheDocument();
    expect(clock).toHaveAttribute("aria-label");
    const label = clock.getAttribute("aria-label") ?? "";
    // Contains both a time-like (digit) and a date-like (alpha) token.
    expect(/\d/.test(label)).toBe(true);
    expect(/[A-Za-z]/.test(label)).toBe(true);
  });

  it("renders Wi-Fi, battery, search and control-centre status icons", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    expect(screen.getByTestId("menu-bar-icon-wifi")).toBeInTheDocument();
    expect(screen.getByTestId("menu-bar-icon-battery")).toBeInTheDocument();
    expect(screen.getByTestId("menu-bar-icon-search")).toBeInTheDocument();
    expect(
      screen.getByTestId("menu-bar-icon-control-center")
    ).toBeInTheDocument();
  });

  it("renders a running-app count matching the openApps set size", () => {
    const open = new Set<AppId>(["finder", "safari", "mail"]);
    render(<MenuBar activeApp="mail" openApps={open} />);
    const counter = screen.getByTestId("menu-bar-running-count");
    expect(counter).toHaveTextContent("3");
    expect(counter).toHaveAttribute("aria-label", "3 apps running");
  });

  it("omits the running-app counter when no apps are open", () => {
    const { container } = render(
      <MenuBar activeApp={null} openApps={new Set<AppId>()} />
    );
    expect(
      container.querySelector("[data-testid='menu-bar-running-count']")
    ).toBeNull();
  });

  it("opens the Apple dropdown when its trigger is clicked and closes it when clicked again", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    const apple = screen.getByTestId("menu-bar-apple");
    expect(apple).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(apple);
    expect(apple).toHaveAttribute("aria-expanded", "true");
    const dropdown = screen.getByTestId("menu-bar-dropdown-apple");
    expect(dropdown).toBeInTheDocument();
    expect(
      within(dropdown).getByRole("menuitem", { name: /About This Mac/i })
    ).toBeInTheDocument();
    fireEvent.click(apple);
    expect(apple).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByTestId("menu-bar-dropdown-apple")
    ).not.toBeInTheDocument();
  });

  it("opens the File dropdown with its standard menu items", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    const fileButton = screen.getByTestId("menu-bar-file");
    fireEvent.click(fileButton);
    expect(fileButton).toHaveAttribute("aria-expanded", "true");
    const dropdown = screen.getByTestId("menu-bar-dropdown-file");
    expect(within(dropdown).getByText("New Window")).toBeInTheDocument();
    expect(within(dropdown).getByText("Close Window")).toBeInTheDocument();
  });

  it("opens only one menu at a time and switches between them", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    const fileButton = screen.getByTestId("menu-bar-file");
    const editButton = screen.getByTestId("menu-bar-edit");

    fireEvent.click(fileButton);
    expect(fileButton).toHaveAttribute("aria-expanded", "true");
    expect(editButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(editButton);
    expect(fileButton).toHaveAttribute("aria-expanded", "false");
    expect(editButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByTestId("menu-bar-dropdown-file")).toBeNull();
    expect(
      screen.getByTestId("menu-bar-dropdown-edit")
    ).toBeInTheDocument();
  });

  it("toggles a menu via the keyboard (Enter / Space) and closes via Escape", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    const helpButton = screen.getByTestId("menu-bar-help");
    helpButton.focus();
    fireEvent.keyDown(helpButton, { key: "Enter" });
    expect(helpButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(helpButton, { key: "Escape" });
    expect(helpButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(helpButton, { key: " " });
    expect(helpButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(helpButton, { key: "Escape" });
    expect(helpButton).toHaveAttribute("aria-expanded", "false");
  });

  it("closes any open menu when the user clicks outside the menu bar", () => {
    render(
      <div>
        <span data-testid="outside">outside</span>
        <MenuBar
          activeApp="finder"
          openApps={new Set<AppId>(["finder"])}
        />
      </div>
    );
    const viewButton = screen.getByTestId("menu-bar-view");
    fireEvent.click(viewButton);
    expect(viewButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(viewButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("menu-bar-dropdown-view")).toBeNull();
  });

  it("renders dropdown items with keyboard shortcuts and disabled state when configured", () => {
    render(<MenuBar activeApp="finder" openApps={new Set<AppId>(["finder"])} />);
    fireEvent.click(screen.getByTestId("menu-bar-file"));
    const dropdown = screen.getByTestId("menu-bar-dropdown-file");
    const newWindow = within(dropdown).getByRole("menuitem", {
      name: /New Window/i,
    });
    expect(newWindow).toHaveTextContent("⌘N");
    const openItem = within(dropdown).getByRole("menuitem", { name: /Open/i });
    expect(openItem).toBeDisabled();
    expect(openItem.className).toContain("menu-bar__dropdown-item--disabled");
  });

  it("reflects the active app name in the active-app menu (uses app registry name)", () => {
    // Iterate through a few apps to confirm registry lookup drives the label.
    const samples: AppId[] = ["calculator", "terminal", "notes"];
    for (const id of samples) {
      const { unmount } = render(
        <MenuBar activeApp={id} openApps={new Set<AppId>([id])} />
      );
      const label = screen.getByTestId("menu-bar-active-app");
      const expected = APPS.find((a) => a.id === id)?.name;
      expect(expected).toBeDefined();
      expect(label).toHaveTextContent(expected as string);
      unmount();
    }
  });

  it("does not crash when the activeApp is unknown to the registry", () => {
    // Cast through unknown to simulate a stale id; component should render
    // the standard menus without the active-app label.
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const { container } = render(
        <MenuBar
          activeApp={"not-a-real-app" as unknown as AppId}
          openApps={new Set<AppId>()}
        />
      );
      expect(container.querySelector(".menu-bar")).not.toBeNull();
      expect(
        container.querySelector("[data-testid='menu-bar-active-app']")
      ).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
});
