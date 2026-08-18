import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import Photos from "./Photos";
import {
  PHOTO_ORDER,
  getPhotoById,
  initialMockPhotos,
} from "./mockPhotos";

/**
 * Scope element lookups to the Photos grid container so other
 * elements (toolbar, detail panel) cannot leak into the matchers.
 */
function getGrid(): HTMLElement {
  return screen.getByTestId("photos-grid");
}

/**
 * Scope element lookups to the detail panel container.
 */
function getDetailPanel(): HTMLElement {
  return screen.getByTestId("photos-detail-panel");
}

describe("Photos", () => {
  it("renders the root container and toolbar on first paint", () => {
    render(<Photos />);
    expect(screen.getByTestId("photos")).toBeInTheDocument();
    expect(screen.getByTestId("photos-toolbar")).toBeInTheDocument();
  });

  it("renders one thumbnail per photo in the seed dataset", () => {
    render(<Photos />);
    const grid = getGrid();
    const cells = within(grid).getAllByTestId(/^photos-cell-/);
    expect(cells).toHaveLength(initialMockPhotos.length);
    // Sanity: the seed dataset should be non-empty so the grid check
    // above actually exercises the rendering path.
    expect(initialMockPhotos.length).toBeGreaterThan(0);
  });

  it("renders every seed photo id exactly once in the grid", () => {
    render(<Photos />);
    const grid = getGrid();
    for (const photo of initialMockPhotos) {
      expect(
        within(grid).getByTestId(`photos-cell-${photo.id}`)
      ).toBeInTheDocument();
    }
    expect(PHOTO_ORDER.length).toBe(initialMockPhotos.length);
  });

  it("shows the title as the caption beneath every thumbnail", () => {
    render(<Photos />);
    const grid = getGrid();
    for (const photo of initialMockPhotos) {
      const caption = within(grid).getByTestId(
        `photos-caption-${photo.id}`
      );
      expect(caption.textContent).toBe(photo.title);
    }
  });

  it("renders the toolbar count matching the number of photos", () => {
    render(<Photos />);
    const toolbarCount = screen.getByTestId("photos-toolbar-count");
    expect(toolbarCount.getAttribute("data-count")).toBe(
      `${initialMockPhotos.length}`
    );
    expect(toolbarCount.textContent).toBe(
      `${initialMockPhotos.length} photos`
    );
  });

  it("uses singular 'photo' when exactly one photo is provided", () => {
    const single = [initialMockPhotos[0]!];
    render(<Photos initialPhotos={single} />);
    const toolbarCount = screen.getByTestId("photos-toolbar-count");
    expect(toolbarCount.getAttribute("data-count")).toBe("1");
    expect(toolbarCount.textContent).toBe("1 photo");
  });

  it("renders a placeholder image with the seeded src for each thumbnail", () => {
    render(<Photos />);
    const grid = getGrid();
    for (const photo of initialMockPhotos) {
      const img = within(grid).getByTestId(
        `photos-thumb-image-${photo.id}`
      );
      // jsdom normalizes URL-encoded spaces to "%20"; compare the
      // escaped form so a non-matching path surfaces as a clean
      // failure rather than a noisy encoding diff.
      expect(img.getAttribute("src")).toBe(photo.src);
      expect(img.getAttribute("alt")).toBe(photo.alt);
      expect(img.tagName).toBe("IMG");
    }
  });

  it("starts with no detail view open and no photo selected", () => {
    render(<Photos />);
    const wrapper = screen.getByTestId("photos");
    expect(wrapper.getAttribute("data-detail-open")).toBe("false");
    expect(wrapper.getAttribute("data-selected")).toBe("");
    expect(screen.queryByTestId("photos-detail")).toBeNull();
  });

  it("clicking a thumbnail opens the detail view with that photo's title", () => {
    render(<Photos />);
    const wrapper = screen.getByTestId("photos");
    const grid = getGrid();

    const target = initialMockPhotos[0]!;
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${target.id}`)
    );

    // Wrapper now reflects the open state and the selected id.
    expect(wrapper.getAttribute("data-detail-open")).toBe("true");
    expect(wrapper.getAttribute("data-selected")).toBe(target.id);

    // Detail panel is rendered with the right title and id.
    const panel = getDetailPanel();
    expect(
      within(panel).getByTestId("photos-detail-title").textContent
    ).toBe(target.title);
    expect(
      screen.getByTestId("photos-detail").getAttribute("data-photo-id")
    ).toBe(target.id);

    // Detail image uses the seeded src.
    const detailImage = within(panel).getByTestId("photos-detail-image");
    expect(detailImage.getAttribute("src")).toBe(target.src);
    expect(detailImage.getAttribute("alt")).toBe(target.alt);
  });

  it("renders the detail view's 'Taken' date in a deterministic Month Day, Year format", () => {
    render(<Photos />);
    const grid = getGrid();
    const target = initialMockPhotos[0]!;
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${target.id}`)
    );

    const panel = getDetailPanel();
    const dateNode = within(panel).getByTestId("photos-detail-date");
    expect(dateNode.textContent).toBe("January 12, 2025");
  });

  it("renders the detail view's description when the photo has one", () => {
    render(<Photos />);
    const grid = getGrid();
    const target = initialMockPhotos[0]!;
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${target.id}`)
    );

    const panel = getDetailPanel();
    const description = within(panel).getByTestId(
      "photos-detail-description"
    );
    expect(description.textContent).toBe(target.description ?? "");
  });

  it("clicking the close button returns to the grid", () => {
    render(<Photos />);
    const grid = getGrid();
    const target = initialMockPhotos[0]!;
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${target.id}`)
    );

    const wrapper = screen.getByTestId("photos");
    expect(wrapper.getAttribute("data-detail-open")).toBe("true");

    fireEvent.click(screen.getByTestId("photos-detail-close"));

    expect(wrapper.getAttribute("data-detail-open")).toBe("false");
    expect(wrapper.getAttribute("data-selected")).toBe("");
    expect(screen.queryByTestId("photos-detail")).toBeNull();
    // The grid is still there after closing the detail.
    expect(getGrid()).toBeInTheDocument();
  });

  it("clicking the backdrop closes the detail and returns to the grid", () => {
    render(<Photos />);
    const grid = getGrid();
    const target = initialMockPhotos[0]!;
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${target.id}`)
    );

    const detail = screen.getByTestId("photos-detail");
    const wrapper = screen.getByTestId("photos");
    expect(wrapper.getAttribute("data-detail-open")).toBe("true");

    fireEvent.click(detail);

    expect(wrapper.getAttribute("data-detail-open")).toBe("false");
    expect(screen.queryByTestId("photos-detail")).toBeNull();
  });

  it("clicking inside the detail panel does not close the detail", () => {
    render(<Photos />);
    const grid = getGrid();
    const target = initialMockPhotos[0]!;
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${target.id}`)
    );

    const wrapper = screen.getByTestId("photos");
    const panel = getDetailPanel();
    fireEvent.click(panel);

    expect(wrapper.getAttribute("data-detail-open")).toBe("true");
    expect(wrapper.getAttribute("data-selected")).toBe(target.id);
  });

  it("selecting a different thumbnail updates the detail view in place", () => {
    render(<Photos />);
    const grid = getGrid();
    const first = initialMockPhotos[0]!;
    const second = initialMockPhotos[1]!;

    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${first.id}`)
    );
    const wrapper = screen.getByTestId("photos");
    expect(wrapper.getAttribute("data-selected")).toBe(first.id);

    // Switch to a different thumbnail.
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${second.id}`)
    );

    expect(wrapper.getAttribute("data-selected")).toBe(second.id);
    expect(wrapper.getAttribute("data-detail-open")).toBe("true");
    const panel = getDetailPanel();
    expect(
      within(panel).getByTestId("photos-detail-title").textContent
    ).toBe(second.title);
    expect(
      screen.getByTestId("photos-detail").getAttribute("data-photo-id")
    ).toBe(second.id);
  });

  it("uses initialSelectedId to open into a deterministic detail view", () => {
    const target = initialMockPhotos[2]!;
    render(<Photos initialSelectedId={target.id} />);
    const wrapper = screen.getByTestId("photos");
    expect(wrapper.getAttribute("data-selected")).toBe(target.id);
    expect(wrapper.getAttribute("data-detail-open")).toBe("true");

    const panel = getDetailPanel();
    expect(
      within(panel).getByTestId("photos-detail-title").textContent
    ).toBe(target.title);
  });

  it("ignores an initialSelectedId that does not belong to the seed dataset", () => {
    render(<Photos initialSelectedId="photo-does-not-exist" />);
    const wrapper = screen.getByTestId("photos");
    expect(wrapper.getAttribute("data-selected")).toBe("");
    expect(wrapper.getAttribute("data-detail-open")).toBe("false");
    expect(screen.queryByTestId("photos-detail")).toBeNull();
  });

  it("uses the dataset passed in via initialPhotos for both grid and detail", () => {
    const single = [initialMockPhotos[0]!];
    render(<Photos initialPhotos={single} />);
    const grid = getGrid();
    const cells = within(grid).getAllByTestId(/^photos-cell-/);
    expect(cells).toHaveLength(1);
    expect(
      within(grid).getByTestId(`photos-cell-${single[0]!.id}`)
    ).toBeInTheDocument();
  });

  it("does not mutate the initialMockPhotos constant after open / close interactions", () => {
    // Snapshot the canonical dataset by sampling a few fields.
    const before = initialMockPhotos.map((photo) => ({
      id: photo.id,
      title: photo.title,
      src: photo.src,
    }));

    render(<Photos />);
    const grid = getGrid();
    const target = initialMockPhotos[0]!;
    fireEvent.click(
      within(grid).getByTestId(`photos-thumb-${target.id}`)
    );
    fireEvent.click(screen.getByTestId("photos-detail-close"));

    const after = initialMockPhotos.map((photo) => ({
      id: photo.id,
      title: photo.title,
      src: photo.src,
    }));
    expect(after).toEqual(before);
  });

  it("renders thumbnails in the canonical PHOTO_ORDER", () => {
    render(<Photos />);
    const grid = getGrid();
    const cells = within(grid).getAllByTestId(/^photos-cell-/);
    const renderedOrder = cells.map(
      (cell) => cell.getAttribute("data-photo-id") ?? ""
    );
    expect(renderedOrder).toEqual([...PHOTO_ORDER]);
  });

  it("exposes getPhotoById lookup helper that matches every seed photo", () => {
    for (const photo of initialMockPhotos) {
      const lookedUp = getPhotoById(photo.id);
      expect(lookedUp?.id).toBe(photo.id);
      expect(lookedUp?.title).toBe(photo.title);
    }
  });
});
