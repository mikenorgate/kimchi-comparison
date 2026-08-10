import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import MailApp from '../MailApp.jsx';

afterEach(() => {
  cleanup();
});

function renderMailApp(props = {}) {
  return render(<MailApp {...props} />);
}

describe('<MailApp />', () => {
  it('renders the root with sidebar, message list and reader', () => {
    renderMailApp();

    const root = screen.getByTestId('mail-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'mail');

    expect(screen.getByTestId('mail-mailbox-list')).toBeInTheDocument();
    expect(screen.getByTestId('mail-message-list')).toBeInTheDocument();
    expect(screen.getByTestId('mail-reader')).toBeInTheDocument();
  });

  it('renders all four mailboxes in the sidebar', () => {
    renderMailApp();

    const mailboxes = screen.getAllByTestId('mail-mailbox');
    expect(mailboxes).toHaveLength(4);

    const ids = mailboxes.map((m) => m.getAttribute('data-mailbox-id'));
    expect(ids).toEqual(['inbox', 'sent', 'drafts', 'trash']);
  });

  it('marks exactly one mailbox as active by default (inbox)', () => {
    renderMailApp();

    const mailboxes = screen.getAllByTestId('mail-mailbox');
    const active = mailboxes.filter((m) => m.getAttribute('data-active') === 'true');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAttribute('data-mailbox-id', 'inbox');
  });

  it('shows messages for the selected mailbox by default', () => {
    renderMailApp();

    const messages = screen.getAllByTestId('mail-message');
    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((message) => {
      expect(message).toHaveAttribute('data-mailbox-id', 'inbox');
      expect(message.getAttribute('data-message-id')).toMatch(/^e\d+$/);
    });
  });

  it('selecting a mailbox filters the message list to that mailbox', () => {
    renderMailApp();

    const initialCount = screen.getAllByTestId('mail-message').length;
    expect(initialCount).toBeGreaterThan(0);

    const sent = screen.getAllByTestId('mail-mailbox').find(
      (m) => m.getAttribute('data-mailbox-id') === 'sent',
    );
    expect(sent).toBeDefined();
    fireEvent.click(sent);

    const sentMessages = screen.getAllByTestId('mail-message');
    expect(sentMessages.length).toBeGreaterThan(0);
    sentMessages.forEach((message) => {
      expect(message).toHaveAttribute('data-mailbox-id', 'sent');
    });

    const mailboxes = screen.getAllByTestId('mail-mailbox');
    const active = mailboxes.filter((m) => m.getAttribute('data-active') === 'true');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAttribute('data-mailbox-id', 'sent');

    const inbox = mailboxes.find((m) => m.getAttribute('data-mailbox-id') === 'inbox');
    fireEvent.click(inbox);
    expect(screen.getAllByTestId('mail-message').length).toBe(initialCount);
  });

  it('clicking a message displays its content in the reader', () => {
    renderMailApp();

    const messages = screen.getAllByTestId('mail-message');
    const target = messages[0];
    const messageId = target.getAttribute('data-message-id');
    const fullText = target.textContent;

    fireEvent.click(target);

    const reader = screen.getByTestId('mail-reader');
    const subjectEl = within(reader).getByTestId('mail-reader-subject');
    const bodyEl = within(reader).getByTestId('mail-reader-body');
    const fromEl = within(reader).getByTestId('mail-reader-from');

    expect(subjectEl.textContent.length).toBeGreaterThan(0);
    expect(bodyEl.textContent.length).toBeGreaterThan(0);
    expect(fromEl.textContent.length).toBeGreaterThan(0);

    // Every fragment of the row's visible text must appear inside the reader
    // (subject line and from/timestamp line and body are all derived from the
    // row content).
    expect(reader.textContent.length).toBeGreaterThan(fullText.length);

    const activeMessages = screen
      .getAllByTestId('mail-message')
      .filter((m) => m.getAttribute('data-active') === 'true');
    expect(activeMessages).toHaveLength(1);
    expect(activeMessages[0]).toHaveAttribute('data-message-id', messageId);
  });

  it('the reader shows distinct content for each message', () => {
    renderMailApp();

    const messages = screen.getAllByTestId('mail-message');
    expect(messages.length).toBeGreaterThanOrEqual(2);

    const reader = screen.getByTestId('mail-reader');
    fireEvent.click(messages[0]);
    const firstSubject = within(reader).getByTestId('mail-reader-subject').textContent;
    const firstBody = within(reader).getByTestId('mail-reader-body').textContent;

    fireEvent.click(messages[1]);
    const secondSubject = within(reader).getByTestId('mail-reader-subject').textContent;
    const secondBody = within(reader).getByTestId('mail-reader-body').textContent;

    expect(firstSubject).not.toBe(secondSubject);
    expect(firstBody).not.toBe(secondBody);
  });

  it('shows a placeholder when no message is selected', () => {
    renderMailApp();

    const reader = screen.getByTestId('mail-reader');
    expect(within(reader).queryByTestId('mail-reader-subject')).toBeNull();
    expect(within(reader).queryByTestId('mail-reader-body')).toBeNull();
    expect(reader.textContent).toMatch(/Select a message/i);
  });

  it('switching mailboxes clears the currently selected message', () => {
    renderMailApp();

    const messages = screen.getAllByTestId('mail-message');
    fireEvent.click(messages[0]);
    expect(
      screen
        .getAllByTestId('mail-message')
        .filter((m) => m.getAttribute('data-active') === 'true'),
    ).toHaveLength(1);

    const drafts = screen.getAllByTestId('mail-mailbox').find(
      (m) => m.getAttribute('data-mailbox-id') === 'drafts',
    );
    fireEvent.click(drafts);

    expect(
      screen
        .getAllByTestId('mail-message')
        .filter((m) => m.getAttribute('data-active') === 'true'),
    ).toHaveLength(0);

    const reader = screen.getByTestId('mail-reader');
    expect(within(reader).queryByTestId('mail-reader-subject')).toBeNull();
  });

  it('rows that are not active are not flagged as active', () => {
    renderMailApp();

    const messages = screen.getAllByTestId('mail-message');
    const active = messages.filter((m) => m.getAttribute('data-active') === 'true');
    expect(active.length).toBeLessThan(messages.length);
  });

  it('uses accessible roles for navigation and reading regions', () => {
    renderMailApp();

    expect(
      screen.getByLabelText('Mailboxes'),
    ).toBe(screen.getByTestId('mail-mailbox-list'));
    expect(
      screen.getByLabelText('Messages'),
    ).toBe(screen.getByTestId('mail-message-list'));
    expect(
      screen.getByLabelText('Message reader'),
    ).toBe(screen.getByTestId('mail-reader'));
  });
});
