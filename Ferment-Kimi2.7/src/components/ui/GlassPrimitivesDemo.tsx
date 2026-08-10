import { GlassPanel, GlassButton, GlassSidebar, GlassToolbar, GlassPopover } from './index'

export function GlassPrimitivesDemo() {
  return (
    <div className="p-8 flex gap-6 flex-wrap items-start">
      <GlassPanel className="p-4 w-64">
        <h3 className="font-semibold mb-2">GlassPanel</h3>
        <p className="text-sm opacity-80">Default liquid glass surface.</p>
      </GlassPanel>

      <GlassPanel variant="strong" className="p-4 w-64">
        <h3 className="font-semibold mb-2">GlassPanel Strong</h3>
        <p className="text-sm opacity-80">Stronger blur for sidebars and popovers.</p>
      </GlassPanel>

      <div className="flex flex-col gap-3">
        <GlassToolbar>
          <GlassButton size="sm">Toolbar</GlassButton>
          <GlassButton size="sm" variant="primary">
            Primary
          </GlassButton>
          <GlassButton size="sm" variant="ghost">
            Ghost
          </GlassButton>
        </GlassToolbar>
        <div className="flex gap-2">
          <GlassButton>Default</GlassButton>
          <GlassButton variant="primary">Primary</GlassButton>
          <GlassButton variant="ghost">Ghost</GlassButton>
        </div>
      </div>

      <GlassSidebar width={160} className="h-48 p-3">
        <span className="text-sm font-medium">Sidebar</span>
      </GlassSidebar>

      <GlassPopover className="w-56">
        <p className="text-sm">Popover content with a glass arrow.</p>
      </GlassPopover>
    </div>
  )
}
