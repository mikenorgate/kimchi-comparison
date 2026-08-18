import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";
import {
  countUnread,
  initialMockMail,
  listMailboxesInOrder,
} from "@/lib/mail/mockMail";

/**
 * Behavioural test for Step 3 of Phase 5: clicking the Mail Dock icon
 * must mount a Mail window whose body is the real Mail UI (mailbox
 * sidebar, message list, reading pane), not the placeholder that
 * {@link src/components/window/WindowManager.tsx} falls back to when an
 * app has no registered component.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Mail: click the Mail Dock icon and verify the real Mail UI is
 * present inside the window layer.
 *
 * Mail-specific assertions are kept here; generic "clicking a Dock
 * icon focuses its window" coverage lives in finder-open.test.tsx /
 * safari-open.test.tsx.
 */
describe("Mail opens from the Dock", () => {
  it("clicking the Mail Dock icon opens a Mail window with the real Mail UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const mailDockButton = within(dock).getByRole("button", {
      name: getApp("mail")?.name ?? "Mail",
    });

    // Before launch, Mail is not running.
    expect(mailDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(mailDockButton);

    // After launch, the Dock should mark Mail as running.
    expect(mailDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Mail window frame.
    const layer = screen.getByTestId("window-layer");
    const mailContent = within(layer).getByTestId("app-content-mail");

    // Inside that frame, the real Mail component must be present
    // (not the window-manager placeholder body).
    expect(within(mailContent).getByTestId("mail")).toBeInTheDocument();
    expect(
      within(mailContent).queryByTestId("app-placeholder-mail")
    ).not.toBeInTheDocument();

    // The three panes the user expects from the Mail window:
    // mailbox sidebar, message list, and reading pane.
    expect(
      within(mailContent).getByTestId("mail-sidebar")
    ).toBeInTheDocument();
    expect(within(mailContent).getByTestId("mail-list")).toBeInTheDocument();
    expect(
      within(mailContent).getByTestId("mail-reading-pane")
    ).toBeInTheDocument();
  });

  it("shows the inbox mailbox by default with the seeded message list", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const mailDockButton = within(dock).getByRole("button", {
      name: getApp("mail")?.name ?? "Mail",
    });
    fireEvent.click(mailDockButton);

    const layer = screen.getByTestId("window-layer");
    const mailContent = within(layer).getByTestId("app-content-mail");
    const sidebar = within(mailContent).getByTestId("mail-sidebar");

    // The sidebar should contain at least the canonical Inbox entry,
    // and its unread badge must match the mock dataset.
    const ordered = listMailboxesInOrder(initialMockMail);
    const inbox = ordered.find((m) => m.kind === "inbox");
    expect(inbox).toBeDefined();
    expect(
      within(sidebar).getByTestId(`mail-mailbox-${inbox!.id}`)
    ).toBeInTheDocument();

    const inboxUnread = countUnread(inbox!.id, initialMockMail);
    const inboxButton = within(sidebar).getByTestId(
      `mail-mailbox-${inbox!.id}`
    );
    expect(inboxButton.getAttribute("data-unread")).toBe(`${inboxUnread}`);

    // The message list must contain one row per Inbox message and
    // those rows must be the real Mail rows (not, e.g., the dock
    // launcher leaking into the matcher).
    const listRows = within(mailContent).getByTestId("mail-list-rows");
    const rows = within(listRows).getAllByTestId(/^mail-message-msg-/);
    expect(rows).toHaveLength(inbox!.messageIds.length);
    expect(inbox!.messageIds.length).toBeGreaterThan(0);
  });

  it("selecting a message row populates the reading pane with that message", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const mailDockButton = within(dock).getByRole("button", {
      name: getApp("mail")?.name ?? "Mail",
    });
    fireEvent.click(mailDockButton);

    const layer = screen.getByTestId("window-layer");
    const mailContent = within(layer).getByTestId("app-content-mail");
    const listRows = within(mailContent).getByTestId("mail-list-rows");

    const inbox = listMailboxesInOrder(initialMockMail).find(
      (m) => m.kind === "inbox"
    );
    expect(inbox).toBeDefined();
    const targetMessageId = inbox!.messageIds[0];
    expect(targetMessageId).toBeDefined();

    const targetRow = within(listRows).getByTestId(
      `mail-message-${targetMessageId}`
    );
    const rowButton = within(targetRow).getByTestId(
      `mail-message-row-${targetMessageId}`
    );
    fireEvent.click(rowButton);

    // The reading pane must leave its empty state and show the
    // selected message's subject/body.
    const readingPane = within(mailContent).getByTestId("mail-reading-pane");
    expect(readingPane.getAttribute("data-empty")).toBe("false");
    expect(readingPane.getAttribute("data-message-id")).toBe(
      targetMessageId
    );

    const targetMessage = initialMockMail.messages[targetMessageId];
    expect(targetMessage).toBeDefined();
    expect(
      within(readingPane).getByTestId("mail-reading-subject")
    ).toHaveTextContent(targetMessage!.subject);
    const bodyNode = within(readingPane).getByTestId("mail-reading-body");
    // The body is rendered inside a <pre>; toHaveTextContent collapses
    // whitespace, so compare with normalized strings to absorb the
    // difference between the raw body (which contains newlines) and
    // the rendered text content.
    expect(bodyNode.textContent?.replace(/\s+/g, " ").trim()).toBe(
      targetMessage!.body.replace(/\s+/g, " ").trim()
    );
  });

  it("does not duplicate the Mail window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const mailDockButton = within(dock).getByRole("button", {
      name: getApp("mail")?.name ?? "Mail",
    });

    fireEvent.click(mailDockButton);
    fireEvent.click(mailDockButton);
    fireEvent.click(mailDockButton);

    // Exactly one Mail window should exist regardless of how many
    // times the user clicked the icon — Dock clicks on a running app
    // focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-mail")).toHaveLength(1);
  });
});
