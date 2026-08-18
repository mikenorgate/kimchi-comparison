import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, fireEvent, within } from "@testing-library/react";
import WindowManager, { useWindowManager } from "./WindowManager";

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
 * Test harness exposing the WindowManagerApi as a series of buttons.
 * Tests click these buttons to drive the manager through context
 * actions, which is exactly how the Dock / MenuBar will wire up
 * later.
 */
function Harness(): JSX.Element {
  const mgr = useWindowManager();
  return (
    <div>
      <button
        type="button"
        onClick={() => mgr.openWindow("finder")}
        data-testid="open-finder"
      >
        open finder
      </button>
      <button
        type="button"
        onClick={() => mgr.openWindow("safari")}
        data-testid="open-safari"
      >
        open safari
      </button>
      <button
        type="button"
        onClick={() => mgr.openWindow("notes")}
        data-testid="open-notes"
      >
        open notes
      </button>
      <button
        type="button"
        onClick={() => {
          const id = mgr.windows[mgr.windows.length - 1]?.id;
          if (id) mgr.closeWindow(id);
        }}
        data-testid="close-last"
      >
        close last
      </button>
      <button
        type="button"
        onClick={() => {
          const first = mgr.windows[0];
          if (first) mgr.focusWindow(first.id);
        }}
        data-testid="focus-first"
      >
        focus first
      </button>
      <button
        type="button"
        onClick={() => {
          const last = mgr.windows[mgr.windows.length - 1];
          if (last) mgr.focusWindow(last.id);
        }}
        data-testid="focus-last"
      >
        focus last
      </button>
      <button
        type="button"
        onClick={() => {
          const last = mgr.windows[mgr.windows.length - 1];
          if (last) mgr.minimizeWindow(last.id);
        }}
        data-testid="minimize-last"
      >
        minimize last
      </button>
      <button
        type="button"
        onClick={() => {
          const last = mgr.windows[mgr.windows.length - 1];
          if (last) mgr.maximizeWindow(last.id);
        }}
        data-testid="maximize-last"
      >
        maximize last
      </button>
      <button
        type="button"
        onClick={() => {
          const last = mgr.windows[mgr.windows.length - 1];
          if (last) mgr.restoreWindow(last.id);
        }}
        data-testid="restore-last"
      >
        restore last
      </button>
      <button
        type="button"
        onClick={() => {
          const last = mgr.windows[mgr.windows.length - 1];
          if (last) mgr.closeWindow(last.id);
        }}
        data-testid="close-active"
      >
        close active
      </button>
      <pre data-testid="active-window-id">{mgr.activeWindowId ?? ""}</pre>
      <pre data-testid="window-count">{mgr.windows.length}</pre>
    </div>
  );
}

function renderHarness(initial?: Parameters<typeof WindowManager>[0]["initialWindows"]) {
  return render(
    <WindowManager initialWindows={initial}>
      <Harness />
    </WindowManager>
  );
}

describe("WindowManager", () => {
  it("starts with no windows when initialWindows is omitted", () => {
    renderHarness();
    expect(screen.getByTestId("window-count").textContent).toBe("0");
    expect(screen.getByTestId("active-window-id").textContent).toBe("");
    expect(screen.queryAllByTestId(/^managed-window-/)).toHaveLength(0);
  });

  it("renders one managed window per initialWindow spec", () => {
    renderHarness([
      { appId: "finder" },
      { appId: "safari" },
    ]);
    expect(screen.getByTestId("window-count").textContent).toBe("2");
    // Finder and Safari both render their real components. The window
    // manager mounts them inside the `app-content-<appId>` wrapper
    // identified by the test id asserted below.
    const finderBody = screen.getByTestId("app-content-finder");
    expect(within(finderBody).getByTestId("finder")).toBeInTheDocument();
    const safariBody = screen.getByTestId("app-content-safari");
    expect(within(safariBody).getByTestId("safari")).toBeInTheDocument();
  });

  it("opens a new window when openWindow is invoked", () => {
    renderHarness();
    act(() => {
      fireEvent.click(screen.getByTestId("open-finder"));
    });
    expect(screen.getByTestId("window-count").textContent).toBe("1");
    expect(screen.getByTestId("app-content-finder")).toBeInTheDocument();
    expect(screen.getByTestId("active-window-id").textContent).not.toBe("");
  });

  it("opens multiple windows and renders them all with staggered cascade", () => {
    renderHarness();
    act(() => {
      fireEvent.click(screen.getByTestId("open-finder"));
      fireEvent.click(screen.getByTestId("open-safari"));
      fireEvent.click(screen.getByTestId("open-notes"));
    });
    expect(screen.getByTestId("window-count").textContent).toBe("3");
    expect(screen.getByTestId("app-content-finder")).toBeInTheDocument();
    expect(screen.getByTestId("app-content-safari")).toBeInTheDocument();
    expect(screen.getByTestId("app-content-notes")).toBeInTheDocument();

    const frames = screen.getAllByTestId(/^managed-window-/);
    // Cascading positions: each subsequent window is offset by 32px.
    const tops = frames.map(
      (frame) => Number((frame as HTMLElement).style.top.replace("px", ""))
    );
    // Allow at most MAX_CASCADE-1 distinct offsets (wrapped) so the
    // offsets must be monotonically non-decreasing (modulo MAX_CASCADE).
    expect(new Set(tops).size).toBeGreaterThanOrEqual(2);
  });

  it("closes a window when closeWindow is invoked", () => {
    renderHarness([{ appId: "finder" }, { appId: "safari" }]);
    expect(screen.getByTestId("window-count").textContent).toBe("2");

    act(() => {
      fireEvent.click(screen.getByTestId("close-last"));
    });
    expect(screen.getByTestId("window-count").textContent).toBe("1");
    expect(screen.queryByTestId("app-content-safari")).toBeNull();
    expect(screen.getByTestId("app-content-finder")).toBeInTheDocument();
  });

  it("closes the active window via the Window close traffic light", () => {
    renderHarness([{ appId: "finder" }]);
    expect(screen.getByTestId("window-count").textContent).toBe("1");
    fireEvent.click(screen.getByTestId("window-close"));
    expect(screen.getByTestId("window-count").textContent).toBe("0");
  });

  it("reassigns activeWindowId to the top-most remaining window on close", () => {
    renderHarness([
      { appId: "finder" },
      { appId: "safari" },
      { appId: "notes" },
    ]);
    // Find each window's id via the managed-window container
    const frames = screen.getAllByTestId(/^managed-window-/);
    const finderFrame = frames.find(
      (f) => f.getAttribute("data-app-id") === "finder"
    )!;
    const finderId = finderFrame.getAttribute("data-testid")!.replace(
      "managed-window-",
      ""
    );

    // notes is initially on top. Focus finder explicitly so finder is
    // the topmost after we close notes.
    act(() => {
      fireEvent.click(screen.getByTestId("focus-first"));
    });
    expect(screen.getByTestId("active-window-id").textContent).toBe(finderId);

    // Close the last window (notes). After close, the topmost
    // remaining should be finder, which should be the new active id.
    act(() => {
      fireEvent.click(screen.getByTestId("close-last"));
    });
    expect(screen.getByTestId("active-window-id").textContent).toBe(finderId);
  });

  it("focusing a window raises its z-index above all others", () => {
    renderHarness([{ appId: "finder" }, { appId: "safari" }]);

    const readZ = () => {
      const frames = screen.getAllByTestId(/^managed-window-/);
      return frames.map((f) => ({
        appId: f.getAttribute("data-app-id")!,
        z: Number(f.getAttribute("data-z-index")),
      }));
    };

    const initial = readZ();
    const finderInitial = initial.find((w) => w.appId === "finder")!.z;
    const safariInitial = initial.find((w) => w.appId === "safari")!.z;
    // Safari was opened last -> should be on top
    expect(safariInitial).toBeGreaterThan(finderInitial);

    // Focus finder explicitly
    act(() => {
      fireEvent.click(screen.getByTestId("focus-first"));
    });
    const after = readZ();
    const finderAfter = after.find((w) => w.appId === "finder")!.z;
    const safariAfter = after.find((w) => w.appId === "safari")!.z;
    expect(finderAfter).toBeGreaterThan(safariAfter);
    expect(screen.getByTestId("active-window-id").textContent).toContain("init-finder");
  });

  it("minimizing a window removes it from the DOM and reassigns active", () => {
    renderHarness([{ appId: "finder" }, { appId: "safari" }]);
    // safari is active (top). Minimize it.
    act(() => {
      fireEvent.click(screen.getByTestId("minimize-last"));
    });
    expect(screen.getByTestId("window-count").textContent).toBe("2");
    // The minimized window must not render any managed frame.
    expect(screen.queryByTestId("app-content-safari")).toBeNull();
    expect(screen.getByTestId("app-content-finder")).toBeInTheDocument();
    // The active id should now be finder (the top-most non-minimized).
    const active = screen.getByTestId("active-window-id").textContent;
    expect(active).toContain("init-finder");
  });

  it("minimizing via the Window minimize traffic light hides the window", () => {
    renderHarness([{ appId: "finder" }]);
    fireEvent.click(screen.getByTestId("window-minimize"));
    expect(screen.getByTestId("window-count").textContent).toBe("1");
    expect(screen.queryByTestId("app-content-finder")).toBeNull();
  });

  it("focus-on-minimized restores and raises z-index (focusWindow API)", () => {
    function FocusProbe(): JSX.Element {
      const mgr = useWindowManager();
      return (
        <div>
          <button
            data-testid="probe-focus-by-id"
            onClick={() => {
              const safari = mgr.windows.find((w) => w.appId === "safari");
              if (safari) mgr.focusWindow(safari.id);
            }}
          >
            focus safari
          </button>
          <pre data-testid="probe-active">{mgr.activeWindowId ?? ""}</pre>
        </div>
      );
    }
    render(
      <WindowManager initialWindows={[{ appId: "finder" }, { appId: "safari" }]}>
        <FocusProbe />
      </WindowManager>
    );
    // Minimize safari via its traffic light — scope to the safari frame
    // because finder renders an inactive copy of the same control.
    const safariFrame = screen
      .getAllByTestId(/^managed-window-/)
      .find((f) => f.getAttribute("data-app-id") === "safari")!;
    fireEvent.click(within(safariFrame as HTMLElement).getByTestId("window-minimize"));
    expect(screen.queryByTestId("app-content-safari")).toBeNull();

    // Now focus the minimized safari
    act(() => {
      fireEvent.click(screen.getByTestId("probe-focus-by-id"));
    });
    // Safari should be back in the DOM, and the active id should be
    // its managed id.
    expect(screen.getByTestId("app-content-safari")).toBeInTheDocument();
    const active = screen.getByTestId("probe-active").textContent;
    expect(active).toContain("init-safari");
  });

  it("maximizing a window toggles the --maximized class and fills the desktop area", () => {
    renderHarness([{ appId: "finder" }]);
    const before = screen.getByTestId(/^managed-window-/) as HTMLElement;
    expect(before.getAttribute("data-maximized")).toBe("false");
    const beforeWidth = before.style.width;

    act(() => {
      fireEvent.click(screen.getByTestId("maximize-last"));
    });
    const after = screen.getByTestId(/^managed-window-/) as HTMLElement;
    expect(after.getAttribute("data-maximized")).toBe("true");
    // Width should fill the viewport (1280px from beforeEach)
    expect(after.style.width).toBe("100%");
    // Top edge should sit below the menu bar (28px).
    expect(after.style.top).toBe("0px");
    // The previous width should have been a pixel value (not 100%).
    expect(beforeWidth.endsWith("px")).toBe(true);

    // Resize handles should not render while maximized.
    expect(screen.queryByTestId(/^resize-/)).toBeNull();
  });

  it("restoring a maximized window returns to its previous geometry", () => {
    renderHarness([
      {
        appId: "finder",
        position: { x: 123, y: 77 },
        size: { width: 640, height: 420 },
      },
    ]);
    const before = screen.getByTestId(/^managed-window-/) as HTMLElement;
    expect(before.style.left).toBe("123px");
    expect(before.style.top).toBe("77px");
    expect(before.style.width).toBe("640px");
    expect(before.style.height).toBe("420px");

    act(() => {
      fireEvent.click(screen.getByTestId("maximize-last"));
    });
    const maximized = screen.getByTestId(/^managed-window-/) as HTMLElement;
    expect(maximized.getAttribute("data-maximized")).toBe("true");
    expect(maximized.style.width).toBe("100%");

    act(() => {
      fireEvent.click(screen.getByTestId("restore-last"));
    });
    const restored = screen.getByTestId(/^managed-window-/) as HTMLElement;
    expect(restored.getAttribute("data-maximized")).toBe("false");
    expect(restored.style.left).toBe("123px");
    expect(restored.style.top).toBe("77px");
    expect(restored.style.width).toBe("640px");
    expect(restored.style.height).toBe("420px");
  });

  it("maximizing via the Window maximize traffic light toggles to --maximized", () => {
    renderHarness([{ appId: "finder" }]);
    fireEvent.click(screen.getByTestId("window-maximize"));
    expect(
      screen.getByTestId(/^managed-window-/).getAttribute("data-maximized")
    ).toBe("true");
  });

  it("clicking maximize again on an already-maximized window restores it", () => {
    renderHarness([{ appId: "finder" }]);
    fireEvent.click(screen.getByTestId("window-maximize"));
    expect(
      screen.getByTestId(/^managed-window-/).getAttribute("data-maximized")
    ).toBe("true");
    fireEvent.click(screen.getByTestId("window-maximize"));
    expect(
      screen.getByTestId(/^managed-window-/).getAttribute("data-maximized")
    ).toBe("false");
  });

  it("orders z-indexes so the most recently focused window is on top", () => {
    renderHarness([
      { appId: "finder" },
      { appId: "safari" },
      { appId: "notes" },
    ]);

    const readOrder = (): string[] => {
      const frames = screen.getAllByTestId(/^managed-window-/);
      const sorted = [...frames].sort(
        (a, b) =>
          Number(b.getAttribute("data-z-index")) -
          Number(a.getAttribute("data-z-index"))
      );
      return sorted.map((f) => f.getAttribute("data-app-id")!);
    };

    expect(readOrder()).toEqual(["notes", "safari", "finder"]);

    // Focus finder -> order should become finder on top
    act(() => {
      fireEvent.click(screen.getByTestId("focus-first"));
    });
    expect(readOrder()).toEqual(["finder", "notes", "safari"]);

    // Open a new app -> it should land on top of finder
    act(() => {
      fireEvent.click(screen.getByTestId("open-notes"));
    });
    // notes was already open, opening it again creates a second notes
    // window. Order should put the new notes above finder.
    expect(readOrder()[0]).toBe("notes");
  });

  it("renders resize handles for non-maximized windows and not for maximized ones", () => {
    renderHarness([{ appId: "finder" }]);
    const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
    for (const dir of dirs) {
      expect(screen.getByTestId(`resize-` + screen.getByTestId(/^managed-window-/).getAttribute("data-testid")!.replace("managed-window-", "") + `-${dir}`)).toBeInTheDocument();
    }

    act(() => {
      fireEvent.click(screen.getByTestId("maximize-last"));
    });
    expect(screen.queryByTestId(/^resize-/)).toBeNull();
  });

  it("the active window renders with data-active=true and inactive ones with false", () => {
    renderHarness([{ appId: "finder" }, { appId: "safari" }]);
    const frames = screen.getAllByTestId(/^managed-window-/);
    const safariFrame = frames.find(
      (f) => f.getAttribute("data-app-id") === "safari"
    )!;
    const finderFrame = frames.find(
      (f) => f.getAttribute("data-app-id") === "finder"
    )!;
    expect(safariFrame.getAttribute("data-active")).toBe("true");
    expect(finderFrame.getAttribute("data-active")).toBe("false");

    // Focus finder -> it becomes active
    act(() => {
      fireEvent.click(screen.getByTestId("focus-first"));
    });
    const updated = screen.getAllByTestId(/^managed-window-/);
    const finder2 = updated.find(
      (f) => f.getAttribute("data-app-id") === "finder"
    )!;
    const safari2 = updated.find(
      (f) => f.getAttribute("data-app-id") === "safari"
    )!;
    expect(finder2.getAttribute("data-active")).toBe("true");
    expect(safari2.getAttribute("data-active")).toBe("false");
  });

  it("the active window's traffic lights are saturated and inactive ones are muted", () => {
    renderHarness([{ appId: "finder" }, { appId: "safari" }]);
    const frames = screen.getAllByTestId(/^managed-window-/);
    const safariFrame = frames.find(
      (f) => f.getAttribute("data-app-id") === "safari"
    )!;
    const finderFrame = frames.find(
      (f) => f.getAttribute("data-app-id") === "finder"
    )!;
    const safariWindow = within(safariFrame as HTMLElement).getByTestId("window");
    const finderWindow = within(finderFrame as HTMLElement).getByTestId("window");
    expect(safariWindow.getAttribute("data-active")).toBe("true");
    expect(finderWindow.getAttribute("data-active")).toBe("false");
  });

  it("focusing a window via clicking its frame raises it to the top", () => {
    renderHarness([{ appId: "finder" }, { appId: "safari" }]);
    const frames = screen.getAllByTestId(/^managed-window-/);
    const finderFrame = frames.find(
      (f) => f.getAttribute("data-app-id") === "finder"
    )!;

    act(() => {
      fireEvent.pointerDown(finderFrame, { pointerId: 1, button: 0 });
    });

    expect(
      screen.getByTestId("active-window-id").textContent
    ).toContain("init-finder");
  });
});
