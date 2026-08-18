import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Finder from "./Finder";
import {
  TOP_LEVEL_FAVORITES,
  getNodeByPath,
  initialMockFs,
  listChildren,
} from "@/lib/fs/mockFs";

/**
 * Helper: scope row queries to the Finder's content list so other
 * buttons (e.g. sidebar favorites) cannot leak into the matcher.
 */
function getContentList(): HTMLElement {
  return screen.getByTestId("finder-list");
}

describe("Finder", () => {
  it("renders the three main regions: sidebar, breadcrumb, and file list", () => {
    render(<Finder initialPath="/Documents" />);
    expect(screen.getByTestId("finder")).toBeInTheDocument();
    expect(screen.getByTestId("finder-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("finder-breadcrumb")).toBeInTheDocument();
    expect(screen.getByTestId("finder-list")).toBeInTheDocument();
  });

  it("renders a toolbar with back, forward, and view-mode toggle buttons", () => {
    render(<Finder initialPath="/Documents" />);
    const toolbar = screen.getByTestId("finder-toolbar");
    expect(toolbar).toBeInTheDocument();
    expect(within(toolbar).getByTestId("finder-back")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("finder-forward")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("finder-view-icon")).toBeInTheDocument();
    expect(within(toolbar).getByTestId("finder-view-list")).toBeInTheDocument();
  });

  it("renders one sidebar favorite button per TOP_LEVEL_FAVORITES entry", () => {
    render(<Finder initialPath="/Documents" />);
    const sidebar = screen.getByTestId("finder-sidebar");
    for (const favorite of TOP_LEVEL_FAVORITES) {
      expect(
        within(sidebar).getByTestId(`finder-favorite-${favorite}`)
      ).toBeInTheDocument();
    }
  });

  it("falls back to the root when initialPath points at an unknown folder", () => {
    render(<Finder initialPath="/no/such/path" />);
    const finder = screen.getByTestId("finder");
    expect(finder.getAttribute("data-current-path")).toBe("/");
  });

  it("opens to initialPath when provided and shows that folder's children", () => {
    render(<Finder initialPath="/Pictures" />);
    const finder = screen.getByTestId("finder");
    expect(finder.getAttribute("data-current-path")).toBe("/Pictures");

    const list = getContentList();
    const pictures = getNodeByPath(initialMockFs, "/Pictures");
    expect(pictures?.kind).toBe("folder");
    if (pictures?.kind === "folder") {
      const expectedNames = listChildren(pictures).map((c) => c.name);
      expect(expectedNames.length).toBeGreaterThan(0);
      for (const name of expectedNames) {
        expect(within(list).getByText(name)).toBeInTheDocument();
      }
    }
  });

  it("uses the documents folder as the default initial path", () => {
    render(<Finder />);
    const finder = screen.getByTestId("finder");
    expect(finder.getAttribute("data-current-path")).toBe("/Documents");
  });

  it("clicking a sidebar favorite navigates to that folder", () => {
    render(<Finder initialPath="/Documents" />);
    const finder = screen.getByTestId("finder");

    const picturesButton = screen.getByTestId("finder-favorite-Pictures");
    fireEvent.click(picturesButton);

    expect(finder.getAttribute("data-current-path")).toBe("/Pictures");

    // The Pictures favorite should now be marked active.
    expect(picturesButton.className).toContain("finder__sidebar-item--active");
  });

  it("flags the active sidebar favorite based on the current path", () => {
    render(<Finder initialPath="/Documents" />);
    const documentsBtn = screen.getByTestId("finder-favorite-Documents");
    const picturesBtn = screen.getByTestId("finder-favorite-Pictures");

    expect(documentsBtn.className).toContain("finder__sidebar-item--active");
    expect(picturesBtn.className).not.toContain(
      "finder__sidebar-item--active"
    );
  });

  it("shows breadcrumb segments for the current path", () => {
    render(<Finder initialPath="/Documents/Work" />);
    const breadcrumb = screen.getByTestId("finder-breadcrumb");
    const crumbs = within(breadcrumb).getAllByTestId("finder-crumb");

    const labels = crumbs.map((c) =>
      c.querySelector("button")?.textContent ?? ""
    );
    expect(labels).toEqual(["Macintosh HD", "Documents", "Work"]);
  });

  it("marks the last breadcrumb segment as the current (non-clickable) one", () => {
    render(<Finder initialPath="/Documents" />);
    const crumbs = within(
      screen.getByTestId("finder-breadcrumb")
    ).getAllByTestId("finder-crumb");
    const last = crumbs[crumbs.length - 1];
    const button = last.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.disabled).toBe(true);
  });

  it("clicking a non-current breadcrumb segment navigates to its path", () => {
    render(<Finder initialPath="/Documents/Work" />);
    const finder = screen.getByTestId("finder");

    const crumbs = within(
      screen.getByTestId("finder-breadcrumb")
    ).getAllByTestId("finder-crumb");

    // The "Documents" crumb is the second one; click it to go up one
    // level.
    const docsCrumb = crumbs.find(
      (c) => c.querySelector("button")?.textContent === "Documents"
    );
    expect(docsCrumb).toBeDefined();
    const docsButton = docsCrumb!.querySelector("button") as HTMLButtonElement;
    fireEvent.click(docsButton);

    expect(finder.getAttribute("data-current-path")).toBe("/Documents");
  });

  it("renders every direct child of the current folder in the file list", () => {
    render(<Finder initialPath="/Documents" />);
    const list = getContentList();

    const documents = getNodeByPath(initialMockFs, "/Documents");
    if (documents?.kind !== "folder") throw new Error("Documents must exist");
    const expectedNames = listChildren(documents).map((c) => c.name);

    const rows = within(list).getAllByTestId("finder-row");
    expect(rows).toHaveLength(expectedNames.length);
    for (const name of expectedNames) {
      expect(within(list).getByText(name)).toBeInTheDocument();
    }
  });

  it("exposes each row's kind and path via data attributes", () => {
    render(<Finder initialPath="/Pictures" />);
    const rows = within(getContentList()).getAllByTestId("finder-row");

    const cats = rows.find((r) => r.getAttribute("data-path") === "/Pictures/cat.png");
    expect(cats).toBeDefined();
    expect(cats!.getAttribute("data-kind")).toBe("file");

    const dataUri = rows.find(
      (r) => r.getAttribute("data-path") === "/Pictures/data-uri.txt"
    );
    expect(dataUri?.getAttribute("data-kind")).toBe("file");
  });

  it("shows the folder's children when navigating into an .app bundle", () => {
    render(<Finder initialPath="/Applications/Safari.app" />);
    const list = getContentList();
    const rows = within(list).getAllByTestId("finder-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.getAttribute("data-path")).toBe(
      "/Applications/Safari.app/Info.plist"
    );
  });

  it("clicking a folder row navigates into that folder", () => {
    render(<Finder initialPath="/Documents" />);
    const finder = screen.getByTestId("finder");

    const list = getContentList();
    const workRow = within(list)
      .getAllByTestId("finder-row")
      .find((r) => r.getAttribute("data-path") === "/Documents/Work");
    expect(workRow).toBeDefined();
    const button = workRow!.querySelector("button") as HTMLButtonElement;
    fireEvent.click(button);

    expect(finder.getAttribute("data-current-path")).toBe("/Documents/Work");

    const newList = getContentList();
    const newNames = within(newList)
      .getAllByTestId("finder-row")
      .map((r) => r.getAttribute("data-path"));
    expect(newNames).toContain("/Documents/Work/spec.md");
    expect(newNames).toContain("/Documents/Work/ideas.txt");
  });

  it("clicking a file row fires onOpenItem without navigating", () => {
    const onOpenItem = vi.fn();
    render(<Finder initialPath="/Documents" onOpenItem={onOpenItem} />);
    const finder = screen.getByTestId("finder");

    const list = getContentList();
    const welcomeRow = within(list)
      .getAllByTestId("finder-row")
      .find(
        (r) => r.getAttribute("data-path") === "/Documents/welcome.txt"
      );
    expect(welcomeRow).toBeDefined();
    fireEvent.click(welcomeRow!.querySelector("button") as HTMLButtonElement);

    expect(onOpenItem).toHaveBeenCalledWith("/Documents/welcome.txt", "file");
    expect(finder.getAttribute("data-current-path")).toBe("/Documents");
  });

  it("back button is disabled at the bottom of the history stack", () => {
    render(<Finder initialPath="/Documents" />);
    const back = screen.getByTestId("finder-back");
    expect(back).toBeDisabled();
  });

  it("back and forward buttons navigate through the visit history", () => {
    render(<Finder initialPath="/Documents" />);
    const finder = screen.getByTestId("finder");
    const back = screen.getByTestId("finder-back");
    const forward = screen.getByTestId("finder-forward");

    // Visit two more folders.
    fireEvent.click(screen.getByTestId("finder-favorite-Pictures"));
    expect(finder.getAttribute("data-current-path")).toBe("/Pictures");
    fireEvent.click(screen.getByTestId("finder-favorite-Downloads"));
    expect(finder.getAttribute("data-current-path")).toBe("/Downloads");

    // Now back twice should land us back on /Documents.
    fireEvent.click(back);
    expect(finder.getAttribute("data-current-path")).toBe("/Pictures");
    fireEvent.click(back);
    expect(finder.getAttribute("data-current-path")).toBe("/Documents");

    // Forward should be enabled now.
    expect(forward).not.toBeDisabled();
    fireEvent.click(forward);
    expect(finder.getAttribute("data-current-path")).toBe("/Pictures");
  });

  it("toggles between icon and list view modes", () => {
    render(<Finder initialPath="/Documents" />);
    const finder = screen.getByTestId("finder");
    expect(finder.getAttribute("data-view-mode")).toBe("icon");

    fireEvent.click(screen.getByTestId("finder-view-list"));
    expect(finder.getAttribute("data-view-mode")).toBe("list");

    // In list mode, a <table> is rendered and the rows are still
    // findable via finder-row.
    const list = getContentList();
    expect(list.tagName).toBe("TABLE");
    expect(within(list).getAllByTestId("finder-row").length).toBeGreaterThan(
      0
    );

    fireEvent.click(screen.getByTestId("finder-view-icon"));
    expect(finder.getAttribute("data-view-mode")).toBe("icon");
    expect(getContentList().tagName).toBe("UL");
  });

  it("uses an accessible label for the file list referencing the current folder", () => {
    render(<Finder initialPath="/Pictures" />);
    const list = getContentList();
    expect(list.getAttribute("aria-label")).toBe("Contents of Pictures");
  });

  // -------------------------------------------------------------------------
  // Step 3: folder navigation via double-click + inline file preview
  // -------------------------------------------------------------------------

  it("double-clicking a folder row navigates into that folder", () => {
    render(<Finder initialPath="/Documents" />);
    const finder = screen.getByTestId("finder");
    expect(finder.getAttribute("data-current-path")).toBe("/Documents");

    const list = getContentList();
    const workRow = within(list)
      .getAllByTestId("finder-row")
      .find((r) => r.getAttribute("data-path") === "/Documents/Work");
    expect(workRow).toBeDefined();
    const button = workRow!.querySelector("button") as HTMLButtonElement;
    fireEvent.doubleClick(button);

    expect(finder.getAttribute("data-current-path")).toBe("/Documents/Work");

    const newList = getContentList();
    const paths = within(newList)
      .getAllByTestId("finder-row")
      .map((r) => r.getAttribute("data-path"));
    expect(paths).toContain("/Documents/Work/spec.md");
    expect(paths).toContain("/Documents/Work/ideas.txt");
  });

  it("double-clicking a text file opens a preview pane with the file contents", () => {
    render(<Finder initialPath="/Documents" />);

    const list = getContentList();
    const welcomeRow = within(list)
      .getAllByTestId("finder-row")
      .find(
        (r) => r.getAttribute("data-path") === "/Documents/welcome.txt"
      );
    expect(welcomeRow).toBeDefined();
    fireEvent.doubleClick(
      welcomeRow!.querySelector("button") as HTMLButtonElement
    );

    const preview = screen.getByTestId("file-preview");
    expect(preview).toBeInTheDocument();
    expect(preview.getAttribute("data-file-path")).toBe(
      "/Documents/welcome.txt"
    );
    expect(preview.getAttribute("data-file-kind")).toBe("text");

    // The filename header should reflect the activated file.
    expect(within(preview).getByTestId("file-preview-name").textContent).toBe(
      "welcome.txt"
    );

    // The full text content should be rendered into a <pre>.
    const textBlock = within(preview).getByTestId("file-preview-text");
    const welcomeNode = getNodeByPath(initialMockFs, "/Documents/welcome.txt");
    expect(welcomeNode?.kind).toBe("file");
    if (welcomeNode?.kind === "file" && welcomeNode.content.kind === "text") {
      expect(textBlock.textContent).toBe(welcomeNode.content.text);
    }
  });

  it("double-clicking an image file opens a preview pane with the image src", () => {
    render(<Finder initialPath="/Pictures" />);

    const list = getContentList();
    const catRow = within(list)
      .getAllByTestId("finder-row")
      .find((r) => r.getAttribute("data-path") === "/Pictures/cat.png");
    expect(catRow).toBeDefined();
    fireEvent.doubleClick(
      catRow!.querySelector("button") as HTMLButtonElement
    );

    const preview = screen.getByTestId("file-preview");
    expect(preview).toBeInTheDocument();
    expect(preview.getAttribute("data-file-path")).toBe("/Pictures/cat.png");
    expect(preview.getAttribute("data-file-kind")).toBe("image");

    const img = within(preview).getByTestId("file-preview-image");
    const catNode = getNodeByPath(initialMockFs, "/Pictures/cat.png");
    expect(catNode?.kind).toBe("file");
    if (catNode?.kind === "file" && catNode.content.kind === "image") {
      expect(img.getAttribute("src")).toBe(catNode.content.src);
    }
    // The <img> tag should always be present (not <pre>) for image previews.
    expect(img.tagName).toBe("IMG");
  });

  it("does not render the preview pane until a file is activated", () => {
    render(<Finder initialPath="/Documents" />);
    expect(screen.queryByTestId("file-preview")).toBeNull();
  });

  it("clicking the preview close button removes the preview pane", () => {
    render(<Finder initialPath="/Documents" />);

    const list = getContentList();
    const welcomeRow = within(list)
      .getAllByTestId("finder-row")
      .find(
        (r) => r.getAttribute("data-path") === "/Documents/welcome.txt"
      );
    expect(welcomeRow).toBeDefined();
    fireEvent.click(
      welcomeRow!.querySelector("button") as HTMLButtonElement
    );

    expect(screen.getByTestId("file-preview")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("file-preview-close"));
    expect(screen.queryByTestId("file-preview")).toBeNull();
  });

  it("single-clicking a text file also opens the preview pane", () => {
    render(<Finder initialPath="/Documents" />);

    const list = getContentList();
    const reportRow = within(list)
      .getAllByTestId("finder-row")
      .find((r) => r.getAttribute("data-path") === "/Documents/report.txt");
    expect(reportRow).toBeDefined();
    fireEvent.click(
      reportRow!.querySelector("button") as HTMLButtonElement
    );

    const preview = screen.getByTestId("file-preview");
    expect(preview.getAttribute("data-file-path")).toBe("/Documents/report.txt");
  });

  it("opening a different file replaces the current preview", () => {
    render(<Finder initialPath="/Documents" />);

    const list = getContentList();
    const welcomeRow = within(list)
      .getAllByTestId("finder-row")
      .find(
        (r) => r.getAttribute("data-path") === "/Documents/welcome.txt"
      );
    fireEvent.click(
      welcomeRow!.querySelector("button") as HTMLButtonElement
    );
    expect(screen.getByTestId("file-preview").getAttribute("data-file-path"))
      .toBe("/Documents/welcome.txt");

    const reportRow = within(list)
      .getAllByTestId("finder-row")
      .find((r) => r.getAttribute("data-path") === "/Documents/report.txt");
    fireEvent.click(
      reportRow!.querySelector("button") as HTMLButtonElement
    );
    expect(screen.getByTestId("file-preview").getAttribute("data-file-path"))
      .toBe("/Documents/report.txt");
  });
});
