const icons = {
  search: (
    <>
      <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  close: <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  minus: <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  plus: (
    <>
      <path d="M12 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  chevronRight: <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  folder: (
    <>
      <path d="M3 6C3 4.89543 3.89543 4 5 4H9L11 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  document: (
    <>
      <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.4 15C19.8 14.2 20 13.4 20 12.5C20 11.6 19.8 10.8 19.4 10L21 8.4L19.6 7L18 8.6C17.2 8.2 16.4 8 15.5 8C14.6 8 13.8 8.2 13 8.6L11.4 7L10 8.4L11.6 10C11.2 10.8 11 11.6 11 12.5C11 13.4 11.2 14.2 11.6 15L10 16.6L11.4 18L13 16.4C13.8 16.8 14.6 17 15.5 17C16.4 17 17.2 16.8 18 16.4L19.6 18L21 16.6L19.4 15Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12C5 12 8 8 12 8C16 8 19 12 19 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15C8 15 10 13 12 13C14 13 16 15 16 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </>
  ),
  bluetooth: (
    <path d="M7 7L17 17L12 22V2L17 7L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  battery: <rect x="2" y="6" width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />,
  star: <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  safari: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3L15 12L12 21L9 12L12 3Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15.54 8.46C16.48 9.4 17 10.63 17 12C17 13.37 16.48 14.6 15.54 15.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
}

export function Icon({ name, size = 20, color = 'currentColor', style = {}, ...props }) {
  const content = icons[name]
  if (!content) return null

  return (
    <svg
      data-testid="icon"
      data-icon={name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', color, ...style }}
      {...props}
    >
      {content}
    </svg>
  )
}

export default Icon
