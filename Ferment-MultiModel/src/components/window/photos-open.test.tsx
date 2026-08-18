import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Desktop from "@/components/desktop/Desktop";
import { getApp } from "@/lib/apps";
import {
  PHOTO_ORDER,
  initialMockPhotos,
} from "@/components/apps/photos/mockPhotos";

/**
 * Behavioural test for Step 5 of Phase 7: clicking the Photos Dock
 * icon must mount a Photos window whose body is the real Photos UI
 * (toolbar, grid of thumbnails), not the placeholder that
 * {@link src/components/window/WindowManager.tsx} falls back to when
 * an app has no registered component.
 *
 * The Desktop boots with a Finder window seeded by the WindowManager,
 * so the test exercises the same flow a user would to first launch
 * Photos: click the Photos Dock icon and verify the real Photos UI
 * is present inside the window layer.
 */
describe("Photos opens from the Dock", () => {
  it("clicking the Photos Dock icon opens a Photos window with the real Photos UI", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const photosDockButton = within(dock).getByRole("button", {
      name: getApp("photos")?.name ?? "Photos",
    });

    // Before launch, Photos is not running.
    expect(photosDockButton).toHaveAttribute("data-running", "false");

    fireEvent.click(photosDockButton);

    // After launch, the Dock should mark Photos as running.
    expect(photosDockButton).toHaveAttribute("data-running", "true");

    // The window manager must mount a Photos window frame.
    const layer = screen.getByTestId("window-layer");
    const photosContent = within(layer).getByTestId("app-content-photos");

    // Inside that frame, the real Photos component must be present
    // (not the window-manager placeholder body).
    expect(within(photosContent).getByTestId("photos")).toBeInTheDocument();
    expect(
      within(photosContent).queryByTestId("app-placeholder-photos")
    ).not.toBeInTheDocument();

    // The two regions the user expects from the Photos window:
    // toolbar (with library label + photo count) and the responsive grid.
    expect(
      within(photosContent).getByTestId("photos-toolbar")
    ).toBeInTheDocument();
    expect(
      within(photosContent).getByTestId("photos-toolbar-count")
    ).toBeInTheDocument();
    expect(
      within(photosContent).getByTestId("photos-grid")
    ).toBeInTheDocument();
  });

  it("renders one thumbnail per seeded photo in the canonical grid order", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const photosDockButton = within(dock).getByRole("button", {
      name: getApp("photos")?.name ?? "Photos",
    });
    fireEvent.click(photosDockButton);

    const layer = screen.getByTestId("window-layer");
    const photosContent = within(layer).getByTestId("app-content-photos");

    // The toolbar count attribute mirrors the seed dataset length.
    const toolbarCount = within(photosContent).getByTestId(
      "photos-toolbar-count"
    );
    expect(Number(toolbarCount.getAttribute("data-count"))).toBe(
      initialMockPhotos.length
    );

    // Every seeded photo must appear as a clickable thumbnail in the
    // grid; the order on screen matches PHOTO_ORDER. Use a regex that
    // matches only the button (not the nested image element whose
    // testid is `photos-thumb-image-<id>`).
    const grid = within(photosContent).getByTestId("photos-grid");
    const thumbIds = within(grid)
      .getAllByTestId(/^photos-thumb-photo-/)
      .map((node) => node.getAttribute("data-testid"))
      .filter((id): id is string => typeof id === "string")
      .map((id) => id.replace("photos-thumb-", ""));
    expect(thumbIds).toEqual([...PHOTO_ORDER]);
  });

  it("clicking a thumbnail opens the photo detail lightbox with its title and date", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const photosDockButton = within(dock).getByRole("button", {
      name: getApp("photos")?.name ?? "Photos",
    });
    fireEvent.click(photosDockButton);

    const layer = screen.getByTestId("window-layer");
    const photosContent = within(layer).getByTestId("app-content-photos");

    const firstId = PHOTO_ORDER[0];
    expect(firstId).toBeDefined();
    const firstThumb = within(photosContent).getByTestId(
      `photos-thumb-${firstId}`
    );
    fireEvent.click(firstThumb);

    // The lightbox detail view should now be in the DOM with the
    // matching photo id, title, and date label.
    const detail = within(photosContent).getByTestId("photos-detail");
    expect(detail.getAttribute("data-photo-id")).toBe(firstId);
    const firstPhoto = initialMockPhotos.find((p) => p.id === firstId);
    expect(firstPhoto).toBeDefined();
    expect(
      within(photosContent).getByTestId("photos-detail-title").textContent
    ).toBe(firstPhoto!.title);
    expect(
      within(photosContent).getByTestId("photos-detail-date").textContent
    ).toBeTruthy();
  });

  it("does not duplicate the Photos window when the Dock icon is clicked more than once", () => {
    render(<Desktop />);

    const dock = screen.getByTestId("dock");
    const photosDockButton = within(dock).getByRole("button", {
      name: getApp("photos")?.name ?? "Photos",
    });

    fireEvent.click(photosDockButton);
    fireEvent.click(photosDockButton);
    fireEvent.click(photosDockButton);

    // Exactly one Photos window should exist regardless of how many
    // times the user clicked the icon — Dock clicks on a running app
    // focus the existing window rather than spawning a new one.
    const layer = screen.getByTestId("window-layer");
    expect(within(layer).getAllByTestId("app-content-photos")).toHaveLength(1);
  });
});
