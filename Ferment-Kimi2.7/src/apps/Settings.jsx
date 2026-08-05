export function Settings() {
  return (
    <div data-testid="settings-app" style={{ padding: 'var(--space-lg)' }}>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)' }}>System Settings</div>
      {['Wi-Fi', 'Bluetooth', 'Display', 'Sound', 'Notifications'].map((setting) => (
        <div key={setting} data-testid={`settings-item-${setting.toLowerCase()}`} style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
          {setting}
        </div>
      ))}
    </div>
  )
}

export default Settings
