/**
 * Type definitions for the in-memory mock mailbox that powers the
 * Mail app. The dataset is a flat, deterministic collection of
 * {@link MailMessage} records indexed by id, plus a set of
 * {@link Mailbox} folders (Inbox, Sent, Drafts, Trash, …) and one or
 * more {@link MailAccount} entries that own those mailboxes.
 *
 * Design notes:
 * - Every field is `readonly` so the dataset can be exported with
 *   `Object.freeze` and shared across components without accidental
 *   mutation. Helpers that need to "mutate" state return new
 *   top-level objects (see `cloneMailDataset` / `markRead` /
 *   `toggleStar` in `mockMail.ts`).
 * - Dates are stored as ISO-8601 strings rather than `Date` objects.
 *   Strings are JSON-stable, make `initialMockMail` trivially
 *   freezable, and force every consumer to convert on the UI side —
 *   which prevents accidental timezone or locale leakage.
 * - Mailboxes reference messages by id rather than embedding them.
 *   This keeps the data flat, makes `getMailboxMessages` a simple
 *   lookup, and matches how real mail stores work (each mailbox is
 *   just a sorted list of message ids).
 * - `MailAddress` carries an optional `name` so we can render both
 *   "Apple Developer" <news@apple.com> and bare <foo@bar.com>
 *   addresses without losing information.
 */

/**
 * A single email address, optionally paired with a display name.
 * `name` is the human-readable label shown in the Mail UI; `email`
 * is the canonical RFC-5322 address. Either field may be the only
 * one present (e.g. an outbound-only sender with no display name).
 */
export interface MailAddress {
  /** Display name, e.g. "Apple Developer". May be empty. */
  readonly name: string;
  /** Canonical email address, e.g. "news@apple.com". */
  readonly email: string;
}

/**
 * A single file attached to a {@link MailMessage}. The Mail app only
 * renders mock metadata — it never streams attachment bytes — so
 * `size` is informational and `mimeType` is enough for the UI to
 * pick an icon.
 */
export interface MailAttachment {
  /** File name as shown in the attachment row, e.g. "report.pdf". */
  readonly name: string;
  /** MIME type, e.g. "application/pdf" or "image/png". */
  readonly mimeType: string;
  /** Size in bytes; values are informational only. */
  readonly size: number;
}

/**
 * Discriminator for {@link Mailbox.kind}. The closed union lets the
 * UI switch on `kind` exhaustively (e.g. to apply the right icon and
 * to know which mailbox a "Reply" should drop outgoing mail into).
 */
export type MailboxKind =
  | "inbox"
  | "sent"
  | "drafts"
  | "trash"
  | "archive"
  | "junk"
  | "custom";

/**
 * A mailbox (a.k.a. folder) within a {@link MailAccount}. Each
 * mailbox carries an ordered list of {@link MailMessage} ids. The
 * Mail UI iterates `messageIds` to render the message list, and
 * {@link Mailbox.unreadCount} is derived from the referenced
 * messages at render time so callers don't have to keep two sources
 * of truth in sync.
 */
export interface Mailbox {
  /** Stable unique identifier (e.g. "mail-inbox"). */
  readonly id: string;
  /** Display name shown in the sidebar, e.g. "Inbox". */
  readonly name: string;
  /** Discriminator for icon and behaviour (see {@link MailboxKind}). */
  readonly kind: MailboxKind;
  /** Owning account id; matches {@link MailAccount.id}. */
  readonly accountId: string;
  /** Ordered message ids. Empty arrays represent empty mailboxes. */
  readonly messageIds: readonly string[];
}

/**
 * A single email message. The fields here mirror what real mail
 * clients render in the message list and reading pane.
 *
 * `read` and `starred` are stored on the message itself rather than
 * in a side table because they are message-level state; flipping
 * either one mutates only this record.
 */
export interface MailMessage {
  /** Stable unique identifier (e.g. "msg-001"). */
  readonly id: string;
  /** Owning mailbox id; matches {@link Mailbox.id}. */
  readonly mailboxId: string;
  /** Sender's {@link MailAddress}. */
  readonly from: MailAddress;
  /** Primary recipients (To:). */
  readonly to: readonly MailAddress[];
  /** Optional CC recipients. Empty array means "no CC line". */
  readonly cc?: readonly MailAddress[];
  /** Subject line as shown in the list and reading pane. */
  readonly subject: string;
  /**
   * Plain-text body. Multi-line strings are preserved verbatim
   * including embedded newlines. The Mail app does not currently
   * render HTML bodies; HTML-only real-world mail is mocked as a
   * short plain-text note so the preview pane always has something
   * to show.
   */
  readonly body: string;
  /** ISO-8601 timestamp the message was "received" / "sent". */
  readonly date: string;
  /** Whether the user has opened the message at least once. */
  readonly read: boolean;
  /** Whether the user has flagged the message with a star. */
  readonly starred: boolean;
  /** Optional list of file attachments. */
  readonly attachments?: readonly MailAttachment[];
}

/**
 * A mail account (e.g. an iCloud / Gmail / IMAP identity). One
 * account owns a set of {@link Mailbox} entries, all of which share
 * the same `accountId`. The mock dataset only needs one account to
 * render the app, but the type is designed to scale to multiple.
 */
export interface MailAccount {
  /** Stable unique identifier (e.g. "acct-icloud"). */
  readonly id: string;
  /** Display name shown in the sidebar, e.g. "iCloud". */
  readonly name: string;
  /** Default From: address for outbound mail. */
  readonly email: string;
}

/**
 * The top-level, frozen mail dataset. Components import this and
 * pass it through React context; mutations go through helpers in
 * `mockMail.ts` which return a fresh top-level object.
 */
export interface MailDataset {
  /** Mailboxes keyed by {@link Mailbox.id}. */
  readonly mailboxes: Readonly<Record<string, Mailbox>>;
  /** Messages keyed by {@link MailMessage.id}. */
  readonly messages: Readonly<Record<string, MailMessage>>;
  /** Mail accounts keyed by {@link MailAccount.id}. */
  readonly accounts: Readonly<Record<string, MailAccount>>;
  /**
   * Ordered list of mailbox ids. Sidebar rendering iterates this
   * list so the order is deterministic and matches the seeded
   * sidebar layout (Inbox, Sent, Drafts, Trash, …).
   */
  readonly mailboxOrder: readonly string[];
  /**
   * Ordered list of account ids. The mock dataset ships exactly one
   * account, but the shape supports multiple without breaking the
   * UI.
   */
  readonly accountOrder: readonly string[];
}
