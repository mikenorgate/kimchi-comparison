import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import MessagesApp from '../MessagesApp.jsx';

afterEach(() => {
  cleanup();
});

function renderMessagesApp(props = {}) {
  return render(<MessagesApp {...props} />);
}

describe('<MessagesApp />', () => {
  it('renders the root and both panes (conversation list and chat view)', () => {
    renderMessagesApp();

    const root = screen.getByTestId('messages-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'messages');

    expect(screen.getByTestId('messages-conversation-list')).toBeInTheDocument();
    expect(screen.getByTestId('messages-chat-view')).toBeInTheDocument();
    expect(screen.getByTestId('messages-input')).toBeInTheDocument();
    expect(screen.getByTestId('messages-send-button')).toBeInTheDocument();
  });

  it('renders at least one conversation item in the list', () => {
    renderMessagesApp();

    const items = screen.getAllByTestId('messages-conversation-item');
    expect(items.length).toBeGreaterThan(0);
    // Every item should expose its conversation id.
    items.forEach((item) => {
      expect(item.getAttribute('data-conversation-id')).toMatch(/^c\d+$/);
    });
  });

  it('marks exactly one conversation as active by default', () => {
    renderMessagesApp();

    const items = screen.getAllByTestId('messages-conversation-item');
    const active = items.filter((item) => item.getAttribute('data-active') === 'true');
    expect(active).toHaveLength(1);
  });

  it('renders the active conversation name in the chat header', () => {
    renderMessagesApp();

    const items = screen.getAllByTestId('messages-conversation-item');
    const active = items.find((item) => item.getAttribute('data-active') === 'true');
    const expectedName = active.querySelector('.font-medium').textContent;

    const chatView = screen.getByTestId('messages-chat-view');
    expect(within(chatView).getByText(expectedName)).toBeInTheDocument();
  });

  it('renders at least one bubble for the active conversation', () => {
    renderMessagesApp();

    const chatView = screen.getByTestId('messages-chat-view');
    const bubbles = within(chatView).getAllByTestId('messages-bubble');
    expect(bubbles.length).toBeGreaterThan(0);
  });

  it('aligns sent messages right and received messages left', () => {
    renderMessagesApp();

    const chatView = screen.getByTestId('messages-chat-view');
    const bubbles = within(chatView).getAllByTestId('messages-bubble');

    const froms = bubbles.map((b) => b.getAttribute('data-from'));
    expect(froms).toContain('me');
    expect(froms).toContain('them');

    bubbles.forEach((bubble) => {
      const from = bubble.getAttribute('data-from');
      const className = bubble.getAttribute('class') ?? '';
      if (from === 'me') {
        expect(className).toContain('justify-end');
      } else if (from === 'them') {
        expect(className).toContain('justify-start');
      }
    });
  });

  it('selecting a different conversation updates the chat view', () => {
    renderMessagesApp();

    const items = screen.getAllByTestId('messages-conversation-item');
    const firstActive = items.find((item) => item.getAttribute('data-active') === 'true');
    const firstName = firstActive.querySelector('.font-medium').textContent;

    // Pick a conversation other than the active one.
    const target = items.find((item) => item !== firstActive);
    expect(target).toBeDefined();
    const targetId = target.getAttribute('data-conversation-id');
    const targetName = target.querySelector('.font-medium').textContent;

    fireEvent.click(target);

    const updatedActive = screen
      .getAllByTestId('messages-conversation-item')
      .find((item) => item.getAttribute('data-active') === 'true');
    expect(updatedActive.getAttribute('data-conversation-id')).toBe(targetId);

    const chatView = screen.getByTestId('messages-chat-view');
    expect(within(chatView).getByText(targetName)).toBeInTheDocument();

    // The chat view should now reflect the selected conversation's name.
    expect(chatView.textContent).toContain(targetName);

    // The header should no longer show the previously active conversation's name
    // when it differs from the newly selected one.
    if (firstName !== targetName) {
      const headers = Array.from(chatView.querySelectorAll('header'));
      expect(
        headers.some((h) => h.textContent.includes(targetName)),
      ).toBe(true);
      expect(
        headers.some((h) => h.textContent.includes(firstName)),
      ).toBe(false);
    }
  });

  it('typing into the input updates its value', () => {
    renderMessagesApp();

    const input = screen.getByTestId('messages-input');
    fireEvent.change(input, { target: { value: 'Hello there' } });

    expect(input).toHaveValue('Hello there');
  });

  it('clicking Send adds a new sent bubble and clears the input', () => {
    renderMessagesApp();

    const input = screen.getByTestId('messages-input');
    fireEvent.change(input, { target: { value: 'This is my new message' } });

    const chatView = screen.getByTestId('messages-chat-view');
    const beforeCount = within(chatView).getAllByTestId('messages-bubble').length;

    fireEvent.click(screen.getByTestId('messages-send-button'));

    const afterBubbles = within(chatView).getAllByTestId('messages-bubble');
    expect(afterBubbles.length).toBe(beforeCount + 1);

    const lastBubble = afterBubbles[afterBubbles.length - 1];
    expect(lastBubble).toHaveAttribute('data-from', 'me');
    expect(lastBubble).toHaveTextContent('This is my new message');

    expect(input).toHaveValue('');
  });

  it('submitting the composer form also sends the message and clears the input', () => {
    renderMessagesApp();

    const input = screen.getByTestId('messages-input');
    fireEvent.change(input, { target: { value: 'Form submission' } });

    const composer = screen.getByTestId('messages-composer');
    fireEvent.submit(composer);

    const chatView = screen.getByTestId('messages-chat-view');
    const bubbles = within(chatView).getAllByTestId('messages-bubble');
    expect(bubbles[bubbles.length - 1]).toHaveTextContent('Form submission');
    expect(input).toHaveValue('');
  });

  it('does not send empty or whitespace-only messages', () => {
    renderMessagesApp();

    const input = screen.getByTestId('messages-input');
    const chatView = screen.getByTestId('messages-chat-view');
    const beforeCount = within(chatView).getAllByTestId('messages-bubble').length;

    // Empty
    fireEvent.click(screen.getByTestId('messages-send-button'));
    expect(within(chatView).getAllByTestId('messages-bubble').length).toBe(beforeCount);

    // Whitespace only
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('messages-send-button'));
    expect(within(chatView).getAllByTestId('messages-bubble').length).toBe(beforeCount);
    // Input value remains so the user can keep typing.
    expect(input).toHaveValue('   ');
  });

  it('does not crash when sending and works for each conversation independently', () => {
    renderMessagesApp();

    const items = screen.getAllByTestId('messages-conversation-item');
    const input = screen.getByTestId('messages-input');

    items.forEach((item) => {
      fireEvent.click(item);
      const id = item.getAttribute('data-conversation-id');
      fireEvent.change(input, { target: { value: `ping ${id}` } });
      fireEvent.click(screen.getByTestId('messages-send-button'));

      const chatView = screen.getByTestId('messages-chat-view');
      const bubbles = within(chatView).getAllByTestId('messages-bubble');
      expect(bubbles[bubbles.length - 1]).toHaveTextContent(`ping ${id}`);
      expect(input).toHaveValue('');
    });
  });

  it('exposes the chat composer (input + send button) inside the chat view', () => {
    renderMessagesApp();

    const chatView = screen.getByTestId('messages-chat-view');
    expect(within(chatView).getByTestId('messages-input')).toBeInTheDocument();
    expect(within(chatView).getByTestId('messages-send-button')).toBeInTheDocument();
  });
});
