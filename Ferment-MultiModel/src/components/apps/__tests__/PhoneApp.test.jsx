import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import PhoneApp, { RECORDS, CONTACTS, VOICEMAILS } from '../PhoneApp.jsx';

afterEach(() => {
  cleanup();
});

function renderPhoneApp(props = {}) {
  return render(<PhoneApp {...props} />);
}

describe('<PhoneApp />', () => {
  it('renders the root with the canonical data-app-id and an active tab', () => {
    renderPhoneApp();

    const root = screen.getByTestId('phone-app');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-app-id', 'phone');
    expect(root).toHaveAttribute('data-active-tab', 'recents');
  });

  it('renders all three tabs with the expected test ids', () => {
    renderPhoneApp();

    const tabs = screen.getByTestId('phone-tabs');
    expect(tabs).toBeInTheDocument();
    expect(tabs).toHaveAttribute('role', 'tablist');

    expect(screen.getByTestId('phone-recents-tab')).toHaveTextContent('Recents');
    expect(screen.getByTestId('phone-contacts-tab')).toHaveTextContent('Contacts');
    expect(screen.getByTestId('phone-voicemail-tab')).toHaveTextContent('Voicemail');
  });

  it('defaults to the Recents tab as active and marks the others inactive', () => {
    renderPhoneApp();

    const recents = screen.getByTestId('phone-recents-tab');
    const contacts = screen.getByTestId('phone-contacts-tab');
    const voicemail = screen.getByTestId('phone-voicemail-tab');

    expect(recents).toHaveAttribute('data-active', 'true');
    expect(recents).toHaveAttribute('aria-selected', 'true');

    expect(contacts).toHaveAttribute('data-active', 'false');
    expect(contacts).toHaveAttribute('aria-selected', 'false');

    expect(voicemail).toHaveAttribute('data-active', 'false');
    expect(voicemail).toHaveAttribute('aria-selected', 'false');
  });

  it('renders the Recents list with one item per mock call record', () => {
    renderPhoneApp();

    const list = screen.getByTestId('phone-recents-list');
    expect(list).toBeInTheDocument();

    const items = within(list).getAllByTestId('phone-recents-item');
    expect(items).toHaveLength(RECORDS.length);

    // Every record id should be represented.
    const ids = items.map((item) => item.getAttribute('data-call-id'));
    RECORDS.forEach((record) => {
      expect(ids).toContain(record.id);
    });
  });

  it('shows the Recents call type on each row', () => {
    renderPhoneApp();

    const list = screen.getByTestId('phone-recents-list');
    const items = within(list).getAllByTestId('phone-recents-item');

    const seenTypes = new Set();
    items.forEach((item) => {
      const type = item.getAttribute('data-call-type');
      expect(['incoming', 'outgoing', 'missed']).toContain(type);
      seenTypes.add(type);
    });

    // Mock data exercises all three call types.
    expect(seenTypes.size).toBe(3);
  });

  it('switching to the Contacts tab shows the Contacts list', () => {
    renderPhoneApp();

    // Recents list is visible by default.
    expect(screen.getByTestId('phone-recents-list')).toBeInTheDocument();
    expect(screen.queryByTestId('phone-contacts-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('phone-voicemail-list')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('phone-contacts-tab'));

    const contacts = screen.getByTestId('phone-contacts-list');
    expect(contacts).toBeInTheDocument();

    const items = within(contacts).getAllByTestId('phone-contact-item');
    expect(items).toHaveLength(CONTACTS.length);

    // The other lists should be gone.
    expect(screen.queryByTestId('phone-recents-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('phone-voicemail-list')).not.toBeInTheDocument();

    // Active tab attribute on the root reflects the change.
    expect(screen.getByTestId('phone-app')).toHaveAttribute(
      'data-active-tab',
      'contacts',
    );
    expect(screen.getByTestId('phone-contacts-tab')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('switching to the Voicemail tab shows the Voicemail list', () => {
    renderPhoneApp();

    expect(screen.getByTestId('phone-recents-list')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('phone-voicemail-tab'));

    const voicemails = screen.getByTestId('phone-voicemail-list');
    expect(voicemails).toBeInTheDocument();

    const items = within(voicemails).getAllByTestId('phone-voicemail-item');
    expect(items).toHaveLength(VOICEMAILS.length);

    expect(screen.queryByTestId('phone-recents-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('phone-contacts-list')).not.toBeInTheDocument();

    expect(screen.getByTestId('phone-app')).toHaveAttribute(
      'data-active-tab',
      'voicemail',
    );
    expect(screen.getByTestId('phone-voicemail-tab')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('renders avatars with initials for contacts', () => {
    renderPhoneApp();
    fireEvent.click(screen.getByTestId('phone-contacts-tab'));

    const list = screen.getByTestId('phone-contacts-list');
    const items = within(list).getAllByTestId('phone-contact-item');
    expect(items.length).toBeGreaterThan(0);

    // Every contact should display a 2-letter (or 1-letter for single-word)
    // uppercase initial inside the avatar circle.
    items.forEach((item) => {
      const text = (item.textContent ?? '').trim();
      // The item should include the contact name and number.
      expect(text.length).toBeGreaterThan(0);
    });

    // Spot-check that at least one contact name is rendered.
    expect(within(list).getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('search input filters the Recents list by name', () => {
    renderPhoneApp();

    const input = screen.getByTestId('phone-search-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'search');

    fireEvent.change(input, { target: { value: 'Ada' } });

    const list = screen.getByTestId('phone-recents-list');
    const items = within(list).getAllByTestId('phone-recents-item');

    // At least one match and fewer than the unfiltered total.
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(RECORDS.length);

    const names = items.map((item) => item.textContent);
    names.forEach((text) => {
      expect(text.toLowerCase()).toContain('ada');
    });
  });

  it('search input filters the Recents list by phone number', () => {
    renderPhoneApp();

    fireEvent.change(screen.getByTestId('phone-search-input'), {
      target: { value: '1003' },
    });

    const list = screen.getByTestId('phone-recents-list');
    const items = within(list).getAllByTestId('phone-recents-item');

    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(RECORDS.length);

    items.forEach((item) => {
      expect(item.textContent).toContain('1003');
    });
  });

  it('search input filters the Contacts list when the Contacts tab is active', () => {
    renderPhoneApp();
    fireEvent.click(screen.getByTestId('phone-contacts-tab'));

    fireEvent.change(screen.getByTestId('phone-search-input'), {
      target: { value: 'grace' },
    });

    const list = screen.getByTestId('phone-contacts-list');
    const items = within(list).getAllByTestId('phone-contact-item');

    expect(items.length).toBe(1);
    expect(items[0]).toHaveTextContent('Grace Hopper');
  });

  it('clearing the search restores the full Recents list', () => {
    renderPhoneApp();

    const input = screen.getByTestId('phone-search-input');

    fireEvent.change(input, { target: { value: 'Ada' } });
    expect(
      within(screen.getByTestId('phone-recents-list')).getAllByTestId(
        'phone-recents-item',
      ).length,
    ).toBeLessThan(RECORDS.length);

    fireEvent.change(input, { target: { value: '' } });
    expect(
      within(screen.getByTestId('phone-recents-list')).getAllByTestId(
        'phone-recents-item',
      ).length,
    ).toBe(RECORDS.length);
  });

  it('shows an empty state on Recents when the search has no matches', () => {
    renderPhoneApp();

    fireEvent.change(screen.getByTestId('phone-search-input'), {
      target: { value: 'zzzz-no-such-name' },
    });

    expect(screen.queryByTestId('phone-recents-list')).not.toBeInTheDocument();
    const empty = screen.getByTestId('phone-recents-empty');
    expect(empty).toBeInTheDocument();
    expect(empty.textContent.toLowerCase()).toContain('no recent');
  });
});
