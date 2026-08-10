export interface MailMessage { id: string; from: string; subject: string; preview: string; body: string; time: string; unread: boolean }
export const MAIL_MESSAGES: MailMessage[] = [
  { id: 'm1', from: 'GitHub', subject: 'Your weekly digest', preview: 'See what the community built this week...', body: 'Hi there,\n\nHere is your weekly digest of activity across repositories you follow.\n\nTop trending repos:\n- A new Rust web framework hit 10k stars\n- An LLM-powered CLI tool\n- A pixel-art editor in 1KB\n\nHappy coding,\nThe GitHub Team', time: '9:41 AM', unread: true },
  { id: 'm2', from: 'Alex Chen', subject: 'Re: Lunch tomorrow?', preview: 'Sounds great! See you at noon.', body: 'Sounds great!\n\nSee you at noon at the usual spot. I will bring the slides.\n\n- Alex', time: '8:15 AM', unread: true },
  { id: 'm3', from: 'Apple', subject: 'Your receipt from Apple', preview: 'Order confirmation for your recent purchase.', body: 'Thank you for your purchase.\n\nOrder summary:\n- iCloud+ 200GB\n- $2.99/month\n\nYour subscription renews next month.', time: 'Yesterday', unread: false },
  { id: 'm4', from: 'Team List', subject: 'Sprint planning notes', preview: 'Recap of our planning session...', body: 'Team,\n\nRecap of sprint planning:\n- Ship the new onboarding flow\n- Fix top 10 bugs\n- Design review Thursday\n\nAction items assigned in the tracker.', time: 'Yesterday', unread: false },
  { id: 'm5', from: 'Newsletter', subject: 'This week in tech', preview: 'The biggest stories of the week.', body: 'Your weekly roundup:\n\n1. A new OS released with a focus on translucency\n2. Open-source LLM benchmarks improved\n3. The web platform added new CSS features\n\nRead more on the blog.', time: 'Mon', unread: false },
]

export interface CalEvent { id: string; day: number; title: string; time: string; color: string }
export const CALENDAR_EVENTS: CalEvent[] = [
  { id: 'e1', day: 3, title: 'Design Review', time: '10:00', color: '#ff453a' },
  { id: 'e2', day: 3, title: 'Lunch w/ Alex', time: '12:00', color: '#ff9f0a' },
  { id: 'e3', day: 7, title: 'Sprint Demo', time: '14:00', color: '#0a84ff' },
  { id: 'e4', day: 10, title: '1:1 with Sam', time: '11:00', color: '#30d158' },
  { id: 'e5', day: 12, title: 'Team Happy Hour', time: '17:00', color: '#bf5af2' },
  { id: 'e6', day: 15, title: 'Product Launch', time: '09:00', color: '#ff375f' },
  { id: 'e7', day: 18, title: 'Doctor Appt', time: '15:30', color: '#ff9f0a' },
  { id: 'e8', day: 21, title: 'Conference', time: 'All day', color: '#0a84ff' },
  { id: 'e9', day: 24, title: 'Birthday Party', time: '19:00', color: '#bf5af2' },
  { id: 'e10', day: 28, title: 'Quarterly Review', time: '13:00', color: '#30d158' },
]

export interface MessageThread { id: string; name: string; avatar: string; lastMessage: string; time: string; messages: { id: string; fromMe: boolean; text: string; time: string }[] }
export const MESSAGE_THREADS: MessageThread[] = [
  { id: 't1', name: 'Alex Chen', avatar: '🧑', lastMessage: 'See you at 3! 🎉', time: '2m', messages: [
    { id: 'msg1', fromMe: false, text: 'Hey, are we still on for lunch?', time: '9:30 AM' },
    { id: 'msg2', fromMe: true, text: 'Yes! Noon at the usual spot.', time: '9:32 AM' },
    { id: 'msg3', fromMe: false, text: 'I will bring the slides.', time: '9:33 AM' },
    { id: 'msg4', fromMe: true, text: 'Sounds great — see you then!', time: '9:34 AM' },
    { id: 'msg5', fromMe: false, text: 'See you at 3! 🎉', time: '9:38 AM' },
  ]},
  { id: 't2', name: 'Mom', avatar: '👩', lastMessage: 'Call me when you can ❤', time: '1h', messages: [
    { id: 'msg1', fromMe: false, text: 'Hi sweetie, how is your week?', time: '8:00 AM' },
    { id: 'msg2', fromMe: true, text: 'Good! Busy with a project launch.', time: '8:10 AM' },
    { id: 'msg3', fromMe: false, text: 'Call me when you can ❤', time: '8:12 AM' },
  ]},
  { id: 't3', name: 'Design Team', avatar: '👥', lastMessage: 'Sam: Pushed the new mockups', time: '3h', messages: [
    { id: 'msg1', fromMe: false, text: 'Morning team! Standup in 10.', time: '9:50 AM' },
    { id: 'msg2', fromMe: true, text: 'Be right there.', time: '9:51 AM' },
    { id: 'msg3', fromMe: false, text: 'Sam: Pushed the new mockups', time: '10:15 AM' },
  ]},
  { id: 't4', name: 'Jordan', avatar: '🧑‍🦱', lastMessage: 'Thanks for the help!', time: 'Yesterday', messages: [
    { id: 'msg1', fromMe: false, text: 'Got a sec to review my PR?', time: '4:00 PM' },
    { id: 'msg2', fromMe: true, text: 'Sure, send the link.', time: '4:02 PM' },
    { id: 'msg3', fromMe: false, text: 'Thanks for the help!', time: '5:30 PM' },
  ]},
]
