import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Notes from "./Notes";
import {
  initialMockNotes,
  listNotesInOrder,
  type NotesDataset,
} from "./mockNotes";

/**
 * Helper: scope lookups to the note sidebar so row assertions don't
 * leak into the editor inputs.
 */
function getSidebar(): HTMLElement {
  return screen.getByTestId("notes-sidebar");
}

/**
 * Helper: scope lookups to the editor pane so tests can assert on
 * the title / body inputs without clashing with the sidebar.
 */
function getEditor(): HTMLElement {
  return screen.getByTestId("notes-editor");
}

/**
 * Build a small synthetic dataset with two notes for tests that
 * don't need the full seed.
 */
function tinyDataset(): NotesDataset {
  const noteA = {
    id: "alpha",
    title: "Alpha",
    body: "Alpha body line one\nline two",
    updatedAt: "2025-02-01T10:00:00.000Z",
  };
  const noteB = {
    id: "beta",
    title: "Beta",
    body: "Beta body",
    updatedAt: "2025-02-02T10:00:00.000Z",
  };
  return {
    notes: { [noteA.id]: noteA, [noteB.id]: noteB },
    order: [noteB.id, noteA.id],
  };
}

describe("Notes", () => {
  it("renders the two main regions: sidebar and editor", () => {
    render(<Notes />);
    expect(screen.getByTestId("notes")).toBeInTheDocument();
    expect(screen.getByTestId("notes-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("notes-editor")).toBeInTheDocument();
  });

  it("renders one sidebar row per seeded note, in dataset order", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const expected = listNotesInOrder();
    expect(expected.length).toBeGreaterThan(0);
    // Each row exposes several nested testids (notes-row-*,
    // notes-row-button-*, notes-row-title-*, etc.). To count just
    // the outer <li> items, scope by `data-note-id` on the row.
    const rowItems = within(sidebar)
      .getAllByTestId(/^notes-row-/)
      .filter((el) => (el.tagName === "LI") && el.hasAttribute("data-note-id"));
    expect(rowItems).toHaveLength(expected.length);
    for (const note of expected) {
      expect(within(sidebar).getByTestId(`notes-row-${note.id}`))
        .toBeInTheDocument();
    }
  });

  it("renders the seeded note titles in the sidebar", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    for (const note of listNotesInOrder()) {
      const titleEl = within(sidebar).getByTestId(
        `notes-row-title-${note.id}`
      );
      expect(titleEl.textContent).toBe(note.title);
    }
  });

  it("renders a one-line body preview in each row", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    for (const note of listNotesInOrder()) {
      const preview = within(sidebar).getByTestId(
        `notes-row-preview-${note.id}`
      );
      // The preview should contain the first line of the body. The
      // helper falls back to "No additional text" when the body is
      // empty, so assert against the actual computed value.
      const trimmed = note.body.trim();
      if (trimmed.length === 0) {
        expect(preview.textContent).toBe("No additional text");
      } else {
        const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? "";
        const expected =
          firstLine.length <= 80
            ? firstLine
            : firstLine.slice(0, 77) + "...";
        expect(preview.textContent).toBe(expected);
      }
    }
  });

  it("selects the first note in the dataset by default and shows it in the editor", () => {
    render(<Notes />);
    const wrapper = screen.getByTestId("notes");
    const first = listNotesInOrder()[0];
    expect(first).toBeDefined();
    expect(wrapper.getAttribute("data-selected-note")).toBe(first?.id ?? "");
    const editor = getEditor();
    expect(editor.getAttribute("data-note-id")).toBe(first?.id ?? "");
    expect(editor.getAttribute("data-empty")).toBe("false");
    const titleInput = within(editor).getByTestId("notes-editor-title");
    expect((titleInput as HTMLInputElement).value).toBe(first?.title ?? "");
    const bodyInput = within(editor).getByTestId("notes-editor-body");
    expect((bodyInput as HTMLTextAreaElement).value).toBe(first?.body ?? "");
  });

  it("exposes the note count via a data attribute", () => {
    render(<Notes />);
    const wrapper = screen.getByTestId("notes");
    const expected = listNotesInOrder().length;
    expect(Number(wrapper.getAttribute("data-note-count"))).toBe(expected);
  });

  it("flags the selected row with the active class and data-selected", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const first = listNotesInOrder()[0];
    const firstRow = within(sidebar).getByTestId(`notes-row-${first!.id}`);
    expect(firstRow.className).toContain("notes__row--selected");
    expect(firstRow.getAttribute("data-selected")).toBe("true");

    const second = listNotesInOrder()[1];
    const secondRow = within(sidebar).getByTestId(`notes-row-${second!.id}`);
    expect(secondRow.className).not.toContain("notes__row--selected");
    expect(secondRow.getAttribute("data-selected")).toBe("false");
  });

  it("clicking a different note selects it and updates the editor inputs", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const second = listNotesInOrder()[1];
    const secondRow = within(sidebar).getByTestId(
      `notes-row-button-${second!.id}`
    );
    fireEvent.click(secondRow);

    const wrapper = screen.getByTestId("notes");
    expect(wrapper.getAttribute("data-selected-note")).toBe(second!.id);

    const editor = getEditor();
    expect(editor.getAttribute("data-note-id")).toBe(second!.id);
    const titleInput = within(editor).getByTestId("notes-editor-title");
    expect((titleInput as HTMLInputElement).value).toBe(second!.title);
    const bodyInput = within(editor).getByTestId("notes-editor-body");
    expect((bodyInput as HTMLTextAreaElement).value).toBe(second!.body);
  });

  it("editing the title updates the dataset and the sidebar label", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const editor = getEditor();
    const first = listNotesInOrder()[0];
    const titleInput = within(editor).getByTestId(
      "notes-editor-title"
    ) as HTMLInputElement;

    const newTitle = "Edited title — v2";
    fireEvent.change(titleInput, { target: { value: newTitle } });

    // The input is controlled, so the DOM reflects the new value.
    expect(titleInput.value).toBe(newTitle);

    // The sidebar label updates because the dataset flushes
    // synchronously.
    const sidebarTitle = within(sidebar).getByTestId(
      `notes-row-title-${first!.id}`
    );
    expect(sidebarTitle.textContent).toBe(newTitle);
  });

  it("editing the body updates the dataset and the preview", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const editor = getEditor();
    const first = listNotesInOrder()[0];
    const bodyInput = within(editor).getByTestId(
      "notes-editor-body"
    ) as HTMLTextAreaElement;

    fireEvent.change(bodyInput, {
      target: { value: "Single line preview" },
    });

    expect(bodyInput.value).toBe("Single line preview");

    const preview = within(sidebar).getByTestId(
      `notes-row-preview-${first!.id}`
    );
    expect(preview.textContent).toBe("Single line preview");
  });

  it("editing a note moves it to the top of the list (most-recently-updated first)", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const ordered = listNotesInOrder();
    const last = ordered[ordered.length - 1];
    expect(last).toBeDefined();

    // Select the last note so the editor inputs bind to it.
    fireEvent.click(
      within(sidebar).getByTestId(`notes-row-button-${last!.id}`)
    );

    // Edit the body — this should bump the note's updatedAt and
    // reorder it above the rest.
    const bodyInput = within(getEditor()).getByTestId(
      "notes-editor-body"
    ) as HTMLTextAreaElement;
    fireEvent.change(bodyInput, {
      target: { value: "Bumped to top" },
    });

    const rows = within(sidebar).getAllByTestId(/^notes-row-/);
    expect(rows[0]?.getAttribute("data-note-id")).toBe(last!.id);
  });

  it("clicking the new-note button adds a blank note and selects it", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const wrapper = screen.getByTestId("notes");
    const beforeCount = Number(wrapper.getAttribute("data-note-count") ?? "0");

    fireEvent.click(screen.getByTestId("notes-new"));

    const afterCount = Number(wrapper.getAttribute("data-note-count") ?? "0");
    expect(afterCount).toBe(beforeCount + 1);

    // The newly-selected note should be at the top of the list.
    const rows = within(sidebar).getAllByTestId(/^notes-row-/);
    const firstRow = rows[0];
    expect(firstRow).toBeDefined();
    const newId = firstRow!.getAttribute("data-note-id") ?? "";
    expect(newId.startsWith("note-new-")).toBe(true);

    // The editor should be bound to the new note and pre-populated
    // with the default title and an empty body.
    const editor = getEditor();
    expect(editor.getAttribute("data-note-id")).toBe(newId);
    expect(
      (within(editor).getByTestId("notes-editor-title") as HTMLInputElement)
        .value
    ).toBe("New Note");
    expect(
      (within(editor).getByTestId("notes-editor-body") as HTMLTextAreaElement)
        .value
    ).toBe("");
  });

  it("deleting a note removes it from the list and updates the count", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const wrapper = screen.getByTestId("notes");
    const beforeCount = Number(wrapper.getAttribute("data-note-count") ?? "0");

    const first = listNotesInOrder()[0];
    const deleteButton = within(sidebar).getByTestId(
      `notes-delete-${first!.id}`
    );
    // Stage the delete.
    fireEvent.click(deleteButton);
    const row = within(sidebar).getByTestId(`notes-row-${first!.id}`);
    expect(row.getAttribute("data-pending-deletion")).toBe("true");

    // Confirm.
    fireEvent.click(within(sidebar).getByTestId(`notes-confirm-delete-${first!.id}`));

    const afterCount = Number(wrapper.getAttribute("data-note-count") ?? "0");
    expect(afterCount).toBe(beforeCount - 1);
    expect(within(sidebar).queryByTestId(`notes-row-${first!.id}`)).toBeNull();
  });

  it("cancelling a staged delete leaves the note in the list", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const wrapper = screen.getByTestId("notes");
    const beforeCount = Number(wrapper.getAttribute("data-note-count") ?? "0");
    const first = listNotesInOrder()[0];

    fireEvent.click(within(sidebar).getByTestId(`notes-delete-${first!.id}`));
    fireEvent.click(within(sidebar).getByTestId(`notes-cancel-delete-${first!.id}`));

    const afterCount = Number(wrapper.getAttribute("data-note-count") ?? "0");
    expect(afterCount).toBe(beforeCount);
    expect(within(sidebar).getByTestId(`notes-row-${first!.id}`))
      .toBeInTheDocument();
    // The pending flag clears.
    const row = within(sidebar).getByTestId(`notes-row-${first!.id}`);
    expect(row.getAttribute("data-pending-deletion")).toBe("false");
  });

  it("selecting a different note clears any pending delete confirmation", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const ordered = listNotesInOrder();
    const first = ordered[0];
    const second = ordered[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    fireEvent.click(within(sidebar).getByTestId(`notes-delete-${first!.id}`));
    expect(
      within(sidebar).getByTestId(`notes-row-${first!.id}`).getAttribute(
        "data-pending-deletion"
      )
    ).toBe("true");

    // Click the second row's body — the pending flag must clear.
    fireEvent.click(within(sidebar).getByTestId(`notes-row-button-${second!.id}`));
    expect(
      within(sidebar).getByTestId(`notes-row-${first!.id}`).getAttribute(
        "data-pending-deletion"
      )
    ).toBe("false");
    // The second row is now the selection.
    const wrapper = screen.getByTestId("notes");
    expect(wrapper.getAttribute("data-selected-note")).toBe(second!.id);
  });

  it("deleting the currently-selected note advances the editor to the next note", () => {
    render(<Notes />);
    const sidebar = getSidebar();
    const wrapper = screen.getByTestId("notes");
    const ordered = listNotesInOrder();
    const first = ordered[0];
    const second = ordered[1];

    expect(wrapper.getAttribute("data-selected-note")).toBe(first!.id);

    // Stage and confirm delete on the currently-selected note.
    fireEvent.click(within(sidebar).getByTestId(`notes-delete-${first!.id}`));
    fireEvent.click(within(sidebar).getByTestId(`notes-confirm-delete-${first!.id}`));

    expect(wrapper.getAttribute("data-selected-note")).toBe(second!.id);
    const editor = getEditor();
    expect(editor.getAttribute("data-note-id")).toBe(second!.id);
    expect(
      (within(editor).getByTestId("notes-editor-title") as HTMLInputElement)
        .value
    ).toBe(second!.title);
  });

  it("deleting every note empties the list and shows the empty editor", () => {
    const dataset = tinyDataset();
    render(<Notes initialDataset={dataset} />);
    const sidebar = getSidebar();
    const wrapper = screen.getByTestId("notes");

    // Stage + confirm delete on the only two notes.
    fireEvent.click(within(sidebar).getByTestId("notes-delete-beta"));
    fireEvent.click(within(sidebar).getByTestId("notes-confirm-delete-beta"));
    fireEvent.click(within(sidebar).getByTestId("notes-delete-alpha"));
    fireEvent.click(within(sidebar).getByTestId("notes-confirm-delete-alpha"));

    expect(Number(wrapper.getAttribute("data-note-count"))).toBe(0);
    expect(within(sidebar).getByTestId("notes-sidebar-empty"))
      .toBeInTheDocument();
    expect(wrapper.getAttribute("data-selected-note")).toBe("");

    const editor = getEditor();
    expect(editor.getAttribute("data-empty")).toBe("true");
    expect(within(editor).getByTestId("notes-editor-empty"))
      .toBeInTheDocument();
  });

  it("the editor delete button removes the currently-selected note", () => {
    render(<Notes />);
    const wrapper = screen.getByTestId("notes");
    const ordered = listNotesInOrder();
    const first = ordered[0];

    expect(wrapper.getAttribute("data-selected-note")).toBe(first!.id);

    fireEvent.click(screen.getByTestId("notes-editor-delete"));

    // Stage the delete from the editor.
    const sidebar = getSidebar();
    expect(
      within(sidebar).getByTestId(`notes-row-${first!.id}`).getAttribute(
        "data-pending-deletion"
      )
    ).toBe("true");

    fireEvent.click(within(sidebar).getByTestId(`notes-confirm-delete-${first!.id}`));

    expect(within(sidebar).queryByTestId(`notes-row-${first!.id}`)).toBeNull();
    // The selection should have advanced to the next note.
    const newSelected = wrapper.getAttribute("data-selected-note") ?? "";
    expect(newSelected).not.toBe(first!.id);
    expect(newSelected.length).toBeGreaterThan(0);
  });

  it("creating a note after deleting all notes populates the editor with the new note", () => {
    const dataset = tinyDataset();
    render(<Notes initialDataset={dataset} />);
    const sidebar = getSidebar();

    // Delete both.
    fireEvent.click(within(sidebar).getByTestId("notes-delete-beta"));
    fireEvent.click(within(sidebar).getByTestId("notes-confirm-delete-beta"));
    fireEvent.click(within(sidebar).getByTestId("notes-delete-alpha"));
    fireEvent.click(within(sidebar).getByTestId("notes-confirm-delete-alpha"));

    expect(screen.getByTestId("notes-editor-empty")).toBeInTheDocument();

    // Create a new note.
    fireEvent.click(screen.getByTestId("notes-new"));

    const wrapper = screen.getByTestId("notes");
    const newId = wrapper.getAttribute("data-selected-note") ?? "";
    expect(newId.startsWith("note-new-")).toBe(true);

    const editor = getEditor();
    expect(editor.getAttribute("data-empty")).toBe("false");
    expect(editor.getAttribute("data-note-id")).toBe(newId);
  });

  it("uses the initialDataset prop when provided", () => {
    const dataset = tinyDataset();
    render(<Notes initialDataset={dataset} />);
    const sidebar = getSidebar();
    // Scope to the outer <li> rows via data-note-id; the sidebar
    // also contains sub-testids like notes-row-button-*, -title-*,
    // -preview-*, and -date-*.
    const rows = within(sidebar)
      .getAllByTestId(/^notes-row-/)
      .filter((el) => el.tagName === "LI" && el.hasAttribute("data-note-id"));
    expect(rows).toHaveLength(2);
    expect(
      within(sidebar).getByTestId(`notes-row-title-beta`).textContent
    ).toBe("Beta");
    expect(
      within(sidebar).getByTestId(`notes-row-title-alpha`).textContent
    ).toBe("Alpha");
  });

  it("uses the initialSelectedId prop when it belongs to the dataset", () => {
    const dataset = tinyDataset();
    render(<Notes initialDataset={dataset} initialSelectedId="alpha" />);
    const wrapper = screen.getByTestId("notes");
    expect(wrapper.getAttribute("data-selected-note")).toBe("alpha");
    const editor = getEditor();
    expect(
      (within(editor).getByTestId("notes-editor-title") as HTMLInputElement)
        .value
    ).toBe("Alpha");
  });

  it("falls back to the first note when initialSelectedId is unknown", () => {
    const dataset = tinyDataset();
    render(
      <Notes initialDataset={dataset} initialSelectedId="does-not-exist" />
    );
    const wrapper = screen.getByTestId("notes");
    expect(wrapper.getAttribute("data-selected-note")).toBe("beta");
  });

  it("renders an empty sidebar state when the dataset is empty at mount", () => {
    const empty: NotesDataset = { notes: {}, order: [] };
    render(<Notes initialDataset={empty} />);
    const sidebar = getSidebar();
    expect(within(sidebar).getByTestId("notes-sidebar-empty"))
      .toBeInTheDocument();
    expect(within(sidebar).queryByTestId("notes-sidebar-list")).toBeNull();

    const wrapper = screen.getByTestId("notes");
    expect(Number(wrapper.getAttribute("data-note-count"))).toBe(0);
    expect(wrapper.getAttribute("data-selected-note")).toBe("");

    const editor = getEditor();
    expect(editor.getAttribute("data-empty")).toBe("true");
    expect(within(editor).getByTestId("notes-editor-empty"))
      .toBeInTheDocument();
  });

  it("does not mutate the initialMockNotes constant after interactions", () => {
    // Snapshot the dataset before any interactions.
    const before = JSON.stringify(initialMockNotes);
    render(<Notes />);

    const sidebar = getSidebar();
    const ordered = listNotesInOrder();
    const first = ordered[0];
    const editor = getEditor();

    // Select a different note, edit title and body, create one, then
    // delete another.
    fireEvent.click(within(sidebar).getByTestId(`notes-row-button-${ordered[1]!.id}`));
    fireEvent.change(within(editor).getByTestId("notes-editor-title"), {
      target: { value: "Mutated" },
    });
    fireEvent.change(within(editor).getByTestId("notes-editor-body"), {
      target: { value: "new body" },
    });
    fireEvent.click(screen.getByTestId("notes-new"));
    fireEvent.click(within(sidebar).getByTestId(`notes-delete-${first!.id}`));
    fireEvent.click(within(sidebar).getByTestId(`notes-confirm-delete-${first!.id}`));

    // The seed constant must be untouched.
    expect(JSON.stringify(initialMockNotes)).toBe(before);
  });

  it("renders the editor 'Edited …' caption with a timestamp", () => {
    render(<Notes />);
    const editor = getEditor();
    const caption = within(editor).getByTestId("notes-editor-updated");
    expect(caption.textContent).toMatch(/^Edited /);
    expect(caption.textContent?.length ?? 0).toBeGreaterThan("Edited ".length);
  });
});
