import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import Safari from "./Safari";

/**
 * Helper: scope element lookups to the Safari toolbar so the address
 * bar input (which lives outside the toolbar) cannot accidentally
 * satisfy a button assertion.
 */
function getToolbar(): HTMLElement {
  return screen.getByTestId("safari-toolbar");
}

/**
 * Helper: type a value into the address bar and press Enter. Mirrors
 * the macOS "submit" gesture: change + keyDown(Enter).
 */
function navigateViaAddressBar(value: string): void {
  const address = screen.getByTestId(
    "safari-address"
  ) as HTMLInputElement;
  fireEvent.change(address, { target: { value } });
  fireEvent.keyDown(address, { key: "Enter" });
}

describe("Safari", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the main safari region with the expected test id", () => {
    render(<Safari />);
    expect(screen.getByTestId("safari")).toBeInTheDocument();
  });

  it("renders a toolbar", () => {
    render(<Safari />);
    const toolbar = getToolbar();
    expect(toolbar).toBeInTheDocument();
  });

  it("renders back, forward, and refresh buttons inside the toolbar", () => {
    render(<Safari />);
    const toolbar = getToolbar();
    expect(within(toolbar).getByTestId("safari-back")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("safari-forward")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("safari-refresh")).toBeInTheDocument();
  });

  it("renders an address bar input", () => {
    render(<Safari />);
    const address = screen.getByTestId("safari-address");
    expect(address).toBeInTheDocument();
    expect(address.tagName).toBe("INPUT");
  });

  it("shows the default URL in the address bar when no initialUrl is given", () => {
    render(<Safari />);
    const address = screen.getByTestId(
      "safari-address"
    ) as HTMLInputElement;
    expect(address.value).toBe("https://example.com");
    // The wrapper exposes the same value for tests/observers.
    expect(screen.getByTestId("safari").getAttribute("data-url")).toBe(
      "https://example.com"
    );
  });

  it("honors an explicit initialUrl prop in the address bar", () => {
    render(<Safari initialUrl="https://www.apple.com" />);
    const address = screen.getByTestId(
      "safari-address"
    ) as HTMLInputElement;
    expect(address.value).toBe("https://www.apple.com");
    expect(screen.getByTestId("safari").getAttribute("data-url")).toBe(
      "https://www.apple.com"
    );
  });

  it("renders a web-view area for the iframe", () => {
    render(<Safari />);
    const webview = screen.getByTestId("safari-webview");
    expect(webview).toBeInTheDocument();
    expect(webview.getAttribute("data-webview-url")).toBe(
      "https://example.com"
    );
  });

  it("back, forward, and refresh buttons exist; back/forward initially disabled", () => {
    render(<Safari />);
    const toolbar = getToolbar();
    const back = within(toolbar).getByTestId(
      "safari-back"
    ) as HTMLButtonElement;
    const forward = within(toolbar).getByTestId(
      "safari-forward"
    ) as HTMLButtonElement;
    expect(back.disabled).toBe(true);
    expect(forward.disabled).toBe(true);
  });

  // -----------------------------------------------------------------
  // Step 2: navigation state + iframe wiring.
  // -----------------------------------------------------------------

  it("renders a sandboxed iframe with the expected sandbox + referrer attributes", () => {
    render(<Safari />);
    const iframe = screen.getByTestId(
      "safari-iframe"
    ) as HTMLIFrameElement;
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin allow-forms"
    );
    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(iframe.getAttribute("src")).toBe("https://example.com");
  });

  it("typing into the address bar updates only the input value, not the active URL", () => {
    render(<Safari />);
    const address = screen.getByTestId(
      "safari-address"
    ) as HTMLInputElement;

    fireEvent.change(address, {
      target: { value: "https://docs.example.org" },
    });

    // The input reflects the in-progress edit.
    expect(address.value).toBe("https://docs.example.org");
    // The committed URL is untouched until the user submits.
    expect(screen.getByTestId("safari").getAttribute("data-url")).toBe(
      "https://example.com"
    );
  });

  it("pressing Enter in the address bar navigates to a new URL", () => {
    render(<Safari />);
    navigateViaAddressBar("https://docs.example.org");

    const wrapper = screen.getByTestId("safari");
    expect(wrapper.getAttribute("data-url")).toBe(
      "https://docs.example.org"
    );
    const iframe = screen.getByTestId(
      "safari-iframe"
    ) as HTMLIFrameElement;
    expect(iframe.getAttribute("src")).toBe("https://docs.example.org");
    expect(wrapper.getAttribute("data-history-length")).toBe("2");
    expect(wrapper.getAttribute("data-history-index")).toBe("1");
  });

  it("Enter with the same URL acts as a refresh (no new history entry)", () => {
    render(<Safari />);
    const wrapper = screen.getByTestId("safari");
    const initialCounter = Number(
      wrapper.getAttribute("data-refresh-counter")
    );

    navigateViaAddressBar("https://example.com");

    expect(wrapper.getAttribute("data-history-length")).toBe("1");
    expect(Number(wrapper.getAttribute("data-history-index"))).toBe(0);
    expect(
      Number(wrapper.getAttribute("data-refresh-counter"))
    ).toBeGreaterThan(initialCounter);
  });

  it("Enter with an empty/whitespace value is ignored", () => {
    render(<Safari />);
    const wrapper = screen.getByTestId("safari");

    navigateViaAddressBar("   ");

    expect(wrapper.getAttribute("data-url")).toBe("https://example.com");
    expect(wrapper.getAttribute("data-history-length")).toBe("1");
  });

  it("back button moves to the previous URL and forward returns to it", () => {
    render(<Safari />);
    const toolbar = getToolbar();

    navigateViaAddressBar("https://docs.example.org");
    navigateViaAddressBar("https://www.iana.org");

    const wrapper = screen.getByTestId("safari");
    expect(wrapper.getAttribute("data-url")).toBe("https://www.iana.org");
    expect(wrapper.getAttribute("data-history-length")).toBe("3");
    expect(wrapper.getAttribute("data-history-index")).toBe("2");

    fireEvent.click(within(toolbar).getByTestId("safari-back"));
    expect(wrapper.getAttribute("data-url")).toBe(
      "https://docs.example.org"
    );
    expect(wrapper.getAttribute("data-history-index")).toBe("1");
    const iframeAfterBack = screen.getByTestId(
      "safari-iframe"
    ) as HTMLIFrameElement;
    expect(iframeAfterBack.getAttribute("src")).toBe(
      "https://docs.example.org"
    );

    fireEvent.click(within(toolbar).getByTestId("safari-forward"));
    expect(wrapper.getAttribute("data-url")).toBe("https://www.iana.org");
    expect(wrapper.getAttribute("data-history-index")).toBe("2");
  });

  it("back is disabled at the start of history; forward is disabled at the end", () => {
    render(<Safari />);
    const toolbar = getToolbar();
    const back = within(toolbar).getByTestId(
      "safari-back"
    ) as HTMLButtonElement;
    const forward = within(toolbar).getByTestId(
      "safari-forward"
    ) as HTMLButtonElement;

    expect(back.disabled).toBe(true);
    expect(forward.disabled).toBe(true);

    navigateViaAddressBar("https://docs.example.org");

    expect(back.disabled).toBe(false);
    expect(forward.disabled).toBe(true);

    fireEvent.click(within(toolbar).getByTestId("safari-back"));
    expect(back.disabled).toBe(true);
    expect(forward.disabled).toBe(false);
  });

  it("navigating from a mid-history position drops forward history", () => {
    render(<Safari />);
    const wrapper = screen.getByTestId("safari");

    navigateViaAddressBar("https://docs.example.org");
    navigateViaAddressBar("https://www.iana.org");
    // Go back one step so a new branch is created.
    fireEvent.click(within(getToolbar()).getByTestId("safari-back"));
    expect(wrapper.getAttribute("data-history-length")).toBe("3");
    expect(wrapper.getAttribute("data-history-index")).toBe("1");

    // Branching from the middle truncates forward history.
    navigateViaAddressBar("https://www.example.net");
    expect(wrapper.getAttribute("data-history-length")).toBe("3");
    expect(wrapper.getAttribute("data-history-index")).toBe("2");
    expect(wrapper.getAttribute("data-url")).toBe(
      "https://www.example.net"
    );
  });

  it("refresh button reloads the iframe by bumping the refresh counter", () => {
    render(<Safari />);
    const toolbar = getToolbar();
    const wrapper = screen.getByTestId("safari");

    const initialRefresh = Number(
      wrapper.getAttribute("data-refresh-counter")
    );

    fireEvent.click(within(toolbar).getByTestId("safari-refresh"));

    expect(
      Number(wrapper.getAttribute("data-refresh-counter"))
    ).toBe(initialRefresh + 1);
    // The iframe stays mounted after refresh; React remounts it
    // internally because its derived `key` changes.
    expect(screen.getByTestId("safari-iframe")).toBeInTheDocument();
  });

  it("renders the fallback placeholder when the iframe fails to load via the timeout", () => {
    render(<Safari />);
    // No fallback should be visible yet.
    expect(screen.queryByTestId("safari-fallback")).toBeNull();

    // Advance timers past the load timeout.
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    const fallback = screen.getByTestId("safari-fallback");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("This site cannot be framed");
    expect(fallback).toHaveTextContent("https://example.com");
    // Iframe is gone when the fallback is showing.
    expect(screen.queryByTestId("safari-iframe")).toBeNull();
  });

  it("clears the fallback when the iframe fires its load event before the timeout", () => {
    render(<Safari />);

    const iframe = screen.getByTestId("safari-iframe");
    // Simulate a successful load BEFORE the timeout fires.
    act(() => {
      fireEvent.load(iframe);
    });

    // Advance past the timeout — should still not be in fallback.
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByTestId("safari-fallback")).toBeNull();
    expect(screen.getByTestId("safari-iframe")).toBeInTheDocument();
  });

  it("wires the iframe onError handler so cross-origin failures surface the fallback in a real browser", () => {
    render(<Safari />);
    // React 18 does not deliver synthetic `error` events for iframes
    // in jsdom (the real `error` event only fires from a browser when
    // a cross-origin frame fails to load, and jsdom does not model
    // that). We instead assert the handler is attached by inspecting
    // the React fiber's prop; the timeout-driven fallback test above
    // covers the user-visible behavior.
    const iframe = screen.getByTestId("safari-iframe") as HTMLIFrameElement;
    const fiberKey = Object.keys(iframe).find(
      (k) => k.startsWith("__reactProps$")
    );
    expect(fiberKey).toBeDefined();
    const props = (iframe as unknown as Record<string, unknown>)[
      fiberKey as string
    ] as { onError?: unknown; onLoad?: unknown };
    expect(typeof props.onError).toBe("function");
    expect(typeof props.onLoad).toBe("function");
  });

  it("clears the fallback when the user navigates to a new URL", () => {
    render(<Safari />);

    // Trigger the timeout fallback.
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByTestId("safari-fallback")).toBeInTheDocument();

    // Navigating should mount a fresh iframe and dismiss the fallback.
    act(() => {
      navigateViaAddressBar("https://docs.example.org");
    });

    expect(screen.queryByTestId("safari-fallback")).toBeNull();
    const iframe = screen.getByTestId(
      "safari-iframe"
    ) as HTMLIFrameElement;
    expect(iframe.getAttribute("src")).toBe("https://docs.example.org");
  });
});
