/**
 * SystemIcon
 *
 * Thin wrapper around a Lucide React icon component. Centralizes Tahoe-style
 * sizing tokens and a default stroke width so call sites stay consistent.
 *
 * Props:
 *   - icon (LucideComponent, required): the Lucide icon component to render.
 *   - size ('xs'|'sm'|'md'|'lg'|'xl'|'dock', default 'md'): Tahoe size token.
 *   - className (string): extra Tailwind / utility classes to compose.
 *   - strokeWidth (number, default 1.5): Lucide stroke width.
 *   - ...rest: any additional props are forwarded to the Lucide icon.
 */

const SIZE_TO_PX = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  dock: 48,
};

function SystemIcon({
  icon: IconComponent,
  size = 'md',
  className = '',
  strokeWidth = 1.5,
  ...rest
}) {
  if (!IconComponent) {
    return null;
  }

  const px = SIZE_TO_PX[size] ?? SIZE_TO_PX.md;
  const composedClassName = className ? className.trim() : '';

  return (
    <IconComponent
      size={px}
      strokeWidth={strokeWidth}
      className={composedClassName}
      {...rest}
    />
  );
}

export default SystemIcon;
export { SIZE_TO_PX };
