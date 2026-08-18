import type {
  FsFile,
  FsFileContent,
  FsFolder,
  FsImageContent,
  FsItem,
  FsTextContent,
} from "./types";

/**
 * The mock filesystem backing the Finder app. Everything is held in
 * memory and exported as a deeply-frozen tree rooted at `/`
 * (`Macintosh HD`). No network calls are made at construction time;
 * the `src` fields of image files simply point at placeholder URLs
 * that the browser fetches lazily when the Finder renders previews.
 *
 * Path conventions:
 * - The root node has `path: "/"` and `parentPath: null`.
 * - Every other node has an absolute path beginning with `/` (e.g.
 *   `/Documents`, `/Documents/welcome.txt`).
 * - Names never contain `/`, so a path is just the parent path
 *   joined with `/` + name.
 */

/** Display label for the root folder, matching macOS Finder. */
export const ROOT_FOLDER_NAME = "Macintosh HD";

/**
 * Folders in the mock filesystem that should be displayed at the top
 * level of every Finder window's sidebar (the "Favorites" section in
 * real macOS). Centralising this list keeps the data model decoupled
 * from the future Finder UI.
 */
export const TOP_LEVEL_FAVORITES: readonly string[] = [
  "Desktop",
  "Documents",
  "Downloads",
  "Pictures",
  "Applications",
] as const;

// ---------------------------------------------------------------------------
// Small constructors — keep the literal tree below readable.
// ---------------------------------------------------------------------------

/** Build a text-content payload. */
const text = (value: string): FsTextContent => ({ kind: "text", text: value });

/** Build an image-content payload. */
const image = (src: string, alt?: string): FsImageContent =>
  alt === undefined ? { kind: "image", src } : { kind: "image", src, alt };

/** Build a {@link FsFile}. The path is derived from parent + name. */
function makeFile(
  id: string,
  name: string,
  parentPath: string,
  content: FsFileContent
): FsFile {
  return {
    kind: "file",
    id,
    name,
    path: joinPath(parentPath, name),
    parentPath,
    content,
  };
}

/** Build a {@link FsFolder} with the given children. */
function makeFolder(
  id: string,
  name: string,
  parentPath: string | null,
  children: readonly FsItem[]
): FsFolder {
  const path = parentPath === null ? "/" : joinPath(parentPath, name);
  return {
    kind: "folder",
    id,
    name,
    path,
    parentPath,
    children,
  };
}

// ---------------------------------------------------------------------------
// Mock tree construction
// ---------------------------------------------------------------------------

const desktop: FsFolder = {
  kind: "folder",
  id: "fs-desktop",
  name: "Desktop",
  path: "/Desktop",
  parentPath: "/",
  children: [
    makeFile("fs-desktop-0", "readme.txt", "/Desktop", text(
      "Welcome to your macOS Tahoe desktop.\nHave fun exploring."
    )),
    makeFile("fs-desktop-1", "project-notes.md", "/Desktop", text(
      [
        "# Project Notes",
        "",
        "- Drag windows around the desktop.",
        "- Open files from Finder.",
        "- Try the dock at the bottom.",
      ].join("\n")
    )),
    makeFile("fs-desktop-2", "screenshot.png", "/Desktop", image(
      "https://via.placeholder.com/150/92c9bf",
      "Desktop screenshot"
    )),
    makeFile("fs-desktop-3", "wallpaper.heic", "/Desktop", image(
      "https://via.placeholder.com/600/4f6d7a",
      "Wallpaper preview"
    )),
  ],
};

const documentsWork: FsFolder = {
  kind: "folder",
  id: "fs-documents-work",
  name: "Work",
  path: "/Documents/Work",
  parentPath: "/Documents",
  children: [
    makeFile("fs-documents-work-0", "spec.md", "/Documents/Work", text(
      "# Finder Spec\n\nIn-memory filesystem for the mock desktop."
    )),
    makeFile("fs-documents-work-1", "ideas.txt", "/Documents/Work", text(
      "Idea: glow effect on active Dock icon."
    )),
  ],
};

const documents: FsFolder = {
  kind: "folder",
  id: "fs-documents",
  name: "Documents",
  path: "/Documents",
  parentPath: "/",
  children: [
    makeFile("fs-documents-0", "welcome.txt", "/Documents", text(
      "Hello! This is the Documents folder. Any text file dropped here " +
        "will appear in Finder and open in the preview pane."
    )),
    makeFile("fs-documents-1", "report.txt", "/Documents", text(
      [
        "Quarterly Report",
        "================",
        "",
        "Revenue: $1.2M",
        "Customers: 4,318",
        "Highlights: macOS Tahoe launch went smoothly.",
      ].join("\n")
    )),
    makeFile("fs-documents-2", "todo.md", "/Documents", text(
      "- [x] Build Finder data model\n- [ ] Ship macOS Tahoe"
    )),
    makeFile("fs-documents-3", "chart.png", "/Documents", image(
      "https://via.placeholder.com/300/dddddd?text=Chart",
      "Quarterly chart"
    )),
    documentsWork,
  ],
};

const downloads: FsFolder = {
  kind: "folder",
  id: "fs-downloads",
  name: "Downloads",
  path: "/Downloads",
  parentPath: "/",
  children: [
    makeFile("fs-downloads-0", "installer.dmg", "/Downloads", text(
      "[binary placeholder — installer.dmg]"
    )),
    makeFile("fs-downloads-1", "archive.zip", "/Downloads", text(
      "[binary placeholder — archive.zip]"
    )),
    makeFile("fs-downloads-2", "holiday.jpg", "/Downloads", image(
      "https://via.placeholder.com/200/ffb86b",
      "Holiday photo"
    )),
  ],
};

const pictures: FsFolder = {
  kind: "folder",
  id: "fs-pictures",
  name: "Pictures",
  path: "/Pictures",
  parentPath: "/",
  children: [
    makeFile("fs-pictures-0", "beach.jpg", "/Pictures", image(
      "https://via.placeholder.com/250/87cefa",
      "Beach scene"
    )),
    makeFile("fs-pictures-1", "mountain.png", "/Pictures", image(
      "https://via.placeholder.com/250/8fbc8f",
      "Mountain view"
    )),
    makeFile("fs-pictures-2", "cat.png", "/Pictures", image(
      "https://via.placeholder.com/250/ffb6c1",
      "A friendly cat"
    )),
    makeFile("fs-pictures-3", "data-uri.txt", "/Pictures", text(
      "This file is purely text; image data URIs live in image files, not here."
    )),
  ],
};

/**
 * Info.plist payloads used by the `.app` bundle fixtures below. Kept
 * here so the bundle literal stays short.
 */
const infoPlist = (bundleName: string): FsTextContent => text(
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<plist version="1.0">',
    "<dict>",
    `  <key>CFBundleName</key><string>${bundleName}</string>`,
    `  <key>CFBundleIdentifier</key><string>com.apple.${bundleName}</string>`,
    "</dict>",
    "</plist>",
  ].join("\n")
);

const safariApp: FsFolder = makeFolder(
  "fs-app-safari",
  "Safari.app",
  "/Applications",
  [makeFile("fs-app-safari-0", "Info.plist", "/Applications/Safari.app", infoPlist("Safari"))]
);

const mailApp: FsFolder = makeFolder(
  "fs-app-mail",
  "Mail.app",
  "/Applications",
  [makeFile("fs-app-mail-0", "Info.plist", "/Applications/Mail.app", infoPlist("Mail"))]
);

const notesApp: FsFolder = makeFolder(
  "fs-app-notes",
  "Notes.app",
  "/Applications",
  [makeFile("fs-app-notes-0", "Info.plist", "/Applications/Notes.app", infoPlist("Notes"))]
);

const applications: FsFolder = makeFolder("fs-applications", "Applications", "/", [
  safariApp,
  mailApp,
  notesApp,
]);

/**
 * The deterministic mock filesystem tree. The reference is frozen so
 * consumers can't accidentally mutate the shared tree at runtime. If
 * a UI feature needs to add or remove nodes, it should operate on a
 * structural clone (see {@link cloneFsItem}) rather than mutating
 * this constant in place.
 */
export const initialMockFs: FsFolder = Object.freeze(
  makeFolder("fs-root", ROOT_FOLDER_NAME, null, [
    desktop,
    documents,
    downloads,
    pictures,
    applications,
  ])
) as FsFolder;

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

/**
 * Join a parent path with a child name, ensuring exactly one `/`
 * separator between them and a leading `/`. Empty parent paths are
 * treated as the root; empty names are rejected because they would
 * produce ambiguous paths.
 */
export function joinPath(parentPath: string, name: string): string {
  if (name.length === 0) {
    throw new Error("joinPath: name must not be empty");
  }
  if (name.includes("/")) {
    throw new Error(`joinPath: name must not contain "/": ${name}`);
  }
  if (parentPath === "" || parentPath === "/") {
    return `/${name}`;
  }
  if (parentPath.endsWith("/")) {
    return `${parentPath}${name}`;
  }
  return `${parentPath}/${name}`;
}

/**
 * Split an absolute path into its segments. The root path `/` returns
 * an empty array so callers can iterate without special-casing the
 * root. Trailing slashes are tolerated.
 */
export function splitPath(path: string): readonly string[] {
  if (path === "/" || path === "") return [];
  const trimmed = path.replace(/\/+$/, "");
  return trimmed.split("/").filter((seg) => seg.length > 0);
}

/**
 * Return the parent path of `path`. The root path `/` has no parent
 * and returns `null`. Every other path returns its parent with no
 * trailing slash (e.g. `getParentPath("/Documents/welcome.txt")`
 * yields `"/Documents"`).
 */
export function getParentPath(path: string): string | null {
  if (path === "/" || path === "") return null;
  const idx = path.lastIndexOf("/");
  if (idx <= 0) return "/";
  return path.slice(0, idx);
}

/**
 * Return the last segment of `path` — the file or folder name. The
 * root path `/` returns an empty string.
 */
export function getFileName(path: string): string {
  if (path === "/" || path === "") return "";
  const segments = splitPath(path);
  return segments[segments.length - 1] ?? "";
}

/**
 * Look up a node by absolute path. Returns `undefined` when the path
 * does not exist so callers can decide how to react without a try
 * block. Lookup is case-sensitive, matching how the mock filesystem
 * is constructed.
 */
export function getNodeByPath(
  rootNode: FsItem,
  path: string
): FsItem | undefined {
  if (rootNode.path === path) return rootNode;
  if (rootNode.kind !== "folder") return undefined;
  for (const child of rootNode.children) {
    if (child.path === path) return child;
    if (child.kind === "folder") {
      const found = getNodeByPath(child, path);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Return the immediate children of a node. Files have no children, so
 * this returns an empty array for them; the Finder UI relies on that
 * to drive the empty-state message.
 */
export function listChildren(node: FsItem): readonly FsItem[] {
  return node.kind === "folder" ? node.children : [];
}

/**
 * Type-guard predicate: is `item` a regular file (not a folder)?
 * Useful when iterating mixed children and only caring about files.
 */
export function isFile(item: FsItem): item is FsFile {
  return item.kind === "file";
}

/**
 * Type-guard predicate: is `item` a folder?
 */
export function isFolder(item: FsItem): item is FsFolder {
  return item.kind === "folder";
}

/**
 * Type-guard predicate: does `file` have image content? Refines the
 * file's `content` to {@link FsImageContent} for the success branch.
 */
export function isImageFile(file: FsFile): file is FsFile & {
  content: FsImageContent;
} {
  return file.content.kind === "image";
}

/**
 * Type-guard predicate: does `file` have text content? Refines the
 * file's `content` to {@link FsTextContent} for the success branch.
 */
export function isTextFile(file: FsFile): file is FsFile & {
  content: FsTextContent;
} {
  return file.content.kind === "text";
}

/**
 * Decide whether a path refers to a file with text content. Walks the
 * tree to find the node, then narrows it. Returns `false` for missing
 * paths and for non-file nodes.
 */
export function isTextPath(
  rootNode: FsItem,
  path: string
): boolean {
  const node = getNodeByPath(rootNode, path);
  return node?.kind === "file" && node.content.kind === "text";
}

/**
 * Decide whether a path refers to a file with image content. Returns
 * `false` for missing paths and for non-file nodes.
 */
export function isImagePath(
  rootNode: FsItem,
  path: string
): boolean {
  const node = getNodeByPath(rootNode, path);
  return node?.kind === "file" && node.content.kind === "image";
}

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

/**
 * Map of file extensions to emoji icons. Keys are lowercased
 * extensions (including the leading dot, e.g. `.txt`). Anything not
 * in the map falls back to the generic file icon.
 */
const FILE_EXTENSION_ICONS: Readonly<Record<string, string>> = {
  ".txt": "📄",
  ".md": "📝",
  ".markdown": "📝",
  ".json": "🧾",
  ".js": "📜",
  ".ts": "📜",
  ".tsx": "📜",
  ".css": "🎨",
  ".html": "🌐",
  ".png": "🖼️",
  ".jpg": "🖼️",
  ".jpeg": "🖼️",
  ".gif": "🖼️",
  ".webp": "🖼️",
  ".heic": "🖼️",
  ".pdf": "📕",
  ".zip": "🗜️",
  ".dmg": "💿",
  ".plist": "⚙️",
};

/**
 * Folder-name to emoji mapping. Used for both the top-level favourites
 * (Desktop, Documents, …) and any future nested folders we want to
 * highlight. Lookups are case-sensitive to match Finder.
 */
const FOLDER_NAME_ICONS: Readonly<Record<string, string>> = {
  Desktop: "🖥️",
  Documents: "📚",
  Downloads: "📥",
  Pictures: "🖼️",
  Applications: "🧩",
  Macintosh: "💾",
  Work: "💼",
};

/**
 * Return an emoji icon appropriate for the given path. The function
 * is path-based (not node-based) so the UI can pre-compute icons
 * before the tree has finished loading, and so it works equally well
 * for files that haven't been resolved yet. Lookup is case-insensitive
 * on the extension; folder lookups are exact (since macOS folder
 * names are case-sensitive).
 */
export function getFileIcon(path: string): string {
  const name = getFileName(path);
  if (name === "") return "💾";

  // `.app` bundles always get the application icon regardless of
  // the rest of the extension logic.
  if (name.endsWith(".app")) return "🧩";

  const ext = extensionOf(name);
  if (ext !== "") {
    const fileIcon = FILE_EXTENSION_ICONS[ext.toLowerCase()];
    if (fileIcon) return fileIcon;
  }
  if (!ext) {
    // No extension -> assume folder.
    const folderIcon = FOLDER_NAME_ICONS[name];
    if (folderIcon) return folderIcon;
    return "📁";
  }
  return "📄";
}

/**
 * Return the lowercased extension of `name` including the leading
 * dot, or an empty string if there is none. Hidden files (`.bashrc`)
 * are treated as having no extension because their visible name has
 * no segment after the dot.
 */
function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "";
  return name.slice(dot);
}

/**
 * Deep-clone a tree of {@link FsItem} nodes. Used by UI features that
 * need to add, remove, or rename nodes without mutating
 * {@link initialMockFs}. Structural sharing isn't relevant for a mock
 * tree of this size; a straight JSON clone keeps the code obvious.
 */
export function cloneFsItem<T extends FsItem>(node: T): T {
  return JSON.parse(JSON.stringify(node)) as T;
}
