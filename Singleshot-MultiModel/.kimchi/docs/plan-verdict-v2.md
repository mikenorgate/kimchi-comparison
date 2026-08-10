# Plan Verdict v2: macOS Tahoe Web-App Prototype

**Verdict:** NEEDS_REVISION

The three issues from the first review are resolved:

- Chunk 5 no longer bundles Terminal; it is correctly classified as `simple` (Calculator + Notes). Terminal is now its own `complex` Chunk 6.
- The required persistence fields (`accentColor`, `computerName`, Dock `size`, `magnificationEnabled`, `position`) are now present in the architecture and in Chunk 1's acceptance criteria and tests.
- The Safari/Settings/persistence bundling is unbundled: persistence is wired in Chunk 1, Terminal is Chunk 6, and Safari + Settings are Chunk 7.

However, a few new gaps prevent the plan from being complete and immediately buildable.

## Issues

1. **Chunk 2 acceptance criteria omit desktop icons**
   - **Reference:** `/Users/mike/tmp/Singleshot-MultiModel/.kimchi/docs/spec.md`, Chunk 2 goal (line 163) and acceptance criteria (lines 178-183).
   - **Problem:** The scoped MVP explicitly requires "Desktop wallpaper + icons + context menu". The Chunk 2 goal states it should render "desktop icons", but none of the seven acceptance criteria or the three test cases mention icons. A builder could pass the chunk while leaving the desktop bare, which would not satisfy the scoped requirement.
   - **Suggested fix:** Add an acceptance criterion such as: "Desktop renders a default set of desktop icons (e.g., a Home alias and/or app shortcuts), and double-clicking an icon opens the corresponding app or folder." Add a corresponding test in `src/__tests__/chrome.test.tsx` asserting that `Desktop.tsx` renders the icons and that clicking one calls `openWindow`.

2. **Undefined `MenuDefinition` type in the app registry**
   - **Reference:** `/Users/mike/tmp/Singleshot-MultiModel/.kimchi/docs/spec.md`, line 69 (`menus: MenuDefinition[];`).
   - **Problem:** The `AppDefinition` interface references `MenuDefinition[]`, but the only menu-related type defined in the spec is `MenuItem` (around line 95). Following the spec literally would produce a TypeScript compile error because `MenuDefinition` is not declared.
   - **Suggested fix:** Change `menus: MenuDefinition[];` to `menus: MenuItem[];`, or add `type MenuDefinition = MenuItem;` in the types section.

3. **`WindowState.prevBounds` has implicit `any` fields**
   - **Reference:** `/Users/mike/tmp/Singleshot-MultiModel/.kimchi/docs/spec.md`, line 89 (`prevBounds?: { x; y; width; height };`).
   - **Problem:** The property type declaration omits explicit types for `x`, `y`, `width`, and `height`. Under TypeScript strict mode this will fail to compile.
   - **Suggested fix:** Change the line to `prevBounds?: { x: number; y: number; width: number; height: number };`.
