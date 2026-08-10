/** Format a time for the menu-bar clock, e.g. "Fri 9:14 AM". */
export function menubarClock(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  const mm = m < 10 ? `0${m}` : `${m}`
  return `${days[date.getDay()]} ${h}:${mm} ${ampm}`
}
