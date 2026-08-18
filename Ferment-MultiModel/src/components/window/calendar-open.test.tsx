import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";
import { initialMockEvents } from "@/components/apps/calendar/mockCalendar";

/**
 * Behavioural test for Step 3 of Phase 6: clicking the Calendar Dock
 * icon must mount a Calendar window whose body is the real Calendar UI
 * (toolbar, month grid, day details), not the placeholder that
 * {@link src/components/window/WindowManager.tsx} falls back to when an
 * app has no registered component.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Calendar: click the Calendar Dock icon and verify the real Calendar
 * UI is present inside the window layer.
 */
describe("Calendar opens from the Dock", () => {
  it("clicking the Calendar Dock icon opens a Calendar window with the real Calendar UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calendarDockButton = within(dock).getByRole("button", {
      name: getApp("calendar")?.name ?? "Calendar",
    });

    // Before launch, Calendar is not running.
    expect(calendarDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(calendarDockButton);

    // After launch, the Dock should mark Calendar as running.
    expect(calendarDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Calendar window frame.
    const layer = screen.getByTestId("window-layer");
    const calendarContent = within(layer).getByTestId("app-content-calendar");

    // Inside that frame, the real Calendar component must be present
    // (not the window-manager placeholder body).
    expect(within(calendarContent).getByTestId("calendar")).toBeInTheDocument();
    expect(
      within(calendarContent).queryByTestId("app-placeholder-calendar")
    ).not.toBeInTheDocument();

    // The three regions the user expects from the Calendar window:
    // toolbar (prev / next / today + title), month grid, and details pane.
    expect(
      within(calendarContent).getByTestId("calendar-toolbar")
    ).toBeInTheDocument();
    expect(
      within(calendarContent).getByTestId("calendar-grid")
    ).toBeInTheDocument();
    expect(
      within(calendarContent).getByTestId("calendar-details")
    ).toBeInTheDocument();
  });

  it("renders a 7-column weekday header followed by 42 day cells", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calendarDockButton = within(dock).getByRole("button", {
      name: getApp("calendar")?.name ?? "Calendar",
    });
    fireEvent.click(calendarDockButton);

    const layer = screen.getByTestId("window-layer");
    const calendarContent = within(layer).getByTestId("app-content-calendar");

    // 7 weekday labels (Sun..Sat) above the grid.
    const weekdayLabels = within(calendarContent).getByTestId(
      "calendar-weekdays"
    );
    const weekdaySpans = within(weekdayLabels).getAllByTestId(
      /^calendar-weekday-/
    );
    expect(weekdaySpans).toHaveLength(7);

    // 42 day cells (6 weeks × 7 days) so the grid is always a
    // consistent rectangle.
    const grid = within(calendarContent).getByTestId("calendar-grid");
    const dayCells = within(grid).getAllByRole("gridcell");
    expect(dayCells).toHaveLength(42);
  });

  it("clicking a day cell reveals its events in the day-details panel", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calendarDockButton = within(dock).getByRole("button", {
      name: getApp("calendar")?.name ?? "Calendar",
    });
    fireEvent.click(calendarDockButton);

    const layer = screen.getByTestId("window-layer");
    const calendarContent = within(layer).getByTestId("app-content-calendar");

    // Pick the first seeded event and navigate the Calendar from its
    // current month (driven by the system clock) back to that event's
    // month so the cell actually appears in the rendered grid.
    const expectedEvent = initialMockEvents[0];
    expect(expectedEvent).toBeDefined();
    const wrapper = within(calendarContent).getByTestId("calendar");
    const startYear = Number(wrapper.getAttribute("data-year"));
    const startMonth = Number(wrapper.getAttribute("data-month"));
    const targetYear = expectedEvent!.year;
    const targetMonth = expectedEvent!.month;
    const monthDelta =
      (startYear - targetYear) * 12 + (startMonth - targetMonth);
    expect(monthDelta).toBeGreaterThan(0);
    const prevButton = within(calendarContent).getByTestId("calendar-prev");
    for (let i = 0; i < monthDelta; i += 1) {
      fireEvent.click(prevButton);
    }
    expect(wrapper.getAttribute("data-year")).toBe(`${targetYear}`);
    expect(wrapper.getAttribute("data-month")).toBe(`${targetMonth}`);

    const expectedIso = `${targetYear}-${String(targetMonth + 1).padStart(
      2,
      "0"
    )}-${String(expectedEvent!.day).padStart(2, "0")}`;
    const cell = within(calendarContent).getByTestId(
      `calendar-cell-${expectedIso}`
    );
    fireEvent.click(cell);

    const details = within(calendarContent).getByTestId("calendar-details");
    expect(details.getAttribute("data-empty")).toBe("false");
    expect(details.getAttribute("data-iso-date")).toBe(expectedIso);
    expect(
      within(details).getByTestId(`calendar-detail-${expectedEvent!.id}`)
    ).toBeInTheDocument();
  });

  it("does not duplicate the Calendar window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const calendarDockButton = within(dock).getByRole("button", {
      name: getApp("calendar")?.name ?? "Calendar",
    });

    fireEvent.click(calendarDockButton);
    fireEvent.click(calendarDockButton);
    fireEvent.click(calendarDockButton);

    // Exactly one Calendar window should exist regardless of how many
    // times the user clicked the icon — Dock clicks on a running app
    // focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-calendar")).toHaveLength(1);
  });
});
