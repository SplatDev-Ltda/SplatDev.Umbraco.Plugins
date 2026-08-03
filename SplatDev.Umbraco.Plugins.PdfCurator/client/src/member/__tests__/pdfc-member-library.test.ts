import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BookListResponse, BookEntry } from "../../types";

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

function mockBooks(page = 1): BookListResponse {
  const items: BookEntry[] = [
    {
      id: 1,
      title: "Advanced TypeScript",
      author: "Jane Doe",
      category: "Technology",
      description: "Deep dive into TypeScript.",
      pageCount: 350,
      thumbnailUrl: "/api/books/1/thumbnail",
      fileUrl: "/api/books/1/file",
      createdAt: "2026-01-15T00:00:00Z",
    },
    {
      id: 2,
      title: "Clean Architecture",
      author: "Robert Martin",
      category: "Technology",
      description: "Software architecture patterns.",
      pageCount: 432,
      thumbnailUrl: "/api/books/2/thumbnail",
      fileUrl: "/api/books/2/file",
      createdAt: "2026-02-10T00:00:00Z",
    },
    {
      id: 3,
      title: "The Pragmatic Programmer",
      author: "David Thomas",
      category: "Technology",
      description: "From journeyman to master.",
      pageCount: 320,
      thumbnailUrl: "/api/books/3/thumbnail",
      fileUrl: "/api/books/3/file",
      createdAt: "2026-03-05T00:00:00Z",
    },
  ];

  return { items, total: items.length, page, pageSize: 12 };
}

const mockEmptyResponse: BookListResponse = { items: [], total: 0, page: 1, pageSize: 12 };

describe("pdfc-member-library", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it("renders loading state initially", async () => {
    const deferred = deferredPromise<Response>();
    vi.mocked(fetch).mockReturnValue(deferred.promise);

    const { PdfcMemberLibrary } = await import("../components/pdfc-member-library");
    const el = document.createElement("pdfc-member-library") as PdfcMemberLibrary;
    document.body.appendChild(el);
    await el.updateComplete;

    const spinner = el.shadowRoot!.querySelector(".spinner");
    expect(spinner).toBeTruthy();

    deferred.resolve(createMockResponse(mockBooks()));
    document.body.removeChild(el);
  });

  it("renders loaded state with books grid", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse(mockBooks()));
    const { PdfcMemberLibrary } = await import("../components/pdfc-member-library");
    const el = document.createElement("pdfc-member-library") as PdfcMemberLibrary;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      const grid = el.shadowRoot!.querySelector(".grid");
      expect(grid).toBeTruthy();
    });

    const cards = el.shadowRoot!.querySelectorAll(".card");
    expect(cards.length).toBe(3);

    document.body.removeChild(el);
  });

  it("renders empty state when no books found", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse(mockEmptyResponse));
    const { PdfcMemberLibrary } = await import("../components/pdfc-member-library");
    const el = document.createElement("pdfc-member-library") as PdfcMemberLibrary;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      const state = el.shadowRoot!.querySelector(".state");
      expect(state).toBeTruthy();
      expect(state!.textContent).toContain("The library is empty");
    });

    document.body.removeChild(el);
  });

  it("renders error state on API failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    const { PdfcMemberLibrary } = await import("../components/pdfc-member-library");
    const el = document.createElement("pdfc-member-library") as PdfcMemberLibrary;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".error-state")).toBeTruthy();
    });

    document.body.removeChild(el);
  });

  it("renders category filter select", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse(mockBooks()));
    const { PdfcMemberLibrary } = await import("../components/pdfc-member-library");
    const el = document.createElement("pdfc-member-library") as PdfcMemberLibrary;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".grid")).toBeTruthy();
    });

    const select = el.shadowRoot!.querySelectorAll("select");
    expect(select.length).toBeGreaterThanOrEqual(2);

    document.body.removeChild(el);
  });

  it("renders cards with accessible roles", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse(mockBooks()));
    const { PdfcMemberLibrary } = await import("../components/pdfc-member-library");
    const el = document.createElement("pdfc-member-library") as PdfcMemberLibrary;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".grid")).toBeTruthy();
    });

    const cards = el.shadowRoot!.querySelectorAll('[role="button"]');
    expect(cards.length).toBe(3);

    cards.forEach((card, i) => {
      expect(card.getAttribute("tabindex")).toBe("0");
      expect(card.getAttribute("aria-label")).toContain(mockBooks().items[i].title);
    });

    document.body.removeChild(el);
  });
});
