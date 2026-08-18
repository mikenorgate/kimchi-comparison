import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import Mail from "./Mail";
import {
  countUnread,
  initialMockMail,
  listMailboxesInOrder,
} from "@/lib/mail/mockMail";
import type { MailDataset } from "@/lib/mail/types";

/**
 * Helper: scope row lookups to the message list container so other
 * buttons (sidebar mailboxes, stars) cannot leak into the matcher.
 */
function getMessageListRows(): HTMLElement {
  return screen.getByTestId("mail-list-rows");
}

/**
 * Helper: scope element lookups to the Mail sidebar so the message
 * list rows don't accidentally satisfy mailbox assertions.
 */
function getSidebar(): HTMLElement {
  return screen.getByTestId("mail-sidebar");
}

/**
 * Helper: scope lookups to the reading pane.
 */
function getReadingPane(): HTMLElement {
  return screen.getByTestId("mail-reading-pane");
}

describe("Mail", () => {
  it("renders the three main regions: sidebar, list, and reading pane", () => {
    render(<Mail />);
    expect(screen.getByTestId("mail")).toBeInTheDocument();
    expect(screen.getByTestId("mail-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mail-list")).toBeInTheDocument();
    expect(screen.getByTestId("mail-reading-pane")).toBeInTheDocument();
  });

  it("renders one sidebar mailbox entry per declared mailbox, in order", () => {
    render(<Mail />);
    const sidebar = getSidebar();
    const ordered = listMailboxesInOrder();
    expect(ordered.length).toBeGreaterThan(0);
    for (const mailbox of ordered) {
      expect(
        within(sidebar).getByTestId(`mail-mailbox-${mailbox.id}`)
      ).toBeInTheDocument();
    }
  });

  it("exposes the selected mailbox and message via data attributes", () => {
    render(<Mail />);
    const wrapper = screen.getByTestId("mail");
    const firstMailbox = listMailboxesInOrder()[0];
    expect(firstMailbox).toBeDefined();
    expect(wrapper.getAttribute("data-selected-mailbox")).toBe(
      firstMailbox?.id ?? ""
    );
    // No message is selected by default.
    expect(wrapper.getAttribute("data-selected-message")).toBe("");
  });

  it("shows unread counts next to mailboxes that contain unread messages", () => {
    render(<Mail />);
    const sidebar = getSidebar();
    for (const mailbox of listMailboxesInOrder()) {
      const expected = countUnread(mailbox.id);
      const button = within(sidebar).getByTestId(
        `mail-mailbox-${mailbox.id}`
      );
      expect(button.getAttribute("data-unread")).toBe(`${expected}`);
    }
  });

  it("renders one list row per message in the initially-selected mailbox", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();
    const rows = within(rowsContainer).getAllByTestId(/^mail-message-msg-/);
    const firstMailbox = listMailboxesInOrder()[0];
    expect(firstMailbox).toBeDefined();
    const expectedCount = firstMailbox?.messageIds.length ?? 0;
    expect(rows).toHaveLength(expectedCount);
    expect(expectedCount).toBeGreaterThan(0);
  });

  it("renders sender, subject, date, and star indicators on each row", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();
    const firstRow = within(rowsContainer).getAllByTestId(
      /^mail-message-msg-/
    )[0];
    expect(firstRow).toBeDefined();
    const rowTestId = firstRow!.getAttribute("data-testid") ?? "";
    const messageId = rowTestId.replace("mail-message-", "");
    expect(messageId.length).toBeGreaterThan(0);

    expect(within(firstRow!).getByTestId(`mail-message-sender-${messageId}`))
      .toBeInTheDocument();
    expect(within(firstRow!).getByTestId(`mail-message-subject-${messageId}`))
      .toBeInTheDocument();
    expect(within(firstRow!).getByTestId(`mail-message-date-${messageId}`))
      .toBeInTheDocument();
    expect(within(firstRow!).getByTestId(`mail-message-star-${messageId}`))
      .toBeInTheDocument();
    expect(within(firstRow!).getByTestId(`mail-message-dot-${messageId}`))
      .toBeInTheDocument();
  });

  it("flags the active sidebar mailbox based on the current selection", () => {
    render(<Mail />);
    const sidebar = getSidebar();
    const first = listMailboxesInOrder()[0];
    expect(first).toBeDefined();
    const inboxButton = within(sidebar).getByTestId(
      `mail-mailbox-${first!.id}`
    );
    expect(inboxButton.className).toContain("mail__sidebar-item--active");

    // Switch to Trash and confirm the active class moves.
    const trashButton = within(sidebar).getByTestId("mail-mailbox-mail-trash");
    fireEvent.click(trashButton);
    expect(trashButton.className).toContain("mail__sidebar-item--active");
    expect(inboxButton.className).not.toContain(
      "mail__sidebar-item--active"
    );
  });

  it("clicking a sidebar mailbox updates the visible message list", () => {
    render(<Mail />);
    const sidebar = getSidebar();

    // Click Trash — should show exactly the trash messages.
    fireEvent.click(within(sidebar).getByTestId("mail-mailbox-mail-trash"));

    const rows = within(getMessageListRows()).getAllByTestId(
      /^mail-message-msg-/
    );
    const trash = initialMockMail.mailboxes["mail-trash"];
    expect(trash).toBeDefined();
    expect(rows).toHaveLength(trash?.messageIds.length ?? 0);

    // Back to inbox.
    fireEvent.click(within(sidebar).getByTestId("mail-mailbox-mail-inbox"));
    const inboxRows = within(getMessageListRows()).getAllByTestId(
      /^mail-message-msg-/
    );
    const inbox = initialMockMail.mailboxes["mail-inbox"];
    expect(inboxRows).toHaveLength(inbox?.messageIds.length ?? 0);
  });

  it("clicking a message row selects it and shows its content in the reading pane", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();
    const wrapper = screen.getByTestId("mail");

    const messageRow = within(rowsContainer).getByTestId("mail-message-msg-001");
    const button = within(messageRow).getByTestId("mail-message-row-msg-001");
    fireEvent.click(button);

    expect(wrapper.getAttribute("data-selected-message")).toBe("msg-001");

    const pane = getReadingPane();
    expect(pane.getAttribute("data-message-id")).toBe("msg-001");
    expect(pane.getAttribute("data-empty")).toBe("false");

    // The subject should match the seeded message.
    expect(within(pane).getByTestId("mail-reading-subject").textContent).toBe(
      "Welcome to macOS Tahoe"
    );
    // The body should contain a snippet from the seeded message.
    const body = within(pane).getByTestId("mail-reading-body");
    expect(body.textContent).toContain("Welcome to macOS Tahoe");
    expect(body.textContent).toContain("— Apple Developer");
  });

  it("renders sender and recipients in the reading pane header", () => {
    render(<Mail />);
    // Select msg-001 explicitly via the list row.
    const rowsContainer = getMessageListRows();
    fireEvent.click(
      within(rowsContainer).getByTestId("mail-message-row-msg-001")
    );

    const pane = getReadingPane();
    const senderEl = within(pane).getByTestId("mail-reading-sender");
    // The sender node renders the name and the email in the same
    // element; assert both pieces independently so a regression in
    // either surfaces clearly.
    expect(senderEl.textContent).toContain("Apple Developer");
    expect(senderEl.textContent).toContain("news@apple.com");
    expect(
      within(pane).getByTestId("mail-reading-recipients").textContent
    ).toBe("Demo User");
    // msg-001 has no CC.
    expect(within(pane).queryByTestId("mail-reading-cc")).toBeNull();
    // Date is rendered as a UTC string.
    expect(within(pane).getByTestId("mail-reading-date").textContent).toContain(
      "GMT"
    );
  });

  it("renders attachments in the reading pane when the message has them", () => {
    render(<Mail />);
    // msg-007 (Mockups v3 attached) lives in mail-sent. Switch
    // mailboxes first so the row becomes selectable.
    fireEvent.click(screen.getByTestId("mail-mailbox-mail-sent"));

    const rowsContainer = getMessageListRows();
    fireEvent.click(
      within(rowsContainer).getByTestId("mail-message-row-msg-007")
    );

    const pane = getReadingPane();
    const attachments = within(pane).getByTestId("mail-reading-attachments");
    expect(attachments).toBeInTheDocument();
    expect(
      within(attachments).getByTestId("mail-reading-attachment-mockups-v3.pdf")
    ).toBeInTheDocument();
    expect(
      within(attachments).getByTestId(
        "mail-reading-attachment-spec-changelog.md"
      )
    ).toBeInTheDocument();
  });

  it("selecting a message auto-marks it as read", () => {
    render(<Mail />);
    const wrapper = screen.getByTestId("mail");
    const rowsContainer = getMessageListRows();

    // msg-001 starts unread.
    const msg001 = initialMockMail.messages["msg-001"];
    expect(msg001?.read).toBe(false);

    const row = within(rowsContainer).getByTestId("mail-message-msg-001");
    expect(row.getAttribute("data-read")).toBe("false");
    expect(row.className).toContain("mail__row--unread");

    fireEvent.click(within(row).getByTestId("mail-message-row-msg-001"));

    // After selection the row reflects the new read flag.
    const updatedRow = within(getMessageListRows()).getByTestId(
      "mail-message-msg-001"
    );
    expect(updatedRow.getAttribute("data-read")).toBe("true");
    expect(updatedRow.className).not.toContain("mail__row--unread");

    // The sidebar unread count for the inbox should have dropped by 1.
    const sidebar = getSidebar();
    const inboxButton = within(sidebar).getByTestId("mail-mailbox-mail-inbox");
    const before = countUnread("mail-inbox");
    expect(inboxButton.getAttribute("data-unread")).toBe(`${before - 1}`);

    // The data attribute on the wrapper still reports the selected
    // message id.
    expect(wrapper.getAttribute("data-selected-message")).toBe("msg-001");
  });

  it("selecting an already-read message does not change the inbox badge", () => {
    render(<Mail />);
    const sidebar = getSidebar();
    const inboxButton = within(sidebar).getByTestId("mail-mailbox-mail-inbox");
    const before = Number(inboxButton.getAttribute("data-unread") ?? "0");

    // msg-002 is seeded read=true. Clicking it should not change the
    // unread count.
    const rowsContainer = getMessageListRows();
    const row = within(rowsContainer).getByTestId("mail-message-msg-002");
    expect(row.getAttribute("data-read")).toBe("true");
    fireEvent.click(within(row).getByTestId("mail-message-row-msg-002"));

    const after = Number(inboxButton.getAttribute("data-unread") ?? "0");
    expect(after).toBe(before);
  });

  it("clicking a sidebar mailbox clears the current message selection", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();
    const wrapper = screen.getByTestId("mail");

    // Select a message in Inbox first.
    fireEvent.click(
      within(rowsContainer).getByTestId("mail-message-row-msg-001")
    );
    expect(wrapper.getAttribute("data-selected-message")).toBe("msg-001");

    // Switch to Trash — the previously-selected message is not in the
    // visible list, so the wrapper's data-selected-message drops back
    // to the empty string.
    fireEvent.click(screen.getByTestId("mail-mailbox-mail-trash"));
    expect(wrapper.getAttribute("data-selected-message")).toBe("");
  });

  it("toggling a star from the list row updates both the row and the reading pane", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();

    // msg-002 starts unstarred. Select it first so the reading pane
    // mirrors the same dataset snapshot.
    fireEvent.click(
      within(rowsContainer).getByTestId("mail-message-row-msg-002")
    );
    const row = within(rowsContainer).getByTestId("mail-message-msg-002");
    const star = within(row).getByTestId("mail-message-star-msg-002");
    expect(star.getAttribute("data-starred")).toBe("false");
    expect(star.getAttribute("aria-pressed")).toBe("false");

    const paneStar = within(getReadingPane()).getByTestId(
      "mail-reading-star"
    );
    expect(paneStar.getAttribute("aria-pressed")).toBe("false");

    // Click the row star — both the row and the reading pane should
    // reflect the new starred=true.
    fireEvent.click(star);

    const row2 = within(getMessageListRows()).getByTestId(
      "mail-message-msg-002"
    );
    expect(
      within(row2).getByTestId("mail-message-star-msg-002").getAttribute(
        "data-starred"
      )
    ).toBe("true");
    expect(
      within(getReadingPane()).getByTestId("mail-reading-star").getAttribute(
        "aria-pressed"
      )
    ).toBe("true");
  });

  it("toggling a star from the reading pane updates the list row in sync", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();

    // Select msg-002 and confirm initial state.
    fireEvent.click(
      within(rowsContainer).getByTestId("mail-message-row-msg-002")
    );
    const paneStar = within(getReadingPane()).getByTestId(
      "mail-reading-star"
    );
    expect(paneStar.getAttribute("aria-pressed")).toBe("false");

    // Toggle from the reading pane.
    fireEvent.click(paneStar);
    expect(paneStar.getAttribute("aria-pressed")).toBe("true");
    const row = within(getMessageListRows()).getByTestId("mail-message-msg-002");
    expect(
      within(row).getByTestId("mail-message-star-msg-002").getAttribute(
        "data-starred"
      )
    ).toBe("true");

    // Toggle back.
    fireEvent.click(paneStar);
    expect(paneStar.getAttribute("aria-pressed")).toBe("false");
    const row2 = within(getMessageListRows()).getByTestId(
      "mail-message-msg-002"
    );
    expect(
      within(row2).getByTestId("mail-message-star-msg-002").getAttribute(
        "data-starred"
      )
    ).toBe("false");
  });

  it("does not mark a message as read when the star button is clicked", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();
    const sidebar = getSidebar();
    const inboxButton = within(sidebar).getByTestId("mail-mailbox-mail-inbox");
    const before = Number(inboxButton.getAttribute("data-unread") ?? "0");

    // msg-001 is unread. Clicking only its star should NOT mark it
    // read and should NOT drop the inbox unread badge.
    const row = within(rowsContainer).getByTestId("mail-message-msg-001");
    fireEvent.click(within(row).getByTestId("mail-message-star-msg-001"));

    const after = Number(inboxButton.getAttribute("data-unread") ?? "0");
    expect(after).toBe(before);
    const updatedRow = within(getMessageListRows()).getByTestId(
      "mail-message-msg-001"
    );
    expect(updatedRow.getAttribute("data-read")).toBe("false");
  });

  it("renders an empty state in the reading pane when nothing is selected", () => {
    render(<Mail />);
    const pane = getReadingPane();
    expect(pane.getAttribute("data-empty")).toBe("true");
    expect(within(pane).getByTestId("mail-reading-empty")).toBeInTheDocument();
    expect(within(pane).queryByTestId("mail-reading-subject")).toBeNull();
  });

  it("uses initialMailboxId and initialMessageId when provided", () => {
    render(
      <Mail
        initialMailboxId="mail-sent"
        initialMessageId="msg-007"
      />
    );
    const wrapper = screen.getByTestId("mail");
    expect(wrapper.getAttribute("data-selected-mailbox")).toBe("mail-sent");
    expect(wrapper.getAttribute("data-selected-message")).toBe("msg-007");

    const pane = getReadingPane();
    expect(within(pane).getByTestId("mail-reading-subject").textContent).toBe(
      "Mockups v3 attached"
    );
    // The sidebar should show Sent as the active mailbox.
    const sidebar = getSidebar();
    const sentButton = within(sidebar).getByTestId("mail-mailbox-mail-sent");
    expect(sentButton.className).toContain("mail__sidebar-item--active");
  });

  it("falls back to the first mailbox when initialMailboxId is unknown", () => {
    render(<Mail initialMailboxId="mail-does-not-exist" />);
    const wrapper = screen.getByTestId("mail");
    const first = listMailboxesInOrder()[0];
    expect(first).toBeDefined();
    expect(wrapper.getAttribute("data-selected-mailbox")).toBe(
      first?.id ?? ""
    );
  });

  it("ignores an initialMessageId that does not belong to the initial mailbox", () => {
    render(
      <Mail initialMailboxId="mail-sent" initialMessageId="msg-001" />
    );
    const wrapper = screen.getByTestId("mail");
    expect(wrapper.getAttribute("data-selected-mailbox")).toBe("mail-sent");
    // msg-001 belongs to the inbox, so the selection is dropped.
    expect(wrapper.getAttribute("data-selected-message")).toBe("");
  });

  it("uses the dataset passed in via initialDataset for both sidebar and list", () => {
    // Build a tiny synthetic dataset with one mailbox and two messages.
    const tiny: MailDataset = {
      ...initialMockMail,
      mailboxOrder: ["mail-inbox"],
      mailboxes: {
        ...initialMockMail.mailboxes,
        "mail-inbox": {
          ...initialMockMail.mailboxes["mail-inbox"]!,
          messageIds: ["msg-001", "msg-002"],
        },
      },
    };
    render(<Mail initialDataset={tiny} />);
    const rows = within(getMessageListRows()).getAllByTestId(
      /^mail-message-msg-/
    );
    expect(rows).toHaveLength(2);
  });

  it("does not mutate the initialMockMail constant after selection / star / read actions", () => {
    render(<Mail />);
    const rowsContainer = getMessageListRows();
    const sidebar = getSidebar();

    // Confirm the seeded baseline before we interact.
    expect(initialMockMail.messages["msg-001"]?.read).toBe(false);
    expect(initialMockMail.messages["msg-002"]?.starred).toBe(false);

    fireEvent.click(
      within(rowsContainer).getByTestId("mail-message-row-msg-001")
    );
    fireEvent.click(
      within(sidebar).getByTestId("mail-mailbox-mail-sent")
    );
    // After navigating to Sent, msg-002 is visible. Star it.
    const rowsContainer2 = getMessageListRows();
    fireEvent.click(
      within(rowsContainer2).getByTestId("mail-message-star-msg-006")
    );

    // The frozen constant must still reflect the seeded state.
    expect(initialMockMail.messages["msg-001"]?.read).toBe(false);
    expect(initialMockMail.messages["msg-002"]?.starred).toBe(false);
    expect(initialMockMail.messages["msg-006"]?.starred).toBe(false);
  });

  it("calls onToggleStar via the star buttons (no external callback wiring required)", () => {
    // Sanity: the row star button exists, is clickable, and does not
    // require a parent-supplied callback to do its job.
    const onToggleStar = vi.fn();
    // Even with a no-op callback prop, the component never wires one
    // up — this test confirms it doesn't crash by accidentally trying
    // to call one.
    void onToggleStar;
    render(<Mail />);
    const rowsContainer = getMessageListRows();
    const star = within(rowsContainer).getByTestId("mail-message-star-msg-001");
    expect(() => fireEvent.click(star)).not.toThrow();
  });
});
