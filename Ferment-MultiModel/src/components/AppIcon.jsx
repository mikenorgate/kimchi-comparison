import {
  Compass,
  MessageCircle,
  Phone,
  Image,
  FileText,
  Calendar,
  Calculator,
  Settings,
  Gamepad2,
  BookOpen,
  Music,
  Mail,
} from 'lucide-react';
import SystemIcon from './SystemIcon.jsx';

/**
 * AppIcon
 *
 * Maps a curated app identifier to a semantically appropriate Lucide icon and
 * renders it via SystemIcon.
 *
 * Props:
 *   - appId (string, required): curated app identifier. Both kebab-case and
 *     PascalCase forms are accepted (e.g. 'safari' or 'Safari'). Documented
 *     canonical form is kebab-case to match URL/route conventions.
 *   - size (string, default 'md'): forwarded to SystemIcon.
 *   - className (string): forwarded to SystemIcon.
 *   - ...rest: forwarded to SystemIcon (and through to the Lucide icon).
 */

const APP_ICON_MAP = {
  safari: Compass,
  messages: MessageCircle,
  phone: Phone,
  photos: Image,
  notes: FileText,
  calendar: Calendar,
  calculator: Calculator,
  settings: Settings,
  games: Gamepad2,
  journal: BookOpen,
  music: Music,
  mail: Mail,
  // PascalCase aliases for ergonomics
  Safari: Compass,
  Messages: MessageCircle,
  Phone: Phone,
  Photos: Image,
  Notes: FileText,
  Calendar: Calendar,
  Calculator: Calculator,
  Settings: Settings,
  Games: Gamepad2,
  Journal: BookOpen,
  Music: Music,
  Mail: Mail,
};

export const CURATED_APP_IDS = Object.freeze([
  'safari',
  'messages',
  'phone',
  'photos',
  'notes',
  'calendar',
  'calculator',
  'settings',
  'games',
  'journal',
  'music',
  'mail',
]);

function AppIcon({ appId, size = 'md', className, ...rest }) {
  if (!appId) {
    return null;
  }

  const IconComponent = APP_ICON_MAP[appId];
  if (!IconComponent) {
    return null;
  }

  return (
    <SystemIcon
      icon={IconComponent}
      size={size}
      className={className}
      {...rest}
    />
  );
}

export default AppIcon;
