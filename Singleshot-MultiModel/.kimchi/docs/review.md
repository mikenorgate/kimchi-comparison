# Final Review — macOS Tahoe Web-App Prototype

## Verdict

NEEDS_FIXES

The implementation is close to the scoped MVP and all automated checks pass, but several spec-required behaviours are missing or incorrect. The issues below should be fixed before the prototype can be considered complete.

## Verification results

- **Tests**: `npm run test` — 130 passed, 0 failed (10 test files).
- **Build**: `npm run build` — succeeded.
- **Type-check**: `npx tsc --noEmit` — no errors.

> Note: the test run emitted React warnings about state updates not wrapped in `act(...)` and a hydration warning about a nested `<button>` inside a `<button>` in `Notes.tsx`. The test suite still passes, but the warnings point to real correctness/accessibility issues documented below.

## Issues

1. **Nested interactive element in Notes sidebar**
   - **File**: `src/apps/Notes.tsx`
   - **Lines**: 130–154
   - **Problem**: Each note list item is rendered as a `<button>`, and the active item also renders a Delete `<button>` inside it. HTML does not allow a `<button>` to contain another `<button>`. This triggers a React hydration warning in StrictMode, can break keyboard/screen-reader navigation, and may cause unpredictable click handling.
   - **Suggested fix**: Change the outer note item to a non-interactive container (e.g. a `<div>` with `role="listitem"`), keep the whole-row click handler on that container, and render the Delete button as a sibling rather than a child. Alternatively, keep the outer `<button>` but move the Delete action outside the item row entirely (for example, into the editor header).

2. **Dock running indicators are never updated**
   - **Files**: `src/stores/dockStore.ts` (line 24), `src/components/Dock.tsx` (lines 45–50), `src/stores/windowStore.ts`
   - **Problem**: The spec requires running apps to show a dot indicator under the Dock icon. `Dock.tsx` reads `running` from `useDockStore`, but no application code ever calls `setRunning` when a window opens or closes. The `running` state is only manipulated in tests, so in the real UI the indicators never appear.
   - **Suggested fix**: Drive the running indicator from the actual window state instead of a separate store field, or keep the store field and synchronise it in `windowStore.openWindow`/`closeWindow`. For example, in `Dock.tsx` derive `runningAppIds` from `Object.values(windows).map((w) => w.appId)` and use that to render the dots.

3. **Desktop folder icons do not open their target folder**
   - **File**: `src/components/Desktop.tsx`
   - **Lines**: 66–72
   - **Problem**: The spec states that double-clicking a desktop icon "opens the corresponding app or folder in a Finder window." The `DesktopIcon` entries for `home` and `applications` correctly set `kind: 'folder'` and `target: 'documents'` / `target: 'applications'`, but `handleIconDoubleClick` ignores `icon.target` for folders and always opens Finder at the root (`openWindow('finder', { title: 'Finder' })`).
   - **Suggested fix**: For folder icons, open Finder and then navigate to the target folder. This can be done by extending `openWindow` to accept an initial folder path or by dispatching a navigation action after the window opens:
     ```ts
     if (icon.kind === 'folder') {
       const wid = openWindow('finder', { title: icon.label });
       useFileSystemStore.getState().navigateTo(icon.target);
       return;
     }
     ```
     (If multiple Finder windows should be supported independently, pass the target through `OpenWindowOptions` and store it on the window state.)

4. **Window drag does not constrain the title bar within reach**
   - **File**: `src/components/Window.tsx`
   - **Lines**: 109–118
   - **Problem**: The spec requires "movement is constrained so the title bar remains reachable." `handleDragMove` adds the pointer delta directly to `x` and `y` without clamping, so a user can drag a window completely off-screen and then be unable to move it back.
   - **Suggested fix**: Clamp the new position in `handleDragMove` so the title bar (or a small grab handle) always remains inside the viewport. For example:
     ```ts
     const maxX = window.innerWidth - 40;
     const maxY = window.innerHeight - 20;
     const nextX = Math.min(Math.max(current.x + delta.dx, -current.width + 80), maxX);
     const nextY = Math.min(Math.max(current.y + delta.dy, 0), maxY);
     moveWindow(windowId, nextX, nextY);
     ```

5. **Finder sidebar active highlight is always on "Home"**
   - **Files**: `src/apps/Finder.tsx` (line 294), `src/apps/FinderSidebar.tsx` (lines 22, 39)
   - **Problem**: `FinderSidebar` receives `currentRootId={currentPath[0] ?? HOME_ID}`, where `currentPath[0]` is always the root folder. Consequently the `active` comparison `entry.fsNodeId === currentRootId` is true only for the Home favourite, regardless of which folder is actually open. The visual highlight never follows the user's selection.
   - **Suggested fix**: Pass the actual current folder id instead of the root of the path:
     ```tsx
     currentFolderId={currentPath[currentPath.length - 1] ?? HOME_ID}
     ```
     and update `FinderSidebar` to highlight when `entry.fsNodeId === currentFolderId`.

## Summary

The Tahoe prototype successfully implements the bulk of the scoped MVP: the store layer is typed and persisted, the desktop chrome, Dock, menu bar, window manager, Finder, Calculator, Notes, Terminal, Safari, and Settings apps are all present and wired together. The test suite is comprehensive (130 passing tests) and the production build is clean.

However, the five issues above are genuine deviations from the spec: a real HTML correctness bug in Notes, a missing Dock running-indicator integration, incomplete desktop-icon folder navigation, missing window-drag constraints, and a broken Finder sidebar highlight. Fixing these would bring the implementation fully in line with the MVP requirements without requiring architectural changes.
