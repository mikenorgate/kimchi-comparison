import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const WindowContext = createContext(null);

const DEFAULT_WIDTH = 760;
const DEFAULT_HEIGHT = 500;
const MIN_WIDTH = 240;
const MIN_HEIGHT = 160;

function centerPosition(width, height) {
  const x = Math.max(40, (window.innerWidth - width) / 2 - 80);
  const y = Math.max(60, (window.innerHeight - height) / 2 - 40);
  return { x, y };
}

export function WindowProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const focusWindow = useCallback((id) => {
    setActiveId(id);
    setWindows((prev) => {
      const target = prev.find((w) => w.id === id);
      if (!target) return prev;
      const nextZ = Math.max(0, ...prev.map((w) => w.zIndex)) + 1;
      return prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ, minimized: false } : w));
    });
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  }, []);

  const maximizeWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) return w;
        return {
          ...w,
          maximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 30,
          width: window.innerWidth,
          height: window.innerHeight - 30,
        };
      })
    );
    focusWindow(id);
  }, [focusWindow]);

  const restoreWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (!w.maximized) return w;
        const bounds = w.prevBounds || centerPosition(DEFAULT_WIDTH, DEFAULT_HEIGHT);
        return {
          ...w,
          maximized: false,
          minimized: false,
          ...bounds,
        };
      })
    );
    focusWindow(id);
  }, [focusWindow]);

  const toggleMinimize = useCallback((id) => {
    const w = windows.find((win) => win.id === id);
    if (!w) return;
    if (w.minimized) {
      focusWindow(id);
    } else {
      minimizeWindow(id);
    }
  }, [windows, focusWindow, minimizeWindow]);

  const toggleMaximize = useCallback((id) => {
    const w = windows.find((win) => win.id === id);
    if (!w) return;
    if (w.maximized) {
      restoreWindow(id);
    } else {
      maximizeWindow(id);
    }
  }, [windows, maximizeWindow, restoreWindow]);

  const updateWindow = useCallback((id, updates) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const openWindow = useCallback((appId) => {
    let existingId = null;
    let newId = null;

    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId && !w.closed);
      if (existing) {
        existingId = existing.id;
        return prev.map((w) =>
          w.id === existing.id ? { ...w, minimized: false } : w
        );
      }
      const { x, y } = centerPosition(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      const id = `${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const nextZ = Math.max(0, ...prev.map((w) => w.zIndex)) + 1;
      newId = id;
      const newWindow = {
        id,
        appId,
        x: x + prev.length * 20,
        y: y + prev.length * 20,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        zIndex: nextZ,
        minimized: false,
        maximized: false,
        prevBounds: null,
      };
      return [...prev, newWindow];
    });

    if (newId) {
      setActiveId(newId);
    } else if (existingId) {
      focusWindow(existingId);
    }
  }, [focusWindow]);

  const activeWindow = useMemo(
    () => windows.find((w) => w.id === activeId) || null,
    [windows, activeId]
  );

  const value = useMemo(
    () => ({
      windows,
      activeId,
      activeWindow,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      toggleMinimize,
      toggleMaximize,
      updateWindow,
    }),
    [
      windows,
      activeId,
      activeWindow,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      toggleMinimize,
      toggleMaximize,
      updateWindow,
    ]
  );

  return (
    <WindowContext.Provider value={value}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindows must be used within <WindowProvider>');
  return ctx;
}

export { MIN_WIDTH, MIN_HEIGHT };
