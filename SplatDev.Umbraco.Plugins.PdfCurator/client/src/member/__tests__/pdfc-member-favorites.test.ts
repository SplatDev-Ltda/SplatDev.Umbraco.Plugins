import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FavoriteEntry, ReadingProgress } from "../../types";

function createMockResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(data),
    headers: new Headers(),
  } as Response;
}

function deferredPromise<T = undefined>(): {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (e: unknown) => void;
} {
  let resolve: (v: T) => void;
  let reject: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

function mockFavorites(): FavoriteEntry[] {
  return [
    { bookId: 1, bookTitle: "Advanced TypeScript", bookAuthor: "Jane Doe", thumbnailUrl: "/api/books/1/thumbnail", createdAt: "2026-01-15T00:00:00Z" },
    { bookId: 2, bookTitle: "Clean Architecture", bookAuthor: "Robert Martin", thumbnailUrl: "/api/books/2/thumbnail", createdAt: "2026-02-10T00:00:00Z" },
  ];
}

function mockProgress(): ReadingProgress[] {
  return [
    { bookId: 1, page: 42, pageCount: 350, updatedAt: "2026-03-01T00:00:00Z" },
  ];
}

describe("pdfc-member-favorites", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it("renders loading state initially", async () => {
    const deferred = deferredPromise<Response>();
    vi.mocked(fetch).mockReturnValue(deferred.promise);

    const { PdfcMemberFavorites } = await import("../components/pdfc-member-favorites");
    const el = document.createElement("pdfc-member-favorites") as PdfcMemberFavorites;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector(".spinner")).toBeTruthy();

    deferred.resolve(createMockResponse([]));
    document.body.removeChild(el);
  });

  it("renders favorites grid with books", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(createMockResponse(mockFavorites()))
      .mockResolvedValueOnce(createMockResponse(mockProgress()));

    const { PdfcMemberFavorites } = await import("../components/pdfc-member-favorites");
    const el = document.createElement("pdfc-member-favorites") as PdfcMemberFavorites;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".grid")).toBeTruthy();
    });

    const cards = el.shadowRoot!.querySelectorAll(".card");
    expect(cards.length).toBe(2);

    document.body.removeChild(el);
  });

  it("renders Reading Now section when progress exists", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(createMockResponse(mockFavorites()))
      .mockResolvedValueOnce(createMockResponse(mockProgress()));

    const { PdfcMemberFavorites } = await import("../components/pdfc-member-favorites");
    const el = document.createElement("pdfc-member-favorites") as PdfcMemberFavorites;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".section-title")).toBeTruthy();
    });

    const readingItem = el.shadowRoot!.querySelector(".reading-item");
    expect(readingItem).toBeTruthy();

    const progressText = el.shadowRoot!.querySelector(".reading-progress");
    expect(progressText).toBeTruthy();

    document.body.removeChild(el);
  });

  it("renders empty state for empty favorites", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(createMockResponse([]))
      .mockResolvedValueOnce(createMockResponse([]));

    const { PdfcMemberFavorites } = await import("../components/pdfc-member-favorites");
    const el = document.createElement("pdfc-member-favorites") as PdfcMemberFavorites;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      const text = el.shadowRoot!.textContent;
      expect(text).toBeTruthy();
      expect(text).toContain("No favorites yet");
    });

    document.body.removeChild(el);
  });

  it("renders error state on API failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    const { PdfcMemberFavorites } = await import("../components/pdfc-member-favorites");
    const el = document.createElement("pdfc-member-favorites") as PdfcMemberFavorites;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".error-state")).toBeTruthy();
    });

    document.body.removeChild(el);
  });

  it("renders remove button on each favorite card", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(createMockResponse(mockFavorites()))
      .mockResolvedValueOnce(createMockResponse([]));

    const { PdfcMemberFavorites } = await import("../components/pdfc-member-favorites");
    const el = document.createElement("pdfc-member-favorites") as PdfcMemberFavorites;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".grid")).toBeTruthy();
    });

    const removeButtons = el.shadowRoot!.querySelectorAll(".btn-sm");
    expect(removeButtons.length).toBe(2);
    removeButtons.forEach((btn) => {
      expect(btn.textContent).toContain("Remove");
    });

    document.body.removeChild(el);
  });
});
