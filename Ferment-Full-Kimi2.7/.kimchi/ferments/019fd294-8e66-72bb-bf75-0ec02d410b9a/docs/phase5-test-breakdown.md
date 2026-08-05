# Phase 5 Test Breakdown — Media and Communication Apps

Full vitest run: **30 test files, 147 tests passed**.

## Mail (6 tests) — `src/apps/mail/Mail.test.tsx`
- Renders inbox with folders (Inbox, Sent, Drafts) and message list.
- Selects a message and shows its content in the reading pane.
- Composes a new message, fills recipients/subject/body, and sends it.
- Toggles the sidebar folder selection.
- Verifies unread indicators and starred status.

## Messages (6 tests) — `src/apps/messages/Messages.test.tsx`
- Renders conversation list and initial chat view.
- Selects a conversation and displays its messages.
- Sends a new message and shows it in the chat history.
- Shows unread indicators per conversation.
- Scopes duplicate text queries to the correct pane.

## Photos (5 tests) — `src/apps/photos/Photos.test.tsx`
- Renders albums sidebar and photo grid.
- Switches between Library, Favorites, and Recently Added albums.
- Opens a photo viewer modal and closes it.
- Navigates previous/next photos with wrap-around.
- Toggles favorite status from the viewer.

## Music (5 tests) — `src/apps/music/Music.test.tsx`
- Renders playlists sidebar and track list.
- Selects a track and starts playback.
- Pauses and resumes playback.
- Skips to the next track.
- Toggles favorite and filters the Favorites playlist.

## TV (4 tests) — `src/apps/tv/Tv.test.tsx`
- Renders featured hero and category rows.
- Opens the player when a movie poster is clicked.
- Closes the player.
- Toggles play/pause in the player.

## Maps (6 tests) — `src/apps/maps/Maps.test.tsx`
- Renders sidebar, search, and map canvas.
- Filters locations by search query.
- Shows an info card when a location list item is selected.
- Shows an info card when a map pin is clicked.
- Closes the info card.
- Shows an empty state for no search results.

## FaceTime (5 tests) — `src/apps/facetime/FaceTime.test.tsx`
- Renders the contacts list.
- Starts a call and shows the call UI.
- Increments the call duration timer.
- Toggles mute and video-off states.
- Ends the call and returns to the contacts list.

## Verification artifacts
- `phase5-test.log` — full vitest output.
- `phase5-typecheck.log` — empty (tsc -b succeeded with no output).
- `phase5-build.log` — vite production build output.
- `phase5-diff.patch` — git diff of all new/changed source files in Phase 5.
