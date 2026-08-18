"use client";

import { useCallback, useMemo, useState, type MouseEvent } from "react";
import {
  countUnread,
  getMailboxMessages,
  initialMockMail,
  listMailboxesInOrder,
  markRead,
  toggleStar,
} from "@/lib/mail/mockMail";
import type {
  MailAddress,
  MailDataset,
  MailMessage,
  Mailbox,
  MailboxKind,
} from "@/lib/mail/types";

/**
 * Mail window content.
 *
 * Renders a three-pane macOS-Mail-inspired layout:
 *
 *   | sidebar (mailboxes) | message list | reading pane |
 *
 * The component owns its own selection state (selected mailbox, selected
 * message) and a working copy of the {@link MailDataset}. Reads and
 * stars are mutated through the immutable helpers in
 * `mockMail.ts` (`markRead`, `toggleStar`), so the canonical
 * `initialMockMail` is never touched and React's reconciliation stays
 * honest.
 *
 * Behavioural notes:
 * - Selecting a message auto-marks it read, matching real Mail.app.
 *   The flip is idempotent (the helper short-circuits when the flag is
 *   already true), so calling it on an already-read message does not
 *   trigger a re-render.
 * - The star toggle updates both the list row and the reading-pane
 *   header in a single re-render because both look at the same
 *   `dataset` snapshot.
 * - When nothing is selected the reading pane shows a friendly
 *   placeholder so the layout never collapses.
 * - `initialMailboxId` and `initialMessageId` props let the window
 *   manager (and tests) open Mail into a deterministic state.
 */
export interface MailProps {
  /**
   * Optional starting mailbox id. Defaults to the first entry in the
   * dataset's declared sidebar order (i.e. Inbox). Unknown ids fall
   * back to the same default so the Mail window always boots into a
   * populated state.
   */
  readonly initialMailboxId?: string;
  /**
   * Optional starting message id. Must belong to `initialMailboxId`
   * (or, when omitted, the resolved initial mailbox) — otherwise the
   * selection is dropped silently. The Mail UI never throws when the
   * message disappears between renders; it just shows the empty
   * placeholder.
   */
  readonly initialMessageId?: string;
  /**
   * Optional override for the working dataset. Defaults to
   * `initialMockMail`. Tests can pass a fixture; production always
   * uses the shared frozen constant.
   */
  readonly initialDataset?: MailDataset;
}

/**
 * Map a {@link MailboxKind} to a single-character glyph used in the
 * sidebar. macOS Mail uses coloured folder icons; we settle for a
 * cheap unicode approximation to keep this step dependency-free.
 */
function mailboxGlyph(kind: MailboxKind): string {
  switch (kind) {
    case "inbox":
      return "\u2709"; // ✉
    case "sent":
      return "\u27A4"; // ➤
    case "drafts":
      return "\u270D"; // ✍
    case "trash":
      return "\u2716"; // ✖
    case "archive":
      return "\u25A4"; // ▤
    case "junk":
      return "\u26A0"; // ⚠
    case "custom":
      return "\u25A6"; // ▦
    default:
      return "\u25A6";
  }
}

/**
 * Format an ISO-8601 date string the way Mail does: "9:23 AM" when
 * the message is from today, otherwise "Jan 15". The clock is
 * intentionally fixed to a deterministic en-US locale so tests don't
 * have to stub `Intl` to read what they expect.
 */
function formatMessageDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const now = new Date();
  const sameDay =
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate();
  if (sameDay) {
    const hours24 = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours12}:${mm} ${period}`;
  }
  const month = date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const day = date.getUTCDate();
  return `${month} ${day}`;
}

/**
 * Format a {@link MailAddress} for display: prefer `name`, fall back
 * to the bare email when the name is missing.
 */
function formatAddress(address: MailAddress): string {
  if (address.name && address.name.trim().length > 0) {
    return address.name;
  }
  return address.email;
}

/**
 * Join a list of addresses with commas. Keeps the reading pane
 * readable when a message has multiple recipients.
 */
function formatAddressList(addresses: readonly MailAddress[]): string {
  return addresses.map(formatAddress).join(", ");
}

/**
 * Resolve which mailbox should be active on first render. Defers to
 * the dataset's declared order so the sidebar order is always the
 * source of truth, regardless of which ids callers pass in.
 */
function resolveInitialMailboxId(
  dataset: MailDataset,
  requested: string | undefined
): string {
  const ordered = listMailboxesInOrder(dataset);
  if (requested && ordered.some((m) => m.id === requested)) {
    return requested;
  }
  return ordered[0]?.id ?? "";
}

/**
 * If `requestedMessageId` belongs to the resolved mailbox, return it;
 * otherwise return undefined so the reading pane starts empty.
 */
function resolveInitialMessageId(
  dataset: MailDataset,
  mailboxId: string,
  requestedMessageId: string | undefined
): string | undefined {
  if (!requestedMessageId) return undefined;
  const mailbox = dataset.mailboxes[mailboxId];
  if (!mailbox) return undefined;
  return mailbox.messageIds.includes(requestedMessageId)
    ? requestedMessageId
    : undefined;
}

export default function Mail({
  initialMailboxId,
  initialMessageId,
  initialDataset,
}: MailProps): JSX.Element {
  // Seed state from props. `useMemo` is overkill here because the
  // computation is trivial, but it makes the dependency tracking
  // explicit and keeps the resolved values stable across renders.
  const seedDataset: MailDataset = initialDataset ?? initialMockMail;
  const seedMailboxId = useMemo(
    () => resolveInitialMailboxId(seedDataset, initialMailboxId),
    // seedDataset is intentionally not a dependency — the user-supplied
    // dataset, when present, is treated as a one-time initial fixture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialMailboxId]
  );
  const seedMessageId = useMemo(
    () =>
      resolveInitialMessageId(seedDataset, seedMailboxId, initialMessageId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seedMailboxId, initialMessageId]
  );

  const [dataset, setDataset] = useState<MailDataset>(seedDataset);
  const [selectedMailboxId, setSelectedMailboxId] = useState<string>(
    seedMailboxId
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(
    seedMessageId
  );

  const mailboxes = useMemo(() => listMailboxesInOrder(dataset), [dataset]);

  const selectedMailbox: Mailbox | undefined = useMemo(
    () => dataset.mailboxes[selectedMailboxId],
    [dataset, selectedMailboxId]
  );

  const visibleMessages: readonly MailMessage[] = useMemo(
    () => getMailboxMessages(selectedMailboxId, dataset),
    [dataset, selectedMailboxId]
  );

  const selectedMessage: MailMessage | undefined = useMemo(() => {
    if (!selectedMessageId) return undefined;
    // Guard against the message being moved out of the current
    // mailbox: if the visible list doesn't include the id, drop the
    // selection so the reading pane falls back to its empty state.
    if (!visibleMessages.some((m) => m.id === selectedMessageId)) {
      return undefined;
    }
    return dataset.messages[selectedMessageId];
  }, [dataset, selectedMessageId, visibleMessages]);

  /**
   * Select a mailbox. Switching mailboxes clears the current message
   * selection so the reading pane doesn't display a message that no
   * longer belongs to the visible list.
   */
  const handleMailboxSelect = useCallback((mailboxId: string) => {
    setSelectedMailboxId(mailboxId);
    setSelectedMessageId(undefined);
  }, []);

  /**
   * Select a message and auto-mark-read via the immutable helper.
   * The helper short-circuits when the flag is already true, so this
   * is safe to call on every click without producing a wasted
   * re-render.
   */
  const handleMessageSelect = useCallback(
    (messageId: string) => {
      setSelectedMessageId(messageId);
      const current = dataset.messages[messageId];
      if (current && !current.read) {
        setDataset((prev) => markRead(messageId, prev));
      }
    },
    [dataset]
  );

  /**
   * Toggle the starred flag on a message. Safe to call from both the
   * list row and the reading-pane star button — they share the same
   * dataset snapshot so the visual updates stay consistent.
   */
  const handleToggleStar = useCallback((messageId: string) => {
    setDataset((prev) => toggleStar(messageId, prev));
  }, []);

  return (
    <div
      className="mail"
      data-testid="mail"
      data-selected-mailbox={selectedMailboxId}
      data-selected-message={selectedMessageId ?? ""}
    >
      <Sidebar
        mailboxes={mailboxes}
        dataset={dataset}
        selectedMailboxId={selectedMailboxId}
        onSelect={handleMailboxSelect}
      />

      <MessageList
        messages={visibleMessages}
        selectedMessageId={selectedMessageId}
        onSelect={handleMessageSelect}
        onToggleStar={handleToggleStar}
      />

      <ReadingPane
        message={selectedMessage}
        mailboxName={selectedMailbox?.name ?? ""}
        onToggleStar={handleToggleStar}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  readonly mailboxes: readonly Mailbox[];
  readonly dataset: MailDataset;
  readonly selectedMailboxId: string;
  readonly onSelect: (mailboxId: string) => void;
}

/**
 * The mailbox sidebar: a vertical list of folders with their unread
 * badge. Mirrors real Mail.app's left rail so testers can drive it
 * with a stable `data-testid="mail-mailbox-{id}"` selector.
 */
function Sidebar({
  mailboxes,
  dataset,
  selectedMailboxId,
  onSelect,
}: SidebarProps): JSX.Element {
  return (
    <aside
      className="mail__sidebar"
      data-testid="mail-sidebar"
      aria-label="Mailboxes"
    >
      <ul className="mail__sidebar-list" role="listbox">
        {mailboxes.map((mailbox) => {
          const unread = countUnread(mailbox.id, dataset);
          const isActive = mailbox.id === selectedMailboxId;
          return (
            <li key={mailbox.id}>
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                className={
                  "mail__sidebar-item" +
                  (isActive ? " mail__sidebar-item--active" : "")
                }
                data-testid={`mail-mailbox-${mailbox.id}`}
                data-mailbox-id={mailbox.id}
                data-mailbox-kind={mailbox.kind}
                data-unread={unread}
                onClick={() => onSelect(mailbox.id)}
              >
                <span className="mail__sidebar-icon" aria-hidden="true">
                  {mailboxGlyph(mailbox.kind)}
                </span>
                <span className="mail__sidebar-label">{mailbox.name}</span>
                <span
                  className="mail__sidebar-count"
                  data-testid={`mail-mailbox-count-${mailbox.id}`}
                  data-unread={unread}
                  aria-label={`${unread} unread`}
                >
                  {unread > 0 ? unread : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Message list
// ---------------------------------------------------------------------------

interface MessageListProps {
  readonly messages: readonly MailMessage[];
  readonly selectedMessageId: string | undefined;
  readonly onSelect: (messageId: string) => void;
  readonly onToggleStar: (messageId: string) => void;
}

/**
 * Middle column: a vertical list of messages. Each row exposes
 * sender, subject, date, a read indicator (filled dot when unread,
 * transparent when read), and a star toggle. Selection and star
 * updates both route through the parent so the sidebar badge stays
 * in sync with the dataset.
 */
function MessageList({
  messages,
  selectedMessageId,
  onSelect,
  onToggleStar,
}: MessageListProps): JSX.Element {
  return (
    <section
      className="mail__list"
      data-testid="mail-list"
      data-mailbox-id={messages.length > 0 ? messages[0]?.mailboxId ?? "" : ""}
      aria-label="Messages"
    >
      {messages.length === 0 ? (
        <div className="mail__empty" data-testid="mail-list-empty" role="status">
          No messages
        </div>
      ) : (
        <ul
          className="mail__list-rows"
          data-testid="mail-list-rows"
          aria-label="Message list"
        >
          {messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              isSelected={message.id === selectedMessageId}
              onSelect={onSelect}
              onToggleStar={onToggleStar}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface MessageRowProps {
  readonly message: MailMessage;
  readonly isSelected: boolean;
  readonly onSelect: (messageId: string) => void;
  readonly onToggleStar: (messageId: string) => void;
}

/**
 * A single row in the message list. The whole row is clickable; the
 * star control uses `event.stopPropagation()` so clicking it doesn't
 * re-trigger the row selection (which would also auto-mark-read,
 * though that's idempotent for an already-read message).
 */
function MessageRow({
  message,
  isSelected,
  onSelect,
  onToggleStar,
}: MessageRowProps): JSX.Element {
  const handleRowClick = useCallback(() => {
    onSelect(message.id);
  }, [message.id, onSelect]);

  const handleStarClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onToggleStar(message.id);
    },
    [message.id, onToggleStar]
  );

  const sender = formatAddress(message.from);
  return (
    <li
      className={
        "mail__row" +
        (isSelected ? " mail__row--selected" : "") +
        (message.read ? "" : " mail__row--unread")
      }
      data-testid={`mail-message-${message.id}`}
      data-message-id={message.id}
      data-read={message.read ? "true" : "false"}
      data-starred={message.starred ? "true" : "false"}
      data-selected={isSelected ? "true" : "false"}
    >
      <button
        type="button"
        className="mail__row-button"
        data-testid={`mail-message-row-${message.id}`}
        onClick={handleRowClick}
        aria-current={isSelected ? "true" : undefined}
      >
        <span
          className="mail__row-unread-dot"
          data-testid={`mail-message-dot-${message.id}`}
          aria-hidden="true"
        />
        <span
          className="mail__row-sender"
          data-testid={`mail-message-sender-${message.id}`}
        >
          {sender}
        </span>
        <span
          className="mail__row-subject"
          data-testid={`mail-message-subject-${message.id}`}
        >
          {message.subject}
        </span>
        <span
          className="mail__row-date"
          data-testid={`mail-message-date-${message.id}`}
        >
          {formatMessageDate(message.date)}
        </span>
      </button>
      <button
        type="button"
        className={
          "mail__row-star" + (message.starred ? " mail__row-star--on" : "")
        }
        data-testid={`mail-message-star-${message.id}`}
        data-starred={message.starred ? "true" : "false"}
        aria-label={
          message.starred ? "Unstar message" : "Star message"
        }
        aria-pressed={message.starred}
        onClick={handleStarClick}
      >
        {message.starred ? "\u2605" : "\u2606"}
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Reading pane
// ---------------------------------------------------------------------------

interface ReadingPaneProps {
  readonly message: MailMessage | undefined;
  readonly mailboxName: string;
  readonly onToggleStar: (messageId: string) => void;
}

/**
 * Right column: full message view. Renders a header (sender,
 * recipients, subject, date, star) and the multi-line body. When no
 * message is selected the pane shows a graceful empty state so the
 * column never collapses into nothing.
 */
function ReadingPane({
  message,
  mailboxName,
  onToggleStar,
}: ReadingPaneProps): JSX.Element {
  if (!message) {
    return (
      <section
        className="mail__reading"
        data-testid="mail-reading-pane"
        data-empty="true"
        aria-label="Reading pane"
      >
        <div
          className="mail__reading-empty"
          data-testid="mail-reading-empty"
          role="status"
        >
          Select a message to read
          {mailboxName ? (
            <span className="mail__reading-empty-sub">
              From {mailboxName}
            </span>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mail__reading"
      data-testid="mail-reading-pane"
      data-message-id={message.id}
      data-empty="false"
      data-starred={message.starred ? "true" : "false"}
      aria-label="Reading pane"
    >
      <header
        className="mail__reading-header"
        data-testid="mail-reading-header"
      >
        <h2
          className="mail__reading-subject"
          data-testid="mail-reading-subject"
        >
          {message.subject}
        </h2>
        <div
          className="mail__reading-meta"
          data-testid="mail-reading-meta"
        >
          <div className="mail__reading-meta-row">
            <span className="mail__reading-meta-label">From:</span>
            <span
              className="mail__reading-meta-value"
              data-testid="mail-reading-sender"
            >
              {formatAddress(message.from)}
              <span className="mail__reading-meta-email">
                {" <"}
                {message.from.email}
                {">"}
              </span>
            </span>
          </div>
          <div className="mail__reading-meta-row">
            <span className="mail__reading-meta-label">To:</span>
            <span
              className="mail__reading-meta-value"
              data-testid="mail-reading-recipients"
            >
              {formatAddressList(message.to)}
            </span>
          </div>
          {message.cc && message.cc.length > 0 ? (
            <div className="mail__reading-meta-row">
              <span className="mail__reading-meta-label">Cc:</span>
              <span
                className="mail__reading-meta-value"
                data-testid="mail-reading-cc"
              >
                {formatAddressList(message.cc)}
              </span>
            </div>
          ) : null}
          <div className="mail__reading-meta-row">
            <span className="mail__reading-meta-label">Date:</span>
            <span
              className="mail__reading-meta-value"
              data-testid="mail-reading-date"
            >
              {new Date(message.date).toUTCString()}
            </span>
          </div>
        </div>
        <button
          type="button"
          className={
            "mail__reading-star" +
            (message.starred ? " mail__reading-star--on" : "")
          }
          data-testid="mail-reading-star"
          aria-label={
            message.starred ? "Unstar message" : "Star message"
          }
          aria-pressed={message.starred}
          onClick={() => onToggleStar(message.id)}
        >
          {message.starred ? "\u2605 Starred" : "\u2606 Star"}
        </button>
      </header>
      <pre
        className="mail__reading-body"
        data-testid="mail-reading-body"
      >
        {message.body}
      </pre>
      {message.attachments && message.attachments.length > 0 ? (
        <footer
          className="mail__reading-attachments"
          data-testid="mail-reading-attachments"
        >
          <h3 className="mail__reading-attachments-title">Attachments</h3>
          <ul className="mail__reading-attachments-list">
            {message.attachments.map((attachment) => (
              <li
                key={attachment.name}
                className="mail__reading-attachments-item"
                data-testid={`mail-reading-attachment-${attachment.name}`}
              >
                <span className="mail__reading-attachments-name">
                  {attachment.name}
                </span>
                <span className="mail__reading-attachments-meta">
                  {attachment.mimeType}
                </span>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
