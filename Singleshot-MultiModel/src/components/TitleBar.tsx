import { Minus, Square, X } from 'lucide-react';

export interface TitleBarProps {
  title: string;
  isMaximized: boolean;
  windowId?: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * macOS-style title bar with traffic lights. The whole bar is a drag handle;
 * traffic-light buttons stop propagation so they aren't treated as drags.
 */
export default function TitleBar({
  title,
  isMaximized,
  windowId,
  onClose,
  onMinimize,
  onMaximize,
  onPointerDown,
}: TitleBarProps) {
  const barTestId = windowId ? `titlebar-${windowId}` : 'title-bar';
  const closeTestId = windowId ? `close-${windowId}` : 'title-bar-close';
  const minimizeTestId = windowId ? `minimize-${windowId}` : 'title-bar-minimize';
  const maximizeTestId = windowId ? `maximize-${windowId}` : 'title-bar-maximize';

  const stop = (handler: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  return (
    <div
      data-testid={barTestId}
      onPointerDown={onPointerDown}
      className="relative flex h-7 shrink-0 cursor-default select-none items-center bg-gradient-to-b from-gray-200/95 to-gray-300/95 px-3"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Close"
          data-testid={closeTestId}
          onClick={stop(onClose)}
          onPointerDown={(e) => e.stopPropagation()}
          className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] ring-1 ring-black/10 hover:brightness-110"
        >
          <X className="h-2 w-2 text-[#7a2018] opacity-0 group-hover:opacity-100" />
        </button>
        <button
          type="button"
          aria-label="Minimize"
          data-testid={minimizeTestId}
          onClick={stop(onMinimize)}
          onPointerDown={(e) => e.stopPropagation()}
          className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] ring-1 ring-black/10 hover:brightness-110"
        >
          <Minus className="h-2 w-2 text-[#7a4a05] opacity-0 group-hover:opacity-100" />
        </button>
        <button
          type="button"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          data-testid={maximizeTestId}
          onClick={stop(onMaximize)}
          onPointerDown={(e) => e.stopPropagation()}
          className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] ring-1 ring-black/10 hover:brightness-110"
        >
          <Square className="h-2 w-2 text-[#0d5e1a] opacity-0 group-hover:opacity-100" />
        </button>
      </div>
      <div
        data-testid={windowId ? `title-${windowId}` : 'title-bar-title'}
        className="pointer-events-none absolute inset-x-0 mx-auto max-w-[60%] text-center text-[11px] font-medium text-gray-700"
      >
        {title}
      </div>
    </div>
  );
}
