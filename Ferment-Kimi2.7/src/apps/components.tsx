function AppPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-tahoe-label">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-sm opacity-70">{subtitle}</p>
    </div>
  )
}

export function FinderApp() {
  return (
    <AppPlaceholder
      title="Finder"
      subtitle="Browse files and folders (mock)"
    />
  )
}

export function SafariApp() {
  return (
    <AppPlaceholder
      title="Safari"
      subtitle="The web browser (mock)"
    />
  )
}

export function NotesApp() {
  return (
    <AppPlaceholder
      title="Notes"
      subtitle="Capture thoughts and ideas (mock)"
    />
  )
}

export function SystemSettingsApp() {
  return (
    <AppPlaceholder
      title="System Settings"
      subtitle="Configure your Mac (mock)"
    />
  )
}

export function CalendarApp() {
  return (
    <AppPlaceholder
      title="Calendar"
      subtitle="Your schedule at a glance (mock)"
    />
  )
}

export function PhotosApp() {
  return (
    <AppPlaceholder
      title="Photos"
      subtitle="Browse your photo library (mock)"
    />
  )
}

export function PhoneApp() {
  return (
    <AppPlaceholder
      title="Phone"
      subtitle="Make and receive calls (mock)"
    />
  )
}

export function JournalApp() {
  return (
    <AppPlaceholder
      title="Journal"
      subtitle="Reflect on your day (mock)"
    />
  )
}
