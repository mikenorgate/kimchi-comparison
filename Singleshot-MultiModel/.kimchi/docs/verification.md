# Verification — macOS Tahoe Web-App Prototype Fixes

## Verdict

ALL_PASS

## Test output

- Command: `npx vitest run` (invoked as `npm run test`)
- Test files: 10 passed (10)
- Tests: 133 passed (133), 0 failed
- Up from 130 in the original review; added 3 new tests:
  - `chrome.test.tsx`: dock running dot updates when a window opens/closes
  - `chrome.test.tsx`: dock running dot hides while window is minimized
  - `chrome.test.tsx`: desktop folder icon navigates Finder to target folder
- Pre-existing `act(...)` warnings remain in `safari.test.tsx`; they are
  unrelated to the fixes and the suite still passes.

## Build output

- Command: `npm run build`
- Result: success (no errors, no warnings)
- `tsc -b` clean, `vite build` emitted `dist/` artifacts.

## Fixes applied

1. **Notes.tsx — nested `<button>` removed**
   - File: `src/apps/Notes.tsx`
   - Outer note list item is now a `<li>` containing a non-interactive
     `<div role="listitem" tabIndex={0}>` that owns the row click handler
     and keyboard activation. The Delete button is rendered as a sibling
     `<button>` outside that container. No more `<button>` inside `<button>`.

2. **Dock.tsx — running indicators driven by window state**
   - File: `src/components/Dock.tsx`
   - Removed the `running` subscription from `useDockStore`. A new
     `runningAppIds` memo derives the running app set from
     `Object.values(windows)` (excluding minimized windows), so opening or
     closing any window automatically updates the dot under the matching
     dock icon.

3. **Desktop.tsx — folder icons open Finder at the target**
   - File: `src/components/Desktop.tsx`
   - `handleIconDoubleClick` now calls
     `useFileSystemStore.getState().navigateTo(icon.target)` after
     `openWindow('finder', ...)` so the Applications icon opens Finder
     rooted at Applications, the Home icon at Documents, etc.

4. **Window.tsx — drag clamped to keep title bar reachable**
   - File: `src/components/Window.tsx`
   - `handleDragMove` clamps the proposed (x, y) so:
     - x is bounded to `[-current.width + 80, viewportW - 80]`
     - y is bounded to `[MENU_BAR_HEIGHT, viewportH - 20]`
   - The user can no longer drag a window fully off-screen; the title bar
     always remains inside the viewport.

5. **Finder.tsx + FinderSidebar.tsx — sidebar highlight follows current folder**
   - Files: `src/apps/Finder.tsx`, `src/apps/FinderSidebar.tsx`
   - `FinderSidebar` now receives `currentFolderId` (renamed from
     `currentRootId`) set to `currentPath[currentPath.length - 1] ?? HOME_ID`,
     and the active comparison uses that id. The highlight now tracks the
     actual open folder rather than always landing on Home.

## Files changed

- `src/apps/Notes.tsx`
- `src/components/Dock.tsx`
- `src/components/Desktop.tsx`
- `src/components/Window.tsx`
- `src/apps/Finder.tsx`
- `src/apps/FinderSidebar.tsx`
- `src/__tests__/chrome.test.tsx` (updated one stale Dock-running test,
  added three new tests covering the fixed behaviours)

## Notes

- `useDockStore.setRunning` and the `running` field are still in
  `dockStore.ts` for backwards compatibility with existing store tests
  (`stores.test.tsx` exercises them directly). The Dock UI no longer
  consults them; the live source of truth is the window store.
- No new features or refactors were introduced beyond the review's scope.
