import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, render, screen, fireEvent } from "@testing-library/react";
import useWindowGeometry from "./useWindowGeometry";

/**
 * The hook reads window.innerWidth / window.innerHeight by default. The
 * jsdom viewport is 1024x768 — we keep that baseline for the suite and
 * override it per-test by stubbing `window.innerWidth/innerHeight`.
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
  setViewport(1024, 768);
});

afterEach(() => {
  setViewport(ORIGINAL_INNER_WIDTH, ORIGINAL_INNER_HEIGHT);
  vi.restoreAllMocks();
});

/**
 * Build a synthetic PointerEvent whose properties the hook reads
 * (button, clientX, clientY, pointerId). jsdom's PointerEvent
 * constructor does not initialise those fields, so we set them
 * explicitly.
 */
function makePointerEvent(
  type: string,
  init: { button?: number; clientX?: number; clientY?: number; pointerId?: number } = {}
): PointerEvent {
  const event = new Event(type) as PointerEvent;
  Object.defineProperty(event, "button", { value: init.button ?? 0 });
  Object.defineProperty(event, "clientX", { value: init.clientX ?? 0 });
  Object.defineProperty(event, "clientY", { value: init.clientY ?? 0 });
  Object.defineProperty(event, "pointerId", { value: init.pointerId ?? 1 });
  return event;
}

/**
 * jsdom does not implement Element#setPointerCapture /
 * Element#releasePointerCapture. The hook wraps both calls in try/catch
 * so the missing methods are harmless in production code, but the
 * integration test in this file drives real DOM elements via fireEvent
 * and therefore hits the unmasked methods. Polyfill them on the
 * Element prototype once for this suite so any element instance
 * inherits no-op implementations.
 */
function ensurePointerCaptureShims(): void {
  if (typeof Element === "undefined") return;
  if (!Element.prototype.setPointerCapture) {
    Object.defineProperty(Element.prototype, "setPointerCapture", {
      configurable: true,
      writable: true,
      value: () => {},
    });
  }
  if (!Element.prototype.releasePointerCapture) {
    Object.defineProperty(Element.prototype, "releasePointerCapture", {
      configurable: true,
      writable: true,
      value: () => {},
    });
  }
}
ensurePointerCaptureShims();

describe("useWindowGeometry", () => {
  it("initialises with the provided position and size", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({
        initialPosition: { x: 120, y: 80 },
        initialSize: { width: 600, height: 400 },
      })
    );
    expect(result.current.position).toEqual({ x: 120, y: 80 });
    expect(result.current.size).toEqual({ width: 600, height: 400 });
    expect(result.current.isDragging).toBe(false);
    expect(result.current.isResizing).toBe(false);
  });

  it("exposes refs for the title bar and the eight resize handles", () => {
    const { result } = renderHook(() => useWindowGeometry());
    expect(result.current.titleBarRef.current).toBeNull();
    const refs = result.current.resizeHandleRefs;
    for (const dir of ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const) {
      expect(refs[dir]).toBeDefined();
      expect(refs[dir].current).toBeNull();
    }
    for (const dir of ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const) {
      const props = result.current.resizeHandleProps[dir];
      expect(props["data-resize-handle"]).toBe(dir);
      expect(props.role).toBe("separator");
      expect(props["aria-label"]).toBe(`Resize ${dir.toUpperCase()}`);
    }
  });

  it("exposes the correct cursor styles on the resize handles", () => {
    const { result } = renderHook(() => useWindowGeometry());
    const expected: Record<string, string> = {
      n: "ns-resize",
      s: "ns-resize",
      e: "ew-resize",
      w: "ew-resize",
      ne: "nesw-resize",
      nw: "nwse-resize",
      se: "nwse-resize",
      sw: "nesw-resize",
    };
    for (const [dir, cursor] of Object.entries(expected)) {
      expect(result.current.resizeHandleProps[dir as keyof typeof expected].style.cursor).toBe(cursor);
    }
    // Title bar resting cursor should be 'grab'
    expect(result.current.titleBarProps.style.cursor).toBe("grab");
    // Body cursor starts neutral
    expect(result.current.cursor).toBe("default");
  });

  it("updates position when the title bar is dragged", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 100, y: 100 }, initialSize: { width: 400, height: 300 } })
    );

    // Stub pointer capture so jsdom does not throw
    const captureEl = document.createElement("div");

    act(() => {
      result.current.titleBarProps.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 120,
        clientY: 140,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof result.current.titleBarProps.onPointerDown>[0]);
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.titleBarProps.style.cursor).toBe("grabbing");
    expect(result.current.cursor).toBe("grabbing");

    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 170, clientY: 190 }));
    });

    expect(result.current.position).toEqual({ x: 150, y: 150 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 220, clientY: 250 }));
    });

    expect(result.current.position).toEqual({ x: 200, y: 210 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.position).toEqual({ x: 200, y: 210 });
  });

  it("ignores non-primary button presses on the title bar", () => {
    const { result } = renderHook(() => useWindowGeometry());
    const captureEl = document.createElement("div");
    act(() => {
      result.current.titleBarProps.onPointerDown({
        currentTarget: captureEl,
        button: 2,
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof result.current.titleBarProps.onPointerDown>[0]);
    });
    expect(result.current.isDragging).toBe(false);
  });

  it("clamps drag position so a minimum sliver stays on-screen left/right", () => {
    setViewport(800, 600);
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 100, y: 100 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    act(() => {
      result.current.titleBarProps.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 120,
        clientY: 120,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof result.current.titleBarProps.onPointerDown>[0]);
    });
    // Pull the window far to the right; min on-screen width is 60px so maxX = 800 - 60 = 740
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 5000, clientY: 5000 }));
    });
    expect(result.current.position.x).toBe(740);
    // Pull far left: minX = -(400 - 60) = -340
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: -5000, clientY: -5000 }));
    });
    expect(result.current.position.x).toBe(-340);
    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("clamps drag position so a minimum sliver stays above the bottom", () => {
    setViewport(800, 600);
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 100, y: 100 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    act(() => {
      result.current.titleBarProps.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 120,
        clientY: 120,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof result.current.titleBarProps.onPointerDown>[0]);
    });
    // Drag way down: maxY = 600 - 24 = 576
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 200, clientY: 9999 }));
    });
    expect(result.current.position.y).toBe(576);
    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("allows the window to be pulled above the top until only the title bar stays visible", () => {
    setViewport(800, 600);
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 100, y: 100 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    act(() => {
      result.current.titleBarProps.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 120,
        clientY: 120,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof result.current.titleBarProps.onPointerDown>[0]);
    });
    // Pull way up: minY = -(titleBarHeight - MIN_TITLE_BAR_VISIBLE) = -(28 - 24) = -4
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 120, clientY: -9999 }));
    });
    expect(result.current.position.y).toBe(-4);
    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("resizes from the east edge by adjusting width only", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 50, y: 50 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.e;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 450,
        clientY: 80,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });
    expect(result.current.isResizing).toBe(true);

    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 520, clientY: 80 }));
    });
    expect(result.current.size).toEqual({ width: 470, height: 300 });
    expect(result.current.position).toEqual({ x: 50, y: 50 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
    expect(result.current.isResizing).toBe(false);
  });

  it("resizes from the south edge by adjusting height only", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 50, y: 50 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.s;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 200,
        clientY: 350,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 200, clientY: 420 }));
    });
    expect(result.current.size).toEqual({ width: 400, height: 370 });
    expect(result.current.position).toEqual({ x: 50, y: 50 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("resizes from the west edge by adjusting width and shifting position", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 200, y: 100 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.w;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });

    // Move 50px to the left -> width grows by 50, x shifts left by 50
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 150, clientY: 100 }));
    });
    expect(result.current.size).toEqual({ width: 450, height: 300 });
    expect(result.current.position).toEqual({ x: 150, y: 100 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("resizes from the north edge by adjusting height and shifting position", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 200, y: 200 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.n;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 300,
        clientY: 200,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });

    // Move 40px up -> height grows by 40, y shifts up by 40
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 300, clientY: 160 }));
    });
    expect(result.current.size).toEqual({ width: 400, height: 340 });
    expect(result.current.position).toEqual({ x: 200, y: 160 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("resizes from the south-east corner by adjusting both dimensions", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 50, y: 50 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.se;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 450,
        clientY: 350,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 500, clientY: 400 }));
    });
    expect(result.current.size).toEqual({ width: 450, height: 350 });
    expect(result.current.position).toEqual({ x: 50, y: 50 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("resizes from the north-west corner by shifting position and growing both dimensions", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 200, y: 200 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.nw;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 200,
        clientY: 200,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });

    // Pull 30px up + 30px left -> width and height both grow by 30, position shifts by -30
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 170, clientY: 170 }));
    });
    expect(result.current.size).toEqual({ width: 430, height: 330 });
    expect(result.current.position).toEqual({ x: 170, y: 170 });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("enforces minimum width and height when resizing", () => {
    setViewport(800, 600);
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 50, y: 50 }, initialSize: { width: 400, height: 300 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.se;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 450,
        clientY: 350,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });

    // Shrink way past min
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 0, clientY: 0 }));
    });
    expect(result.current.size.width).toBe(240);
    expect(result.current.size.height).toBe(160);

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("respects custom minWidth/minHeight options", () => {
    const { result } = renderHook(() =>
      useWindowGeometry({
        initialPosition: { x: 50, y: 50 },
        initialSize: { width: 500, height: 500 },
        minWidth: 320,
        minHeight: 220,
      })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.se;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 550,
        clientY: 550,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 0, clientY: 0 }));
    });
    expect(result.current.size.width).toBe(320);
    expect(result.current.size.height).toBe(220);
    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("clamps width and height to the viewport when growing", () => {
    setViewport(600, 400);
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 50, y: 50 }, initialSize: { width: 300, height: 200 } })
    );
    const captureEl = document.createElement("div");

    const props = result.current.resizeHandleProps.se;
    act(() => {
      props.onPointerDown({
        currentTarget: captureEl,
        button: 0,
        clientX: 350,
        clientY: 250,
        pointerId: 1,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as Parameters<typeof props.onPointerDown>[0]);
    });
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { pointerId: 1, clientX: 9999, clientY: 9999 }));
    });
    expect(result.current.size.width).toBe(600);
    expect(result.current.size.height).toBe(400);
    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { pointerId: 1 }));
    });
  });

  it("imperative setPosition clamps out-of-bounds values", () => {
    setViewport(800, 600);
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 100, y: 100 }, initialSize: { width: 400, height: 300 } })
    );
    act(() => {
      result.current.setPosition({ x: -9999, y: -9999 });
    });
    expect(result.current.position).toEqual({ x: -340, y: -4 });
    act(() => {
      result.current.setPosition({ x: 9999, y: 9999 });
    });
    expect(result.current.position).toEqual({ x: 740, y: 576 });
  });

  it("imperative setSize clamps below the minimum and above the viewport", () => {
    setViewport(800, 600);
    const { result } = renderHook(() =>
      useWindowGeometry({ initialPosition: { x: 100, y: 100 }, initialSize: { width: 400, height: 300 } })
    );
    act(() => {
      result.current.setSize({ width: 50, height: 50 });
    });
    expect(result.current.size).toEqual({ width: 240, height: 160 });
    act(() => {
      result.current.setSize({ width: 9999, height: 9999 });
    });
    expect(result.current.size).toEqual({ width: 800, height: 600 });
  });

  it("fires onPositionChange / onSizeChange callbacks when state changes", () => {
    const onPositionChange = vi.fn();
    const onSizeChange = vi.fn();
    const { result } = renderHook(() =>
      useWindowGeometry({
        initialPosition: { x: 100, y: 100 },
        initialSize: { width: 400, height: 300 },
        onPositionChange,
        onSizeChange,
      })
    );
    act(() => {
      result.current.setPosition({ x: 200, y: 150 });
    });
    expect(onPositionChange).toHaveBeenCalledWith({ x: 200, y: 150 });
    act(() => {
      result.current.setSize({ width: 500, height: 350 });
    });
    expect(onSizeChange).toHaveBeenCalledWith({ width: 500, height: 350 });
  });

  it("integrates with a Window-like DOM via titleBarProps and resizeHandleProps", () => {
    // Render a small harness component that uses the hook the same way
    // the eventual Window will, and drive interactions with fireEvent so
    // we can verify the handlers are wired end-to-end.
    function Harness(): JSX.Element {
      const geo = useWindowGeometry({
        initialPosition: { x: 50, y: 50 },
        initialSize: { width: 320, height: 200 },
      });
      return (
        <div>
          <div
            data-testid="title"
            {...geo.titleBarProps}
            ref={geo.titleBarRef}
          >
            title
          </div>
          {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const).map((dir) => (
            <div
              key={dir}
              data-testid={`handle-${dir}`}
              {...geo.resizeHandleProps[dir]}
              ref={geo.resizeHandleRefs[dir]}
            />
          ))}
          <pre data-testid="state">
            {`x=${geo.position.x} y=${geo.position.y} w=${geo.size.width} h=${geo.size.height}`}
          </pre>
        </div>
      );
    }

    render(<Harness />);

    const title = screen.getByTestId("title");
    fireEvent.pointerDown(title, { button: 0, clientX: 60, clientY: 60, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 110, clientY: 90, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(screen.getByTestId("state").textContent).toBe("x=100 y=80 w=320 h=200");

    const east = screen.getByTestId("handle-e");
    fireEvent.pointerDown(east, { button: 0, clientX: 370, clientY: 60, pointerId: 2 });
    fireEvent.pointerMove(window, { clientX: 430, clientY: 60, pointerId: 2 });
    fireEvent.pointerUp(window, { pointerId: 2 });
    expect(screen.getByTestId("state").textContent).toBe("x=100 y=80 w=380 h=200");

    const sw = screen.getByTestId("handle-sw");
    fireEvent.pointerDown(sw, { button: 0, clientX: 100, clientY: 250, pointerId: 3 });
    fireEvent.pointerMove(window, { clientX: 80, clientY: 270, pointerId: 3 });
    fireEvent.pointerUp(window, { pointerId: 3 });
    // SW: dx=-20 -> width grows by 20 and x shifts left by 20; dy=+20 -> height grows by 20
    expect(screen.getByTestId("state").textContent).toBe("x=80 y=80 w=400 h=220");
  });
});
