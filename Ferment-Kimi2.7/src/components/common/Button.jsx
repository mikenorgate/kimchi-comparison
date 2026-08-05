const variants = {
  default: {
    background: 'var(--color-button-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  primary: {
    background: 'var(--color-button-primary-bg)',
    color: 'var(--color-accent-text)',
    border: '1px solid transparent',
  },
  ghost: {
    background: 'transparent',
    color: 'inherit',
    border: '1px solid transparent',
  },
}

const sizes = {
  sm: { padding: '2px 8px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-sm)' },
  md: { padding: '4px 12px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' },
  lg: { padding: '6px 16px', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-md)' },
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const variantStyles = variants[variant] || variants.default
  const sizeStyles = sizes[size] || sizes.md

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-sm)',
        fontFamily: 'var(--font-system)',
        fontWeight: 'var(--font-weight-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: `background var(--transition-fast), transform var(--transition-fast)`,
        boxShadow: 'var(--shadow-button)',
        ...variantStyles,
        ...sizeStyles,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
