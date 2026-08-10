import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import {
  OPEN,
  CLOSE,
  MINIMIZE,
  RESTORE,
  FOCUS,
  DRAG,
  RESIZE,
  FULLSCREEN,
  windowReducer,
  initialState as reducerInitialState,
} from '../reducers/windowReducer.js';

const WindowContext = createContext(null);

export function WindowProvider({ children, initialState }) {
  const seed = initialState ?? reducerInitialState;
  const [state, dispatch] = useReducer(windowReducer, seed);

  const openApp = useCallback(
    (appId) => dispatch({ type: OPEN, appId }),
    [],
  );
  const closeWindow = useCallback(
    (id) => dispatch({ type: CLOSE, id }),
    [],
  );
  const minimizeWindow = useCallback(
    (id) => dispatch({ type: MINIMIZE, id }),
    [],
  );
  const restoreWindow = useCallback(
    (id) => dispatch({ type: RESTORE, id }),
    [],
  );
  const focusWindow = useCallback(
    (id) => dispatch({ type: FOCUS, id }),
    [],
  );
  const dragWindow = useCallback(
    (id, deltaX, deltaY) =>
      dispatch({ type: DRAG, id, deltaX, deltaY }),
    [],
  );
  const resizeWindow = useCallback(
    (id, width, height) => dispatch({ type: RESIZE, id, width, height }),
    [],
  );
  const setFullscreen = useCallback(
    (id, isFullscreen) =>
      dispatch({ type: FULLSCREEN, id, isFullscreen }),
    [],
  );

  const actions = useMemo(
    () => ({
      openApp,
      closeWindow,
      minimizeWindow,
      restoreWindow,
      focusWindow,
      dragWindow,
      resizeWindow,
      setFullscreen,
    }),
    [
      openApp,
      closeWindow,
      minimizeWindow,
      restoreWindow,
      focusWindow,
      dragWindow,
      resizeWindow,
      setFullscreen,
    ],
  );

  const value = useMemo(
    () => ({
      windows: state.windows,
      nextZIndex: state.nextZIndex,
      activeAppId: state.activeAppId,
      actions,
      dispatch,
    }),
    [state, actions],
  );

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  );
}

export function useWindowContext() {
  const ctx = useContext(WindowContext);
  if (ctx === null) {
    throw new Error(
      'useWindowContext must be used inside a <WindowProvider />',
    );
  }
  return ctx;
}

export function useWindows() {
  const { windows, nextZIndex, activeAppId } = useWindowContext();
  return { windows, nextZIndex, activeAppId };
}

export function useWindowActions() {
  const { actions } = useWindowContext();
  return actions;
}

export default WindowContext;
