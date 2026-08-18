import type {
  MailAccount,
  MailAddress,
  MailAttachment,
  MailDataset,
  MailMessage,
  Mailbox,
} from "./types";

/**
 * The deterministic mock mail dataset that powers the Mail app.
 *
 * Conventions:
 * - Exactly one {@link MailAccount} is seeded ("iCloud"). The data
 *   model scales to multiple accounts without API changes.
 * - Mailboxes are addressed by stable ids (`mail-inbox`,
 *   `mail-sent`, `mail-drafts`, `mail-trash`). The
 *   {@link MailDataset.mailboxOrder} field drives sidebar layout
 *   in the same order as real Mail.app.
 * - `messageIds` on each mailbox preserve the order in which the
 *   messages should be displayed in the list (newest first).
 * - All timestamps are fixed ISO-8601 strings so the dataset is
 *   fully deterministic and `Object.freeze`-safe.
 *
 * Immutability: the exported `initialMockMail` constant is deeply
 * frozen at module load. To "mutate" state (mark a message as read,
 * star it, etc.), use the helpers below — they return new
 * top-level {@link MailDataset} objects rather than touching the
 * shared constant.
 */

// ---------------------------------------------------------------------------
// Tiny constructors — keep the dataset literal readable.
// ---------------------------------------------------------------------------

/** Build a {@link MailAddress}. */
const addr = (name: string, email: string): MailAddress => ({ name, email });

/** Build a {@link MailAttachment}. */
const attachment = (
  name: string,
  mimeType: string,
  size: number
): MailAttachment => ({ name, mimeType, size });

/** Build a {@link Mailbox}. */
function makeMailbox(
  id: string,
  name: string,
  kind: Mailbox["kind"],
  accountId: string,
  messageIds: readonly string[]
): Mailbox {
  return { id, name, kind, accountId, messageIds };
}

/** Build a {@link MailMessage}. */
function makeMessage(
  id: string,
  mailboxId: string,
  from: MailAddress,
  to: readonly MailAddress[],
  subject: string,
  body: string,
  date: string,
  read: boolean,
  starred: boolean,
  extras?: {
    cc?: readonly MailAddress[];
    attachments?: readonly MailAttachment[];
  }
): MailMessage {
  const base: MailMessage = {
    id,
    mailboxId,
    from,
    to,
    subject,
    body,
    date,
    read,
    starred,
  };
  if (extras?.cc !== undefined) {
    return { ...base, cc: extras.cc };
  }
  if (extras?.attachments !== undefined) {
    return { ...base, attachments: extras.attachments };
  }
  return base;
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

/** The single seeded account: a fictional iCloud mailbox. */
const icloudAccount: MailAccount = {
  id: "acct-icloud",
  name: "iCloud",
  email: "demo@icloud.example",
};

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/** Sender / recipient aliases used below. Centralised for readability. */
const apple = addr("Apple Developer", "news@apple.com");
const github = addr("GitHub", "noreply@github.com");
const mom = addr("Mom", "mom@example.com");
const slack = addr("Slack", "feedback@slack.com");
const linear = addr("Linear", "notifications@linear.app");
const spammer = addr("Mega Offerz", "spam@offers.example");

const me = addr("Demo User", "demo@icloud.example");
const johnSmith = addr("John Smith", "john.smith@example.com");
const designTeam = addr("Design Team", "design@example.com");
const boss = addr("Avery Lee", "avery.lee@example.com");
const newsletter = addr("Tahoe Weekly", "editors@tahoeweekly.example");

const messages: Readonly<Record<string, MailMessage>> = Object.freeze({
  // ---- Inbox -----------------------------------------------------------
  "msg-001": makeMessage(
    "msg-001",
    "mail-inbox",
    apple,
    [me],
    "Welcome to macOS Tahoe",
    [
      "Hi Demo User,",
      "",
      "Welcome to macOS Tahoe. The new desktop is faster, friendlier, and",
      "full of small refinements you'll notice the moment you log in.",
      "",
      "Highlights:",
      "  - A redesigned translucent menu bar",
      "  - Spotlight that does more with less typing",
      "  - A re-engineered Finder sidebar",
      "",
      "Reply to this email if you'd like a guided tour.",
      "",
      "— Apple Developer",
    ].join("\n"),
    "2025-01-15T09:23:00Z",
    false,
    true
  ),
  "msg-002": makeMessage(
    "msg-002",
    "mail-inbox",
    github,
    [me],
    "Your weekly digest",
    [
      "Here's what happened on GitHub this week:",
      "",
      "  3 pull requests you authored were merged.",
      "  1 issue you watch got a new comment.",
      "  12 stars across your repositories.",
      "",
      "Open github.com to catch up.",
    ].join("\n"),
    "2025-01-14T17:45:00Z",
    true,
    false
  ),
  "msg-003": makeMessage(
    "msg-003",
    "mail-inbox",
    mom,
    [me],
    "Sunday lunch this weekend?",
    [
      "Hi sweetheart,",
      "",
      "We're doing a long-overdue Sunday lunch at grandma's this weekend.",
      "She'd love to see you. Roast beef at 1pm — let me know if you can",
      "make it and I'll add you to the head count.",
      "",
      "Love,",
      "Mom",
    ].join("\n"),
    "2025-01-13T11:02:00Z",
    false,
    false
  ),
  "msg-004": makeMessage(
    "msg-004",
    "mail-inbox",
    slack,
    [me],
    "You have 3 unread mentions",
    [
      "demo, you have 3 new mentions across the channels you follow:",
      "",
      "  #design        — 2 mentions",
      "  #engineering   — 1 mention",
      "",
      "Open Slack to catch up.",
    ].join("\n"),
    "2025-01-13T08:30:00Z",
    false,
    false
  ),
  "msg-005": makeMessage(
    "msg-005",
    "mail-inbox",
    linear,
    [me],
    "[Acme] Bug fix shipped",
    [
      "ENG-312 — 'Dock icon does not bounce on first click' — has been",
      "shipped to production.",
      "",
      "Released by: @avery",
      "Reviewed by: @demo, @john",
      "",
      "No further action required.",
    ].join("\n"),
    "2025-01-12T16:15:00Z",
    true,
    true
  ),

  // ---- Sent ------------------------------------------------------------
  "msg-006": makeMessage(
    "msg-006",
    "mail-sent",
    me,
    [johnSmith],
    "Re: Quarterly review",
    [
      "John,",
      "",
      "Thanks for sending the deck over. I went through it last night and",
      "left a few comments on slides 7, 12, and 18. Overall it looks solid",
      "— happy to talk through any of the feedback in our 1:1 tomorrow.",
      "",
      "Demo",
    ].join("\n"),
    "2025-01-15T14:20:00Z",
    true,
    false
  ),
  "msg-007": makeMessage(
    "msg-007",
    "mail-sent",
    me,
    [designTeam],
    "Mockups v3 attached",
    [
      "Team,",
      "",
      "Latest mockups are attached. Key changes since v2:",
      "  - Sidebar collapses to icons under 1024px",
      "  - Empty states now use illustrations instead of plain text",
      "",
      "Let me know by Friday if anything needs another pass.",
      "",
      "Demo",
    ].join("\n"),
    "2025-01-14T10:00:00Z",
    true,
    false,
    {
      attachments: [
        attachment("mockups-v3.pdf", "application/pdf", 1_482_913),
        attachment("spec-changelog.md", "text/markdown", 4_812),
      ],
    }
  ),
  "msg-008": makeMessage(
    "msg-008",
    "mail-sent",
    me,
    [mom],
    "Re: Sunday lunch",
    [
      "Hi Mom,",
      "",
      "Count me in! I'll bring a dessert. Should I swing by early to help",
      "with the table?",
      "",
      "Love,",
      "Demo",
    ].join("\n"),
    "2025-01-13T12:30:00Z",
    true,
    false
  ),

  // ---- Drafts ----------------------------------------------------------
  "msg-009": makeMessage(
    "msg-009",
    "mail-drafts",
    me,
    [boss],
    "Q4 planning notes (draft)",
    [
      "Hi Avery,",
      "",
      "Quick draft of my Q4 planning notes for our 1:1:",
      "  1. Ship Mail + Calendar + Notes apps",
      "  2. Begin Dock glow effect experiment",
      "  3. Sketch a v2 of the window manager",
      "",
      "Will fill in numbers before we meet.",
      "",
      "Demo",
    ].join("\n"),
    "2025-01-15T16:00:00Z",
    true,
    false
  ),
  "msg-010": makeMessage(
    "msg-010",
    "mail-drafts",
    me,
    [newsletter],
    "Why macOS Tahoe is delightful",
    [
      "Hi Tahoe Weekly editors,",
      "",
      "I'd love to pitch a short opinion piece on the small touches that",
      "make macOS Tahoe feel faster than its predecessor. Roughly 800 words,",
      "ready in two weeks. Let me know if that fits your editorial calendar.",
      "",
      "Thanks,",
      "Demo User",
    ].join("\n"),
    "2025-01-10T09:00:00Z",
    true,
    false
  ),

  // ---- Trash -----------------------------------------------------------
  "msg-011": makeMessage(
    "msg-011",
    "mail-trash",
    spammer,
    [me],
    "WIN A FREE iPHONE TODAY",
    [
      "CONGRATULATIONS!!!",
      "",
      "You have been selected as the lucky winner of a brand new iPhone!!!",
      "Click the link below to claim your prize within 24 hours or your",
      "winning entry will be forfeited.",
      "",
      ">>> http://definitely-not-a-scam.example/claim <<<",
      "",
      "(This message was moved to Trash.)",
    ].join("\n"),
    "2025-01-11T03:14:00Z",
    true,
    false
  ),
});

// ---------------------------------------------------------------------------
// Mailboxes
// ---------------------------------------------------------------------------

const mailboxes: Readonly<Record<string, Mailbox>> = Object.freeze({
  "mail-inbox": makeMailbox(
    "mail-inbox",
    "Inbox",
    "inbox",
    icloudAccount.id,
    ["msg-001", "msg-002", "msg-003", "msg-004", "msg-005"]
  ),
  "mail-sent": makeMailbox(
    "mail-sent",
    "Sent",
    "sent",
    icloudAccount.id,
    ["msg-006", "msg-007", "msg-008"]
  ),
  "mail-drafts": makeMailbox(
    "mail-drafts",
    "Drafts",
    "drafts",
    icloudAccount.id,
    ["msg-009", "msg-010"]
  ),
  "mail-trash": makeMailbox(
    "mail-trash",
    "Trash",
    "trash",
    icloudAccount.id,
    ["msg-011"]
  ),
});

// ---------------------------------------------------------------------------
// Dataset
// ---------------------------------------------------------------------------

/**
 * The default sidebar order. New mailboxes should be appended here so
 * the Mail window renders in the same order as the seeded data.
 */
const MAILBOX_ORDER: readonly string[] = Object.freeze([
  "mail-inbox",
  "mail-sent",
  "mail-drafts",
  "mail-trash",
]);

/**
 * The default account order. The mock dataset only has one account,
 * but the shape scales.
 */
const ACCOUNT_ORDER: readonly string[] = Object.freeze([icloudAccount.id]);

const accounts: Readonly<Record<string, MailAccount>> = Object.freeze({
  [icloudAccount.id]: icloudAccount,
});

/**
 * The deterministic mock mail dataset. Frozen at module load so the
 * reference is safe to share across components. Mutating helpers
 * below return a fresh {@link MailDataset} rather than touching this
 * constant.
 */
export const initialMockMail: MailDataset = Object.freeze({
  mailboxes,
  messages,
  accounts,
  mailboxOrder: MAILBOX_ORDER,
  accountOrder: ACCOUNT_ORDER,
});

// ---------------------------------------------------------------------------
// Pure helpers — operate on a passed-in dataset (default
// `initialMockMail`) and return new objects without mutating.
// ---------------------------------------------------------------------------

/**
 * Deep-clone a {@link MailDataset}. The result is structurally
 * independent of the input — mutating the clone does not affect the
 * original. Used internally by {@link markRead} and
 * {@link toggleStar}, and exported for callers that want a mutable
 * scratch copy.
 */
export function cloneMailDataset(dataset: MailDataset): MailDataset {
  return JSON.parse(JSON.stringify(dataset)) as MailDataset;
}

/**
 * Return the messages in `mailboxId`, in the order they should appear
 * in the Mail list (the order in which the ids are listed on the
 * mailbox). Unknown mailboxes return an empty array; unknown message
 * ids are skipped silently so a partially-broken dataset never
 * crashes the UI.
 */
export function getMailboxMessages(
  mailboxId: string,
  dataset: MailDataset = initialMockMail
): readonly MailMessage[] {
  const mailbox = dataset.mailboxes[mailboxId];
  if (!mailbox) return [];
  const out: MailMessage[] = [];
  for (const id of mailbox.messageIds) {
    const message = dataset.messages[id];
    if (message) out.push(message);
  }
  return out;
}

/**
 * Return a single {@link MailMessage} by id, or `undefined` if the
 * id is not in the dataset.
 */
export function getMessageById(
  messageId: string,
  dataset: MailDataset = initialMockMail
): MailMessage | undefined {
  return dataset.messages[messageId];
}

/**
 * Return a new {@link MailDataset} with `messageId` flagged as read.
 * The original dataset (typically `initialMockMail`) is never
 * mutated. If `messageId` does not exist the dataset is returned
 * unchanged so callers can chain calls without checking for typos.
 */
export function markRead(
  messageId: string,
  dataset: MailDataset = initialMockMail
): MailDataset {
  const existing = dataset.messages[messageId];
  if (!existing) return dataset;
  if (existing.read) return dataset;
  const next: MailDataset = {
    ...dataset,
    messages: {
      ...dataset.messages,
      [messageId]: { ...existing, read: true },
    },
  };
  return Object.freeze(next);
}

/**
 * Return a new {@link MailDataset} with the `starred` flag on
 * `messageId` flipped. Same immutability guarantees as
 * {@link markRead}: the original dataset is never mutated and an
 * unknown id is a no-op.
 */
export function toggleStar(
  messageId: string,
  dataset: MailDataset = initialMockMail
): MailDataset {
  const existing = dataset.messages[messageId];
  if (!existing) return dataset;
  const next: MailDataset = {
    ...dataset,
    messages: {
      ...dataset.messages,
      [messageId]: { ...existing, starred: !existing.starred },
    },
  };
  return Object.freeze(next);
}

/**
 * Count the unread messages in `mailboxId`. Useful for the sidebar
 * badge in the Mail UI; reads the underlying messages rather than
 * caching a counter so callers can't desync the badge from the data.
 */
export function countUnread(
  mailboxId: string,
  dataset: MailDataset = initialMockMail
): number {
  let n = 0;
  for (const message of getMailboxMessages(mailboxId, dataset)) {
    if (!message.read) n += 1;
  }
  return n;
}

/**
 * Return the mailboxes in the dataset's declared sidebar order. The
 * result is a fresh array, so callers can sort or filter without
 * mutating the underlying frozen list.
 */
export function listMailboxesInOrder(
  dataset: MailDataset = initialMockMail
): readonly Mailbox[] {
  const out: Mailbox[] = [];
  for (const id of dataset.mailboxOrder) {
    const mailbox = dataset.mailboxes[id];
    if (mailbox) out.push(mailbox);
  }
  return out;
}

/**
 * Return the accounts in the dataset's declared order. Same
 * immutability guarantees as {@link listMailboxesInOrder}.
 */
export function listAccountsInOrder(
  dataset: MailDataset = initialMockMail
): readonly MailAccount[] {
  const out: MailAccount[] = [];
  for (const id of dataset.accountOrder) {
    const account = dataset.accounts[id];
    if (account) out.push(account);
  }
  return out;
}
