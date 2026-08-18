"use client";

import type { FsFile } from "@/lib/fs/types";

/**
 * Inline preview pane used by {@link Finder} to display the contents
 * of a file once the user double-clicks it. The pane renders either
 * the file's text content in a `<pre>` block or the image at its
 * `src` URL in an `<img>`, with no special handling for other file
 * kinds (the mock filesystem currently only ships text and image
 * content; the third branch exists as a safety net so the component
 * never renders nothing).
 *
 * The preview is a pure presentational component: it owns no state
 * and is fully driven by the `file` prop. The parent (Finder) is
 * responsible for clearing its `previewPath` when `onClose` fires.
 */
export interface FilePreviewProps {
  /**
   * The file whose contents should be displayed. The component does
   * not perform any filesystem lookup; the caller must resolve the
   * path to an {@link FsFile} first and only render this component
   * when the lookup succeeds.
   */
  readonly file: FsFile;
  /**
   * Invoked when the user clicks the close button. Finder uses this
   * to clear its `previewPath` and unmount the preview pane.
   */
  readonly onClose: () => void;
}

/**
 * Render the preview header (filename + close button) and the body
 * (text or image). Both the header and the body expose stable test
 * ids so the Finder test suite can assert against them without
 * scraping visible text.
 */
export default function FilePreview({
  file,
  onClose,
}: FilePreviewProps): JSX.Element {
  const { content } = file;
  return (
    <aside
      className="file-preview"
      data-testid="file-preview"
      data-file-path={file.path}
      data-file-kind={content.kind}
      aria-label={`Preview of ${file.name}`}
    >
      <header className="file-preview__header" data-testid="file-preview-header">
        <span className="file-preview__name" data-testid="file-preview-name">
          {file.name}
        </span>
        <button
          type="button"
          className="file-preview__close"
          data-testid="file-preview-close"
          aria-label="Close preview"
          onClick={onClose}
        >
          {"\u2715"}
        </button>
      </header>
      <div className="file-preview__body" data-testid="file-preview-body">
        {content.kind === "text" ? (
          <pre
            className="file-preview__text"
            data-testid="file-preview-text"
            data-text-source={file.path}
          >
            {content.text}
          </pre>
        ) : (
          <img
            className="file-preview__image"
            data-testid="file-preview-image"
            src={content.src}
            alt={content.alt ?? file.name}
          />
        )}
      </div>
    </aside>
  );
}
