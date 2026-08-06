# Review: macOS Tahoe Web App

## Verdict
NEEDS_FIXES

## Issues

1. **File:** `package.json` / project root
   - **Problem:** `npm run lint` is configured (`eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`) but there is no ESLint configuration file (`.eslintrc.*` or `eslint.config.*`). ESLint exits with an error before checking any source files.
   - **Suggested fix:** Add an ESLint config file, e.g. `.eslintrc.cjs`:
     ```js
     module.exports = {
       root: true,
       env: { browser: true, es2020: true },
       extends: [
         'eslint:recommended',
         'plugin:@typescript-eslint/recommended',
         'plugin:react-hooks/recommended',
       ],
       ignorePatterns: ['dist', '.eslintrc.cjs'],
       parser: '@typescript-eslint/parser',
       plugins: ['react-refresh'],
       rules: {
         'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
       },
     };
     ```

2. **File:** `src/App.tsx` (lines 35–70)
   - **Problem:** Global keyboard shortcuts required by the spec are missing. The only implemented global shortcuts are `Cmd/Ctrl+Space` (Spotlight) and `Escape` (close top overlay). The spec explicitly calls for `Cmd+Tab`, `Cmd+W`, `Cmd+Q`, `Cmd+N`, and arrow-key navigation. Menu bar items also advertise shortcuts like `⌘W` and `⌘N`, but no handler exists.
   - **Suggested fix:** Add a central keyboard handler in `App.tsx` (or a new `useGlobalShortcuts` hook) that:
     - `Cmd+Tab` / `Cmd+Shift+Tab`: cycles `windows` by z-index to update `activeAppId` and focus.
     - `Cmd+W`: closes the focused window (`closeWindow(selectFocusedWindow(...).id)`).
     - `Cmd+Q`: closes all windows of the active app.
     - `Cmd+N`: opens a new window of the active app (or Finder if none).
     - Arrow keys: nudges the focused window by 1 px when no text input is focused.

3. **File:** `src/components/WindowManager.tsx` (lines 18–22)
   - **Problem:** Minimized windows are filtered out before rendering, so the `window--minimized` CSS animation in `src/styles/global.css` never runs. The spec requires "Minimize animates down to the Dock".
   - **Suggested fix:** Render minimized windows (or at least a cloned Dock icon proxy) so the scale/translate animation is visible. A minimal fix is to remove the `!w.isMinimized` filter and instead let the `Window` component apply the `window--minimized` class, then hide it with `pointer-events: none` after the animation completes. Alternatively, render a temporary absolutely positioned clone that animates from the window's last position to the Dock icon's position.

4. **File:** `src/apps/Maps.tsx` (lines 134–171)
   - **Problem:** The map background grid is painted on `.maps-canvas`, but the pan/zoom `transform` is applied only to the inner `div` that contains the pins. As a result, the pins move against a stationary background, breaking the illusion of a pannable map.
   - **Suggested fix:** Move the background grid to the same transformed inner `div` (or to a sibling that shares the transform). For example, add a child `div` inside the transformed container with `position: absolute; inset: 0; background-image: ...` and the grid CSS, then place pins as siblings inside the same transformed container.

5. **File:** `src/apps/registerCalendar.ts`, `registerMail.ts`, `registerMusic.ts`, `registerPhotos.ts`, `registerWeather.ts`, `registerMaps.ts`, `registerClock.ts`, `registerStocks.ts`, `registerTV.ts`, `registerPodcasts.ts`, `registerReminders.ts`
   - **Problem:** Most additional (Chunk 7) apps are registered without `menus`. When one of these apps is focused, the menu bar shows the app name but no app-specific menus (File/Edit/View/etc.), contrary to the "App contract" in the spec and the behavior of the core apps.
   - **Suggested fix:** Add lightweight `menus` arrays to each additional app registration, matching the pattern used in `registerFinder.ts` / `registerSafari.ts`. At minimum each app should provide `File`, `Edit`, `View`, `Window`, and `Help` menus with disabled/no-op items and the documented shortcuts.

6. **File:** `src/components/Window.tsx` (lines 255–290)
   - **Problem:** The global pointer-move/up listeners are re-attached on every render because the `useEffect` depends on the `win` object. This is inefficient and can cause brief listener gaps during rapid state updates.
   - **Suggested fix:** Replace the `win` dependency with stable scalar dependencies (`windowId`, `viewport.width`, `viewport.height`) and read the current window via `useOSStore.getState()` inside the handlers, or memoize the handler callbacks and pass them directly to the resize-handle/title-bar elements instead of using a document-level effect.

7. **File:** `src/components/Dock.tsx` (lines 163–185)
   - **Problem:** The running-indicator dot is shown for the Trash separator entry (`(isRunning || isSeparator) && ...`), but the separator branch renders a `div` and exits before this code. The `isSeparator` check inside the button branch is therefore dead code and misleading.
   - **Suggested fix:** Remove `isSeparator` from the indicator condition inside the button branch (it is never true there) and ensure the separator branch does not render an indicator:
     ```tsx
     {(isRunning && !isSeparatorEntry) && <span className="dock-item__indicator" ... />}
     ```

8. **File:** `src/apps/Terminal.tsx` (lines 210–260)
   - **Problem:** Command history navigation with the Down arrow is inconsistent. After pressing Up once, Down returns `''`; pressing Down again when the draft is already `''` leaves it `''`. However, pressing Up from a non-empty draft that is not in history returns the first history entry instead of the most recent, which is non-standard.
   - **Suggested fix:** Maintain an explicit history index (`-1` = current draft) in state. Up/Down move the index and read `history[index]` or fall back to the saved draft when the index is `-1`.

## Verification

- `npm run typecheck`: PASS (no errors)
- `npm run build`: PASS
  ```
  vite v5.4.10 building for production...
  ✓ 1638 modules transformed.
  dist/index.html                   0.45 kB │ gzip:  0.29 kB
  dist/assets/index-D0vLWA1q.css   42.72 kB │ gzip:  7.79 kB
  dist/assets/index-CFNG01fh.js   305.63 kB │ gzip: 90.60 kB
  ✓ built in 913ms
  ```
- `npm run lint`: FAIL
  ```
  Oops! Something went wrong! :(    
  ESLint: 8.57.1
  ESLint couldn't find a configuration file.
  ```

## Notes

- The overall architecture matches the spec: Zustand store, draggable/resizable windows, Dock, Launchpad, Spotlight, Control Center, and the full set of bundled apps are present and launchable.
- Finder has a surprisingly complete mock file system with sidebar navigation, icon/list views, drag-and-drop to folders/Trash, context menus, tags, and Get Info dialogs. It is the most polished app in the build.
- Core apps (Safari, Terminal, System Settings, Notes, Calculator) and additional apps (Calendar, Mail, Music, Photos, Weather, Maps, Clock, Stocks, TV, Podcasts, Reminders) all render functional UIs with sample data and basic interactions.
- No test files exist (`src/store/osStore.test.ts` referenced in Chunk 2 of the spec is not present). Manual verification is the only coverage.
- The missing global shortcuts (#2) and the broken minimize animation (#3) are the biggest correctness/usability gaps relative to the spec. Fixing the lint config (#1) is required for the CI/build pipeline to be considered complete.
