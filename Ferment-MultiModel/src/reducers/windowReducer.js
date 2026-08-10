// Window state reducer for the Tahoe Web Desktop.
//
// The reducer is pure and deterministic given its inputs. The only
// environment touch is a guarded read of `window.innerWidth`/`innerHeight`
// inside the FULLSCREEN action so the reducer can size the window to the
// viewport without taking the value as a payload. When no global `window`
// is available the reducer falls back to a 1200x800 default.

export const OPEN = 'OPEN';
export const CLOSE = 'CLOSE';
export const MINIMIZE = 'MINIMIZE';
export const RESTORE = 'RESTORE';
export const FOCUS = 'FOCUS';
export const DRAG = 'DRAG';
export const RESIZE = 'RESIZE';
export const FULLSCREEN = 'FULLSCREEN';

export const DEFAULT_WINDOW_WIDTH = 800;
export const DEFAULT_WINDOW_HEIGHT = 500;
export const CASCADE_BASE_X = 40;
export const CASCADE_BASE_Y = 40;
export const CASCADE_STEP = 30;
export const CASCADE_VIEWPORT_MARGIN = 40;
export const FALLBACK_VIEWPORT_WIDTH = 1200;
export const FALLBACK_VIEWPORT_HEIGHT = 800;

export const initialState = {
  windows: [],
  nextZIndex: 1,
  activeAppId: null,
};

function generateId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `w-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getViewportSize() {
  if (typeof window !== 'undefined') {
    return {
      width:
        typeof window.innerWidth === 'number'
          ? window.innerWidth
          : FALLBACK_VIEWPORT_WIDTH,
      height:
        typeof window.innerHeight === 'number'
          ? window.innerHeight
          : FALLBACK_VIEWPORT_HEIGHT,
    };
  }
  return {
    width: FALLBACK_VIEWPORT_WIDTH,
    height: FALLBACK_VIEWPORT_HEIGHT,
  };
}

function findTopmostWindow(windows) {
  // "Topmost" means highest zIndex among non-minimized windows so the
  // caller can pick a sensible next active app.
  let top = null;
  for (const w of windows) {
    if (w.minimized) continue;
    if (top === null || w.zIndex > top.zIndex) top = w;
  }
  return top;
}

function topmostAppId(windows) {
  const top = findTopmostWindow(windows);
  return top ? top.appId : null;
}

function clampCascadePosition(index) {
  const { width: vw, height: vh } = getViewportSize();
  const x = Math.min(
    CASCADE_BASE_X + index * CASCADE_STEP,
    Math.max(CASCADE_BASE_X, vw - CASCADE_VIEWPORT_MARGIN),
  );
  const y = Math.min(
    CASCADE_BASE_Y + index * CASCADE_STEP,
    Math.max(CASCADE_BASE_Y, vh - CASCADE_VIEWPORT_MARGIN),
  );
  return { x, y };
}

export function windowReducer(state, action) {
  switch (action.type) {
    case OPEN: {
      const { appId } = action;
      // If any window for this app already exists (open or minimized),
      // restore and focus it instead of creating a duplicate. This makes
      // clicking a Dock icon for a minimized app behave the same as
      // clicking the active app's icon — both bring the window forward.
      const existing = state.windows.find((w) => w.appId === appId);
      if (existing) {
        return {
          ...state,
          windows: state.windows.map((w) =>
            w.id === existing.id
              ? { ...w, minimized: false, zIndex: state.nextZIndex }
              : w,
          ),
          nextZIndex: state.nextZIndex + 1,
          activeAppId: appId,
        };
      }
      const { x, y } = clampCascadePosition(state.windows.length);
      const newWindow = {
        id: generateId(),
        appId,
        x,
        y,
        width: DEFAULT_WINDOW_WIDTH,
        height: DEFAULT_WINDOW_HEIGHT,
        minimized: false,
        zIndex: state.nextZIndex,
      };
      return {
        ...state,
        windows: [...state.windows, newWindow],
        nextZIndex: state.nextZIndex + 1,
        activeAppId: appId,
      };
    }

    case CLOSE: {
      const { id } = action;
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;
      const remaining = state.windows.filter((w) => w.id !== id);
      let activeAppId = state.activeAppId;
      if (target.appId === state.activeAppId) {
        activeAppId = topmostAppId(remaining);
      }
      return {
        ...state,
        windows: remaining,
        activeAppId,
      };
    }

    case MINIMIZE: {
      const { id } = action;
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;
      const windows = state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w,
      );
      let activeAppId = state.activeAppId;
      if (target.appId === state.activeAppId) {
        activeAppId = topmostAppId(windows);
      }
      return {
        ...state,
        windows,
        activeAppId,
      };
    }

    case RESTORE: {
      const { id } = action;
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === id
            ? { ...w, minimized: false, zIndex: state.nextZIndex }
            : w,
        ),
        nextZIndex: state.nextZIndex + 1,
        activeAppId: target.appId,
      };
    }

    case FOCUS: {
      const { id } = action;
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, zIndex: state.nextZIndex } : w,
        ),
        nextZIndex: state.nextZIndex + 1,
        activeAppId: target.appId,
      };
    }

    case DRAG: {
      const { id, deltaX, deltaY } = action;
      if (!state.windows.some((w) => w.id === id)) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, x: w.x + deltaX, y: w.y + deltaY } : w,
        ),
      };
    }

    case RESIZE: {
      const { id, width, height } = action;
      if (!state.windows.some((w) => w.id === id)) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, width, height } : w,
        ),
      };
    }

    case FULLSCREEN: {
      const { id, isFullscreen } = action;
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;
      if (isFullscreen) {
        const { width: vw, height: vh } = getViewportSize();
        return {
          ...state,
          windows: state.windows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  x: 0,
                  y: 0,
                  width: vw,
                  height: vh,
                  previousRect: {
                    x: w.x,
                    y: w.y,
                    width: w.width,
                    height: w.height,
                  },
                }
              : w,
          ),
        };
      }
      const rect = target.previousRect;
      if (!rect) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === id
            ? {
                ...w,
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                previousRect: undefined,
              }
            : w,
        ),
      };
    }

    default:
      return state;
  }
}

export default windowReducer;
