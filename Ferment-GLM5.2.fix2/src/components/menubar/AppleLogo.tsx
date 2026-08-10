/** Apple logo glyph (filled). Sits in the menu bar's leftmost position. */
export function AppleLogo({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.6 7.4c0-1.3.7-2 1.7-2.5-.6-.8-1.4-1.1-2-1.2-.8-.1-1.6.4-2 .4-.4 0-1-.4-1.7-.4-.9 0-1.7.5-2.1 1.3-.9 1.5-.2 3.8.6 5 .5.6 1 1.3 1.7 1.3.7 0 .9-.4 1.7-.4.8 0 1 .4 1.7.4.7 0 1.2-.6 1.6-1.2.5-.7.7-1.4.7-1.4s-1.4-.5-1.4-1.9zM10.3 2.9c.3-.4.5-.9.5-1.5-.5 0-1.1.4-1.5.9-.3.4-.6.9-.6 1.4.6.1 1.2-.3 1.6-.8z" />
    </svg>
  )
}
