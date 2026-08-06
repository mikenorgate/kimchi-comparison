/* ============================================================
   macOS Tahoe — App Implementations
   ============================================================ */

// ---- Helper: Create SVG icon strings for dock icons ----
const Icons = {
    finder: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#finder-grad)"/><defs><linearGradient id="finder-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4aa3ff"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><path d="M50 25 Q35 25 35 45 L35 75 L65 75 L65 45 Q65 25 50 25Z" fill="white" opacity="0.9"/><circle cx="42" cy="42" r="3" fill="#2563eb"/><circle cx="58" cy="42" r="3" fill="#2563eb"/><path d="M42 55 Q50 62 58 55" stroke="#2563eb" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
    safari: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#safari-grad)"/><defs><radialGradient id="safari-grad"><stop offset="0" stop-color="#f5f5f7"/><stop offset="1" stop-color="#d4d4d8"/></radialGradient></defs><circle cx="50" cy="50" r="30" fill="#0a84ff"/><circle cx="50" cy="50" r="28" fill="#fff"/><circle cx="50" cy="50" r="28" fill="none" stroke="#0a84ff" stroke-width="2"/><path d="M50 22 L54 48 L50 50Z" fill="#ff3b30"/><path d="M78 50 L52 54 L50 50Z" fill="#fff"/><path d="M50 78 L46 52 L50 50Z" fill="#ff3b30"/><path d="M22 50 L48 46 L50 50Z" fill="#fff"/><circle cx="50" cy="50" r="3" fill="#333"/><line x1="50" y1="50" x2="62" y2="38" stroke="#333" stroke-width="2" stroke-linecap="round"/></svg>`,
    notes: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#notes-grad)"/><defs><linearGradient id="notes-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef08a"/><stop offset="1" stop-color="#facc15"/></linearGradient></defs><rect x="22" y="18" width="56" height="64" rx="4" fill="#fff"/><line x1="30" y1="30" x2="70" y2="30" stroke="#facc15" stroke-width="2"/><line x1="30" y1="40" x2="70" y2="40" stroke="#fde68a" stroke-width="2"/><line x1="30" y1="50" x2="70" y2="50" stroke="#fde68a" stroke-width="2"/><line x1="30" y1="60" x2="55" y2="60" stroke="#fde68a" stroke-width="2"/></svg>`,
    calculator: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#calc-grad)"/><defs><linearGradient id="calc-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7280"/><stop offset="1" stop-color="#374151"/></linearGradient></defs><rect x="22" y="16" width="56" height="14" rx="3" fill="#1f2937"/><text x="72" y="27" fill="#4ade80" font-size="10" text-anchor="end" font-family="monospace">1234</text><circle cx="32" cy="44" r="6" fill="#9ca3af"/><circle cx="50" cy="44" r="6" fill="#9ca3af"/><circle cx="68" cy="44" r="6" fill="#9ca3af"/><circle cx="32" cy="60" r="6" fill="#9ca3af"/><circle cx="50" cy="60" r="6" fill="#9ca3af"/><circle cx="68" cy="60" r="6" fill="#f97316"/><circle cx="32" cy="76" r="6" fill="#9ca3af"/><circle cx="50" cy="76" r="6" fill="#9ca3af"/><circle cx="68" cy="76" r="6" fill="#f97316"/></svg>`,
    calendar: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#fff"/><rect x="14" y="14" width="72" height="72" rx="4" fill="#fff" stroke="#e5e5e7"/><rect x="14" y="14" width="72" height="16" rx="4" fill="#ff3b30"/><text x="50" y="68" fill="#1f2937" font-size="36" font-weight="700" text-anchor="middle">${new Date().getDate()}</text></svg>`,
    terminal: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#term-grad)"/><defs><linearGradient id="term-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2937"/><stop offset="1" stop-color="#111827"/></linearGradient></defs><rect x="14" y="18" width="72" height="50" rx="6" fill="#0d1117"/><text x="24" y="40" fill="#4ade80" font-size="14" font-family="monospace">&gt;_</text><text x="24" y="58" fill="#6b7280" font-size="10" font-family="monospace">user@mac</text></svg>`,
    settings: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#set-grad)"/><defs><linearGradient id="set-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ca3af"/><stop offset="1" stop-color="#6b7280"/></linearGradient></defs><g transform="translate(50,50)"><g fill="#fff"><path d="M-3,-28 L3,-28 L4,-22 L10,-20 L14,-24 L18,-20 L14,-14 L16,-8 L22,-7 L22,-1 L16,0 L14,6 L18,12 L14,16 L10,12 L4,14 L3,20 L-3,20 L-4,14 L-10,12 L-14,16 L-18,12 L-14,6 L-16,0 L-22,-1 L-22,-7 L-16,-8 L-14,-14 L-18,-20 L-14,-24 L-10,-20 L-4,-22 Z"/></g><circle r="8" fill="#6b7280"/></g></svg>`,
    mail: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#mail-grad)"/><defs><linearGradient id="mail-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><rect x="20" y="28" width="60" height="44" rx="6" fill="#fff"/><path d="M22 32 L50 52 L78 32" stroke="#2563eb" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    photos: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#fff"/><circle cx="50" cy="50" r="28" fill="none" stroke="#fbbf24" stroke-width="4"/><circle cx="50" cy="50" r="18" fill="none" stroke="#f97316" stroke-width="4"/><circle cx="50" cy="50" r="8" fill="none" stroke="#ef4444" stroke-width="4"/><g transform="translate(50,50)"><ellipse rx="30" ry="8" fill="none" stroke="#fbbf24" stroke-width="3"/><ellipse rx="30" ry="8" fill="none" stroke="#34d399" stroke-width="3" transform="rotate(60)"/><ellipse rx="30" ry="8" fill="none" stroke="#60a5fa" stroke-width="3" transform="rotate(120)"/></g></svg>`,
    music: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#music-grad)"/><defs><linearGradient id="music-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#e11d48"/></linearGradient></defs><path d="M42 30 L70 24 L70 64 Q70 72 62 72 Q54 72 54 64 Q54 58 62 58 Q66 58 68 60 L68 36 L48 40 L48 68 Q48 76 40 76 Q32 76 32 68 Q32 62 40 62 Q44 62 46 64 L46 34 Z" fill="#fff"/></svg>`,
    maps: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#maps-grad)"/><defs><linearGradient id="maps-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#059669"/></linearGradient></defs><path d="M20 75 L35 40 L50 55 L65 25 L80 75 Z" fill="#fff" opacity="0.9"/><circle cx="65" cy="25" r="5" fill="#ef4444"/><path d="M65 25 L65 12" stroke="#fff" stroke-width="2"/></svg>`,
    weather: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#weather-grad)"/><defs><linearGradient id="weather-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs><circle cx="38" cy="40" r="14" fill="#fbbf24"/><path d="M30 60 Q22 60 22 52 Q22 44 30 44 Q32 36 42 36 Q54 36 56 48 Q66 48 66 56 Q66 64 58 64 L30 64 Z" fill="#fff"/></svg>`,
    clock: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#000"/><circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="2"/><circle cx="50" cy="50" r="2" fill="#fff"/><line x1="50" y1="50" x2="50" y2="30" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="50" x2="64" y2="50" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="50" x2="58" y2="58" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    textedit: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#te-grad)"/><defs><linearGradient id="te-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f4f6"/><stop offset="1" stop-color="#d1d5db"/></linearGradient></defs><path d="M25 25 L75 25 L75 75 L25 75 Z" fill="#fff" stroke="#9ca3af" stroke-width="1"/><line x1="32" y1="38" x2="68" y2="38" stroke="#9ca3af" stroke-width="1.5"/><line x1="32" y1="48" x2="68" y2="48" stroke="#9ca3af" stroke-width="1.5"/><line x1="32" y1="58" x2="55" y2="58" stroke="#9ca3af" stroke-width="1.5"/></svg>`,
    appstore: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#as-grad)"/><defs><linearGradient id="as-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs><path d="M30 68 L42 48 M58 48 L70 68 M35 68 L65 68 M50 30 L50 48 M42 48 L50 30 L58 48 M38 68 L50 44 L62 68" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    messages: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#msg-grad)"/><defs><linearGradient id="msg-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs><path d="M25 35 Q25 25 35 25 L65 25 Q75 25 75 35 L75 55 Q75 65 65 65 L45 65 L30 75 L33 65 Q25 65 25 55 Z" fill="#fff"/></svg>`,
    reminders: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#rem-grad)"/><defs><linearGradient id="rem-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs><circle cx="50" cy="50" r="28" fill="none" stroke="#fff" stroke-width="4"/><circle cx="50" cy="50" r="16" fill="none" stroke="#fff" stroke-width="2" opacity="0.5"/><path d="M38 50 L46 58 L62 42" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    contacts: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#con-grad)"/><defs><linearGradient id="con-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d1d5db"/><stop offset="1" stop-color="#9ca3af"/></linearGradient></defs><circle cx="50" cy="40" r="14" fill="#fff"/><path d="M26 76 Q26 56 50 56 Q74 56 74 76 Z" fill="#fff"/></svg>`,
    podcasts: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#pod-grad)"/><defs><linearGradient id="pod-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c084fc"/><stop offset="1" stop-color="#9333ea"/></linearGradient></defs><circle cx="50" cy="42" r="8" fill="#fff"/><path d="M36 42 Q36 28 50 28 Q64 28 64 42" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 42 Q28 20 50 20 Q72 20 72 42" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/><path d="M44 70 L50 56 L56 70 Z" fill="#fff"/></svg>`,
    tv: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#000"/><rect x="20" y="28" width="60" height="44" rx="4" fill="#1a1a1a" stroke="#333" stroke-width="1"/><text x="50" y="56" fill="#fff" font-size="18" font-weight="700" text-anchor="middle">tv</text></svg>`,
    stocks: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#st-grad)"/><defs><linearGradient id="st-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2937"/><stop offset="1" stop-color="#111827"/></linearGradient></defs><path d="M22 60 L35 45 L45 52 L58 30 L78 40" stroke="#4ade80" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    phone: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#ph-grad)"/><defs><linearGradient id="ph-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs><path d="M36 28 L64 28 Q70 28 70 34 L70 70 Q70 76 64 76 L36 76 Q30 76 30 70 L30 34 Q30 28 36 28 Z" fill="#fff" rx="6"/><path d="M42 38 L58 38 L58 62 L42 62 Z" fill="#16a34a" rx="3"/><circle cx="50" cy="68" r="2" fill="#16a34a"/></svg>`,
    games: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#game-grad)"/><defs><linearGradient id="game-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><path d="M30 42 Q30 35 37 35 L63 35 Q70 35 70 42 L70 58 Q70 65 63 65 Q60 65 58 62 L42 62 Q40 65 37 65 Q30 65 30 58 Z" fill="#fff"/><circle cx="40" cy="48" r="2.5" fill="#7c3aed"/><circle cx="40" cy="54" r="2.5" fill="#7c3aed"/><path d="M58 48 L64 48 M61 45 L61 51" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>`,
    journal: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#jr-grad)"/><defs><linearGradient id="jr-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#ea580c"/></linearGradient></defs><rect x="28" y="22" width="44" height="56" rx="4" fill="#fff"/><line x1="36" y1="35" x2="64" y2="35" stroke="#ea580c" stroke-width="2"/><line x1="36" y1="45" x2="64" y2="45" stroke="#fdba74" stroke-width="1.5"/><line x1="36" y1="55" x2="56" y2="55" stroke="#fdba74" stroke-width="1.5"/><circle cx="50" cy="68" r="4" fill="none" stroke="#ea580c" stroke-width="2"/><line x1="50" y1="68" x2="50" y2="64" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/></svg>`,
    books: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#bk-grad)"/><defs><linearGradient id="bk-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#c2410c"/></linearGradient></defs><path d="M25 25 L50 30 L75 25 L75 75 L50 70 L25 75 Z" fill="#fff"/><line x1="50" y1="30" x2="50" y2="70" stroke="#c2410c" stroke-width="1.5"/></svg>`,
    facetime: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#ft-grad)"/><defs><linearGradient id="ft-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs><rect x="22" y="30" width="44" height="32" rx="6" fill="#fff"/><path d="M66 38 L78 30 L78 62 L66 54 Z" fill="#fff"/></svg>`,
    preview: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="url(#pv-grad)"/><defs><linearGradient id="pv-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5e7eb"/><stop offset="1" stop-color="#9ca3af"/></linearGradient></defs><circle cx="50" cy="50" r="24" fill="none" stroke="#fff" stroke-width="3"/><circle cx="50" cy="50" r="6" fill="#fff"/></svg>`,
};

// ---- Mock Data ----
const MockData = {
    notes: [
        { id: 1, title: 'Welcome to Notes', body: 'Welcome to Notes on macOS Tahoe!\n\nThis is your first note. You can:\n• Create new notes\n• Edit existing ones\n• Search through your notes\n\nEnjoy the Liquid Glass design!', date: 'Today' },
        { id: 2, title: 'Shopping List', body: 'Shopping List\n\n• Milk\n• Coffee beans\n• Sourdough bread\n• Olive oil\n• Avocados\n• Cheese', date: 'Yesterday' },
        { id: 3, title: 'Project Ideas', body: 'Project Ideas\n\n1. Build a macOS web clone\n2. Learn SwiftUI\n3. Create a Liquid Glass component library\n4. Write a blog post about design systems', date: 'Aug 3' },
        { id: 4, title: 'Meeting Notes', body: 'Meeting Notes - Aug 1\n\nAttendees: Team\n\nKey decisions:\n- Ship v2.0 next week\n- Focus on performance\n- Redesign onboarding flow', date: 'Aug 1' },
        { id: 5, title: 'Books to Read', body: 'Reading List\n\n• "Designing Interfaces" by Jenifer Tidwell\n• "Refactoring UI" by Adam Wathan\n• "The Design of Everyday Things" by Don Norman', date: 'Jul 28' },
    ],
    messages: [
        { id: 1, name: 'Sarah Chen', avatar: '👩🏻', color: '#f97316', last: 'See you tomorrow!', msgs: [
            { sent: false, text: 'Hey! Are we still on for lunch?' },
            { sent: true, text: 'Yes! 12:30 at the usual spot?' },
            { sent: false, text: 'Perfect, see you tomorrow!' },
        ]},
        { id: 2, name: 'Mom', avatar: '👩🏼', color: '#ec4899', last: 'Call me when you can', msgs: [
            { sent: false, text: 'How was your day?' },
            { sent: true, text: 'Great! Just finished a big project' },
            { sent: false, text: 'So proud of you! Call me when you can' },
        ]},
        { id: 3, name: 'Dev Team', avatar: '👨‍💻', color: '#3b82f6', last: 'PR merged 🎉', msgs: [
            { sent: false, text: 'Can someone review PR #42?' },
            { sent: true, text: 'On it!' },
            { sent: false, text: 'PR merged 🎉' },
        ]},
        { id: 4, name: 'Alex Rivera', avatar: '🧑🏻', color: '#8b5cf6', last: 'Thanks again!', msgs: [
            { sent: true, text: 'Did you get the tickets?' },
            { sent: false, text: 'Yes! Thanks again!' },
        ]},
        { id: 5, name: 'Pizza Place', avatar: '🍕', color: '#ef4444', last: 'Your order is ready', msgs: [
            { sent: false, text: 'Your order is ready for pickup!' },
        ]},
    ],
    contacts: [
        { name: 'Sarah Chen', phone: '(555) 123-4567', email: 'sarah@example.com', color: '#f97316' },
        { name: 'Alex Rivera', phone: '(555) 234-5678', email: 'alex@example.com', color: '#8b5cf6' },
        { name: 'Emma Wilson', phone: '(555) 345-6789', email: 'emma@example.com', color: '#ec4899' },
        { name: 'James Park', phone: '(555) 456-7890', email: 'james@example.com', color: '#3b82f6' },
        { name: 'Lisa Anderson', phone: '(555) 567-8901', email: 'lisa@example.com', color: '#10b981' },
        { name: 'Michael Brown', phone: '(555) 678-9012', email: 'mike@example.com', color: '#f59e0b' },
        { name: 'Olivia Martinez', phone: '(555) 789-0123', email: 'olivia@example.com', color: '#ef4444' },
        { name: 'Robert Lee', phone: '(555) 890-1234', email: 'robert@example.com', color: '#6366f1' },
    ],
    reminders: [
        { list: 'Today', items: [
            { text: 'Review pull request', done: true },
            { text: 'Design system sync at 2pm', done: false },
            { text: 'Update documentation', done: false },
            { text: 'Reply to Sarah\'s email', done: false },
        ]},
        { list: 'Work', items: [
            { text: 'Prepare presentation slides', done: false },
            { text: 'Fix the login bug', done: true },
            { text: 'Deploy to staging', done: false },
        ]},
        { list: 'Personal', items: [
            { text: 'Buy birthday gift', done: false },
            { text: 'Schedule dentist appointment', done: false },
            { text: 'Plan weekend trip', done: false },
        ]},
    ],
    stocks: [
        { ticker: 'AAPL', name: 'Apple Inc.', price: 234.50, change: +2.32, pct: +1.0 },
        { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 178.25, change: +1.15, pct: +0.65 },
        { ticker: 'MSFT', name: 'Microsoft Corp.', price: 425.80, change: -2.10, pct: -0.49 },
        { ticker: 'TSLA', name: 'Tesla Inc.', price: 312.44, change: +8.76, pct: +2.88 },
        { ticker: 'AMZN', name: 'Amazon.com', price: 185.60, change: +0.92, pct: +0.50 },
        { ticker: 'META', name: 'Meta Platforms', price: 512.30, change: -3.45, pct: -0.67 },
        { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 125.40, change: +4.56, pct: +3.77 },
        { ticker: 'NFLX', name: 'Netflix Inc.', price: 689.20, change: +12.30, pct: +1.82 },
    ],
    calendarEvents: {
        3: [{ title: 'Team Standup', color: '' }, { title: 'Design Review', color: 'green' }],
        7: [{ title: '1:1 with Sarah', color: 'orange' }],
        12: [{ title: 'Product Launch', color: 'purple' }, { title: 'Lunch w/ Alex', color: 'green' }],
        15: [{ title: 'Conference Call', color: '' }],
        20: [{ title: 'Birthday Party', color: 'orange' }],
        25: [{ title: 'Quarterly Review', color: 'purple' }],
    },
    safariBookmarks: [
        { name: 'Apple', url: 'https://apple.com', icon: '🍎', color: '#1a1a1a' },
        { name: 'Google', url: 'https://google.com', icon: 'G', color: '#4285f4' },
        { name: 'YouTube', url: 'https://youtube.com', icon: '▶', color: '#ff0000' },
        { name: 'GitHub', url: 'https://github.com', icon: '🐙', color: '#24292e' },
        { name: 'Wikipedia', url: 'https://wikipedia.org', icon: 'W', color: '#636363' },
        { name: 'Reddit', url: 'https://reddit.com', icon: '🤖', color: '#ff4500' },
        { name: 'Netflix', url: 'https://netflix.com', icon: 'N', color: '#e50914' },
        { name: 'Amazon', url: 'https://amazon.com', icon: 'a', color: '#ff9900' },
        { name: 'Twitter', url: 'https://twitter.com', icon: '𝕏', color: '#1da1f2' },
        { name: 'Spotify', url: 'https://spotify.com', icon: '♪', color: '#1db954' },
    ],
    musicTracks: [
        { title: 'Liquid Dreams', artist: 'Tahoe Sessions', duration: '3:42', color1: '#e74c3c', color2: '#8e44ad' },
        { title: 'Glass Horizon', artist: 'Aurora Bay', duration: '4:15', color1: '#3498db', color2: '#2c3e50' },
        { title: 'Mountain Echo', artist: 'Sierra Sound', duration: '5:01', color1: '#2ecc71', color2: '#27ae60' },
        { title: 'Crystal Lake', artist: 'Mirror Lake', duration: '3:28', color1: '#f39c12', color2: '#e67e22' },
        { title: 'Liquid Light', artist: 'Tahoe Sessions', duration: '4:52', color1: '#9b59b6', color2: '#8e44ad' },
        { title: 'Floating Glass', artist: 'Aurora Bay', duration: '3:19', color1: '#1abc9c', color2: '#16a085' },
    ],
    weatherHours: [
        { time: 'Now', icon: '☀️', temp: '68°' },
        { time: '1PM', icon: '☀️', temp: '70°' },
        { time: '2PM', icon: '🌤️', temp: '71°' },
        { time: '3PM', icon: '🌤️', temp: '72°' },
        { time: '4PM', icon: '⛅', temp: '71°' },
        { time: '5PM', icon: '⛅', temp: '69°' },
        { time: '6PM', icon: '☁️', temp: '66°' },
        { time: '7PM', icon: '☁️', temp: '63°' },
    ],
    weatherDays: [
        { day: 'Today', icon: '☀️', low: 58, high: 72 },
        { day: 'Thu', icon: '⛅', low: 55, high: 70 },
        { day: 'Fri', icon: '🌧️', low: 52, high: 65 },
        { day: 'Sat', icon: '☀️', low: 56, high: 71 },
        { day: 'Sun', icon: '🌤️', low: 54, high: 68 },
        { day: 'Mon', icon: '☁️', low: 50, high: 62 },
        { day: 'Tue', icon: '🌧️', low: 48, high: 58 },
    ],
    podcasts: [
        { title: 'The Daily', author: 'The New York Times', color: '#ff6b6b' },
        { title: 'Lex Fridman', author: 'Lex Fridman', color: '#4ecdc4' },
        { title: 'Hard Fork', author: 'The New York Times', color: '#ffbe0b' },
        { title: 'Acquired', author: 'Ben Gilbert & David Rosenthal', color: '#8338ec' },
        { title: 'Darknet Diaries', author: 'Jack Rhysider', color: '#3a86ff' },
        { title: 'Search Engine', author: 'PJ Vogt', color: '#fb5607' },
    ],
    appStoreApps: [
        { name: 'Pixelmator Pro', desc: 'Powerful image editor', icon: '🎨', color: '#5856d6' },
        { name: 'Things 3', desc: 'The award-winning to-do app', icon: '✅', color: '#3b82f6' },
        { name: 'Bear', desc: 'Beautiful writing app', icon: '🐻', color: '#f59e0b' },
        { name: 'Ulysses', desc: 'The writing app', icon: '✍️', color: '#f97316' },
        { name: 'Magnet', desc: 'Window manager', icon: '🧲', color: '#ef4444' },
        { name: 'CleanMyMac', desc: 'All-in-one cleanup', icon: '🧹', color: '#10b981' },
    ],
    games: [
        { name: 'Sea of Stars', genre: 'RPG', color: '#3b82f6' },
        { name: 'Hades II', genre: 'Action', color: '#ef4444' },
        { name: 'Stardew Valley', genre: 'Simulation', color: '#22c55e' },
        { name: 'Hollow Knight', genre: 'Adventure', color: '#6366f1' },
        { name: 'Dead Cells', genre: 'Action', color: '#8b5cf6' },
        { name: 'Balatro', genre: 'Card', color: '#f59e0b' },
    ],
    books: [
        { title: 'Designing Interfaces', author: 'Jenifer Tidwell', color: '#3b82f6' },
        { title: 'Refactoring UI', author: 'Adam Wathan', color: '#22c55e' },
        { title: 'Don\'t Make Me Think', author: 'Steve Krug', color: '#f97316' },
        { title: 'Atomic Habits', author: 'James Clear', color: '#ef4444' },
        { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', color: '#8b5cf6' },
        { title: 'Clean Code', author: 'Robert Martin', color: '#6366f1' },
    ],
    tvShows: [
        { title: 'Severance', color: '#1a1a2e' },
        { title: 'Ted Lasso', color: '#f59e0b' },
        { title: 'Foundation', color: '#3b82f6' },
        { title: 'The Morning Show', color: '#ef4444' },
        { title: 'For All Mankind', color: '#6366f1' },
        { title: 'Slow Horses', color: '#374151' },
    ],
    worldClocks: [
        { city: 'Cupertino', label: 'Today', offset: 0 },
        { city: 'New York', label: 'Today', offset: 3 },
        { city: 'London', label: 'Today', offset: 8 },
        { city: 'Paris', label: 'Today', offset: 9 },
        { city: 'Tokyo', label: 'Tomorrow', offset: 17 },
        { city: 'Sydney', label: 'Tomorrow', offset: 19 },
    ],
    emails: [
        { id: 1, from: 'Apple', subject: 'Welcome to macOS Tahoe', preview: 'Discover what\'s new in macOS Tahoe 26 with Liquid Glass...', time: '9:32 AM', unread: true, color: '#1a1a1a' },
        { id: 2, from: 'Sarah Chen', subject: 'Lunch tomorrow?', preview: 'Hey! Want to grab lunch tomorrow? I found this great new place...', time: '8:15 AM', unread: true, color: '#f97316' },
        { id: 3, 'from': 'GitHub', subject: '[org/repo] PR #42 needs review', preview: 'A new pull request has been opened and needs your review...', time: 'Yesterday', unread: false, color: '#24292e' },
        { id: 4, from: 'Netflix', subject: 'New on Netflix this week', preview: 'Check out the latest movies and shows added to Netflix...', time: 'Yesterday', unread: false, color: '#e50914' },
        { id: 5, from: 'Slack', subject: 'You have 3 new mentions', preview: 'You were mentioned in #design-team, #engineering, and...', time: 'Mon', unread: false, color: '#4a154b' },
        { id: 6, from: 'LinkedIn', subject: 'New connection request', preview: 'Alex Rivera wants to connect with you on LinkedIn...', time: 'Sun', unread: false, color: '#0a66c2' },
    ],
    finderFiles: {
        'Desktop': [{ name: 'Screenshot.png', icon: '🖼️' }, { name: 'Project Notes', icon: '📄' }, { name: 'Resume.pdf', icon: '📕' }],
        'Documents': [{ name: 'Tax Returns', icon: '📁' }, { name: 'Budget.xlsx', icon: '📊' }, { name: 'Letter.docx', icon: '📄' }, { name: 'Recipes', icon: '📁' }, { name: 'Contract.pdf', icon: '📕' }],
        'Downloads': [{ name: 'macOS-Tahoe.dmg', icon: '💽' }, { name: 'wallpaper.jpg', icon: '🖼️' }, { name: 'setup.zip', icon: '📦' }, { name: 'report.pdf', icon: '📕' }],
        'Applications': [{ name: 'Safari', icon: '🧭' }, { name: 'Mail', icon: '✉️' }, { name: 'Calendar', icon: '📅' }, { name: 'Notes', icon: '📝' }, { name: 'Terminal', icon: '⬛' }, { name: 'Calculator', icon: '🧮' }, { name: 'Settings', icon: '⚙️' }, { name: 'Music', icon: '🎵' }],
        'Pictures': [{ name: 'vacation.jpg', icon: '🖼️' }, { name: 'family.jpg', icon: '🖼️' }, { name: 'screenshots', icon: '📁' }, { name: 'wallpapers', icon: '📁' }],
        'Movies': [{ name: 'movie-trailer.mov', icon: '🎬' }, { name: 'screen-recording.mp4', icon: '🎬' }],
        'Music': [{ name: 'Playlists', icon: '📁' }, { name: 'Albums', icon: '📁' }],
    },
};

// Helper: make a toolbar
function makeToolbar(items) {
    const tb = document.createElement('div');
    tb.className = 'window-toolbar';
    items.forEach(item => {
        if (item === 'divider') {
            const div = document.createElement('div');
            div.style.width = '1px';
            div.style.height = '20px';
            div.style.background = 'rgba(0,0,0,0.1)';
            tb.appendChild(div);
        } else if (item.group) {
            const group = document.createElement('div');
            group.className = 'tb-group';
            item.group.forEach(btn => group.appendChild(makeToolbarBtn(btn)));
            tb.appendChild(group);
        } else {
            tb.appendChild(makeToolbarBtn(item));
        }
    });
    return tb;
}

function makeToolbarBtn(config) {
    const btn = document.createElement('button');
    btn.className = 'tb-btn';
    btn.innerHTML = config.icon || '';
    if (config.label) btn.innerHTML += ` <span>${config.label}</span>`;
    if (config.action) btn.addEventListener('click', config.action);
    if (config.flex) btn.style.flex = config.flex;
    return btn;
}

// Helper: create sidebar
function makeSidebar(items) {
    const sidebar = document.createElement('div');
    sidebar.className = 'app-sidebar';
    items.forEach(section => {
        const sec = document.createElement('div');
        sec.className = 'sidebar-section';
        if (section.label) {
            const label = document.createElement('div');
            label.className = 'sidebar-label';
            label.textContent = section.label;
            sec.appendChild(label);
        }
        section.items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'sidebar-item';
            el.innerHTML = `<span class="si-icon">${item.icon || ''}</span><span>${item.label}</span>`;
            if (item.count) el.innerHTML += `<span class="si-count">${item.count}</span>`;
            if (item.action) el.addEventListener('click', () => {
                sec.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
                el.classList.add('active');
                item.action();
            });
            if (item.active) el.classList.add('active');
            sec.appendChild(el);
        });
        sidebar.appendChild(sec);
    });
    return sidebar;
}

// ============================================================
// FINDER
// ============================================================
OS.registerApp('finder', {
    name: 'Finder',
    icon: Icons.finder,
    dockIcon: Icons.finder,
    windowWidth: 760,
    windowHeight: 480,
    render(content, winState, data) {
        let currentLocation = data && data.location ? data.location : 'Desktop';

        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { label: 'Favorites', items: [
                { label: 'AirDrop', icon: '📡' },
                { label: 'Recents', icon: '🕐' },
                { label: 'Applications', icon: '📦', action: () => navigate('Applications') },
                { label: 'Desktop', icon: '🖥️', active: currentLocation === 'Desktop', action: () => navigate('Desktop') },
                { label: 'Documents', icon: '📄', action: () => navigate('Documents') },
                { label: 'Downloads', icon: '⬇️', action: () => navigate('Downloads') },
            ]},
            { label: 'iCloud', items: [
                { label: 'iCloud Drive', icon: '☁️' },
                { label: 'Shared', icon: '👥' },
            ]},
            { label: 'Locations', items: [
                { label: 'Macintosh HD', icon: '💽' },
                { label: 'Network', icon: '🌐' },
            ]},
            { label: 'Tags', items: [
                { label: 'Red', icon: '🔴' },
                { label: 'Orange', icon: '🟠' },
                { label: 'Green', icon: '🟢' },
                { label: 'Blue', icon: '🔵' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'finder-main';

        const toolbar = makeToolbar([
            { icon: '◀', action: () => {} },
            { icon: '▶', action: () => {} },
            'divider',
            { label: currentLocation, action: () => {} },
            'divider',
            { group: [{ icon: '⊞' }, { icon: '☰' }, { icon: '⋱' }] },
            { icon: '🔍', flex: '1' },
            { icon: '⊕' },
        ]);

        const fileList = document.createElement('div');
        fileList.className = 'finder-content';

        const pathBar = document.createElement('div');
        pathBar.className = 'finder-path-bar';
        pathBar.innerHTML = `💽 Macintosh HD <span style="opacity:0.4">›</span> ${currentLocation}`;

        main.appendChild(toolbar);
        main.appendChild(fileList);
        main.appendChild(pathBar);

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);

        function navigate(loc) {
            currentLocation = loc;
            const files = MockData.finderFiles[loc] || [];
            fileList.innerHTML = `<div class="finder-grid">${files.map(f => `
                <div class="finder-item">
                    <div class="finder-item-icon">${f.icon}</div>
                    <div class="finder-item-name">${f.name}</div>
                </div>
            `).join('')}</div>`;
            pathBar.innerHTML = `💽 Macintosh HD <span style="opacity:0.4">›</span> ${currentLocation}`;
            // Update toolbar label
            const labelBtn = toolbar.querySelectorAll('.tb-btn')[2];
            if (labelBtn) labelBtn.querySelector('span') ? labelBtn.querySelector('span').textContent = loc : null;
        }

        navigate(currentLocation);

        // Click file items
        fileList.addEventListener('click', (e) => {
            const item = e.target.closest('.finder-item');
            if (!item) return;
            fileList.querySelectorAll('.finder-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
        });

        // Double click to "open"
        fileList.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.finder-item');
            if (!item) return;
            const name = item.querySelector('.finder-item-name').textContent;
            OS.notify({ app: 'Finder', title: 'Cannot open', body: `${name} cannot be opened in this demo.`, iconChar: '📁' });
        });
    },
});

// ============================================================
// SAFARI
// ============================================================
OS.registerApp('safari', {
    name: 'Safari',
    icon: Icons.safari,
    dockIcon: Icons.safari,
    windowWidth: 900,
    windowHeight: 600,
    render(content, winState, data) {
        const main = document.createElement('div');
        main.style.display = 'flex';
        main.style.flexDirection = 'column';
        main.style.flex = '1';

        const toolbar = makeToolbar([
            { group: [{ icon: '◀' }, { icon: '▶' }] },
            { icon: '⤴' },
            'divider',
            { icon: '⇧', action: () => showSidebar() },
            'divider',
        ]);

        // Address bar
        const addrContainer = document.createElement('div');
        addrContainer.className = 'safari-addr-bar';
        addrContainer.style.flex = '1';
        addrContainer.innerHTML = `
            <span style="opacity:0.5">🔒</span>
            <input type="text" placeholder="Search or enter website name" value="${data && data.url ? data.url : ''}">
        `;
        toolbar.appendChild(addrContainer);

        toolbar.appendChild(makeToolbarBtn({ icon: '⊕' }));
        toolbar.appendChild(makeToolbarBtn({ icon: '⊘' }));
        toolbar.appendChild(makeToolbarBtn({ icon: '⤴' }));

        const pageContent = document.createElement('div');
        pageContent.className = 'safari-content';

        main.appendChild(toolbar);
        main.appendChild(pageContent);
        content.appendChild(main);

        function renderStartPage() {
            pageContent.innerHTML = `
                <div class="safari-startpage">
                    <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;">Favorites</h1>
                    <p style="color:var(--text-secondary);margin-bottom:20px;">Your favorite sites, all in one place</p>
                    <div class="safari-favorites">
                        ${MockData.safariBookmarks.map(b => `
                            <div class="safari-fav-item" data-url="${b.url}">
                                <div class="safari-fav-icon" style="background:${b.color}">${b.icon}</div>
                                <div class="safari-fav-name">${b.name}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top:40px;padding:20px;background:rgba(0,0,0,0.03);border-radius:12px;">
                        <h3 style="font-size:18px;margin-bottom:8px;">Privacy Report</h3>
                        <p style="color:var(--text-secondary);font-size:14px;">In the last 7 days, Safari prevented <strong>142 trackers</strong> from profiling you.</p>
                    </div>
                </div>
            `;
            pageContent.querySelectorAll('.safari-fav-item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    const input = addrContainer.querySelector('input');
                    input.value = url;
                    renderPage(url);
                });
            });
        }

        function renderPage(url) {
            pageContent.innerHTML = `
                <div style="padding:40px;max-width:700px;margin:0 auto;">
                    <div style="background:linear-gradient(135deg,#1a3a5c,#4a9fd5);border-radius:12px;padding:30px;color:#fff;margin-bottom:20px;">
                        <h2 style="font-size:24px;margin-bottom:8px;">Welcome to ${url.replace('https://','')}</h2>
                        <p style="opacity:0.8;">This is a simulated web page in Safari on macOS Tahoe.</p>
                    </div>
                    <div style="background:rgba(0,0,0,0.03);border-radius:12px;padding:20px;margin-bottom:12px;">
                        <h3 style="margin-bottom:8px;">📰 Featured Article</h3>
                        <p style="color:var(--text-secondary);font-size:14px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    </div>
                    <div style="background:rgba(0,0,0,0.03);border-radius:12px;padding:20px;margin-bottom:12px;">
                        <h3 style="margin-bottom:8px;">🚀 Latest News</h3>
                        <p style="color:var(--text-secondary);font-size:14px;">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    </div>
                    <div style="background:rgba(0,0,0,0.03);border-radius:12px;padding:20px;">
                        <h3 style="margin-bottom:8px;">📊 Popular Stories</h3>
                        <p style="color:var(--text-secondary);font-size:14px;">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                    </div>
                </div>
            `;
        }

        // Handle address bar
        const input = addrContainer.querySelector('input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = input.value.trim();
                if (!val) return;
                if (val.includes('.') && !val.includes(' ')) {
                    const url = val.startsWith('http') ? val : 'https://' + val;
                    renderPage(url);
                } else {
                    renderPage('https://www.google.com/search?q=' + encodeURIComponent(val));
                }
            }
        });

        function showSidebar() {
            if (sidebar.style.display === 'none' || !sidebar.style.display) {
                sidebar.style.display = 'none';
            } else {
                sidebar.style.display = '';
            }
        }

        // Sidebar
        const sidebar = makeSidebar([
            { label: 'Favorites', items: MockData.safariBookmarks.slice(0, 5).map(b => ({
                label: b.name, icon: b.icon, action: () => { input.value = b.url; renderPage(b.url); }
            }))},
        ]);

        content.style.display = 'flex';
        content.appendChild(sidebar);
        sidebar.style.flexShrink = '0';

        // Reorder: sidebar before main
        content.insertBefore(sidebar, main);

        // Init
        if (data && data.url) {
            renderPage(data.url);
        } else {
            renderStartPage();
        }
    },
});

// ============================================================
// NOTES
// ============================================================
OS.registerApp('notes', {
    name: 'Notes',
    icon: Icons.notes,
    dockIcon: Icons.notes,
    windowWidth: 720,
    windowHeight: 500,
    render(content, winState) {
        let activeNote = MockData.notes[0];

        const layout = document.createElement('div');
        layout.className = 'notes-main';

        // Sidebar
        const sidebar = makeSidebar([
            { label: 'iCloud', items: [
                { label: 'All Notes', icon: '📝', count: MockData.notes.length, active: true },
                { label: 'Notes', icon: '📁' },
            ]},
            { label: 'Folders', items: [
                { label: 'Work', icon: '💼' },
                { label: 'Personal', icon: '🏠' },
                { label: 'Ideas', icon: '💡' },
            ]},
        ]);
        layout.appendChild(sidebar);

        // Notes list
        const notesList = document.createElement('div');
        notesList.className = 'notes-list';
        function renderNotesList() {
            notesList.innerHTML = MockData.notes.map((n, i) => `
                <div class="notes-list-item ${n.id === activeNote.id ? 'active' : ''}" data-id="${n.id}">
                    <div class="notes-list-title">${n.title}</div>
                    <div class="notes-list-preview">${n.body.split('\n')[1] || n.body.substring(0, 40) + '...'}</div>
                    <div class="notes-list-date">${n.date}</div>
                </div>
            `).join('');
            notesList.querySelectorAll('.notes-list-item').forEach(el => {
                el.addEventListener('click', () => {
                    activeNote = MockData.notes.find(n => n.id == el.dataset.id);
                    renderNotesList();
                    renderEditor();
                });
            });
        }

        // Editor
        const editor = document.createElement('div');
        editor.className = 'notes-editor';
        function renderEditor() {
            editor.innerHTML = `
                <textarea spellcheck="false">${activeNote.body}</textarea>
            `;
            const ta = editor.querySelector('textarea');
            ta.addEventListener('input', () => {
                activeNote.body = ta.value;
                activeNote.title = ta.value.split('\n')[0] || 'New Note';
                renderNotesList();
            });
        }

        // Toolbar
        const toolbar = makeToolbar([
            { icon: '⊕', action: () => {
                const newNote = { id: Date.now(), title: 'New Note', body: 'New Note\n\n', date: 'Today' };
                MockData.notes.unshift(newNote);
                activeNote = newNote;
                renderNotesList();
                renderEditor();
            }},
            { icon: '🗑', action: () => {
                if (MockData.notes.length > 1) {
                    const idx = MockData.notes.findIndex(n => n.id === activeNote.id);
                    MockData.notes.splice(idx, 1);
                    activeNote = MockData.notes[0];
                    renderNotesList();
                    renderEditor();
                }
            }},
            'divider',
            { icon: '🔍' },
        ]);

        layout.appendChild(notesList);

        const editorCol = document.createElement('div');
        editorCol.style.display = 'flex';
        editorCol.style.flexDirection = 'column';
        editorCol.style.flex = '1';
        editorCol.appendChild(toolbar);
        editorCol.appendChild(editor);
        layout.appendChild(editorCol);

        content.appendChild(layout);
        renderNotesList();
        renderEditor();
    },
});

// ============================================================
// CALCULATOR
// ============================================================
OS.registerApp('calculator', {
    name: 'Calculator',
    icon: Icons.calculator,
    dockIcon: Icons.calculator,
    windowWidth: 280,
    windowHeight: 420,
    minWidth: 240,
    minHeight: 360,
    resizable: false,
    maximizable: false,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'calc-app';
        app.style.height = '100%';

        let display = '0';
        let history = '';
        let prevValue = null;
        let pendingOp = null;
        let shouldReset = false;

        const displayEl = document.createElement('div');
        displayEl.className = 'calc-display';
        displayEl.innerHTML = `<div class="calc-display-history"></div><div class="calc-display-value">0</div>`;
        app.appendChild(displayEl);

        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'calc-buttons';

        const buttons = [
            { label: 'AC', cls: 'fn', action: () => { display = '0'; history = ''; prevValue = null; pendingOp = null; } },
            { label: '±', cls: 'fn', action: () => { display = (parseFloat(display) * -1).toString(); } },
            { label: '%', cls: 'fn', action: () => { display = (parseFloat(display) / 100).toString(); } },
            { label: '÷', cls: 'op', action: () => setOp('÷') },
            { label: '7', action: () => inputDigit('7') },
            { label: '8', action: () => inputDigit('8') },
            { label: '9', action: () => inputDigit('9') },
            { label: '×', cls: 'op', action: () => setOp('×') },
            { label: '4', action: () => inputDigit('4') },
            { label: '5', action: () => inputDigit('5') },
            { label: '6', action: () => inputDigit('6') },
            { label: '−', cls: 'op', action: () => setOp('−') },
            { label: '1', action: () => inputDigit('1') },
            { label: '2', action: () => inputDigit('2') },
            { label: '3', action: () => inputDigit('3') },
            { label: '+', cls: 'op', action: () => setOp('+') },
            { label: '0', cls: 'wide', action: () => inputDigit('0') },
            { label: '.', action: () => inputDigit('.') },
            { label: '=', cls: 'op', action: () => calculate() },
        ];

        buttons.forEach(btn => {
            const el = document.createElement('button');
            el.className = `calc-btn ${btn.cls || ''}`;
            el.textContent = btn.label;
            el.addEventListener('click', () => {
                btn.action();
                updateDisplay();
                // Highlight active op
                buttonsEl.querySelectorAll('.calc-btn.op').forEach(b => b.classList.remove('active'));
                if (pendingOp && btn.label === pendingOp) el.classList.add('active');
            });
            buttonsEl.appendChild(el);
        });

        app.appendChild(buttonsEl);
        content.appendChild(app);

        function inputDigit(d) {
            if (shouldReset) { display = '0'; shouldReset = false; }
            if (d === '.' && display.includes('.')) return;
            if (display === '0' && d !== '.') display = d;
            else display += d;
        }

        function setOp(op) {
            if (pendingOp && !shouldReset) calculate();
            prevValue = parseFloat(display);
            pendingOp = op;
            history = `${prevValue} ${op}`;
            shouldReset = true;
        }

        function calculate() {
            if (!pendingOp || prevValue === null) return;
            const current = parseFloat(display);
            let result;
            switch (pendingOp) {
                case '+': result = prevValue + current; break;
                case '−': result = prevValue - current; break;
                case '×': result = prevValue * current; break;
                case '÷': result = current === 0 ? 'Error' : prevValue / current; break;
            }
            history = `${prevValue} ${pendingOp} ${current} =`;
            display = typeof result === 'number' ? (Math.round(result * 1e10) / 1e10).toString() : result;
            prevValue = null;
            pendingOp = null;
            shouldReset = true;
        }

        function updateDisplay() {
            const histEl = displayEl.querySelector('.calc-display-history');
            const valEl = displayEl.querySelector('.calc-display-value');
            histEl.textContent = history;
            valEl.textContent = display;
            // Adjust font size for long numbers
            if (display.length > 9) {
                valEl.style.fontSize = Math.max(20, 52 - (display.length - 9) * 3) + 'px';
            } else {
                valEl.style.fontSize = '52px';
            }
        }

        updateDisplay();

        // Keyboard support
        const keyHandler = (e) => {
            if (!winState.el.contains(document.activeElement) && document.activeElement.tagName !== 'BODY') return;
            const key = e.key;
            if (/[0-9.]/.test(key)) { inputDigit(key); updateDisplay(); }
            else if (key === '+') { setOp('+'); updateDisplay(); }
            else if (key === '-') { setOp('−'); updateDisplay(); }
            else if (key === '*') { setOp('×'); updateDisplay(); }
            else if (key === '/') { e.preventDefault(); setOp('÷'); updateDisplay(); }
            else if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); updateDisplay(); }
            else if (key === 'Escape') { display = '0'; history = ''; prevValue = null; pendingOp = null; updateDisplay(); }
            else if (key === 'Backspace') { display = display.length > 1 ? display.slice(0, -1) : '0'; updateDisplay(); }
        };
        winState.el.addEventListener('keydown', keyHandler);
        winState.el.tabIndex = -1;
    },
});

// ============================================================
// TERMINAL
// ============================================================
OS.registerApp('terminal', {
    name: 'Terminal',
    icon: Icons.terminal,
    dockIcon: Icons.terminal,
    windowWidth: 680,
    windowHeight: 420,
    minWidth: 400,
    minHeight: 200,
    render(content, winState) {
        const term = document.createElement('div');
        term.className = 'terminal-body';
        content.appendChild(term);
        content.style.background = 'rgba(20,20,25,0.95)';

        const cwd = '~';
        let history = [];
        let historyIdx = -1;

        function addLine(text, cls = '') {
            const line = document.createElement('div');
            line.className = 'terminal-line ' + cls;
            line.innerHTML = text;
            term.appendChild(line);
            term.scrollTop = term.scrollHeight;
        }

        function addPrompt() {
            const line = document.createElement('div');
            line.className = 'terminal-input-line';
            line.innerHTML = `<span class="terminal-prompt">user@mac</span> <span class="terminal-prompt-path">${cwd}</span> <span style="color:#fbbf24">%</span> `;
            const input = document.createElement('input');
            input.className = 'terminal-input';
            input.spellcheck = false;
            input.autocomplete = 'off';
            line.appendChild(input);
            term.appendChild(line);
            input.focus();
            term.scrollTop = term.scrollHeight;

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = input.value;
                    input.disabled = true;
                    if (cmd.trim()) {
                        history.push(cmd);
                        historyIdx = history.length;
                    }
                    processCommand(cmd);
                    addPrompt();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx]; }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx]; }
                    else { historyIdx = history.length; input.value = ''; }
                }
            });
        }

        function processCommand(cmd) {
            const parts = cmd.trim().split(/\s+/);
            const command = parts[0];
            const args = parts.slice(1);

            switch (command) {
                case '':
                    break;
                case 'help':
                    addLine('Available commands:');
                    addLine('  help        Show this help');
                    addLine('  ls          List files');
                    addLine('  pwd         Print working directory');
                    addLine('  whoami      Print current user');
                    addLine('  date        Show current date');
                    addLine('  echo        Print text');
                    addLine('  clear       Clear screen');
                    addLine('  neofetch    System info');
                    addLine('  cowsay      Cow says something');
                    addLine('  open <app>  Open an app');
                    addLine('  uname       System info');
                    addLine('  history     Command history');
                    break;
                case 'ls':
                    addLine('Desktop    Documents  Downloads  Movies  Music  Pictures  Public  Applications');
                    break;
                case 'pwd':
                    addLine('/Users/user');
                    break;
                case 'whoami':
                    addLine('user');
                    break;
                case 'date':
                    addLine(new Date().toString());
                    break;
                case 'echo':
                    addLine(args.join(' '));
                    break;
                case 'clear':
                    term.innerHTML = '';
                    break;
                case 'neofetch':
                    const resW = window.innerWidth;
                    const resH = window.innerHeight;
                    addLine('<span style="color:#4ade80">                    \'\x60\'\'\x60</span>');
                    addLine('<span style="color:#4ade80">                 \x60    \x60</span>');
                    addLine('<span style="color:#4ade80">                  /</span>                    <span style="color:#60a5fa">user@mac</span>');
                    addLine('<span style="color:#4ade80">                 /</span>                     <span style="color:#9ca3af">--------</span>');
                    addLine('<span style="color:#4ade80">                /</span>                      <span style="color:#fbbf24">OS:</span> macOS Tahoe 26');
                    addLine('<span style="color:#4ade80">              \x60</span>                       <span style="color:#fbbf24">Host:</span> MacBook Pro');
                    addLine('<span style="color:#4ade80">     \\x60</span>                          <span style="color:#fbbf24">Kernel:</span> Darwin 26.0.0');
                    addLine('<span style="color:#4ade80">      \\x60</span>                          <span style="color:#fbbf24">Shell:</span> zsh 5.9');
                    addLine('<span style="color:#4ade80">       \\x60</span>                          <span style="color:#fbbf24">DE:</span> Aqua (Liquid Glass)');
                    addLine('<span style="color:#4ade80">        \\x60</span>                         <span style="color:#fbbf24">CPU:</span> Apple M3 Pro');
                    addLine('<span style="color:#4ade80">         \\x60</span>                        <span style="color:#fbbf24">Memory:</span> 18GB');
                    addLine('<span style="color:#4ade80">          \\x60</span>                       <span style="color:#fbbf24">Resolution:</span> ' + resW + 'x' + resH);
                    break;
                case 'cowsay':
                    const msg = args.join(' ') || 'Moo!';
                    const len = msg.length;
                    addLine(' ' + '_'.repeat(len + 2));
                    addLine(`< ${msg} >`);
                    addLine(' ' + '-'.repeat(len + 2));
                    addLine('        \\   ^__^');
                    addLine('         \\  (oo)\\_______');
                    addLine('            (__)\\       )\\/\\');
                    addLine('                ||----w |');
                    addLine('                ||     ||');
                    break;
                case 'open':
                    if (args[0]) {
                        const appMap = {
                            safari: 'safari', finder: 'finder', notes: 'notes', calculator: 'calculator',
                            calendar: 'calendar', terminal: 'terminal', settings: 'settings', mail: 'mail',
                            music: 'music', maps: 'maps', photos: 'photos', weather: 'weather', clock: 'clock',
                            appstore: 'appstore', messages: 'messages', reminders: 'reminders', contacts: 'contacts',
                            podcasts: 'podcasts', phone: 'phone', games: 'games', journal: 'journal',
                            textedit: 'textedit', tv: 'tv', books: 'books', stocks: 'stocks',
                        };
                        const appId = appMap[args[0].toLowerCase()];
                        if (appId) {
                            OS.openWindow(appId);
                            addLine(`Opening ${args[0]}...`);
                        } else {
                            addLine(`open: ${args[0]}: application not found`);
                        }
                    } else {
                        addLine('usage: open <app>');
                    }
                    break;
                case 'uname':
                    addLine(args.includes('-a') ? 'Darwin mac 26.0.0 Darwin Kernel Version 26.0.0 arm64' : 'Darwin');
                    break;
                case 'history':
                    history.forEach((h, i) => addLine(`  ${i + 1}  ${h}`));
                    break;
                case 'cat':
                    addLine(`cat: ${args[0] || ''}: No such file or directory`);
                    break;
                case 'cd':
                    if (!args[0] || args[0] === '~') addLine('');
                    else addLine('');
                    break;
                case 'mkdir':
                    addLine('');
                    break;
                case 'touch':
                    addLine('');
                    break;
                case 'git':
                    if (args[0] === 'status') addLine('On branch main\nnothing to commit, working tree clean');
                    else if (args[0] === 'log') addLine('commit a1b2c3d4 (HEAD -> main)\nAuthor: User <user@mac>\nDate: ' + new Date().toString() + '\n\n    Initial commit');
                    else if (args[0] === '--version') addLine('git version 2.45.0');
                    else addLine(`git: '${args[0] || ''}' is not a git command. See 'git --help'.`);
                    break;
                case 'python3':
                case 'python':
                    if (args[0] === '--version') addLine('Python 3.12.4');
                    else addLine('Python 3.12.4 (interactive mode not available in this demo)');
                    break;
                case 'node':
                    if (args[0] === '--version') addLine('v22.5.0');
                    else addLine('v22.5.0 (interactive mode not available in this demo)');
                    break;
                case 'brew':
                    addLine('Homebrew 4.3.0');
                    break;
                case 'sudo':
                    addLine('We trust you have received the usual lecture from the local System');
                    addLine('Administrator. It usually boils down to these three things:');
                    addLine('    #1) Respect the privacy of others.');
                    addLine('    #2) Think before you type.');
                    addLine('    #3) With great power comes great responsibility.');
                    break;
                default:
                    addLine(`zsh: command not found: ${command}`, 'terminal-error');
            }
        }

        // Welcome message
        addLine('Last login: ' + new Date().toString().split(' ').slice(0, 5).join(' ') + ' on ttys000');
        addLine('Welcome to macOS Tahoe Terminal — zsh 5.9');
        addLine('Type "help" for available commands.\n');
        addPrompt();

        // Click to focus
        term.addEventListener('click', () => {
            const lastInput = term.querySelector('.terminal-input:not([disabled])');
            if (lastInput) lastInput.focus();
        });
    },
});

// ============================================================
// CALENDAR
// ============================================================
OS.registerApp('calendar', {
    name: 'Calendar',
    icon: Icons.calendar,
    dockIcon: Icons.calendar,
    windowWidth: 720,
    windowHeight: 540,
    render(content, winState) {
        const app = document.createElement('div');
        app.style.display = 'flex';
        app.style.flexDirection = 'column';
        app.style.flex = '1';

        let viewDate = new Date();

        const header = document.createElement('div');
        header.className = 'cal-header';

        const toolbar = makeToolbar([
            { group: [{ icon: '◀', action: () => { changeMonth(-1); } }, { icon: '▶', action: () => { changeMonth(1); } }] },
            'divider',
        ]);

        const monthLabel = document.createElement('div');
        monthLabel.className = 'cal-month';
        header.appendChild(toolbar);
        header.appendChild(monthLabel);
        app.appendChild(header);

        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'flex';
        gridContainer.style.flexDirection = 'column';
        gridContainer.style.flex = '1';

        const dayHeader = document.createElement('div');
        dayHeader.style.display = 'grid';
        dayHeader.style.gridTemplateColumns = 'repeat(7, 1fr)';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
            const dh = document.createElement('div');
            dh.className = 'cal-day-header';
            dh.textContent = d;
            dayHeader.appendChild(dh);
        });

        const grid = document.createElement('div');
        grid.className = 'cal-grid';

        gridContainer.appendChild(dayHeader);
        gridContainer.appendChild(grid);
        app.appendChild(gridContainer);
        content.appendChild(app);

        function renderCalendar() {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            monthLabel.textContent = `${months[month]} ${year}`;

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            const today = new Date();

            grid.innerHTML = '';

            // Previous month days
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = document.createElement('div');
                day.className = 'cal-day other-month';
                day.innerHTML = `<div class="cal-day-num">${daysInPrevMonth - i}</div>`;
                grid.appendChild(day);
            }

            // Current month days
            for (let d = 1; d <= daysInMonth; d++) {
                const day = document.createElement('div');
                day.className = 'cal-day';
                if (today.getDate() === d && today.getMonth() === month && today.getFullYear() === year) {
                    day.classList.add('today');
                }
                let html = `<div class="cal-day-num">${d}</div>`;
                const events = MockData.calendarEvents[d];
                if (events) {
                    events.forEach(e => {
                        html += `<div class="cal-event ${e.color || ''}">${e.title}</div>`;
                    });
                }
                day.innerHTML = html;
                day.addEventListener('click', () => {
                    OS.notify({ app: 'Calendar', title: `${months[month]} ${d}`, body: events ? events.map(e => e.title).join(', ') : 'No events', iconChar: '📅' });
                });
                grid.appendChild(day);
            }

            // Next month days
            const totalCells = firstDay + daysInMonth;
            const remaining = (7 - (totalCells % 7)) % 7;
            for (let i = 1; i <= remaining; i++) {
                const day = document.createElement('div');
                day.className = 'cal-day other-month';
                day.innerHTML = `<div class="cal-day-num">${i}</div>`;
                grid.appendChild(day);
            }
        }

        function changeMonth(delta) {
            viewDate.setMonth(viewDate.getMonth() + delta);
            renderCalendar();
        }

        renderCalendar();
    },
});

// ============================================================
// SYSTEM SETTINGS
// ============================================================
OS.registerApp('settings', {
    name: 'System Settings',
    icon: Icons.settings,
    dockIcon: Icons.settings,
    windowWidth: 760,
    windowHeight: 540,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.className = 'settings-main';

        let activePanel = 'general';

        const sidebar = makeSidebar([
            { items: [
                { label: 'Apple Account', icon: '👤' },
            ]},
            { items: [
                { label: 'Wi-Fi', icon: '📶', action: () => showPanel('wifi') },
                { label: 'Bluetooth', icon: '🔵', action: () => showPanel('bluetooth') },
                { label: 'Network', icon: '🌐', action: () => showPanel('network') },
            ]},
            { items: [
                { label: 'General', icon: '⚙️', active: true, action: () => showPanel('general') },
                { label: 'Appearance', icon: '🎨', action: () => showPanel('appearance') },
                { label: 'Accessibility', icon: '♿', action: () => showPanel('accessibility') },
                { label: 'Control Center', icon: '🎛️', action: () => showPanel('controlcenter') },
                { label: 'Siri', icon: '🎙️', action: () => showPanel('siri') },
                { label: 'Spotlight', icon: '🔍', action: () => showPanel('spotlight') },
                { label: 'Privacy & Security', icon: '🔒', action: () => showPanel('privacy') },
            ]},
            { items: [
                { label: 'Desktop & Dock', icon: '🖥️', action: () => showPanel('desktop') },
                { label: 'Displays', icon: '🖥️', action: () => showPanel('displays') },
                { label: 'Wallpaper', icon: '🖼️', action: () => showPanel('wallpaper') },
                { label: 'Screen Saver', icon: '💤', action: () => showPanel('screensaver') },
            ]},
            { items: [
                { label: 'Battery', icon: '🔋', action: () => showPanel('battery') },
                { label: 'Sound', icon: '🔊', action: () => showPanel('sound') },
            ]},
        ]);

        const detail = document.createElement('div');
        detail.className = 'settings-detail';

        layout.appendChild(sidebar);
        layout.appendChild(detail);
        content.appendChild(layout);

        function showPanel(panel) {
            activePanel = panel;
            const panels = {
                general: { title: 'General', rows: [
                    { label: 'About', value: 'MacBook Pro (M3 Pro)' },
                    { label: 'Software Update', value: 'macOS Tahoe 26.0' },
                    { label: 'Storage', value: '248.5 GB available' },
                    { label: 'AirDrop', toggle: true, on: true },
                    { label: 'AirPlay Receiver', toggle: true, on: false },
                    { label: 'Date & Time', value: 'Set automatically' },
                    { label: 'Language & Region', value: 'English (US)' },
                    { label: 'Sharing', value: 'AirDrop, File Sharing' },
                ]},
                appearance: { title: 'Appearance', rows: [
                    { label: 'Dark Mode', toggle: true, on: OS.state.darkMode, action: () => OS.toggleDarkMode() },
                    { label: 'Accent Color', colors: ['#0a84ff', '#bf5af2', '#ff375f', '#ff9f0a', '#ffd60a', '#30d158', '#64d2ff'] },
                    { label: 'Allow wallpaper tinting', toggle: true, on: true },
                    { label: 'Show scroll bars', value: 'When scrolling' },
                ]},
                wifi: { title: 'Wi-Fi', rows: [
                    { label: 'Wi-Fi', toggle: true, on: true },
                    { label: 'Network Name', value: 'Home Network (5GHz)' },
                    { label: 'IP Address', value: '192.168.1.42' },
                    { label: 'Router', value: '192.168.1.1' },
                    { label: 'DNS', value: '192.168.1.1' },
                ]},
                bluetooth: { title: 'Bluetooth', rows: [
                    { label: 'Bluetooth', toggle: true, on: true },
                    { label: 'AirPods Pro', value: 'Connected' },
                    { label: 'Magic Mouse', value: 'Connected' },
                    { label: 'Magic Keyboard', value: 'Connected' },
                ]},
                desktop: { title: 'Desktop & Dock', rows: [
                    { label: 'Automatically arrange Dock', toggle: true, on: false },
                    { label: 'Magnification', toggle: true, on: true },
                    { label: 'Minimize using', value: 'Genie Effect' },
                    { label: 'Show recent apps', toggle: true, on: true },
                ]},
                wallpaper: { title: 'Wallpaper', custom: 'wallpaper' },
                battery: { title: 'Battery', rows: [
                    { label: 'Battery Health', value: 'Normal' },
                    { label: 'Cycle Count', value: '42' },
                    { label: 'Low Power Mode', toggle: true, on: false },
                    { label: 'Optimized Battery Charging', toggle: true, on: true },
                ]},
                sound: { title: 'Sound', rows: [
                    { label: 'Output Volume', slider: 60 },
                    { label: 'Alert Volume', slider: 40 },
                    { label: 'Output Device', value: 'MacBook Pro Speakers' },
                    { label: 'Play sound on startup', toggle: true, on: true },
                ]},
                displays: { title: 'Displays', rows: [
                    { label: 'Built-in Retina Display', value: '3024 × 1964' },
                    { label: 'True Tone', toggle: true, on: true },
                    { label: 'Night Shift', toggle: true, on: false },
                    { label: 'Refresh Rate', value: 'ProMotion (120Hz)' },
                ]},
                spotlight: { title: 'Spotlight', rows: [
                    { label: 'Search Results', toggle: true, on: true },
                    { label: 'Allow Spotlight Suggestions', toggle: true, on: true },
                    { label: 'Quick Keys', value: 'Enabled' },
                    { label: 'Clipboard Manager', toggle: true, on: true },
                ]},
                privacy: { title: 'Privacy & Security', rows: [
                    { label: 'Location Services', toggle: true, on: true },
                    { label: 'Camera', value: '3 apps have access' },
                    { label: 'Microphone', value: '2 apps have access' },
                    { label: 'Full Disk Access', value: '4 apps have access' },
                    { label: 'FileVault', toggle: true, on: true },
                    { label: 'Firewall', toggle: true, on: true },
                ]},
                network: { title: 'Network', rows: [
                    { label: 'Wi-Fi', value: 'Connected' },
                    { label: 'Ethernet', value: 'Not Connected' },
                    { label: 'VPN', toggle: true, on: false },
                    { label: 'Thunderbolt Bridge', value: 'Not Connected' },
                ]},
                siri: { title: 'Siri', rows: [
                    { label: 'Ask Siri', toggle: true, on: true },
                    { label: 'Listen for', value: '"Hey Siri"' },
                    { label: 'Siri Voice', value: 'Voice 2' },
                    { label: 'Siri Suggestions', toggle: true, on: true },
                ]},
                controlcenter: { title: 'Control Center', rows: [
                    { label: 'Show in Menu Bar', toggle: true, on: true },
                    { label: 'Customize Layout', value: 'Default' },
                ]},
                accessibility: { title: 'Accessibility', rows: [
                    { label: 'VoiceOver', toggle: true, on: false },
                    { label: 'Zoom', toggle: true, on: false },
                    { label: 'Display Contrast', value: 'Normal' },
                    { label: 'Reduce Transparency', toggle: true, on: false },
                ]},
                screensaver: { title: 'Screen Saver', rows: [
                    { label: 'Start after', value: '5 minutes' },
                    { label: 'Screen Saver', value: 'Aerial' },
                    { label: 'Show screensaver on all displays', toggle: true, on: false },
                ]},
            };

            const p = panels[panel] || panels.general;

            if (p.custom === 'wallpaper') {
                detail.innerHTML = `
                    <div class="settings-section">
                        <h3>Wallpaper</h3>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                            ${['linear-gradient(135deg,#0a0e27,#1a3a5c,#4a9fd5,#a8e0f0)',
                               'linear-gradient(135deg,#1a0033,#4a0080,#9333ea,#e9d5ff)',
                               'linear-gradient(135deg,#0c4a6e,#0e7490,#22d3ee,#a5f3fc)',
                               'linear-gradient(135deg,#451a03,#9a3412,#f97316,#fed7aa)',
                               'linear-gradient(135deg,#064e3b,#047857,#10b981,#a7f3d0)',
                               'linear-gradient(135deg,#000,#1f2937,#374151,#6b7280)'
                            ].map((g, i) => `<div style="height:80px;border-radius:8px;cursor:pointer;background:${g};border:2px solid ${i===0?'var(--accent)':'transparent'};" onclick="document.getElementById('wallpaper').style.background='${g}'"></div>`).join('')}
                        </div>
                    </div>
                `;
                return;
            }

            let html = `<div class="settings-section"><h3>${p.title}</h3>`;
            p.rows.forEach(row => {
                if (row.toggle !== undefined) {
                    html += `<div class="settings-row"><span class="settings-label">${row.label}</span><div class="toggle ${row.on ? 'on' : ''}" data-setting="${row.label}"></div></div>`;
                } else if (row.slider !== undefined) {
                    html += `<div class="settings-row"><span class="settings-label">${row.label}</span><input type="range" value="${row.slider}" style="width:150px;"></div>`;
                } else if (row.colors) {
                    html += `<div class="settings-row"><span class="settings-label">${row.label}</span><div style="display:flex;gap:8px;">${row.colors.map(c => `<div style="width:20px;height:20px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${c==='#0a84ff'?'#fff':'transparent'};box-shadow:0 0 0 1px rgba(0,0,0,0.1);"></div>`).join('')}</div></div>`;
                } else {
                    html += `<div class="settings-row"><span class="settings-label">${row.label}</span><span style="color:var(--text-secondary);font-size:13px;">${row.value || ''}</span></div>`;
                }
            });
            html += `</div>`;
            detail.innerHTML = html;

            // Wire toggles
            detail.querySelectorAll('.toggle').forEach(t => {
                t.addEventListener('click', function() {
                    this.classList.toggle('on');
                    const setting = this.dataset.setting;
                    if (setting === 'Dark Mode') OS.toggleDarkMode();
                });
            });
        }

        showPanel('general');
    },
});

// ============================================================
// TEXTEDIT
// ============================================================
OS.registerApp('textedit', {
    name: 'TextEdit',
    icon: Icons.textedit,
    dockIcon: Icons.textedit,
    windowWidth: 640,
    windowHeight: 500,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'textedit-main';

        const toolbar = makeToolbar([
            { group: [{ icon: '📁', action: () => OS.notify({ app: 'TextEdit', title: 'Open', body: 'File picker not available in demo', iconChar: '📄' }) },
                      { icon: '💾', action: () => OS.notify({ app: 'TextEdit', title: 'Saved', body: 'Document saved', iconChar: '✅' }) }] },
            'divider',
            { group: [{ icon: '𝐁', action: function(){ this.style.fontWeight = this.style.fontWeight === 'bold' ? 'normal' : 'bold'; } },
                      { icon: '𝐼', action: function(){ this.style.fontStyle = this.style.fontStyle === 'italic' ? 'normal' : 'italic'; } }] },
            'divider',
            { label: 'Aa', action: () => {} },
            { icon: '≣', action: () => {} },
        ]);

        const ta = document.createElement('textarea');
        ta.className = 'textedit-area';
        ta.placeholder = 'Start typing...';
        ta.value = 'Welcome to TextEdit on macOS Tahoe!\n\nThis is a simple text editor. You can:\n• Type and edit text\n• Bold and italic formatting\n• Save your document\n\nEnjoy the Liquid Glass design!\n';

        app.appendChild(toolbar);
        app.appendChild(ta);
        content.appendChild(app);
        setTimeout(() => ta.focus(), 100);
    },
});

// ============================================================
// MAIL
// ============================================================
OS.registerApp('mail', {
    name: 'Mail',
    icon: Icons.mail,
    dockIcon: Icons.mail,
    windowWidth: 820,
    windowHeight: 560,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { label: 'Mailboxes', items: [
                { label: 'All Inboxes', icon: '📥', count: '2' },
                { label: 'Inbox', icon: '✉️', count: '2', active: true },
                { label: 'Sent', icon: '📤' },
                { label: 'Drafts', icon: '📝' },
                { label: 'Junk', icon: '🗑️' },
                { label: 'Trash', icon: '🗑️' },
            ]},
            { label: 'Accounts', items: [
                { label: 'iCloud', icon: '☁️' },
                { label: 'Gmail', icon: '📧' },
            ]},
        ]);

        const listAndDetail = document.createElement('div');
        listAndDetail.style.display = 'flex';
        listAndDetail.style.flex = '1';

        const emailList = document.createElement('div');
        emailList.style.width = '300px';
        emailList.style.borderRight = '0.5px solid rgba(0,0,0,0.06)';
        emailList.style.overflowY = 'auto';

        const emailDetail = document.createElement('div');
        emailDetail.style.flex = '1';
        emailDetail.style.padding = '20px';
        emailDetail.style.overflowY = 'auto';

        function renderEmailList() {
            emailList.innerHTML = MockData.emails.map(e => `
                <div class="email-item ${e.unread ? 'unread' : ''}" data-id="${e.id}" style="padding:12px 16px;border-bottom:0.5px solid rgba(0,0,0,0.04);cursor:pointer;${e.unread ? 'background:rgba(10,132,255,0.05);' : ''}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                        <span style="font-weight:${e.unread ? '700' : '500'};font-size:13px;">${e.from}</span>
                        <span style="font-size:11px;color:var(--text-secondary);">${e.time}</span>
                    </div>
                    <div style="font-size:13px;font-weight:${e.unread ? '600' : '400'};margin-bottom:2px;">${e.subject}</div>
                    <div style="font-size:12px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.preview}</div>
                </div>
            `).join('');
            emailList.querySelectorAll('.email-item').forEach(el => {
                el.addEventListener('click', () => {
                    const email = MockData.emails.find(e => e.id == el.dataset.id);
                    email.unread = false;
                    renderEmailList();
                    renderEmailDetail(email);
                });
            });
        }

        function renderEmailDetail(email) {
            emailDetail.innerHTML = `
                <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">${email.subject}</h2>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:16px;border-bottom:0.5px solid rgba(0,0,0,0.06);">
                    <div style="width:36px;height:36px;border-radius:50%;background:${email.color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">${email.from[0]}</div>
                    <div>
                        <div style="font-weight:600;font-size:14px;">${email.from}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">to: user@mac</div>
                    </div>
                    <div style="margin-left:auto;font-size:12px;color:var(--text-secondary);">${email.time}</div>
                </div>
                <div style="font-size:14px;line-height:1.6;color:var(--text-primary);">
                    ${email.preview}
                    <br><br>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    <br><br>
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                    <br><br>
                    Best regards,<br>${email.from}
                </div>
                <div style="margin-top:24px;display:flex;gap:8px;">
                    <button class="tb-btn" onclick="OS.notify({app:'Mail',title:'Reply',body:'Reply sent!',iconChar:'✉️'})">↩ Reply</button>
                    <button class="tb-btn" onclick="OS.notify({app:'Mail',title:'Reply All',body:'Reply sent!',iconChar:'✉️'})">↩↩ Reply All</button>
                    <button class="tb-btn" onclick="OS.notify({app:'Mail',title:'Forward',body:'Email forwarded!',iconChar:'➡️'})">➡ Forward</button>
                </div>
            `;
        }

        const toolbar = makeToolbar([
            { icon: '✏️', action: () => OS.notify({ app: 'Mail', title: 'New Message', body: 'New email draft created', iconChar: '✉️' }) },
            { icon: '📥' },
            { icon: '📤' },
            'divider',
            { icon: '🔍' },
        ]);

        layout.appendChild(sidebar);

        const mainCol = document.createElement('div');
        mainCol.style.display = 'flex';
        mainCol.style.flexDirection = 'column';
        mainCol.style.flex = '1';
        mainCol.appendChild(toolbar);

        listAndDetail.appendChild(emailList);
        listAndDetail.appendChild(emailDetail);
        mainCol.appendChild(listAndDetail);
        layout.appendChild(mainCol);
        content.appendChild(layout);

        renderEmailList();
        renderEmailDetail(MockData.emails[0]);
    },
});

// ============================================================
// PHOTOS
// ============================================================
OS.registerApp('photos', {
    name: 'Photos',
    icon: Icons.photos,
    dockIcon: Icons.photos,
    windowWidth: 760,
    windowHeight: 540,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { label: 'Photos', items: [
                { label: 'Library', icon: '🖼️', active: true },
                { label: 'Memories', icon: '🎬' },
                { label: 'Favorites', icon: '❤️' },
                { label: 'Recents', icon: '🕐' },
            ]},
            { label: 'Albums', items: [
                { label: 'Vacation 2024', icon: '🏖️' },
                { label: 'Family', icon: '👨‍👩‍👧' },
                { label: 'Screenshots', icon: '📱' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'app-main';

        const colors = [
            ['#fbbf24', '#f97316'], ['#34d399', '#059669'], ['#60a5fa', '#2563eb'],
            ['#f87171', '#dc2626'], ['#a78bfa', '#7c3aed'], ['#fb923c', '#ea580c'],
            ['#22d3ee', '#0891b2'], ['#a3e635', '#65a30d'], ['#e879f9', '#c026d3'],
            ['#fde047', '#ca8a04'], ['#67e8f9', '#0e7490'], ['#fca5a5', '#b91c1c'],
            ['#bef264', '#4d7c0f'], ['#ddd6fe', '#7c3aed'], ['#fecaca', '#991b1b'],
            ['#bfdbfe', '#1e40af'], ['#bbf7d0', '#166534'], ['#fed7aa', '#9a3412'],
        ];

        main.innerHTML = `
            <div class="photos-grid">
                ${colors.map((c, i) => `
                    <div class="photo-item" style="background:linear-gradient(135deg,${c[0]},${c[1]});" data-idx="${i}"></div>
                `).join('')}
            </div>
        `;

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);

        main.querySelectorAll('.photo-item').forEach(p => {
            p.addEventListener('click', () => {
                OS.notify({ app: 'Photos', title: 'Photo', body: `Photo #${parseInt(p.dataset.idx) + 1}`, iconChar: '🖼️' });
            });
        });
    },
});

// ============================================================
// MUSIC
// ============================================================
OS.registerApp('music', {
    name: 'Music',
    icon: Icons.music,
    dockIcon: Icons.music,
    windowWidth: 720,
    windowHeight: 520,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.className = 'music-main';

        const sidebar = makeSidebar([
            { label: 'Apple Music', items: [
                { label: 'Home', icon: '🏠', active: true },
                { label: 'New', icon: '✨' },
                { label: 'Radio', icon: '📻' },
            ]},
            { label: 'Library', items: [
                { label: 'Recently Added', icon: '🕐' },
                { label: 'Artists', icon: '🎤' },
                { label: 'Albums', icon: '💿' },
                { label: 'Songs', icon: '🎵' },
            ]},
            { label: 'Playlists', items: [
                { label: 'Chill Vibes', icon: '🎧' },
                { label: 'Workout', icon: '💪' },
                { label: 'Focus', icon: '🧠' },
            ]},
        ]);

        const player = document.createElement('div');
        player.className = 'music-player';

        let currentTrack = 0;
        let isPlaying = false;

        function renderPlayer() {
            const track = MockData.musicTracks[currentTrack];
            player.innerHTML = `
                <div class="music-art" style="background:linear-gradient(135deg,${track.color1},${track.color2});"></div>
                <div class="music-title">${track.title}</div>
                <div class="music-artist">${track.artist}</div>
                <div class="music-progress"><div class="music-progress-fill"></div></div>
                <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;">0:00 / ${track.duration}</div>
                <div class="music-controls">
                    <button class="music-btn" id="music-prev">⏮</button>
                    <button class="music-btn music-play-btn" id="music-play">${isPlaying ? '⏸' : '▶'}</button>
                    <button class="music-btn" id="music-next">⏭</button>
                </div>
            `;

            player.querySelector('#music-play').addEventListener('click', function() {
                isPlaying = !isPlaying;
                this.textContent = isPlaying ? '⏸' : '▶';
                if (isPlaying) {
                    OS.notify({ app: 'Music', title: track.title, body: track.artist, iconChar: '🎵', duration: 3000 });
                }
            });
            player.querySelector('#music-prev').addEventListener('click', () => {
                currentTrack = (currentTrack - 1 + MockData.musicTracks.length) % MockData.musicTracks.length;
                isPlaying = false;
                renderPlayer();
            });
            player.querySelector('#music-next').addEventListener('click', () => {
                currentTrack = (currentTrack + 1) % MockData.musicTracks.length;
                isPlaying = false;
                renderPlayer();
            });
        }

        // Track list below player
        const trackList = document.createElement('div');
        trackList.style.width = '100%';
        trackList.style.marginTop = '20px';
        trackList.innerHTML = `
            <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Up Next</div>
            ${MockData.musicTracks.map((t, i) => `
                <div class="music-track-item" data-idx="${i}" style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:6px;cursor:pointer;">
                    <div style="width:40px;height:40px;border-radius:6px;background:linear-gradient(135deg,${t.color1},${t.color2});flex-shrink:0;"></div>
                    <div style="flex:1;">
                        <div style="font-size:13px;font-weight:600;">${t.title}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">${t.artist}</div>
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);">${t.duration}</div>
                </div>
            `).join('')}
        `;

        trackList.querySelectorAll('.music-track-item').forEach(item => {
            item.addEventListener('click', () => {
                currentTrack = parseInt(item.dataset.idx);
                isPlaying = true;
                renderPlayer();
            });
            item.addEventListener('mouseenter', () => item.style.background = 'rgba(0,0,0,0.04)');
            item.addEventListener('mouseleave', () => item.style.background = '');
        });

        player.appendChild(trackList);
        layout.appendChild(sidebar);
        layout.appendChild(player);
        content.appendChild(layout);
        renderPlayer();
    },
});

// ============================================================
// MAPS
// ============================================================
OS.registerApp('maps', {
    name: 'Maps',
    icon: Icons.maps,
    dockIcon: Icons.maps,
    windowWidth: 800,
    windowHeight: 560,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'maps-main';

        // Create a faux map with SVG
        app.innerHTML = `
            <div class="maps-search">
                <input type="text" placeholder="Search Maps" value="Cupertino, CA">
            </div>
            <div class="maps-canvas" id="maps-canvas">
                <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style="position:absolute;">
                    <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                    <!-- Roads -->
                    <path d="M 0 150 Q 200 140 400 160 T 800 150" stroke="#fff" stroke-width="8" fill="none" opacity="0.8"/>
                    <path d="M 0 150 Q 200 140 400 160 T 800 150" stroke="#fbbf24" stroke-width="3" fill="none" opacity="0.6"/>
                    <path d="M 150 0 L 160 500" stroke="#fff" stroke-width="6" fill="none" opacity="0.8"/>
                    <path d="M 500 0 L 520 500" stroke="#fff" stroke-width="6" fill="none" opacity="0.8"/>
                    <path d="M 0 300 L 800 320" stroke="#fff" stroke-width="5" fill="none" opacity="0.8"/>
                    <path d="M 300 0 L 310 500" stroke="#fff" stroke-width="4" fill="none" opacity="0.6"/>
                    <!-- Water -->
                    <ellipse cx="600" cy="400" rx="120" ry="60" fill="#a8d8f0" opacity="0.6"/>
                    <!-- Parks -->
                    <rect x="200" y="200" width="80" height="60" rx="8" fill="#c8e6c9" opacity="0.7"/>
                    <rect x="400" y="80" width="60" height="50" rx="8" fill="#c8e6c9" opacity="0.7"/>
                    <!-- Buildings -->
                    <rect x="100" y="100" width="30" height="25" fill="rgba(0,0,0,0.08)" rx="2"/>
                    <rect x="180" y="80" width="25" height="20" fill="rgba(0,0,0,0.08)" rx="2"/>
                    <rect x="350" y="180" width="35" height="30" fill="rgba(0,0,0,0.08)" rx="2"/>
                    <!-- Location pin -->
                    <g transform="translate(400, 250)">
                        <circle cx="0" cy="0" r="20" fill="#0a84ff" opacity="0.2"/>
                        <circle cx="0" cy="0" r="8" fill="#0a84ff"/>
                        <circle cx="0" cy="0" r="4" fill="#fff"/>
                    </g>
                </svg>
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-100%);pointer-events:none;">
                    <div style="width:28px;height:28px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
                </div>
                <div style="position:absolute;top:50%;left:50%;transform:translate(20px,-60px);background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);padding:8px 14px;border-radius:8px;font-size:13px;box-shadow:0 2px 10px rgba(0,0,0,0.1);pointer-events:none;">
                    <div style="font-weight:600;">Apple Park</div>
                    <div style="font-size:11px;color:var(--text-secondary);">Cupertino, CA</div>
                </div>
            </div>
            <div class="maps-controls">
                <button class="maps-zoom-btn">+</button>
                <button class="maps-zoom-btn">−</button>
                <button class="maps-zoom-btn">🧭</button>
            </div>
        `;

        content.appendChild(app);
        content.style.background = '#c5e4f5';
    },
});

// ============================================================
// WEATHER
// ============================================================
OS.registerApp('weather', {
    name: 'Weather',
    icon: Icons.weather,
    dockIcon: Icons.weather,
    windowWidth: 420,
    windowHeight: 580,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'weather-app';
        app.style.background = 'linear-gradient(180deg, #4a90d9 0%, #6bafe0 40%, #8ec5e8 100%)';

        app.innerHTML = `
            <div class="weather-main">
                <div class="weather-location">Cupertino</div>
                <div class="weather-temp-large">68°</div>
                <div class="weather-condition">Sunny</div>
                <div class="weather-hi-lo">H:72° L:58°</div>
            </div>
            <div class="weather-hourly">
                ${MockData.weatherHours.map(h => `
                    <div class="weather-hour">
                        <div class="weather-hour-time">${h.time}</div>
                        <div class="weather-hour-icon">${h.icon}</div>
                        <div class="weather-hour-temp">${h.temp}</div>
                    </div>
                `).join('')}
            </div>
            <div class="weather-daily">
                ${MockData.weatherDays.map(d => `
                    <div class="weather-day-row">
                        <div class="weather-day-name">${d.day}</div>
                        <div class="weather-day-icon">${d.icon}</div>
                        <div class="weather-day-temps">
                            <span class="weather-day-low">${d.low}°</span>
                            <div class="weather-day-bar"><div class="weather-day-bar-fill" style="left:${(d.low-48)*2}%;right:${100-(d.high-48)*2}%;"></div></div>
                            <span class="weather-day-high">${d.high}°</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="padding:16px;color:#fff;">
                <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Air Quality</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:24px;height:24px;border-radius:50%;background:#4ade80;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#065f46;">42</div>
                    <div style="font-size:13px;">Good — Air quality is satisfactory.</div>
                </div>
            </div>
        `;

        content.appendChild(app);
    },
});

// ============================================================
// CLOCK
// ============================================================
OS.registerApp('clock', {
    name: 'Clock',
    icon: Icons.clock,
    dockIcon: Icons.clock,
    windowWidth: 560,
    windowHeight: 420,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'clock-app';

        let activeTab = 'world';

        const tabs = document.createElement('div');
        tabs.className = 'clock-tabs';
        const tabData = [
            { id: 'world', label: 'World Clock' },
            { id: 'alarm', label: 'Alarms' },
            { id: 'stopwatch', label: 'Stopwatch' },
            { id: 'timer', label: 'Timers' },
        ];

        tabs.innerHTML = tabData.map(t => `<div class="clock-tab ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</div>`).join('');
        app.appendChild(tabs);

        const tabContent = document.createElement('div');
        tabContent.style.flex = '1';
        app.appendChild(tabContent);

        function renderTab() {
            if (activeTab === 'world') {
                tabContent.innerHTML = `<div class="clock-world"></div>`;
                const world = tabContent.querySelector('.clock-world');
                MockData.worldClocks.forEach(c => {
                    const now = new Date();
                    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
                    const cityTime = new Date(utc + c.offset * 3600000);
                    const item = document.createElement('div');
                    item.className = 'world-clock-item';
                    item.innerHTML = `
                        <div>
                            <div class="world-clock-city">${c.city}</div>
                            <div class="world-clock-label">${c.label}, ${cityTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="world-clock-time">${cityTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                        </div>
                    `;
                    world.appendChild(item);
                });
            } else if (activeTab === 'alarm') {
                tabContent.innerHTML = `
                    <div class="clock-world">
                        <div class="world-clock-item">
                            <div><div class="world-clock-city">07:00</div><div class="world-clock-label">Weekdays</div></div>
                            <div class="toggle on"></div>
                        </div>
                        <div class="world-clock-item">
                            <div><div class="world-clock-city">08:30</div><div class="world-clock-label">Weekends</div></div>
                            <div class="toggle"></div>
                        </div>
                        <div class="world-clock-item">
                            <div><div class="world-clock-city">22:00</div><div class="world-clock-label">Bedtime</div></div>
                            <div class="toggle on"></div>
                        </div>
                    </div>
                `;
                tabContent.querySelectorAll('.toggle').forEach(t => t.addEventListener('click', () => t.classList.toggle('on')));
            } else if (activeTab === 'stopwatch') {
                tabContent.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;">
                        <div id="sw-display" style="font-size:64px;font-weight:200;font-variant-numeric:tabular-nums;color:var(--text-primary);">00:00.00</div>
                        <div style="display:flex;gap:16px;">
                            <button id="sw-toggle" class="tb-btn" style="background:var(--accent);color:#fff;border:none;border-radius:20px;padding:8px 24px;">Start</button>
                            <button id="sw-reset" class="tb-btn" style="border-radius:20px;padding:8px 24px;">Reset</button>
                        </div>
                    </div>
                `;
                let swInterval = null;
                let swTime = 0;
                let swRunning = false;
                const swDisplay = tabContent.querySelector('#sw-display');
                const swToggle = tabContent.querySelector('#sw-toggle');
                const swReset = tabContent.querySelector('#sw-reset');

                swToggle.addEventListener('click', () => {
                    if (swRunning) {
                        clearInterval(swInterval);
                        swRunning = false;
                        swToggle.textContent = 'Resume';
                    } else {
                        swRunning = true;
                        swToggle.textContent = 'Stop';
                        const start = Date.now() - swTime;
                        swInterval = setInterval(() => {
                            swTime = Date.now() - start;
                            const min = Math.floor(swTime / 60000);
                            const sec = Math.floor((swTime % 60000) / 1000);
                            const ms = Math.floor((swTime % 1000) / 10);
                            swDisplay.textContent = `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
                        }, 10);
                    }
                });
                swReset.addEventListener('click', () => {
                    clearInterval(swInterval);
                    swTime = 0;
                    swRunning = false;
                    swDisplay.textContent = '00:00.00';
                    swToggle.textContent = 'Start';
                });
            } else if (activeTab === 'timer') {
                tabContent.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;">
                        <div id="tm-display" style="font-size:64px;font-weight:200;font-variant-numeric:tabular-nums;color:var(--text-primary);">10:00</div>
                        <div style="display:flex;gap:16px;">
                            <button id="tm-toggle" class="tb-btn" style="background:#34c759;color:#fff;border:none;border-radius:20px;padding:8px 24px;">Start</button>
                            <button id="tm-reset" class="tb-btn" style="border-radius:20px;padding:8px 24px;">Reset</button>
                        </div>
                    </div>
                `;
                let tmInterval = null;
                let tmTime = 600;
                let tmRunning = false;
                const tmDisplay = tabContent.querySelector('#tm-display');
                const tmToggle = tabContent.querySelector('#tm-toggle');
                const tmReset = tabContent.querySelector('#tm-reset');

                tmToggle.addEventListener('click', () => {
                    if (tmRunning) {
                        clearInterval(tmInterval);
                        tmRunning = false;
                        tmToggle.textContent = 'Resume';
                    } else {
                        if (tmTime <= 0) return;
                        tmRunning = true;
                        tmToggle.textContent = 'Pause';
                        tmInterval = setInterval(() => {
                            tmTime--;
                            const min = Math.floor(tmTime / 60);
                            const sec = tmTime % 60;
                            tmDisplay.textContent = `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
                            if (tmTime <= 0) {
                                clearInterval(tmInterval);
                                tmRunning = false;
                                tmToggle.textContent = 'Start';
                                OS.notify({ app: 'Timer', title: 'Timer Complete', body: 'Your timer has finished!', iconChar: '⏰' });
                            }
                        }, 1000);
                    }
                });
                tmReset.addEventListener('click', () => {
                    clearInterval(tmInterval);
                    tmTime = 600;
                    tmRunning = false;
                    tmDisplay.textContent = '10:00';
                    tmToggle.textContent = 'Start';
                });
            }
        }

        tabs.querySelectorAll('.clock-tab').forEach(t => {
            t.addEventListener('click', () => {
                activeTab = t.dataset.tab;
                tabs.querySelectorAll('.clock-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                renderTab();
            });
        });

        content.appendChild(app);
        renderTab();
    },
});

// ============================================================
// MESSAGES
// ============================================================
OS.registerApp('messages', {
    name: 'Messages',
    icon: Icons.messages,
    dockIcon: Icons.messages,
    windowWidth: 720,
    windowHeight: 520,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.className = 'messages-main';

        let activeConvo = MockData.messages[0];

        const list = document.createElement('div');
        list.className = 'messages-list';

        const chat = document.createElement('div');
        chat.className = 'messages-chat';

        function renderList() {
            list.innerHTML = MockData.messages.map(m => `
                <div class="messages-convo ${m.id === activeConvo.id ? 'active' : ''}" data-id="${m.id}">
                    <div class="messages-avatar" style="background:${m.color}">${m.avatar}</div>
                    <div class="messages-convo-info">
                        <div class="messages-convo-name">${m.name}</div>
                        <div class="messages-convo-last">${m.last}</div>
                    </div>
                </div>
            `).join('');
            list.querySelectorAll('.messages-convo').forEach(el => {
                el.addEventListener('click', () => {
                    activeConvo = MockData.messages.find(m => m.id == el.dataset.id);
                    renderList();
                    renderChat();
                });
            });
        }

        function renderChat() {
            chat.innerHTML = `
                <div class="messages-bubbles">
                    ${activeConvo.msgs.map(m => `<div class="msg-bubble ${m.sent ? 'sent' : 'received'}">${m.text}</div>`).join('')}
                </div>
                <div class="messages-input-row">
                    <input type="text" class="messages-input" placeholder="iMessage" autocomplete="off">
                    <button class="messages-send-btn">↑</button>
                </div>
            `;
            chat.querySelector('.messages-send-btn').addEventListener('click', sendMessage);
            const input = chat.querySelector('.messages-input');
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
            setTimeout(() => input.focus(), 50);
        }

        function sendMessage() {
            const input = chat.querySelector('.messages-input');
            const text = input.value.trim();
            if (!text) return;
            activeConvo.msgs.push({ sent: true, text });
            activeConvo.last = text;
            input.value = '';
            renderChat();

            // Auto-reply
            setTimeout(() => {
                const replies = ['Sounds good!', '👍', 'Let me think about it...', 'Sure thing!', 'Haha 😄', 'Talk soon!'];
                const reply = replies[Math.floor(Math.random() * replies.length)];
                activeConvo.msgs.push({ sent: false, text: reply });
                activeConvo.last = reply;
                renderChat();
            }, 1500);
        }

        layout.appendChild(list);
        layout.appendChild(chat);
        content.appendChild(layout);
        renderList();
        renderChat();
    },
});

// ============================================================
// REMINDERS
// ============================================================
OS.registerApp('reminders', {
    name: 'Reminders',
    icon: Icons.reminders,
    dockIcon: Icons.reminders,
    windowWidth: 560,
    windowHeight: 480,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { items: [
                { label: 'Today', icon: '📅', count: '3', active: true },
                { label: 'Scheduled', icon: '🕐' },
                { label: 'All', icon: '📋' },
                { label: 'Flagged', icon: '🚩' },
            ]},
            { label: 'My Lists', items: [
                { label: 'Work', icon: '💼' },
                { label: 'Personal', icon: '🏠' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'reminders-main';

        let activeList = MockData.reminders[0];

        function renderReminders() {
            main.innerHTML = `
                <h3 style="font-size:22px;font-weight:700;margin-bottom:16px;">${activeList.list}</h3>
                <div id="reminder-list">
                    ${activeList.items.map((r, i) => `
                        <div class="reminder-item" data-idx="${i}">
                            <div class="reminder-check ${r.done ? 'done' : ''}"></div>
                            <span class="reminder-text ${r.done ? 'done' : ''}">${r.text}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="reminder-item" id="new-reminder-row" style="margin-top:8px;color:var(--text-secondary);">
                    <div class="reminder-check" style="border-style:dashed;"></div>
                    <input type="text" id="new-reminder-input" placeholder="New Reminder" style="border:none;background:transparent;outline:none;font-size:14px;font-family:inherit;flex:1;color:var(--text-primary);">
                </div>
            `;

            main.querySelectorAll('.reminder-item[data-idx]').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.dataset.idx);
                    activeList.items[idx].done = !activeList.items[idx].done;
                    renderReminders();
                });
            });

            const newInput = main.querySelector('#new-reminder-input');
            newInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && newInput.value.trim()) {
                    activeList.items.push({ text: newInput.value.trim(), done: false });
                    renderReminders();
                }
            });
        }

        // Sidebar actions
        sidebar.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const label = item.querySelector('span:last-child').textContent;
                if (label === 'Today') activeList = MockData.reminders[0];
                else if (label === 'Work') activeList = MockData.reminders[1];
                else if (label === 'Personal') activeList = MockData.reminders[2];
                renderReminders();
            });
        });

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);
        renderReminders();
    },
});

// ============================================================
// CONTACTS
// ============================================================
OS.registerApp('contacts', {
    name: 'Contacts',
    icon: Icons.contacts,
    dockIcon: Icons.contacts,
    windowWidth: 660,
    windowHeight: 480,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.className = 'contacts-main';

        let activeContact = MockData.contacts[0];

        const list = document.createElement('div');
        list.className = 'contacts-list';

        const detail = document.createElement('div');
        detail.className = 'contact-detail';

        function renderList() {
            list.innerHTML = MockData.contacts.map(c => `
                <div class="contact-item ${c.name === activeContact.name ? 'active' : ''}" data-name="${c.name}">
                    <div class="contact-avatar" style="background:${c.color}">${c.name[0]}</div>
                    <span class="contact-name">${c.name}</span>
                </div>
            `).join('');
            list.querySelectorAll('.contact-item').forEach(el => {
                el.addEventListener('click', () => {
                    activeContact = MockData.contacts.find(c => c.name === el.dataset.name);
                    renderList();
                    renderDetail();
                });
            });
        }

        function renderDetail() {
            detail.innerHTML = `
                <div style="text-align:center;margin-bottom:30px;">
                    <div style="width:100px;height:100px;border-radius:50%;background:${activeContact.color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:40px;margin:0 auto 16px;">${activeContact.name[0]}</div>
                    <h2 style="font-size:24px;font-weight:700;">${activeContact.name}</h2>
                </div>
                <div style="max-width:400px;margin:0 auto;">
                    <div class="settings-row" style="background:rgba(255,255,255,0.3);border-radius:8px;margin-bottom:1px;">
                        <span style="color:var(--text-secondary);">📱 Phone</span>
                        <span>${activeContact.phone}</span>
                    </div>
                    <div class="settings-row" style="background:rgba(255,255,255,0.3);border-radius:8px;margin-bottom:1px;">
                        <span style="color:var(--text-secondary);">✉️ Email</span>
                        <span>${activeContact.email}</span>
                    </div>
                    <div class="settings-row" style="background:rgba(255,255,255,0.3);border-radius:8px;margin-bottom:16px;">
                        <span style="color:var(--text-secondary);">🎂 Birthday</span>
                        <span>March 15</span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="tb-btn" style="flex:1;justify-content:center;" onclick="OS.notify({app:'Phone',title:'Calling ${activeContact.name}',body:'${activeContact.phone}',iconChar:'📞'})">📞 Call</button>
                        <button class="tb-btn" style="flex:1;justify-content:center;" onclick="OS.notify({app:'Messages',title:'New Message',body:'To: ${activeContact.name}',iconChar:'💬'})">💬 Message</button>
                        <button class="tb-btn" style="flex:1;justify-content:center;" onclick="OS.openWindow('mail')">✉️ Email</button>
                    </div>
                </div>
            `;
        }

        layout.appendChild(list);
        layout.appendChild(detail);
        content.appendChild(layout);
        renderList();
        renderDetail();
    },
});

// ============================================================
// APP STORE
// ============================================================
OS.registerApp('appstore', {
    name: 'App Store',
    icon: Icons.appstore,
    dockIcon: Icons.appstore,
    windowWidth: 760,
    windowHeight: 540,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { items: [
                { label: 'Discover', icon: '🔍', active: true },
                { label: 'Arcade', icon: '🎮' },
                { label: 'Create', icon: '🎨' },
                { label: 'Work', icon: '💼' },
                { label: 'Play', icon: '🕹️' },
                { label: 'Develop', icon: '⚙️' },
                { label: 'Categories', icon: '📁' },
                { label: 'Updates', icon: '⬆️' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'appstore-main';

        main.innerHTML = `
            <div class="appstore-hero">
                <h2>App of the Day</h2>
                <p style="margin-top:4px;">Pixelmator Pro — Powerful image editing reimagined</p>
                <button class="appstore-get-btn" style="margin-top:12px;background:rgba(255,255,255,0.2);color:#fff;">GET</button>
            </div>
            <div class="appstore-section">
                <h3>Top Free Apps</h3>
                <div class="appstore-list">
                    ${MockData.appStoreApps.map((a, i) => `
                        <div class="appstore-app">
                            <div class="appstore-app-icon" style="background:${a.color}">${a.icon}</div>
                            <div class="appstore-app-info">
                                <div class="appstore-app-name">${a.name}</div>
                                <div class="appstore-app-desc">${a.desc}</div>
                            </div>
                            <button class="appstore-get-btn" data-app="${a.name}">${i % 3 === 0 ? 'GET' : '$' + (i + 0.99).toFixed(2)}</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="appstore-section">
                <h3>Games We Love</h3>
                <div class="appstore-list">
                    ${MockData.games.slice(0, 4).map((g, i) => `
                        <div class="appstore-app">
                            <div class="appstore-app-icon" style="background:${g.color}">${g.name[0]}</div>
                            <div class="appstore-app-info">
                                <div class="appstore-app-name">${g.name}</div>
                                <div class="appstore-app-desc">${g.genre}</div>
                            </div>
                            <button class="appstore-get-btn">${i % 2 === 0 ? 'GET' : '$9.99'}</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        main.querySelectorAll('.appstore-get-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.textContent === 'GET') {
                    this.textContent = '⏬';
                    setTimeout(() => {
                        this.textContent = 'OPEN';
                        OS.notify({ app: 'App Store', title: 'Download Complete', body: this.dataset.app + ' is ready to use', iconChar: '✅' });
                    }, 2000);
                }
            });
        });

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);
    },
});

// ============================================================
// STOCKS
// ============================================================
OS.registerApp('stocks', {
    name: 'Stocks',
    icon: Icons.stocks,
    dockIcon: Icons.stocks,
    windowWidth: 560,
    windowHeight: 480,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flexDirection = 'column';
        layout.style.flex = '1';

        const header = document.createElement('div');
        header.style.padding = '16px 20px';
        header.style.borderBottom = '0.5px solid rgba(0,0,0,0.06)';
        header.innerHTML = `<h3 style="font-size:18px;font-weight:700;">My Symbols</h3>`;
        layout.appendChild(header);

        const list = document.createElement('div');
        list.className = 'stocks-list';

        list.innerHTML = MockData.stocks.map(s => `
            <div class="stock-item">
                <div>
                    <div class="stock-ticker">${s.ticker}</div>
                    <div class="stock-name">${s.name}</div>
                </div>
                <svg class="stock-chart" viewBox="0 0 60 30">
                    <path d="${generateChartPath(s.change >= 0)}" stroke="${s.change >= 0 ? '#34c759' : '#ff3b30'}" stroke-width="1.5" fill="none"/>
                </svg>
                <div class="stock-price">
                    <div class="stock-price-val">${s.price.toFixed(2)}</div>
                    <div class="stock-change ${s.change >= 0 ? 'up' : 'down'}">${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)} (${s.pct >= 0 ? '+' : ''}${s.pct}%)</div>
                </div>
            </div>
        `).join('');

        function generateChartPath(up) {
            let path = 'M 0 15';
            for (let i = 1; i <= 12; i++) {
                const y = up ? 15 - Math.sin(i / 2) * 8 + (i - 6) * -0.5 : 15 + Math.sin(i / 2) * 8 + (i - 6) * 0.5;
                path += ` L ${i * 5} ${y}`;
            }
            return path;
        }

        layout.appendChild(list);
        content.appendChild(layout);
    },
});

// ============================================================
// PODCASTS
// ============================================================
OS.registerApp('podcasts', {
    name: 'Podcasts',
    icon: Icons.podcasts,
    dockIcon: Icons.podcasts,
    windowWidth: 660,
    windowHeight: 500,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { label: 'Listen Now', items: [
                { label: 'Listen Now', icon: '▶️', active: true },
                { label: 'Browse', icon: '🔍' },
                { label: 'Top Charts', icon: '📊' },
            ]},
            { label: 'Library', items: [
                { label: 'Shows', icon: '📻' },
                { label: 'Saved', icon: '💾' },
                { label: 'Downloaded', icon: '⬇️' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'podcasts-main';

        main.innerHTML = `
            <div class="podcast-featured">
                <h3>The Daily</h3>
                <p>From the New York Times — This is what the news should sound like.</p>
                <button class="tb-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:none;margin-top:12px;">▶ Play Latest</button>
            </div>
            <h3 style="padding:0 0 12px;">Top Podcasts</h3>
            <div class="podcast-list">
                ${MockData.podcasts.map(p => `
                    <div class="podcast-card">
                        <div class="podcast-card-art" style="background:linear-gradient(135deg,${p.color},${p.color}aa);"></div>
                        <div class="podcast-card-title">${p.title}</div>
                        <div class="podcast-card-author">${p.author}</div>
                    </div>
                `).join('')}
            </div>
        `;

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);
    },
});

// ============================================================
// TV
// ============================================================
OS.registerApp('tv', {
    name: 'TV',
    icon: Icons.tv,
    dockIcon: Icons.tv,
    windowWidth: 720,
    windowHeight: 520,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { label: 'Apple TV+', items: [
                { label: 'Home', icon: '🏠', active: true },
                { label: 'Movies', icon: '🎬' },
                { label: 'TV Shows', icon: '📺' },
                { label: 'Sports', icon: '⚽' },
                { label: 'Kids', icon: '👶' },
                { label: 'Library', icon: '📚' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'tv-main';

        main.innerHTML = `
            <div class="tv-hero">
                <h2>Severance</h2>
                <p>Season 2 now streaming — The mystery deepens at Lumon Industries.</p>
                <button class="tb-btn" style="background:rgba(255,255,255,0.2);color:#fff;border:none;margin-top:12px;">▶ Watch Now</button>
            </div>
            <h3 style="padding:16px 16px 0;">Up Next</h3>
            <div class="tv-shows-grid">
                ${MockData.tvShows.map(s => `
                    <div class="tv-show-card">
                        <div class="tv-show-art" style="background:linear-gradient(135deg,${s.color},${s.color}88);"></div>
                        <div class="tv-show-title">${s.title}</div>
                    </div>
                `).join('')}
            </div>
        `;

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);
    },
});

// ============================================================
// PHONE
// ============================================================
OS.registerApp('phone', {
    name: 'Phone',
    icon: Icons.phone,
    dockIcon: Icons.phone,
    windowWidth: 360,
    windowHeight: 560,
    resizable: false,
    maximizable: false,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'phone-main';

        const tabs = document.createElement('div');
        tabs.className = 'clock-tabs';
        tabs.innerHTML = `
            <div class="clock-tab active" data-tab="keypad">Keypad</div>
            <div class="clock-tab" data-tab="recents">Recents</div>
            <div class="clock-tab" data-tab="contacts">Contacts</div>
            <div class="clock-tab" data-tab="voicemail">Voicemail</div>
        `;
        app.appendChild(tabs);

        const tabContent = document.createElement('div');
        tabContent.style.flex = '1';
        app.appendChild(tabContent);

        let activeTab = 'keypad';

        function renderTab() {
            if (activeTab === 'keypad') {
                tabContent.innerHTML = `
                    <div class="phone-dialpad">
                        <div class="phone-display" id="phone-num"></div>
                        <div class="phone-keys">
                            ${['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => {
                                const subs = { '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL', '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ', '0': '+', '*': '', '#': '' };
                                return `<button class="phone-key" data-key="${k}">${k}${subs[k] ? `<div class="phone-key-sub">${subs[k]}</div>` : ''}</button>`;
                            }).join('')}
                        </div>
                        <button class="phone-call-btn" id="phone-call">📞</button>
                    </div>
                `;
                let num = '';
                tabContent.querySelectorAll('.phone-key').forEach(k => {
                    k.addEventListener('click', () => {
                        num += k.dataset.key;
                        tabContent.querySelector('#phone-num').textContent = num;
                    });
                });
                tabContent.querySelector('#phone-call').addEventListener('click', () => {
                    if (num) {
                        OS.notify({ app: 'Phone', title: 'Calling...', body: num, iconChar: '📞' });
                    }
                });
            } else if (activeTab === 'recents') {
                tabContent.innerHTML = `
                    <div style="overflow-y:auto;flex:1;padding:12px;">
                        ${MockData.contacts.slice(0, 5).map((c, i) => `
                            <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:0.5px solid rgba(0,0,0,0.06);">
                                <div class="contact-avatar" style="background:${c.color};width:36px;height:36px;font-size:14px;">${c.name[0]}</div>
                                <div style="flex:1;">
                                    <div style="font-size:14px;font-weight:500;">${c.name}</div>
                                    <div style="font-size:12px;color:var(--text-secondary);">${i % 2 ? 'Outgoing' : 'Incoming'} • ${c.phone}</div>
                                </div>
                                <div style="font-size:12px;color:var(--text-secondary);">${i + 1}h ago</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (activeTab === 'contacts') {
                tabContent.innerHTML = `
                    <div style="overflow-y:auto;flex:1;padding:12px;">
                        ${MockData.contacts.map(c => `
                            <div class="contact-item" data-name="${c.name}">
                                <div class="contact-avatar" style="background:${c.color};width:36px;height:36px;font-size:14px;">${c.name[0]}</div>
                                <span class="contact-name">${c.name}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (activeTab === 'voicemail') {
                tabContent.innerHTML = `
                    <div style="overflow-y:auto;flex:1;padding:12px;">
                        <div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:14px;">No voicemail messages</div>
                    </div>
                `;
            }
        }

        tabs.querySelectorAll('.clock-tab').forEach(t => {
            t.addEventListener('click', () => {
                activeTab = t.dataset.tab;
                tabs.querySelectorAll('.clock-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                renderTab();
            });
        });

        content.appendChild(app);
        renderTab();
    },
});

// ============================================================
// GAMES
// ============================================================
OS.registerApp('games', {
    name: 'Games',
    icon: Icons.games,
    dockIcon: Icons.games,
    windowWidth: 720,
    windowHeight: 540,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { items: [
                { label: 'Home', icon: '🏠', active: true },
                { label: 'Library', icon: '📚' },
                { label: 'Friends', icon: '👥' },
                { label: 'Arcade', icon: '🕹️' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'games-main';

        main.innerHTML = `
            <div class="games-hero">
                <h2>Play. Connect. Discover.</h2>
                <p style="margin-top:8px;opacity:0.8;">Your games, all in one place. With Liquid Glass.</p>
            </div>
            <h3 style="padding:16px 16px 0;">Featured Games</h3>
            <div class="games-grid">
                ${MockData.games.map(g => `
                    <div class="game-card">
                        <div class="game-card-art" style="background:linear-gradient(135deg,${g.color},${g.color}88);display:flex;align-items:center;justify-content:center;font-size:48px;">${g.name[0]}</div>
                        <div class="game-card-title">${g.name}</div>
                        <div class="game-card-genre">${g.genre}</div>
                    </div>
                `).join('')}
            </div>
        `;

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);
    },
});

// ============================================================
// JOURNAL
// ============================================================
OS.registerApp('journal', {
    name: 'Journal',
    icon: Icons.journal,
    dockIcon: Icons.journal,
    windowWidth: 660,
    windowHeight: 520,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.className = 'journal-main';

        const sidebar = makeSidebar([
            { items: [
                { label: 'Today', icon: '📅', active: true },
                { label: 'This Week', icon: '🗓️' },
                { label: 'All Entries', icon: '📖' },
            ]},
        ]);

        const editor = document.createElement('div');
        editor.className = 'journal-editor';
        editor.innerHTML = `
            <input type="text" placeholder="Title" value="My Day">
            <textarea spellcheck="false" placeholder="What happened today?">Dear Journal,\n\nToday was a great day! I explored macOS Tahoe with the new Liquid Glass design. Everything feels so fluid and alive.\n\nThe transparent menu bar is beautiful, and the dock with its glass material is stunning. I can't wait to customize it more.\n\nUntil tomorrow!</textarea>
        `;

        layout.appendChild(sidebar);
        layout.appendChild(editor);
        content.appendChild(layout);
        setTimeout(() => editor.querySelector('textarea').focus(), 50);
    },
});

// ============================================================
// BOOKS
// ============================================================
OS.registerApp('books', {
    name: 'Books',
    icon: Icons.books,
    dockIcon: Icons.books,
    windowWidth: 660,
    windowHeight: 500,
    render(content, winState) {
        const layout = document.createElement('div');
        layout.style.display = 'flex';
        layout.style.flex = '1';

        const sidebar = makeSidebar([
            { label: 'Library', items: [
                { label: 'Books', icon: '📚', active: true },
                { label: 'Audiobooks', icon: '🎧' },
                { label: 'PDFs', icon: '📄' },
            ]},
            { label: 'Collections', items: [
                { label: 'Want to Read', icon: '📖' },
                { label: 'Finished', icon: '✅' },
            ]},
        ]);

        const main = document.createElement('div');
        main.className = 'books-main';
        main.innerHTML = `
            <div class="books-grid">
                ${MockData.books.map(b => `
                    <div class="book-card">
                        <div class="book-cover" style="background:linear-gradient(135deg,${b.color},${b.color}cc);display:flex;align-items:center;justify-content:center;padding:8px;text-align:center;">
                            <span style="color:#fff;font-size:11px;font-weight:600;line-height:1.3;">${b.title}</span>
                        </div>
                        <div class="book-title">${b.title}</div>
                        <div class="book-author">${b.author}</div>
                    </div>
                `).join('')}
            </div>
        `;

        layout.appendChild(sidebar);
        layout.appendChild(main);
        content.appendChild(layout);
    },
});

// ============================================================
// FACETIME
// ============================================================
OS.registerApp('facetime', {
    name: 'FaceTime',
    icon: Icons.facetime,
    dockIcon: Icons.facetime,
    windowWidth: 400,
    windowHeight: 480,
    resizable: false,
    maximizable: false,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'facetime-main';
        app.innerHTML = `
            <div class="facetime-video" id="ft-video">
                <div>📹 Camera preview not available in demo</div>
            </div>
            <button class="facetime-btn" id="ft-call">Video Call</button>
            <div style="display:flex;gap:8px;">
                <button class="tb-btn" onclick="OS.notify({app:'FaceTime',title:'Audio Call',body:'Starting audio call...',iconChar:'📞'})">📞 Audio</button>
                <button class="tb-btn" onclick="OS.notify({app:'FaceTime',title:'New FaceTime',body:'Creating link...',iconChar:'🔗'})">🔗 Create Link</button>
            </div>
        `;

        const callBtn = app.querySelector('#ft-call');
        let calling = false;
        callBtn.addEventListener('click', () => {
            calling = !calling;
            callBtn.textContent = calling ? 'End Call' : 'Video Call';
            callBtn.style.background = calling ? '#ef4444' : '#4ade80';
            const video = app.querySelector('#ft-video');
            if (calling) {
                video.innerHTML = '<div style="font-size:40px;">📞</div><div style="margin-top:8px;">Calling...</div>';
                video.style.background = '#1a2e1a';
            } else {
                video.innerHTML = '<div>📹 Camera preview not available in demo</div>';
                video.style.background = '#1a1a1a';
            }
        });

        content.appendChild(app);
    },
});

// ============================================================
// PREVIEW
// ============================================================
OS.registerApp('preview', {
    name: 'Preview',
    icon: Icons.preview,
    dockIcon: Icons.preview,
    windowWidth: 600,
    windowHeight: 500,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'preview-main';
        app.innerHTML = `
            <div style="text-align:center;">
                <div style="width:300px;height:200px;background:linear-gradient(135deg,#4a9fd5,#a8e0f0);border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.2);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:#fff;font-size:18px;font-weight:600;">Document Preview</span>
                </div>
                <div style="display:flex;justify-content:center;gap:8px;">
                    <button class="tb-btn">🔍 Zoom In</button>
                    <button class="tb-btn">🔍 Zoom Out</button>
                    <button class="tb-btn">🔄 Rotate</button>
                    <button class="tb-btn">✂️ Crop</button>
                </div>
            </div>
        `;
        content.appendChild(app);
    },
});

// ============================================================
// ABOUT THIS MAC
// ============================================================
OS.registerApp('aboutmac', {
    name: 'About This Mac',
    dockIcon: '',
    windowWidth: 420,
    windowHeight: 460,
    resizable: false,
    maximizable: false,
    singleton: true,
    render(content, winState) {
        const app = document.createElement('div');
        app.className = 'about-mac';
        app.innerHTML = `
            <div class="about-mac-logo"></div>
            <h2>macOS Tahoe</h2>
            <h3>Version 26.0</h3>
            <div class="about-mac-specs">
                <div class="about-mac-spec-row"><span class="about-mac-spec-label">MacBook Pro</span><span>14-inch, 2024</span></div>
                <div class="about-mac-spec-row"><span class="about-mac-spec-label">Chip</span><span>Apple M3 Pro</span></div>
                <div class="about-mac-spec-row"><span class="about-mac-spec-label">Memory</span><span>18 GB</span></div>
                <div class="about-mac-spec-row"><span class="about-mac-spec-label">Startup disk</span><span>Macintosh HD</span></div>
                <div class="about-mac-spec-row"><span class="about-mac-spec-label">Serial number</span><span>C02XL0TAJGH</span></div>
                <div class="about-mac-spec-row"><span class="about-mac-spec-label">Display</span><span>${window.screen.width} × ${window.screen.height}</span></div>
            </div>
            <div style="margin-top:20px;display:flex;gap:8px;justify-content:center;">
                <button class="tb-btn" onclick="OS.openWindow('settings')">System Settings…</button>
                <button class="tb-btn" onclick="OS.openWindow('appstore')">Software Update…</button>
            </div>
        `;
        content.appendChild(app);
    },
});

// Register About Mac icon
OS.state.apps.aboutmac.icon = '';
