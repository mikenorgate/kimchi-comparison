"use client";

import { useCallback, useMemo, useState } from "react";
import {
  TOP_LEVEL_FAVORITES,
  getFileIcon,
  getNodeByPath,
  initialMockFs,
  listChildren,
  splitPath,
} from "@/lib/fs/mockFs";
import type { FsFile, FsFolder, FsItem } from "@/lib/fs/types";
import FilePreview from "./FilePreview";

/**
 * Finder window content.
 *
 * Renders a three-pane layout reminiscent of macOS Finder:
 *
 *   | sidebar (favorites) | toolbar                            |
 *   |                    | breadcrumb                         |
 *   |                    | file list (icon or list view)      |
 *
 * The component owns its own navigation state (current path, back /
 * forward history, view mode) and accepts an optional `initialPath`
 * prop for deterministic tests. File previews are intentionally out of
 * scope for this step.
 */
export type FinderViewMode = "icon" | "list";

export interface FinderProps {
  /**
   * Absolute path the Finder should open to. Defaults to `/Documents`
   * when omitted so the user (or test) sees a non-empty folder on
   * first paint.
   */
  readonly initialPath?: string;
  /**
   * Optional override for the root filesystem node. Defaults to the
   * shared {@link initialMockFs} tree. Kept as an escape hatch for
   * future steps (e.g. tests that want a smaller fixture) without
   * requiring this step to introduce a more elaborate context.
   */
  readonly root?: FsItem;
  /**
   * Optional callback fired when the user double-clicks a file or
   * single-clicks a folder in the main content area. Step 3 will wire
   * this up to the preview window; for now the component still
   * navigates into folders internally when one is activated so the
   * UI feels alive on its own.
   */
  readonly onOpenItem?: (path: string, kind: "file" | "folder") => void;
}

const DEFAULT_INITIAL_PATH = "/Documents";

/**
 * Returned when the path is missing from the tree so the UI can
 * degrade gracefully rather than crash.
 */
function resolveNode(root: FsItem, path: string): FsItem | undefined {
  if (path === "" || path === "/") return root;
  return getNodeByPath(root, path);
}

/**
 * Split a path into breadcrumb segments paired with the absolute path
 * they refer to. The root segment always renders as "Macintosh HD".
 */
function breadcrumbSegments(
  path: string,
  rootName: string
): readonly { label: string; path: string }[] {
  if (path === "/" || path === "") {
    return [{ label: rootName, path: "/" }];
  }
  const segments = splitPath(path);
  let cursor = "";
  const out: { label: string; path: string }[] = [
    { label: rootName, path: "/" },
  ];
  for (const segment of segments) {
    cursor = cursor === "/" ? `/${segment}` : `${cursor}/${segment}`;
    out.push({ label: segment, path: cursor });
  }
  return out;
}

/**
 * Cheap human-friendly label for a child node based on its `kind` and
 * (for files) the content discriminator. Mirrors what Finder shows in
 * the "Kind" column for files in the mock filesystem.
 */
function describeKind(item: FsItem): string {
  if (item.kind === "folder") return "Folder";
  if (item.content.kind === "text") return "Text Document";
  return "Image";
}

export default function Finder({
  initialPath,
  root = initialMockFs,
  onOpenItem,
}: FinderProps): JSX.Element {
  const rootName = root.name;
  const safeInitial = useMemo(() => {
    const candidate = initialPath ?? DEFAULT_INITIAL_PATH;
    return resolveNode(root, candidate) ? candidate : root.path;
  }, [initialPath, root]);

  const [currentPath, setCurrentPath] = useState<string>(safeInitial);
  const [history, setHistory] = useState<readonly string[]>([safeInitial]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<FinderViewMode>("icon");
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const currentNode = useMemo(
    () => resolveNode(root, currentPath) ?? root,
    [root, currentPath]
  );

  const previewNode = useMemo(
    () => (previewPath ? resolveNode(root, previewPath) : undefined),
    [previewPath, root]
  );

  const closePreview = useCallback(() => {
    setPreviewPath(null);
  }, []);

  const crumbs = useMemo(
    () => breadcrumbSegments(currentPath, rootName),
    [currentPath, rootName]
  );

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const navigateTo = useCallback(
    (nextPath: string) => {
      if (nextPath === currentPath) return;
      const target = resolveNode(root, nextPath);
      if (!target || target.kind !== "folder") return;
      setCurrentPath(target.path);
      // Truncate any "forward" entries beyond the current index, then
      // append the new path. This mirrors how real Finder handles a
      // navigation event triggered after the user has gone back.
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), target.path]);
      setHistoryIndex((idx) => idx + 1);
    },
    [currentPath, historyIndex, root]
  );

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    const nextIndex = historyIndex - 1;
    const nextPath = history[nextIndex];
    if (!nextPath) return;
    setHistoryIndex(nextIndex);
    setCurrentPath(nextPath);
  }, [canGoBack, history, historyIndex]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;
    const nextIndex = historyIndex + 1;
    const nextPath = history[nextIndex];
    if (!nextPath) return;
    setHistoryIndex(nextIndex);
    setCurrentPath(nextPath);
  }, [canGoForward, history, historyIndex]);

  const handleCrumbClick = useCallback(
    (path: string) => {
      navigateTo(path);
    },
    [navigateTo]
  );

  const handleFavoriteClick = useCallback(
    (name: string) => {
      const target = listChildren(root).find((c) => c.name === name);
      if (target && target.kind === "folder") {
        navigateTo(target.path);
      }
    },
    [navigateTo, root]
  );

  const handleItemActivate = useCallback(
    (item: FsItem) => {
      onOpenItem?.(item.path, item.kind);
      if (item.kind === "folder") {
        navigateTo(item.path);
      } else {
        // "Activating" a file (single click) opens the preview pane
        // in addition to notifying the consumer via onOpenItem.
        setPreviewPath(item.path);
      }
    },
    [navigateTo, onOpenItem]
  );

  const handleItemDoubleClick = useCallback(
    (item: FsItem) => {
      onOpenItem?.(item.path, item.kind);
      if (item.kind === "folder") {
        navigateTo(item.path);
      } else {
        setPreviewPath(item.path);
      }
    },
    [navigateTo, onOpenItem]
  );

  return (
    <div
      className="finder"
      data-testid="finder"
      data-current-path={currentPath}
      data-view-mode={viewMode}
    >
      <aside
        className="finder__sidebar"
        data-testid="finder-sidebar"
        aria-label="Favorites"
      >
        <h2 className="finder__sidebar-title">Favorites</h2>
        <ul className="finder__sidebar-list">
          {TOP_LEVEL_FAVORITES.map((name) => {
            const icon = getFileIcon(`/${name}`);
            const isActive = listChildren(root).some(
              (c) => c.name === name && c.path === currentPath
            );
            return (
              <li key={name}>
                <button
                  type="button"
                  className={
                    "finder__sidebar-item" +
                    (isActive ? " finder__sidebar-item--active" : "")
                  }
                  data-testid={`finder-favorite-${name}`}
                  data-favorite={name}
                  onClick={() => handleFavoriteClick(name)}
                >
                  <span className="finder__sidebar-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="finder__sidebar-label">{name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="finder__main">
        <div className="finder__toolbar" data-testid="finder-toolbar">
          <button
            type="button"
            className="finder__toolbar-button"
            data-testid="finder-back"
            aria-label="Go back"
            disabled={!canGoBack}
            onClick={goBack}
          >
            {"\u2039"}
          </button>
          <button
            type="button"
            className="finder__toolbar-button"
            data-testid="finder-forward"
            aria-label="Go forward"
            disabled={!canGoForward}
            onClick={goForward}
          >
            {"\u203A"}
          </button>
          <div
            className="finder__toolbar-spacer"
            aria-hidden="true"
          />
          <div
            className="finder__view-toggle"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              className={
                "finder__toolbar-button" +
                (viewMode === "icon" ? " finder__toolbar-button--active" : "")
              }
              data-testid="finder-view-icon"
              aria-label="Icon view"
              aria-pressed={viewMode === "icon"}
              onClick={() => setViewMode("icon")}
            >
              {"\u25A6"}
            </button>
            <button
              type="button"
              className={
                "finder__toolbar-button" +
                (viewMode === "list" ? " finder__toolbar-button--active" : "")
              }
              data-testid="finder-view-list"
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              {"\u2630"}
            </button>
          </div>
        </div>

        <nav
          className="finder__breadcrumb"
          data-testid="finder-breadcrumb"
          aria-label="Current folder"
        >
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span
                key={crumb.path}
                className="finder__breadcrumb-segment"
                data-testid="finder-crumb"
                data-crumb-path={crumb.path}
              >
                <button
                  type="button"
                  className={
                    "finder__breadcrumb-button" +
                    (isLast ? " finder__breadcrumb-button--current" : "")
                  }
                  disabled={isLast}
                  onClick={() => handleCrumbClick(crumb.path)}
                >
                  {crumb.label}
                </button>
                {!isLast ? (
                  <span className="finder__breadcrumb-sep" aria-hidden="true">
                    {"\u203A"}
                  </span>
                ) : null}
              </span>
            );
          })}
        </nav>

        {currentNode.kind === "folder" ? (
          <FolderContents
            folder={currentNode}
            viewMode={viewMode}
            onActivate={handleItemActivate}
            onDoubleActivate={handleItemDoubleClick}
          />
        ) : (
          <div
            className="finder__empty"
            data-testid="finder-empty"
            role="status"
          >
            Select a folder from the sidebar.
          </div>
        )}
      </section>

      {previewNode && previewNode.kind === "file" ? (
        <FilePreview file={previewNode} onClose={closePreview} />
      ) : null}
    </div>
  );
}

interface FolderContentsProps {
  readonly folder: FsFolder;
  readonly viewMode: FinderViewMode;
  readonly onActivate: (item: FsItem) => void;
  readonly onDoubleActivate: (item: FsItem) => void;
}

/**
 * Body of the Finder: either an icon grid or a list table. Both
 * variants surface the same data and test ids (`finder-row`,
 * `finder-item-name`) so the test suite can pick the most ergonomic
 * selector regardless of view mode.
 */
function FolderContents({
  folder,
  viewMode,
  onActivate,
  onDoubleActivate,
}: FolderContentsProps): JSX.Element {
  const children = listChildren(folder);
  if (children.length === 0) {
    return (
      <div className="finder__empty" data-testid="finder-empty" role="status">
        This folder is empty.
      </div>
    );
  }
  if (viewMode === "icon") {
    return (
      <ul
        className="finder__icon-grid"
        data-testid="finder-list"
        data-folder={folder.path}
        aria-label={`Contents of ${folder.name}`}
      >
        {children.map((child) => (
          <li
            key={child.id}
            className="finder__icon-cell"
            data-testid="finder-row"
            data-kind={child.kind}
            data-path={child.path}
          >
            <button
              type="button"
              className="finder__icon-button"
              onClick={() => onActivate(child)}
              onDoubleClick={() => onDoubleActivate(child)}
            >
              <span className="finder__icon-glyph" aria-hidden="true">
                {getFileIcon(child.path)}
              </span>
              <span className="finder__icon-name">{child.name}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <table
      className="finder__table"
      data-testid="finder-list"
      data-folder={folder.path}
      aria-label={`Contents of ${folder.name}`}
    >
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Kind</th>
        </tr>
      </thead>
      <tbody>
        {children.map((child) => (
          <tr
            key={child.id}
            className="finder__table-row"
            data-testid="finder-row"
            data-kind={child.kind}
            data-path={child.path}
          >
            <td>
              <button
                type="button"
                className="finder__table-button"
                onClick={() => onActivate(child)}
                onDoubleClick={() => onDoubleActivate(child)}
              >
                <span className="finder__table-glyph" aria-hidden="true">
                  {getFileIcon(child.path)}
                </span>
                <span className="finder__item-name">{child.name}</span>
              </button>
            </td>
            <td className="finder__item-kind">{describeKind(child)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Re-export the FsFile type so consumers can write `Finder.FsFile` if
// they need a type-level companion to the component. Keeps the public
// surface area colocated.
export type { FsFile };
