function hexToRgba(hex, alpha) {
  let sanitized = hex.replace('#', '');
  if (sanitized.length === 3) {
    sanitized = sanitized.split('').map((c) => c + c).join('');
  }
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function iconSvg(face, color, glyphColor) {
  switch (face) {
    case 'finder':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 6v12M8 8c1.5 3 1.5 5 0 8M16 8c-1.5 3-1.5 5 0 8" stroke={glyphColor} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'compass':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2M15 9l-4 7-1-4-4-1 7-4z" fill={glyphColor} stroke="none" />
        </g>
      );
    case 'envelope':
      return (
        <g>
          <rect x="3" y="6" width="18" height="12" rx="2" fill={color} />
          <path d="M3 8l9 5 9-5" stroke={glyphColor} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'map':
      return (
        <g>
          <path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2V6z" fill={color} />
          <circle cx="12" cy="10" r="2" fill={glyphColor} />
        </g>
      );
    case 'photos':
      return (
        <g>
          <rect x="3" y="5" width="18" height="14" rx="2" fill={color} />
          <circle cx="9" cy="10" r="2" fill={glyphColor} />
          <path d="M4 17l5-6 4 4 4-4 3 4v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1z" fill={glyphColor} />
        </g>
      );
    case 'calendar':
      return (
        <g>
          <rect x="4" y="5" width="16" height="15" rx="2" fill={color} />
          <path d="M4 9h16M8 3v4M16 3v4" stroke={glyphColor} strokeWidth="1.5" fill="none" />
          <text x="12" y="18" textAnchor="middle" fontSize="9" fill={glyphColor} fontWeight="600">{new Date().getDate()}</text>
        </g>
      );
    case 'note':
      return (
        <g>
          <rect x="5" y="3" width="14" height="18" rx="2" fill={color} />
          <path d="M8 8h8M8 12h8M8 16h5" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'gear':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 8v8M8 12h8M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'calculator':
      return (
        <g>
          <rect x="4" y="4" width="16" height="16" rx="3" fill={color} />
          <path d="M7 7h10M7 11h10M7 15h4M7 18h4M13 15h4M13 18h4" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'terminal':
      return (
        <g>
          <rect x="4" y="5" width="16" height="14" rx="2" fill={color} />
          <path d="M7 9l3 3-3 3M11 15h6" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'chat':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M8 10h8M8 14h5" stroke={glyphColor} strokeWidth="1.8" />
        </g>
      );
    case 'person':
      return (
        <g>
          <circle cx="12" cy="8" r="4" fill={color} />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill={color} />
        </g>
      );
    case 'check':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M8 12l3 3 5-6" stroke={glyphColor} strokeWidth="2" fill="none" />
        </g>
      );
    case 'music':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M9 16V9l7-2v6M9 12l7-2" stroke={glyphColor} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'tv':
      return (
        <g>
          <rect x="5" y="6" width="14" height="10" rx="2" fill={color} />
          <path d="M9 16l-2 4M15 16l2 4" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'bag':
      return (
        <g>
          <path d="M6 7h12l1 13H5L6 7z" fill={color} />
          <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke={glyphColor} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'video':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M9 8l8 4-8 4V8z" fill={glyphColor} />
        </g>
      );
    case 'newspaper':
      return (
        <g>
          <rect x="5" y="4" width="14" height="16" rx="1" fill={color} />
          <path d="M8 8h8M8 12h8M8 16h5" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'chart':
      return (
        <g>
          <rect x="4" y="4" width="16" height="16" rx="3" fill={color} />
          <path d="M7 14l3-4 3 2 4-6" stroke={glyphColor} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'book':
      return (
        <g>
          <path d="M5 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill={color} />
          <path d="M5 4v14" stroke={glyphColor} strokeWidth="1" />
        </g>
      );
    case 'home':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M7 12l5-5 5 5M9 11v6h6v-6" stroke={glyphColor} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'cloud':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M8 15a3 3 0 1 1 .3-5.98 4 4 0 1 1 7.4 0A3 3 0 1 1 16 15H8z" fill={glyphColor} />
        </g>
      );
    case 'clock':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 7v5l3 3" stroke={glyphColor} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'wallet':
      return (
        <g>
          <rect x="4" y="6" width="16" height="12" rx="2" fill={color} />
          <circle cx="15" cy="12" r="2" fill={glyphColor} />
        </g>
      );
    case 'radar':
      return (
        <g>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 6v2M12 16v2M6 12h2M16 12h2M9 9l1.4 1.4M14.6 13.6L16 15" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'phone':
      return (
        <g>
          <rect x="7" y="3" width="10" height="18" rx="2" fill={color} />
          <path d="M11 16h2" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'journal':
      return (
        <g>
          <rect x="6" y="4" width="12" height="16" rx="2" fill={color} />
          <path d="M9 4v16" stroke={glyphColor} strokeWidth="1" />
        </g>
      );
    case 'gamepad':
      return (
        <g>
          <rect x="4" y="8" width="16" height="8" rx="4" fill={color} />
          <path d="M7 12h2M8 11v2M14 12h4" stroke={glyphColor} strokeWidth="1.5" />
        </g>
      );
    case 'trash':
      return (
        <g>
          <path d="M6 7h12M9 7V5h6v2M10 10v8M14 10v8" stroke={glyphColor} strokeWidth="1.8" fill="none" />
        </g>
      );
    case 'rocket':
      return (
        <g>
          <path d="M12 2c2 4 3 8 2 11s-3 5-3 5-2-2-3-5 0-7 2-11c1-1 1-1 2 0z" fill={color} />
          <circle cx="12" cy="8" r="1.5" fill={glyphColor} />
          <path d="M7 18c-1 1-2 3-2 3s2-1 3-2M17 18c1 1 2 3 2 3s-2-1-3-2" stroke={color} strokeWidth="1" />
        </g>
      );
    default:
      return <circle cx="12" cy="12" r="10" fill={color} />;
  }
}

export default function AppIcon({ app, size = 48, className = '', variant = 'default' }) {
  const color = app?.color || '#8E8E93';
  const face = app?.iconFace || 'default';

  const variants = {
    default: { bg: color, glyph: '#fff', shadow: '0 6px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)' },
    light: { bg: 'rgba(255,255,255,0.95)', glyph: color, shadow: '0 4px 10px rgba(0,0,0,0.12)' },
    dark: { bg: 'rgba(28,28,30,0.95)', glyph: '#fff', shadow: '0 4px 10px rgba(0,0,0,0.25)' },
    clear: { bg: 'transparent', glyph: color, shadow: 'none' },
    tinted: { bg: hexToRgba(color, 0.35), glyph: '#fff', shadow: '0 4px 10px rgba(0,0,0,0.12)' },
    dock: { bg: color, glyph: '#fff', shadow: '0 4px 10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)' },
  };

  const style = variants[variant] || variants.default;
  const isDock = variant === 'dock';

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: isDock ? 12 : 14,
    background: style.bg,
    color: style.glyph,
    boxShadow: style.shadow,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 120ms ease, background 120ms ease',
  };

  return (
    <div
      className={`app-icon app-icon--${variant} ${className}`}
      style={baseStyle}
      title={app?.name}
      data-testid="app-icon"
      data-variant={variant}
    >
      <svg viewBox="0 0 24 24" width={size - 6} height={size - 6}>
        {iconSvg(face, color, style.glyph)}
      </svg>
    </div>
  );
}
