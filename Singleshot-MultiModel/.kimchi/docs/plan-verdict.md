# Plan Verdict: macOS Tahoe Web-App Prototype

**Verdict:** NEEDS_REVISION

The plan is largely aligned with the scoped MVP, buildable, and well-chunked, but it contains a complexity-classification error and a state-model gap that a Builder would have to invent at implementation time.

## Issues

1. **Invalid complexity classification in Chunk 5**
   - **Reference:** `spec.md`, Chunk 5: "Calculator + Notes + Terminal apps" — complexity paragraph.
   - **Problem:** The chunk states "`simple` for Notes/Calculator, `medium` for Terminal; overall `simple`". `medium` is not a valid classification under the rules (only `simple` or `complex` are allowed). The Terminal app involves command parsing, working-directory state tied to the file-system store, and up/down history navigation that depends on subtle ordering of history index and command execution state. Per the complexity rules, logic depending on subtle ordering must be marked `complex`. Therefore the chunk as a whole must be `complex`, not `simple`.
   - **Suggested fix:** Change Chunk 5 complexity to `complex`, or split Terminal into its own `complex` chunk and keep Calculator + Notes as `simple`.

2. **Missing state-store fields required by the Settings app**
   - **Reference:** `spec.md`, Architecture / State stores (1–5) and Chunk 6 Settings acceptance criteria.
   - **Problem:** The Settings app is required to support accent color, computer name, Dock size, Dock magnification toggle, and Dock position (bottom/left/right). The architecture defines `useSystemStore` (wallpaper, appearance, volume, date/time, booted flag) and `useDockStore` (pinned apps, running apps, bounce state), but neither store includes fields for accent color, computer name, Dock size, Dock magnification, or Dock position. A Builder would have to decide where these live and update the store interfaces, which is a major design decision left unspecified.
   - **Suggested fix:** Extend `useSystemStore` to include `accentColor` and `computerName`; extend `useDockStore` to include `size`, `magnificationEnabled`, and `position`. Update the architecture section and Chunk 1 store files accordingly.

3. **Chunk 6 combines multiple independent concerns**
   - **Reference:** `spec.md`, Chunk 6: "Safari + Settings apps + persistence wiring".
   - **Problem:** Safari, Settings, and cross-cutting persistence wiring are three largely independent work items bundled into a single chunk. While the acceptance criteria are detailed, this reduces independent buildability and ordering flexibility. Persistence, in particular, should ideally be wired per store as each store is introduced (e.g., file system in Chunk 1, app data in Chunk 1/5) rather than deferred to the end.
   - **Suggested fix:** Consider splitting into separate chunks: Safari app, Settings app, and persistence wiring (applied incrementally to the relevant stores).

## Positive Notes

- All scoped MVP requirements are covered: Desktop + icons + context menu, global menu bar, Dock, window manager, Finder, Calculator/Notes/Terminal/Safari/Settings, and `localStorage` persistence.
- Core type definitions (`FsNode`, `AppDefinition`, `WindowState`, `MenuItem`) and store actions are concrete and buildable.
- Every chunk includes acceptance criteria and at least one test file reference.
- Chunk ordering is logical: scaffolding/stores → shell → window manager → apps → integration.
