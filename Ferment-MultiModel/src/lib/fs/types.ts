/**
 * Type definitions for the in-memory mock filesystem that powers the
 * Finder app. The filesystem is a tree of {@link FsItem} nodes where
 * every node has a stable {@link FsItem.path} (an absolute path that
 * begins with `/`).
 *
 * Files carry a discriminated-union {@link FsFileContent} so the UI
 * layer can tell text from image files without sniffing extensions.
 * That keeps the data model explicit and type-safe: a file is either
 * text or image, never both, and the type system enforces the
 * distinction at every boundary.
 */

/**
 * Discriminator for {@link FsItem}. Only two kinds are supported by
 * the mock filesystem: regular files and folders. The union is closed
 * so the Finder UI can exhaustively switch on `kind` without a
 * default branch.
 */
export type FsKind = "file" | "folder";

/**
 * Common fields shared by every filesystem node. Both files and
 * folders know their absolute path and (where applicable) their
 * parent's absolute path so callers never have to derive either from
 * scratch.
 */
export interface FsBase {
  /** Stable, unique identifier for React keys and selection tracking. */
  readonly id: string;
  /** Last path segment as shown to the user (e.g. "readme.txt"). */
  readonly name: string;
  /** Absolute path beginning with `/` (e.g. "/Documents/readme.txt"). */
  readonly path: string;
  /**
   * Absolute path of the containing folder, or `null` for the root
   * node. Callers can rely on `parentPath === null` as the canonical
   * "this is the root folder" signal.
   */
  readonly parentPath: string | null;
}

/**
 * Base shape for the {@link FsFile.content} discriminated union. The
 * `kind` field doubles as the discriminator and as the runtime check
 * used by {@link isImageFile} / {@link isTextFile}.
 */
export interface FsFileContentBase {
  readonly kind: "text" | "image";
}

/**
 * Text file payload. The `text` field holds the raw file contents as
 * a UTF-8 string. Multi-line strings (e.g. mock README contents) are
 * preserved verbatim including embedded newlines.
 */
export interface FsTextContent extends FsFileContentBase {
  readonly kind: "text";
  readonly text: string;
}

/**
 * Image file payload. `src` is either an external URL (e.g. a
 * `https://via.placeholder.com/...` placeholder) or a `data:` URI for
 * fully-embedded mock assets. `alt` is optional accessibility text.
 */
export interface FsImageContent extends FsFileContentBase {
  readonly kind: "image";
  readonly src: string;
  readonly alt?: string;
}

/**
 * Discriminated union of every supported file content variant. New
 * content kinds (e.g. PDF, audio) should be added here rather than
 * alongside `FsFile` so the type system keeps the content contract
 * closed.
 */
export type FsFileContent = FsTextContent | FsImageContent;

/**
 * A file node. `content` carries the actual payload; the Finder UI
 * inspects `content.kind` (directly or via {@link isImageFile} /
 * {@link isTextFile}) to choose between a text preview and an image
 * preview.
 */
export interface FsFile extends FsBase {
  readonly kind: "file";
  readonly content: FsFileContent;
}

/**
 * A folder node. `children` is the in-order list of contained items;
 * a folder with no children is represented as an empty array (never
 * `undefined` or `null`), which simplifies UI iteration.
 */
export interface FsFolder extends FsBase {
  readonly kind: "folder";
  readonly children: readonly FsItem[];
}

/**
 * Sum type covering every filesystem node. The Finder UI consumes
 * this type for both listing and rendering; the `kind` field is the
 * primary discriminator.
 */
export type FsItem = FsFile | FsFolder;

/**
 * Helper alias for code that wants to accept either a top-level
 * filesystem tree or any folder within it (e.g. recursive helpers).
 */
export type FsNode = FsItem;
