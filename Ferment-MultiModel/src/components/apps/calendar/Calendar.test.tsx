import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Calendar from "./Calendar";
import {
  CALENDAR_GRID_SIZE,
  DAY_LABELS,
  initialMockEvents,
  monthName,
} from "./mockCalendar";

/**
 * Helper: scope lookups to the calendar's day grid so chips and
 * detail rows never leak into cell queries.
 */
function getGrid(): HTMLElement {
  return screen.getByTestId("calendar-grid");
}

/**
 * Helper: scope lookups to the details panel.
 */
function getDetails(): HTMLElement {
  return screen.getByTestId("calendar-details");
}

describe("Calendar", () => {
  it("renders the four main regions: toolbar, weekday header, grid, and details", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-weekdays")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-grid")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-details")).toBeInTheDocument();
  });

  it("renders exactly 42 day cells in the month grid", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const cells = within(getGrid()).getAllByRole("gridcell");
    expect(cells).toHaveLength(CALENDAR_GRID_SIZE);
  });

  it("renders one weekday header cell per DAY_LABELS entry", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const header = screen.getByTestId("calendar-weekdays");
    const weekdays = within(header).getAllByTestId(/^calendar-weekday-/);
    expect(weekdays).toHaveLength(DAY_LABELS.length);
    expect(DAY_LABELS).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });

  it("exposes the visible month and year via data attributes and the toolbar title", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const wrapper = screen.getByTestId("calendar");
    expect(wrapper.getAttribute("data-year")).toBe("2025");
    expect(wrapper.getAttribute("data-month")).toBe("0");

    const title = screen.getByTestId("calendar-title");
    expect(title.textContent).toBe("January 2025");
  });

  it("marks out-of-month cells with data-current-month=\"false\"", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const cells = within(getGrid()).getAllByRole("gridcell");
    const outOfMonth = cells.filter(
      (c) => c.getAttribute("data-current-month") === "false"
    );
    // A January grid always bleeds into the previous and next month.
    expect(outOfMonth.length).toBeGreaterThan(0);
    // Every flagged out-of-month cell should carry the out class so
    // CSS can dim it.
    for (const cell of outOfMonth) {
      expect(cell.className).toContain("calendar__cell--out");
    }
  });

  it("navigates to the previous month when the prev button is clicked", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const wrapper = screen.getByTestId("calendar");
    expect(wrapper.getAttribute("data-month")).toBe("0");

    fireEvent.click(screen.getByTestId("calendar-prev"));

    expect(wrapper.getAttribute("data-year")).toBe("2024");
    expect(wrapper.getAttribute("data-month")).toBe("11");
    expect(screen.getByTestId("calendar-title").textContent).toBe(
      "December 2024"
    );
  });

  it("navigates to the next month when the next button is clicked", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const wrapper = screen.getByTestId("calendar");
    expect(wrapper.getAttribute("data-month")).toBe("0");

    fireEvent.click(screen.getByTestId("calendar-next"));

    expect(wrapper.getAttribute("data-year")).toBe("2025");
    expect(wrapper.getAttribute("data-month")).toBe("1");
    expect(screen.getByTestId("calendar-title").textContent).toBe(
      `${monthName(1)} 2025`
    );
  });

  it("navigates multiple months forward and backward through year boundaries", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const wrapper = screen.getByTestId("calendar");
    const next = screen.getByTestId("calendar-next");
    const prev = screen.getByTestId("calendar-prev");

    // Click "next" twice: Jan -> Feb -> Mar.
    fireEvent.click(next);
    fireEvent.click(next);
    expect(wrapper.getAttribute("data-year")).toBe("2025");
    expect(wrapper.getAttribute("data-month")).toBe("2");

    // Step one more — April — and confirm the title updates.
    fireEvent.click(next);
    expect(screen.getByTestId("calendar-title").textContent).toBe(
      "April 2025"
    );

    // Step back three times — Jan 2025.
    fireEvent.click(prev);
    fireEvent.click(prev);
    fireEvent.click(prev);
    expect(wrapper.getAttribute("data-year")).toBe("2025");
    expect(wrapper.getAttribute("data-month")).toBe("0");

    // Step back one more — December 2024.
    fireEvent.click(prev);
    expect(wrapper.getAttribute("data-year")).toBe("2024");
    expect(wrapper.getAttribute("data-month")).toBe("11");
  });

  it("renders every seeded event on the matching day cell", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);

    // The visible month is January 2025 — only check events that fall
    // in that month, since later-month events are correctly hidden
    // until the user navigates to them.
    const januaryEvents = initialMockEvents.filter(
      (e) => e.year === 2025 && e.month === 0
    );
    expect(januaryEvents.length).toBeGreaterThan(0);

    for (const event of januaryEvents) {
      const iso = `${event.year}-${String(event.month + 1).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`;
      const cell = within(getGrid()).getByTestId(`calendar-cell-${iso}`);
      expect(cell).toBeInTheDocument();

      const chips = within(cell).getAllByTestId(
        `calendar-event-${event.id}`
      );
      expect(chips).toHaveLength(1);
      expect(within(chips[0]!).getByText(event.title)).toBeInTheDocument();
    }
  });

  it("reports event counts on each day cell via data attributes", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const grid = getGrid();
    // Jan 2 (evt-001 only), Jan 6 (evt-002 only), Jan 8 (evt-003 only).
    const jan02 = within(grid).getByTestId("calendar-cell-2025-01-02");
    expect(jan02.getAttribute("data-event-count")).toBe("1");
    const jan06 = within(grid).getByTestId("calendar-cell-2025-01-06");
    expect(jan06.getAttribute("data-event-count")).toBe("1");
    // Jan 1 has no events in the seed dataset.
    const jan01 = within(grid).getByTestId("calendar-cell-2025-01-01");
    expect(jan01.getAttribute("data-event-count")).toBe("0");
  });

  it("renders chips with the colour class matching the event's color field", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const chip = within(getGrid()).getByTestId("calendar-event-evt-001");
    expect(chip.getAttribute("data-event-color")).toBe("indigo");
    expect(chip.className).toContain("calendar__event--indigo");

    const chip2 = within(getGrid()).getByTestId("calendar-event-evt-002");
    expect(chip2.getAttribute("data-event-color")).toBe("rose");
    expect(chip2.className).toContain("calendar__event--rose");
  });

  it("clicking a day cell selects it and shows its events in the details panel", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const wrapper = screen.getByTestId("calendar");
    expect(wrapper.getAttribute("data-selected-date")).toBe("");

    fireEvent.click(
      within(getGrid()).getByTestId("calendar-cell-2025-01-06")
    );

    expect(wrapper.getAttribute("data-selected-date")).toBe("2025-01-06");
    const cell = within(getGrid()).getByTestId("calendar-cell-2025-01-06");
    expect(cell.className).toContain("calendar__cell--selected");

    const details = getDetails();
    expect(details.getAttribute("data-iso-date")).toBe("2025-01-06");
    expect(details.getAttribute("data-empty")).toBe("false");
    expect(within(details).getByTestId("calendar-detail-evt-002"))
      .toBeInTheDocument();
    expect(within(details).getByTestId("calendar-detail-title-evt-002")
      .textContent).toBe("Design review");
  });

  it("clicking an event chip selects its day and reveals the matching detail row", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const wrapper = screen.getByTestId("calendar");
    expect(wrapper.getAttribute("data-selected-date")).toBe("");

    fireEvent.click(within(getGrid()).getByTestId("calendar-event-evt-005"));

    expect(wrapper.getAttribute("data-selected-date")).toBe("2025-01-15");

    const details = getDetails();
    expect(details.getAttribute("data-iso-date")).toBe("2025-01-15");
    const detailRow = within(details).getByTestId("calendar-detail-evt-005");
    expect(within(detailRow).getByTestId("calendar-detail-title-evt-005")
      .textContent).toBe("Tahoe beta demo");
  });

  it("shows the 'No events' empty state when a selected day has no events", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    fireEvent.click(
      within(getGrid()).getByTestId("calendar-cell-2025-01-01")
    );

    const details = getDetails();
    expect(details.getAttribute("data-empty")).toBe("true");
    expect(within(details).getByTestId("calendar-details-empty"))
      .toBeInTheDocument();
    expect(within(details).getByTestId("calendar-details-empty")
      .textContent).toBe("No events");
  });

  it("clears the selection when the close button is clicked", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    const wrapper = screen.getByTestId("calendar");

    fireEvent.click(
      within(getGrid()).getByTestId("calendar-cell-2025-01-06")
    );
    expect(wrapper.getAttribute("data-selected-date")).toBe("2025-01-06");

    fireEvent.click(screen.getByTestId("calendar-details-close"));
    expect(wrapper.getAttribute("data-selected-date")).toBe("");
    const details = getDetails();
    expect(details.getAttribute("data-empty")).toBe("true");
  });

  it("renders the title and time label for timed events in the detail panel", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    fireEvent.click(
      within(getGrid()).getByTestId("calendar-cell-2025-01-02")
    );

    const detail = within(getDetails()).getByTestId("calendar-detail-evt-001");
    expect(within(detail).getByTestId("calendar-detail-title-evt-001")
      .textContent).toBe("Team standup");

    const meta = within(detail).getByTestId("calendar-detail-meta-evt-001");
    // "09:00" should render as "9:00 AM".
    expect(meta.textContent).toContain("9:00 AM");
    // The duration comes from the dataset (30 minutes).
    expect(meta.textContent).toContain("30 min");
    // The location is set on this event.
    expect(within(detail).getByTestId("calendar-detail-location-evt-001")
      .textContent).toContain("Zoom");
  });

  it("renders the 'All day' label for events without a startTime", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    fireEvent.click(
      within(getGrid()).getByTestId("calendar-cell-2025-01-15")
    );

    const meta = within(getDetails()).getByTestId(
      "calendar-detail-meta-evt-005"
    );
    expect(meta.textContent).toContain("All day");
  });

  it("switching to the next month hides events from the current month and shows new ones", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    // January has evt-001 on Jan 2.
    expect(
      within(getGrid()).queryByTestId("calendar-event-evt-001")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("calendar-next"));
    // February grid still has 42 cells.
    expect(within(getGrid()).getAllByRole("gridcell")).toHaveLength(
      CALENDAR_GRID_SIZE
    );
    // January's events are gone from the visible cells.
    expect(
      within(getGrid()).queryByTestId("calendar-event-evt-001")
    ).not.toBeInTheDocument();
    // February's seeded event appears.
    expect(
      within(getGrid()).getByTestId("calendar-event-evt-012")
    ).toBeInTheDocument();
  });

  it("accepts a custom initialEvents fixture and uses it instead of the seed", () => {
    const fixture = [
      {
        id: "custom-1",
        title: "Custom event",
        year: 2025,
        month: 5,
        day: 10,
        startTime: "08:00",
        color: "sky" as const,
      },
    ];
    render(
      <Calendar
        initialYear={2025}
        initialMonth={5}
        initialEvents={fixture}
      />
    );
    const grid = getGrid();
    // Custom event present.
    expect(
      within(grid).getByTestId("calendar-event-custom-1")
    ).toBeInTheDocument();
    // Seeded events from the global dataset absent.
    expect(
      within(grid).queryByTestId("calendar-event-evt-001")
    ).not.toBeInTheDocument();
  });

  it("renders the details panel title with a friendly long-form date", () => {
    render(<Calendar initialYear={2025} initialMonth={0} />);
    fireEvent.click(
      within(getGrid()).getByTestId("calendar-cell-2025-01-15")
    );

    const title = within(getDetails()).getByTestId(
      "calendar-details-title"
    );
    expect(title.textContent).toBe("Wednesday, January 15, 2025");
  });

  it("does not mutate the initialMockEvents constant when interacting", () => {
    const baseline = JSON.stringify(initialMockEvents);
    render(<Calendar initialYear={2025} initialMonth={0} />);

    // Click several days / chips / navigation buttons.
    fireEvent.click(
      within(getGrid()).getByTestId("calendar-cell-2025-01-02")
    );
    fireEvent.click(within(getGrid()).getByTestId("calendar-event-evt-007"));
    fireEvent.click(screen.getByTestId("calendar-next"));
    fireEvent.click(screen.getByTestId("calendar-prev"));
    fireEvent.click(screen.getByTestId("calendar-details-close"));

    expect(JSON.stringify(initialMockEvents)).toBe(baseline);
  });
});
