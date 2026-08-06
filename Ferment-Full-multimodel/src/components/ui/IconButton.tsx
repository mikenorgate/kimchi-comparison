import type { MouseEvent, ReactNode } from 'react';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  size?: IconButtonSize;
  label?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * A small square icon-only button used across the macOS shell
 * (toolbars, menu bar status icons, control center tiles, etc.).
 */
export function IconButton({
  children,
  onClick,
  active = false,
  size = 'md',
  label,
  className,
  type = 'button',
}: IconButtonProps): JSX.Element {
  const sizeClass =
    size === 'sm' ? 'icon-button--sm' : size === 'lg' ? 'icon-button--lg' : '';
  const classes = [
    'icon-button',
    sizeClass,
    active ? 'icon-button--active' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
    >
      {children}
    </button>
  );
}

export default IconButton;
