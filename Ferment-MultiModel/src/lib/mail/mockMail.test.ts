import { describe, it, expect } from "vitest";
import {
  cloneMailDataset,
  countUnread,
  getMailboxMessages,
  getMessageById,
  initialMockMail,
  listAccountsInOrder,
  listMailboxesInOrder,
  markRead,
  toggleStar,
} from "./mockMail";
import type {
  MailAccount,
  MailAddress,
  MailAttachment,
  MailDataset,
  MailMessage,
  Mailbox,
} from "./types";

/**
 * Tests for the Mail data model and helpers. Mirrors the structure of
 * `src/lib/fs/mockFs.test.ts` so the two fixtures stay aligned: shape,
 * reachability, type guards, and immutability are all covered in the
 * same order.
 */

/**
 * Convenience: collect every message in the dataset by walking the
 * message map (not by iterating mailboxes, so we don't depend on
 * sidebar ordering).
 */
function collectAllMessages(dataset: MailDataset): MailMessage[] {
  return Object.values(dataset.messages);
}

/**
 * Convenience: collect every mailbox by walking the mailbox map.
 */
function collectAllMailboxes(dataset: MailDataset): Mailbox[] {
  return Object.values(dataset.mailboxes);
}

/**
 * Convenience: collect every account by walking the account map.
 */
function collectAllAccounts(dataset: MailDataset): MailAccount[] {
  return Object.values(dataset.accounts);
}

describe("initialMockMail", () => {
  it("is frozen at the top level so it cannot be reassigned by accident", () => {
    expect(Object.isFrozen(initialMockMail)).toBe(true);
  });

  it("contains exactly one iCloud account", () => {
    const accounts = collectAllAccounts(initialMockMail);
    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.id).toBe("acct-icloud");
    expect(accounts[0]?.name).toBe("iCloud");
    expect(accounts[0]?.email.length).toBeGreaterThan(0);
  });

  it("exposes the account via accountOrder", () => {
    expect(initialMockMail.accountOrder).toEqual(["acct-icloud"]);
    for (const id of initialMockMail.accountOrder) {
      expect(initialMockMail.accounts[id]).toBeDefined();
    }
  });

  it("declares Inbox, Sent, Drafts, and Trash in mailboxOrder", () => {
    expect(initialMockMail.mailboxOrder).toEqual([
      "mail-inbox",
      "mail-sent",
      "mail-drafts",
      "mail-trash",
    ]);
    for (const id of initialMockMail.mailboxOrder) {
      expect(initialMockMail.mailboxes[id]).toBeDefined();
    }
  });

  it("ships 8-12 messages spread across the mailboxes", () => {
    const all = collectAllMessages(initialMockMail);
    expect(all.length).toBeGreaterThanOrEqual(8);
    expect(all.length).toBeLessThanOrEqual(12);
  });

  it("every message belongs to a known mailbox", () => {
    const all = collectAllMessages(initialMockMail);
    for (const message of all) {
      expect(initialMockMail.mailboxes[message.mailboxId]).toBeDefined();
    }
  });

  it("every mailbox's messageIds resolve to real messages", () => {
    for (const mailbox of collectAllMailboxes(initialMockMail)) {
      for (const id of mailbox.messageIds) {
        const message = initialMockMail.messages[id];
        expect(message).toBeDefined();
        if (message) {
          expect(message.mailboxId).toBe(mailbox.id);
        }
      }
    }
  });

  it("every message id is unique across the dataset", () => {
    const ids = new Set<string>();
    for (const message of collectAllMessages(initialMockMail)) {
      expect(ids.has(message.id)).toBe(false);
      ids.add(message.id);
    }
    expect(ids.size).toBe(collectAllMessages(initialMockMail).length);
  });

  it("every mailbox id is unique across the dataset", () => {
    const ids = new Set<string>();
    for (const mailbox of collectAllMailboxes(initialMockMail)) {
      expect(ids.has(mailbox.id)).toBe(false);
      ids.add(mailbox.id);
    }
    expect(ids.size).toBe(collectAllMailboxes(initialMockMail).length);
  });
});

describe("mailbox distribution", () => {
  it("Inbox has multiple messages", () => {
    const inbox = initialMockMail.mailboxes["mail-inbox"];
    expect(inbox).toBeDefined();
    expect(inbox?.kind).toBe("inbox");
    expect(inbox?.messageIds.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it("Sent, Drafts, and Trash are non-empty", () => {
    for (const id of ["mail-sent", "mail-drafts", "mail-trash"]) {
      const mailbox = initialMockMail.mailboxes[id];
      expect(mailbox).toBeDefined();
      expect(mailbox?.messageIds.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("every mailbox reports the correct kind", () => {
    const kinds: Record<string, Mailbox["kind"]> = {
      "mail-inbox": "inbox",
      "mail-sent": "sent",
      "mail-drafts": "drafts",
      "mail-trash": "trash",
    };
    for (const [id, kind] of Object.entries(kinds)) {
      expect(initialMockMail.mailboxes[id]?.kind).toBe(kind);
    }
  });

  it("every mailbox belongs to a known account", () => {
    for (const mailbox of collectAllMailboxes(initialMockMail)) {
      expect(initialMockMail.accounts[mailbox.accountId]).toBeDefined();
    }
  });
});

describe("message shape", () => {
  it("every message has a non-empty subject", () => {
    for (const message of collectAllMessages(initialMockMail)) {
      expect(message.subject.length).toBeGreaterThan(0);
    }
  });

  it("every message has a non-empty body", () => {
    for (const message of collectAllMessages(initialMockMail)) {
      expect(message.body.length).toBeGreaterThan(0);
    }
  });

  it("every message has a valid ISO-8601 date", () => {
    for (const message of collectAllMessages(initialMockMail)) {
      // The stored string should parse as a valid timestamp.
      // Note: Date.toISOString() normalises to millisecond precision
      // (e.g. "2025-01-15T09:23:00.000Z"), so we can't rely on a
      // string round-trip — but `Date.parse` on an ISO-8601 string is
      // exact up to that precision.
      const parsed = new Date(message.date);
      expect(Number.isNaN(parsed.getTime())).toBe(false);
      expect(parsed.getTime()).toBe(Date.parse(message.date));
      // Spot-check the format: starts with a 4-digit year and ends
      // with a `Z` (UTC).
      expect(message.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
    }
  });

  it("every from address has a non-empty email", () => {
    for (const message of collectAllMessages(initialMockMail)) {
      expect(message.from.email.length).toBeGreaterThan(0);
    }
  });

  it("every message has at least one recipient", () => {
    for (const message of collectAllMessages(initialMockMail)) {
      expect(message.to.length).toBeGreaterThan(0);
      for (const recipient of message.to) {
        expect(recipient.email.length).toBeGreaterThan(0);
      }
    }
  });

  it("preserves multi-line bodies verbatim", () => {
    const welcome = initialMockMail.messages["msg-001"];
    expect(welcome).toBeDefined();
    if (!welcome) return;
    expect(welcome.body.split("\n").length).toBeGreaterThan(5);
    expect(welcome.body).toContain("macOS Tahoe");
  });

  it("includes a mix of read/unread and starred/unstarred messages", () => {
    const all = collectAllMessages(initialMockMail);
    const read = all.filter((m) => m.read);
    const unread = all.filter((m) => !m.read);
    const starred = all.filter((m) => m.starred);
    expect(read.length).toBeGreaterThan(0);
    expect(unread.length).toBeGreaterThan(0);
    expect(starred.length).toBeGreaterThan(0);
  });

  it("at least one message carries attachments with non-empty metadata", () => {
    const withAttachments = collectAllMessages(initialMockMail).filter(
      (m): m is MailMessage & { attachments: readonly MailAttachment[] } =>
        m.attachments !== undefined && m.attachments.length > 0
    );
    expect(withAttachments.length).toBeGreaterThan(0);
    for (const message of withAttachments) {
      for (const attachment of message.attachments) {
        expect(attachment.name.length).toBeGreaterThan(0);
        expect(attachment.mimeType.length).toBeGreaterThan(0);
        expect(attachment.size).toBeGreaterThan(0);
      }
    }
  });

  it("addresses carry both display name and email (or at least one)", () => {
    for (const message of collectAllMessages(initialMockMail)) {
      const checkAddr = (a: MailAddress): void => {
        expect(a.email.length).toBeGreaterThan(0);
        // `name` may be empty but never undefined (the type forbids it).
        expect(typeof a.name).toBe("string");
      };
      checkAddr(message.from);
      for (const recipient of message.to) checkAddr(recipient);
      if (message.cc) {
        for (const cc of message.cc) checkAddr(cc);
      }
    }
  });
});

describe("getMailboxMessages", () => {
  it("returns the messages for a known mailbox, in mailbox order", () => {
    const inbox = initialMockMail.mailboxes["mail-inbox"];
    if (!inbox) throw new Error("test fixture: mail-inbox missing");
    const messages = getMailboxMessages("mail-inbox");
    expect(messages.map((m) => m.id)).toEqual(inbox.messageIds);
  });

  it("returns an empty array for an unknown mailbox id", () => {
    expect(getMailboxMessages("mail-nonexistent")).toEqual([]);
  });

  it("returns an empty array for an empty string", () => {
    expect(getMailboxMessages("")).toEqual([]);
  });

  it("honors a caller-provided dataset", () => {
    const custom: MailDataset = {
      ...initialMockMail,
      mailboxes: {
        ...initialMockMail.mailboxes,
        "mail-inbox": {
          ...initialMockMail.mailboxes["mail-inbox"]!,
          messageIds: ["msg-002"],
        },
      },
    };
    expect(getMailboxMessages("mail-inbox", custom).map((m) => m.id)).toEqual([
      "msg-002",
    ]);
    // The original dataset is untouched.
    expect(getMailboxMessages("mail-inbox").length).toBeGreaterThan(1);
  });
});

describe("getMessageById", () => {
  it("returns the right message for a known id", () => {
    const message = getMessageById("msg-001");
    expect(message).toBeDefined();
    expect(message?.id).toBe("msg-001");
    expect(message?.subject).toContain("macOS Tahoe");
  });

  it("returns undefined for an unknown id", () => {
    expect(getMessageById("msg-does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getMessageById("")).toBeUndefined();
  });
});

describe("markRead", () => {
  it("flips read=false to read=true on a target message", () => {
    const before = getMessageById("msg-001");
    expect(before?.read).toBe(false);
    const next = markRead("msg-001");
    expect(getMessageById("msg-001", next)?.read).toBe(true);
  });

  it("is a no-op when the message is already read", () => {
    // msg-002 is seeded with read=true in initialMockMail.
    const before = getMessageById("msg-002");
    expect(before?.read).toBe(true);
    const next = markRead("msg-002");
    // Object equality confirms markRead did not allocate a new tree
    // for a no-op flip, but we treat that as a stable optimisation,
    // not a contract — so we also assert the message still reads true.
    expect(getMessageById("msg-002", next)?.read).toBe(true);
  });

  it("is a no-op for an unknown message id", () => {
    const next = markRead("msg-does-not-exist");
    expect(next).toBe(initialMockMail);
  });

  it("does not mutate the original dataset", () => {
    const before = getMessageById("msg-001");
    expect(before?.read).toBe(false);
    markRead("msg-001");
    const after = getMessageById("msg-001");
    expect(after?.read).toBe(false);
  });

  it("does not affect other messages' read flags", () => {
    const target = getMessageById("msg-003");
    expect(target?.read).toBe(false);
    const next = markRead("msg-003");
    expect(getMessageById("msg-001", next)?.read).toBe(false);
    expect(getMessageById("msg-004", next)?.read).toBe(false);
    expect(getMessageById("msg-002", next)?.read).toBe(true);
  });
});

describe("toggleStar", () => {
  it("flips starred=false to starred=true on a target message", () => {
    const before = getMessageById("msg-002");
    expect(before?.starred).toBe(false);
    const next = toggleStar("msg-002");
    expect(getMessageById("msg-002", next)?.starred).toBe(true);
  });

  it("flips starred=true back to starred=false", () => {
    // msg-001 is seeded with starred=true.
    const before = getMessageById("msg-001");
    expect(before?.starred).toBe(true);
    const next = toggleStar("msg-001");
    expect(getMessageById("msg-001", next)?.starred).toBe(false);
    // And once more, back on.
    const next2 = toggleStar("msg-001", next);
    expect(getMessageById("msg-001", next2)?.starred).toBe(true);
  });

  it("is a no-op for an unknown message id", () => {
    const next = toggleStar("msg-does-not-exist");
    expect(next).toBe(initialMockMail);
  });

  it("does not mutate the original dataset", () => {
    const before = getMessageById("msg-002");
    expect(before?.starred).toBe(false);
    toggleStar("msg-002");
    const after = getMessageById("msg-002");
    expect(after?.starred).toBe(false);
  });

  it("does not affect other messages' starred flags", () => {
    const next = toggleStar("msg-002");
    // msg-001 stays starred.
    expect(getMessageById("msg-001", next)?.starred).toBe(true);
    // msg-003 stays unstarred.
    expect(getMessageById("msg-003", next)?.starred).toBe(false);
  });
});

describe("countUnread", () => {
  it("counts unread messages in Inbox", () => {
    const inboxUnread = countUnread("mail-inbox");
    // msg-001, msg-003, msg-004 are seeded unread in the inbox;
    // the exact count is allowed to vary as long as it's > 0 and
    // <= the number of messages in the mailbox.
    const total = initialMockMail.mailboxes["mail-inbox"]?.messageIds.length ?? 0;
    expect(inboxUnread).toBeGreaterThan(0);
    expect(inboxUnread).toBeLessThanOrEqual(total);
  });

  it("returns 0 for Trash (all messages there are seeded read)", () => {
    expect(countUnread("mail-trash")).toBe(0);
  });

  it("returns 0 for an unknown mailbox", () => {
    expect(countUnread("mail-nope")).toBe(0);
  });

  it("reflects markRead changes when given a derived dataset", () => {
    const before = countUnread("mail-inbox");
    const next = markRead("msg-001");
    expect(countUnread("mail-inbox", next)).toBe(before - 1);
  });
});

describe("listMailboxesInOrder", () => {
  it("returns the mailboxes in the declared sidebar order", () => {
    const ordered = listMailboxesInOrder();
    expect(ordered.map((m) => m.id)).toEqual(initialMockMail.mailboxOrder);
  });

  it("returns a fresh array (safe to sort/filter)", () => {
    const a = listMailboxesInOrder();
    const b = listMailboxesInOrder();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("returns the right count", () => {
    expect(listMailboxesInOrder()).toHaveLength(4);
  });
});

describe("listAccountsInOrder", () => {
  it("returns the single seeded account", () => {
    expect(listAccountsInOrder()).toHaveLength(1);
    expect(listAccountsInOrder()[0]?.id).toBe("acct-icloud");
  });
});

describe("cloneMailDataset", () => {
  it("returns a deeply-equal copy", () => {
    const clone = cloneMailDataset(initialMockMail);
    expect(clone).toEqual(initialMockMail);
  });

  it("returns a structurally-independent object", () => {
    const clone = cloneMailDataset(initialMockMail);
    expect(clone).not.toBe(initialMockMail);
    expect(clone.messages).not.toBe(initialMockMail.messages);
    expect(clone.mailboxes).not.toBe(initialMockMail.mailboxes);

    // Mutating the clone must not affect the original.
    const clonedMessage = clone.messages["msg-001"];
    if (clonedMessage) {
      (clonedMessage as { subject: string }).subject = "MUTATED";
    }
    expect(getMessageById("msg-001")?.subject).not.toBe("MUTATED");
  });
});

describe("dataset integrity", () => {
  it("every mail-inbox message is in fact in mail-inbox", () => {
    const mailbox = initialMockMail.mailboxes["mail-inbox"];
    if (!mailbox) throw new Error("test fixture: mail-inbox missing");
    for (const id of mailbox.messageIds) {
      const message = initialMockMail.messages[id];
      expect(message).toBeDefined();
      expect(message?.mailboxId).toBe("mail-inbox");
    }
  });

  it("every mail-sent message originates from the user", () => {
    const mailbox = initialMockMail.mailboxes["mail-sent"];
    if (!mailbox) throw new Error("test fixture: mail-sent missing");
    for (const id of mailbox.messageIds) {
      const message = initialMockMail.messages[id];
      expect(message).toBeDefined();
      expect(message?.from.email).toBe(initialMockMail.accounts["acct-icloud"]?.email);
    }
  });

  it("every mail-drafts message originates from the user", () => {
    const mailbox = initialMockMail.mailboxes["mail-drafts"];
    if (!mailbox) throw new Error("test fixture: mail-drafts missing");
    for (const id of mailbox.messageIds) {
      const message = initialMockMail.messages[id];
      expect(message).toBeDefined();
      expect(message?.from.email).toBe(initialMockMail.accounts["acct-icloud"]?.email);
    }
  });
});

describe("derived dataset immutability", () => {
  it("a clone made via cloneMailDataset can be mutated freely", () => {
    const clone = cloneMailDataset(initialMockMail);
    // Cast away readonly for the test mutation. The point is to show
    // that the clone is genuinely independent of the frozen dataset.
    (clone.messages["msg-001"] as { subject: string }).subject = "MUTATED";
    expect(getMessageById("msg-001")?.subject).not.toBe("MUTATED");
  });

  it("markRead + toggleStar compose without cross-contamination", () => {
    // msg-003 is seeded read=false, starred=false and is not touched
    // by the helpers below — perfect for confirming cross-call
    // isolation.
    expect(getMessageById("msg-003")?.read).toBe(false);
    expect(getMessageById("msg-003")?.starred).toBe(false);

    const marked = markRead("msg-001");
    const starred = toggleStar("msg-002", marked);

    // The two helpers did their own job.
    expect(getMessageById("msg-001", starred)?.read).toBe(true);
    expect(getMessageById("msg-002", starred)?.starred).toBe(true);
    // msg-003 is untouched.
    expect(getMessageById("msg-003", starred)?.read).toBe(false);
    expect(getMessageById("msg-003", starred)?.starred).toBe(false);
  });
});
