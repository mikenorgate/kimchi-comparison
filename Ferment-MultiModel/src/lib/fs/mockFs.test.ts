import { describe, it, expect } from "vitest";
import {
  ROOT_FOLDER_NAME,
  TOP_LEVEL_FAVORITES,
  cloneFsItem,
  getFileIcon,
  getFileName,
  getNodeByPath,
  getParentPath,
  initialMockFs,
  isFile,
  isFolder,
  isImageFile,
  isImagePath,
  isTextFile,
  isTextPath,
  joinPath,
  listChildren,
  splitPath,
} from "./mockFs";
import type { FsFile, FsItem } from "./types";

/**
 * Convenience: locate the Documents folder so individual tests don't
 * have to repeat the lookup.
 */
function documentsFolder(): FsItem {
  const node = getNodeByPath(initialMockFs, "/Documents");
  if (!node) throw new Error("test fixture: /Documents missing");
  return node;
}

describe("initialMockFs", () => {
  it("is frozen at the top level so it cannot be reassigned by accident", () => {
    expect(Object.isFrozen(initialMockFs)).toBe(true);
  });

  it("is a folder rooted at '/' with no parent", () => {
    expect(initialMockFs.kind).toBe("folder");
    expect(initialMockFs.path).toBe("/");
    expect(initialMockFs.parentPath).toBeNull();
    expect(initialMockFs.name).toBe(ROOT_FOLDER_NAME);
  });

  it("exposes Desktop, Documents, Downloads, Pictures, and Applications at the top level", () => {
    const topLevelNames = listChildren(initialMockFs).map((c) => c.name);
    for (const favorite of TOP_LEVEL_FAVORITES) {
      expect(topLevelNames).toContain(favorite);
    }
    expect(topLevelNames).toHaveLength(TOP_LEVEL_FAVORITES.length);
  });

  it("stamps every child's path with the parent's absolute path", () => {
    for (const child of listChildren(initialMockFs)) {
      expect(child.parentPath).toBe("/");
      expect(child.path.startsWith("/")).toBe(true);
      expect(child.path).toBe(`/${child.name}`);
    }
  });
});

describe("listChildren", () => {
  it("returns the five top-level favourites", () => {
    expect(listChildren(initialMockFs)).toHaveLength(5);
  });

  it("returns an empty array for files", () => {
    const welcome = getNodeByPath(initialMockFs, "/Documents/welcome.txt");
    expect(welcome?.kind).toBe("file");
    if (welcome?.kind === "file") {
      expect(listChildren(welcome)).toEqual([]);
    }
  });

  it("returns the nested Work folder for /Documents", () => {
    const children = listChildren(documentsFolder());
    const work = children.find((c) => c.name === "Work");
    expect(work).toBeDefined();
    expect(work?.kind).toBe("folder");
  });
});

describe("getNodeByPath", () => {
  it("returns the root for '/'", () => {
    expect(getNodeByPath(initialMockFs, "/")).toBe(initialMockFs);
  });

  it("resolves top-level folders", () => {
    const desktop = getNodeByPath(initialMockFs, "/Desktop");
    expect(desktop?.name).toBe("Desktop");
    expect(desktop?.kind).toBe("folder");
  });

  it("resolves a file inside Documents", () => {
    const node = getNodeByPath(initialMockFs, "/Documents/welcome.txt");
    expect(node).toBeDefined();
    expect(node?.kind).toBe("file");
    if (node?.kind === "file") {
      expect(node.content.kind).toBe("text");
      expect(node.name).toBe("welcome.txt");
    }
  });

  it("resolves a nested file inside Documents/Work", () => {
    const node = getNodeByPath(initialMockFs, "/Documents/Work/spec.md");
    expect(node).toBeDefined();
    expect(node?.kind).toBe("file");
    if (node?.kind === "file") {
      expect(node.content.kind).toBe("text");
      if (node.content.kind === "text") {
        expect(node.content.text).toContain("Finder Spec");
      }
    }
  });

  it("resolves an Info.plist inside an .app bundle", () => {
    const plist = getNodeByPath(
      initialMockFs,
      "/Applications/Safari.app/Info.plist"
    );
    expect(plist).toBeDefined();
    expect(plist?.kind).toBe("file");
    if (plist?.kind === "file") {
      expect(plist.content.kind).toBe("text");
    }
  });

  it("resolves an image file by path", () => {
    const cat = getNodeByPath(initialMockFs, "/Pictures/cat.png");
    expect(cat).toBeDefined();
    expect(cat?.kind).toBe("file");
    if (cat?.kind === "file" && cat.content.kind === "image") {
      expect(cat.content.src).toMatch(/^https?:\/\//);
    } else {
      throw new Error("expected /Pictures/cat.png to be an image file");
    }
  });

  it("returns undefined for an unknown path", () => {
    expect(getNodeByPath(initialMockFs, "/Documents/does-not-exist.txt")).toBeUndefined();
  });

  it("returns undefined when called on a file (no descent possible)", () => {
    const file = getNodeByPath(initialMockFs, "/Documents/welcome.txt");
    expect(getNodeByPath(file!, "/anything")).toBeUndefined();
  });

  it("is case-sensitive", () => {
    expect(getNodeByPath(initialMockFs, "/documents")).toBeUndefined();
    expect(getNodeByPath(initialMockFs, "/Desktop")).toBeDefined();
  });
});

describe("getParentPath", () => {
  it("returns null for the root path", () => {
    expect(getParentPath("/")).toBeNull();
    expect(getParentPath("")).toBeNull();
  });

  it("returns '/' for a single-segment path", () => {
    expect(getParentPath("/Documents")).toBe("/");
  });

  it("returns the parent folder for nested paths", () => {
    expect(getParentPath("/Documents/welcome.txt")).toBe("/Documents");
    expect(getParentPath("/Documents/Work/spec.md")).toBe("/Documents/Work");
  });
});

describe("getFileName", () => {
  it("returns the last path segment", () => {
    expect(getFileName("/Documents/welcome.txt")).toBe("welcome.txt");
    expect(getFileName("/Applications/Safari.app")).toBe("Safari.app");
  });

  it("returns '' for the root", () => {
    expect(getFileName("/")).toBe("");
    expect(getFileName("")).toBe("");
  });
});

describe("joinPath", () => {
  it("joins two segments with a single slash", () => {
    expect(joinPath("/Documents", "welcome.txt")).toBe("/Documents/welcome.txt");
  });

  it("treats '/' and '' as the root", () => {
    expect(joinPath("/", "Desktop")).toBe("/Desktop");
    expect(joinPath("", "Desktop")).toBe("/Desktop");
  });

  it("does not duplicate trailing slashes", () => {
    expect(joinPath("/Documents/", "welcome.txt")).toBe("/Documents/welcome.txt");
  });

  it("rejects empty names", () => {
    expect(() => joinPath("/Documents", "")).toThrow();
  });

  it("rejects names containing '/'", () => {
    expect(() => joinPath("/Documents", "foo/bar")).toThrow();
  });
});

describe("splitPath", () => {
  it("returns [] for the root and empty strings", () => {
    expect(splitPath("/")).toEqual([]);
    expect(splitPath("")).toEqual([]);
  });

  it("splits absolute paths into segments", () => {
    expect(splitPath("/Documents/Work/spec.md")).toEqual([
      "Documents",
      "Work",
      "spec.md",
    ]);
  });

  it("tolerates trailing slashes", () => {
    expect(splitPath("/Documents/")).toEqual(["Documents"]);
  });
});

describe("type guards (isFile / isFolder)", () => {
  it("isFile matches files and excludes folders", () => {
    const welcome = getNodeByPath(initialMockFs, "/Documents/welcome.txt")!;
    expect(isFile(welcome)).toBe(true);
    expect(isFolder(welcome)).toBe(false);

    const docs = documentsFolder();
    expect(isFolder(docs)).toBe(true);
    expect(isFile(docs)).toBe(false);
  });
});

describe("type guards (isImageFile / isTextFile)", () => {
  it("classifies text and image files correctly", () => {
    const welcome = getNodeByPath(
      initialMockFs,
      "/Documents/welcome.txt"
    )! as FsFile;
    const cat = getNodeByPath(initialMockFs, "/Pictures/cat.png")! as FsFile;

    expect(isTextFile(welcome)).toBe(true);
    expect(isImageFile(welcome)).toBe(false);

    expect(isImageFile(cat)).toBe(true);
    expect(isTextFile(cat)).toBe(false);
  });
});

describe("isTextPath / isImagePath", () => {
  it("returns true for matching content kinds", () => {
    expect(isTextPath(initialMockFs, "/Documents/welcome.txt")).toBe(true);
    expect(isImagePath(initialMockFs, "/Pictures/cat.png")).toBe(true);
  });

  it("returns false for the opposite content kind", () => {
    expect(isImagePath(initialMockFs, "/Documents/welcome.txt")).toBe(false);
    expect(isTextPath(initialMockFs, "/Pictures/cat.png")).toBe(false);
  });

  it("returns false for folder paths and unknown paths", () => {
    expect(isTextPath(initialMockFs, "/Documents")).toBe(false);
    expect(isImagePath(initialMockFs, "/Documents")).toBe(false);
    expect(isTextPath(initialMockFs, "/no/such/path.txt")).toBe(false);
    expect(isImagePath(initialMockFs, "/no/such/path.png")).toBe(false);
  });
});

describe("getFileIcon", () => {
  it("returns a drive icon for the root", () => {
    expect(getFileIcon("/")).toBe("💾");
  });

  it("maps text extensions to document-style icons", () => {
    expect(getFileIcon("/Documents/welcome.txt")).toBe("📄");
    expect(getFileIcon("/Documents/Work/spec.md")).toBe("📝");
  });

  it("maps image extensions to image icons", () => {
    expect(getFileIcon("/Pictures/cat.png")).toBe("🖼️");
    expect(getFileIcon("/Pictures/beach.jpg")).toBe("🖼️");
    expect(getFileIcon("/Desktop/wallpaper.heic")).toBe("🖼️");
  });

  it("maps archive / disk extensions to their own icons", () => {
    expect(getFileIcon("/Downloads/archive.zip")).toBe("🗜️");
    expect(getFileIcon("/Downloads/installer.dmg")).toBe("💿");
  });

  it("always renders .app bundles with the application icon", () => {
    expect(getFileIcon("/Applications/Safari.app")).toBe("🧩");
    expect(getFileIcon("/Applications/Mail.app")).toBe("🧩");
  });

  it("maps folder names to their customised icons", () => {
    expect(getFileIcon("/Desktop")).toBe("🖥️");
    expect(getFileIcon("/Documents")).toBe("📚");
    expect(getFileIcon("/Downloads")).toBe("📥");
    expect(getFileIcon("/Pictures")).toBe("🖼️");
    expect(getFileIcon("/Applications")).toBe("🧩");
  });

  it("falls back to the default icons for unknown extensions and folders", () => {
    expect(getFileIcon("/foo/notes.rtf")).toBe("📄");
    expect(getFileIcon("/foo")).toBe("📁");
  });

  it("is case-insensitive on file extensions", () => {
    expect(getFileIcon("/Pictures/CAT.PNG")).toBe("🖼️");
    expect(getFileIcon("/Documents/WELCOME.TXT")).toBe("📄");
  });
});

describe("cloneFsItem", () => {
  it("returns a deeply-equal copy", () => {
    const clone = cloneFsItem(initialMockFs);
    expect(clone).toEqual(initialMockFs);
  });

  it("returns a structurally-independent object", () => {
    const clone = cloneFsItem(initialMockFs);
    expect(clone).not.toBe(initialMockFs);
    expect(clone.children).not.toBe(initialMockFs.children);

    // Mutating the clone must not affect the original.
    const clonedDocs = clone.children.find((c) => c.name === "Documents");
    expect(clonedDocs).toBeDefined();
    if (clonedDocs) {
      (clonedDocs as { name: string }).name = "Mutated";
    }
    const docsInOriginal = listChildren(initialMockFs).find(
      (c) => c.name === "Documents"
    );
    expect(docsInOriginal).toBeDefined();
  });
});

describe("constants", () => {
  it("exposes ROOT_FOLDER_NAME as 'Macintosh HD'", () => {
    expect(ROOT_FOLDER_NAME).toBe("Macintosh HD");
  });

  it("exposes the five top-level favourites in canonical order", () => {
    expect(TOP_LEVEL_FAVORITES).toEqual([
      "Desktop",
      "Documents",
      "Downloads",
      "Pictures",
      "Applications",
    ]);
  });
});

/**
 * Recursive helpers used by the deep-reachability and breadth tests
 * below. Kept local to the test file so we don't leak implementation
 * helpers into the production module.
 */
function walk(node: FsItem, visit: (n: FsItem) => void): void {
  visit(node);
  if (node.kind === "folder") {
    for (const child of node.children) walk(child, visit);
  }
}

function collectAll(node: FsItem): FsItem[] {
  const out: FsItem[] = [];
  walk(node, (n) => out.push(n));
  return out;
}

function collectFiles(node: FsItem): FsFile[] {
  return collectAll(node).filter((n): n is FsFile => n.kind === "file");
}

describe("tree reachability", () => {
  it("contains exactly one root node across the full traversal", () => {
    const all = collectAll(initialMockFs);
    const roots = all.filter((n) => n.parentPath === null);
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBe(initialMockFs);
  });

  it("every node other than root has a non-null parentPath", () => {
    const all = collectAll(initialMockFs);
    for (const node of all) {
      if (node === initialMockFs) continue;
      expect(node.parentPath).not.toBeNull();
      // The parent must exist in the tree, otherwise we have an
      // orphan that getNodeByPath could never resolve through.
      const parent = getNodeByPath(initialMockFs, node.parentPath!);
      expect(parent).toBeDefined();
      if (parent) {
        expect(parent.kind).toBe("folder");
        const childIds = listChildren(parent).map((c) => c.id);
        expect(childIds).toContain(node.id);
      }
    }
  });

  it("every file in the tree resolves via getNodeByPath using its own path", () => {
    const files = collectFiles(initialMockFs);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const looked = getNodeByPath(initialMockFs, file.path);
      expect(looked).toBe(file);
    }
  });

  it("every folder in the tree resolves via getNodeByPath using its own path", () => {
    const all = collectAll(initialMockFs).filter((n) => n.kind === "folder");
    for (const folder of all) {
      expect(getNodeByPath(initialMockFs, folder.path)).toBe(folder);
    }
  });

  it("every id is unique across the tree (stable React keys)", () => {
    const all = collectAll(initialMockFs);
    const ids = new Set<string>();
    for (const node of all) {
      expect(ids.has(node.id)).toBe(false);
      ids.add(node.id);
    }
    expect(ids.size).toBe(all.length);
  });
});

describe("content distribution", () => {
  it("contains a healthy mix of text and image files", () => {
    const files = collectFiles(initialMockFs);
    const textFiles = files.filter((f) => f.content.kind === "text");
    const imageFiles = files.filter((f) => f.content.kind === "image");
    expect(textFiles.length).toBeGreaterThan(0);
    expect(imageFiles.length).toBeGreaterThan(0);
    // Every file must be classified as exactly one of the two.
    expect(textFiles.length + imageFiles.length).toBe(files.length);
  });

  it("every image file has a non-empty src", () => {
    const images = collectFiles(initialMockFs).filter(
      (f): f is FsFile & { content: { kind: "image"; src: string; alt?: string } } =>
        f.content.kind === "image"
    );
    for (const img of images) {
      expect(img.content.src.length).toBeGreaterThan(0);
    }
  });

  it("every text file has non-empty text content", () => {
    const texts = collectFiles(initialMockFs).filter(
      (f): f is FsFile & { content: { kind: "text"; text: string } } =>
        f.content.kind === "text"
    );
    for (const t of texts) {
      expect(t.content.text.length).toBeGreaterThan(0);
    }
  });

  it("preserves multi-line text content exactly (no trimming/normalisation)", () => {
    const node = getNodeByPath(
      initialMockFs,
      "/Documents/report.txt"
    )! as FsFile;
    expect(node.content.kind).toBe("text");
    if (node.content.kind === "text") {
      expect(node.content.text).toBe(
        [
          "Quarterly Report",
          "================",
          "",
          "Revenue: $1.2M",
          "Customers: 4,318",
          "Highlights: macOS Tahoe launch went smoothly.",
        ].join("\n")
      );
    }
  });
});

describe("application bundle layout", () => {
  it("every .app folder under /Applications contains an Info.plist text file", () => {
    const applications = getNodeByPath(initialMockFs, "/Applications");
    expect(applications?.kind).toBe("folder");
    if (!applications || applications.kind !== "folder") return;

    for (const app of applications.children) {
      expect(app.kind).toBe("folder");
      expect(app.name.endsWith(".app")).toBe(true);
      const plist = getNodeByPath(initialMockFs, `${app.path}/Info.plist`);
      expect(plist).toBeDefined();
      if (plist?.kind === "file") {
        expect(plist.content.kind).toBe("text");
        if (plist.content.kind === "text") {
          expect(plist.content.text).toContain("CFBundleName");
          expect(plist.content.text).toContain(app.name.replace(".app", ""));
        }
      }
    }
  });

  it("renders .app folders with the application icon", () => {
    expect(getFileIcon("/Applications/Safari.app")).toBe("🧩");
    expect(getFileIcon("/Applications/Mail.app")).toBe("🧩");
    expect(getFileIcon("/Applications/Notes.app")).toBe("🧩");
  });
});

describe("Documents/Work nested folder", () => {
  it("is reachable via nested path traversal", () => {
    const work = getNodeByPath(initialMockFs, "/Documents/Work");
    expect(work).toBeDefined();
    expect(work?.kind).toBe("folder");
    expect(work?.parentPath).toBe("/Documents");
  });

  it("lists its files (spec.md and ideas.txt)", () => {
    const work = getNodeByPath(initialMockFs, "/Documents/Work")!;
    const names = listChildren(work).map((c) => c.name);
    expect(names).toContain("spec.md");
    expect(names).toContain("ideas.txt");
  });

  it("renders the Work folder with the briefcase icon", () => {
    expect(getFileIcon("/Documents/Work")).toBe("💼");
  });

  it("renders nested text files with the matching icon", () => {
    expect(getFileIcon("/Documents/Work/spec.md")).toBe("📝");
    expect(getFileIcon("/Documents/Work/ideas.txt")).toBe("📄");
  });
});

describe("Pictures folder", () => {
  it("contains three image files and one text file", () => {
    const pictures = getNodeByPath(initialMockFs, "/Pictures")!;
    const children = listChildren(pictures);
    const images = children.filter((c) => c.kind === "file" && c.content.kind === "image");
    const texts = children.filter((c) => c.kind === "file" && c.content.kind === "text");
    expect(images).toHaveLength(3);
    expect(texts).toHaveLength(1);
  });

  it("uses the 🖼️ icon for each image regardless of extension", () => {
    expect(getFileIcon("/Pictures/beach.jpg")).toBe("🖼️");
    expect(getFileIcon("/Pictures/mountain.png")).toBe("🖼️");
    expect(getFileIcon("/Pictures/cat.png")).toBe("🖼️");
  });
});

describe("Downloads folder", () => {
  it("contains the expected archive / disk placeholders", () => {
    const downloads = getNodeByPath(initialMockFs, "/Downloads")!;
    const names = listChildren(downloads).map((c) => c.name);
    expect(names).toContain("installer.dmg");
    expect(names).toContain("archive.zip");
    expect(names).toContain("holiday.jpg");
  });

  it("renders archive icons distinctly", () => {
    expect(getFileIcon("/Downloads/archive.zip")).toBe("🗜️");
    expect(getFileIcon("/Downloads/installer.dmg")).toBe("💿");
  });
});

describe("Desktop folder", () => {
  it("contains both text and image files", () => {
    const desktop = getNodeByPath(initialMockFs, "/Desktop")!;
    const kinds = listChildren(desktop).map((c) => {
      if (c.kind !== "file") return c.kind;
      return c.content.kind;
    });
    expect(kinds).toContain("text");
    expect(kinds).toContain("image");
  });

  it("renders the Desktop folder with the desktop emoji", () => {
    expect(getFileIcon("/Desktop")).toBe("🖥️");
  });
});

describe("Documents folder", () => {
  it("contains both files and the nested Work folder", () => {
    const docs = getNodeByPath(initialMockFs, "/Documents")!;
    const children = listChildren(docs);
    const files = children.filter((c) => c.kind === "file");
    const folders = children.filter((c) => c.kind === "folder");
    expect(files.length).toBeGreaterThan(0);
    expect(folders).toHaveLength(1);
    expect(folders[0]?.name).toBe("Work");
  });

  it("renders the Documents folder with the books emoji", () => {
    expect(getFileIcon("/Documents")).toBe("📚");
  });

  it("renders to-do markdown files with the notes emoji", () => {
    expect(getFileIcon("/Documents/todo.md")).toBe("📝");
  });
});

describe("icon extension coverage", () => {
  it("handles a broad set of known extensions", () => {
    const cases: Array<[string, string]> = [
      ["/foo/a.json", "🧾"],
      ["/foo/a.js", "📜"],
      ["/foo/a.ts", "📜"],
      ["/foo/a.tsx", "📜"],
      ["/foo/a.css", "🎨"],
      ["/foo/a.html", "🌐"],
      ["/foo/a.gif", "🖼️"],
      ["/foo/a.webp", "🖼️"],
      ["/foo/a.pdf", "📕"],
      ["/foo/a.plist", "⚙️"],
    ];
    for (const [path, expected] of cases) {
      expect(getFileIcon(path)).toBe(expected);
    }
  });

  it("falls back to 📄 for unknown extensions", () => {
    expect(getFileIcon("/foo/notes.rtf")).toBe("📄");
    expect(getFileIcon("/foo/data.csv")).toBe("📄");
  });

  it("treats trailing-dot names as no extension (folder icon)", () => {
    expect(getFileIcon("/foo/strange.")).toBe("📁");
  });

  it("treats dotfiles as having no extension (folder fallback)", () => {
    // `.bashrc` has no extension after the leading dot, so the helper
    // falls through to the folder path and returns the default 📁.
    expect(getFileIcon("/foo/.bashrc")).toBe("📁");
  });
});

describe("path consistency", () => {
  it("every folder's path matches joinPath(parent.path, folder.name)", () => {
    const all = collectAll(initialMockFs).filter((n) => n.kind === "folder");
    for (const folder of all) {
      // The root node is a documented exception: its display name
      // ("Macintosh HD") is a label, not a path segment, so its
      // path is the literal "/" rather than "/Macintosh HD". This
      // matches macOS Finder's behaviour.
      if (folder.parentPath === null) {
        expect(folder.path).toBe("/");
        continue;
      }
      expect(folder.path).toBe(joinPath(folder.parentPath, folder.name));
    }
  });

  it("every file's path matches joinPath(parent.path, file.name)", () => {
    const files = collectFiles(initialMockFs);
    for (const file of files) {
      expect(file.path).toBe(joinPath(file.parentPath ?? "", file.name));
    }
  });

  it("listChildren returns paths that all share the folder's path as prefix", () => {
    const folders = collectAll(initialMockFs).filter((n) => n.kind === "folder");
    for (const folder of folders) {
      for (const child of listChildren(folder)) {
        // child.parentPath should match the folder's path. We use
        // ! because every non-root folder has a non-null parentPath
        // (verified by the tree-reachability suite above).
        expect(child.parentPath).toBe(folder.path);
        expect(child.path.startsWith(folder.path)).toBe(true);
      }
    }
  });
});
