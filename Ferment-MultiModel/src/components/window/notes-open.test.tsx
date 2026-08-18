import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";
import { initialMockNotes, listNotesInOrder } from "@/components/apps/notes/mockNotes";

/**
 * Behavioural test for Step 3 of Phase 6: clicking the Notes Dock icon
 * must mount a Notes window whose body is the real Notes UI (note
 * sidebar, editor), not the placeholder that
 * {@link src/components/window/WindowManager.tsx} falls back to when an
 * app has no registered component.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Notes: click the Notes Dock icon and verify the real Notes UI is
 * present inside the window layer.
 */
describe("Notes opens from the Dock", () => {
  it("clicking the Notes Dock icon opens a Notes window with the real Notes UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const notesDockButton = within(dock).getByRole("button", {
      name: getApp("notes")?.name ?? "Notes",
    });

    // Before launch, Notes is not running.
    expect(notesDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(notesDockButton);

    // After launch, the Dock should mark Notes as running.
    expect(notesDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Notes window frame.
    const layer = screen.getByTestId("window-layer");
    const notesContent = within(layer).getByTestId("app-content-notes");

    // Inside that frame, the real Notes component must be present
    // (not the window-manager placeholder body).
    expect(within(notesContent).getByTestId("notes")).toBeInTheDocument();
    expect(
      within(notesContent).queryByTestId("app-placeholder-notes")
    ).not.toBeInTheDocument();

    // The two panes the user expects from the Notes window: a sidebar
    // with the note list and an editor with title + body inputs.
    expect(
      within(notesContent).getByTestId("notes-sidebar")
    ).toBeInTheDocument();
    expect(
      within(notesContent).getByTestId("notes-editor")
    ).toBeInTheDocument();
    expect(
      within(notesContent).getByTestId("notes-editor-title")
    ).toBeInTheDocument();
    expect(
      within(notesContent).getByTestId("notes-editor-body")
    ).toBeInTheDocument();
  });

  it("renders one sidebar row per seeded note and selects the first by default", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const notesDockButton = within(dock).getByRole("button", {
      name: getApp("notes")?.name ?? "Notes",
    });
    fireEvent.click(notesDockButton);

    const layer = screen.getByTestId("window-layer");
    const notesContent = within(layer).getByTestId("app-content-notes");
    const sidebar = within(notesContent).getByTestId("notes-sidebar");

    const list = within(sidebar).getByTestId("notes-sidebar-list");
    // Each sidebar row renders five child test ids (notes-row-*,
    // notes-row-button-*, notes-row-title-*, notes-row-preview-*,
    // notes-row-date-*). Count the outer <li> rows by their
    // `data-note-id` attribute instead so the assertion isn't fooled
    // by the per-row nested ids.
    const rowItems = within(list).getAllByTestId(/^notes-row-/);
    const outerRows = rowItems.filter(
      (node) => node.getAttribute("data-note-id") !== null
    );
    expect(outerRows).toHaveLength(listNotesInOrder().length);

    // The wrapper's data attribute mirrors the seeded note count.
    const wrapper = within(notesContent).getByTestId("notes");
    expect(Number(wrapper.getAttribute("data-note-count"))).toBe(
      initialMockNotes.order.length
    );

    // The first seeded note is selected by default and shown in the
    // editor.
    const first = listNotesInOrder()[0];
    expect(first).toBeDefined();
    expect(wrapper.getAttribute("data-selected-note")).toBe(first!.id);
    const editor = within(notesContent).getByTestId("notes-editor");
    expect(editor.getAttribute("data-note-id")).toBe(first!.id);
    const titleInput = within(editor).getByTestId(
      "notes-editor-title"
    ) as HTMLInputElement;
    expect(titleInput.value).toBe(first!.title);
  });

  it("selecting a different note row updates the editor with that note's content", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const notesDockButton = within(dock).getByRole("button", {
      name: getApp("notes")?.name ?? "Notes",
    });
    fireEvent.click(notesDockButton);

    const layer = screen.getByTestId("window-layer");
    const notesContent = within(layer).getByTestId("app-content-notes");
    const sidebar = within(notesContent).getByTestId("notes-sidebar");

    const ordered = listNotesInOrder();
    expect(ordered.length).toBeGreaterThan(1);
    const second = ordered[1];
    const targetButton = within(sidebar).getByTestId(
      `notes-row-button-${second!.id}`
    );
    fireEvent.click(targetButton);

    const editor = within(notesContent).getByTestId("notes-editor");
    expect(editor.getAttribute("data-note-id")).toBe(second!.id);
    const titleInput = within(editor).getByTestId(
      "notes-editor-title"
    ) as HTMLInputElement;
    expect(titleInput.value).toBe(second!.title);
  });

  it("does not duplicate the Notes window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const notesDockButton = within(dock).getByRole("button", {
      name: getApp("notes")?.name ?? "Notes",
    });

    fireEvent.click(notesDockButton);
    fireEvent.click(notesDockButton);
    fireEvent.click(notesDockButton);

    // Exactly one Notes window should exist regardless of how many
    // times the user clicked the icon — Dock clicks on a running app
    // focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-notes")).toHaveLength(1);
  });
});
