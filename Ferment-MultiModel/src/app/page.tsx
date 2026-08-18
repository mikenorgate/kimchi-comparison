import Desktop from "@/components/desktop/Desktop";

/**
 * Root route entry point. The full desktop shell (wallpaper, Menu Bar,
 * Dock, and shared shell state) lives in `<Desktop />`; this file is a
 * thin wrapper so Next.js's `app/` router has a `page.tsx` to mount at
 * `/`.
 */
export default function DesktopShell(): JSX.Element {
  return <Desktop />;
}
