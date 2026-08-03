import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BookDetail, SimilarBook } from "../../types";

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

function mockBook(): BookDetail {
  return {
    id: 1,
    title: "Advanced TypeScript",
    author: "Jane Doe",
    category: "Technology",
    description: "Deep dive into TypeScript.",
    pageCount: 350,
    thumbnailUrl: "/api/books/1/thumbnail",
    fileUrl: "/api/books/1/file",
    createdAt: "2026-01-15T00:00:00Z",
    isFavorite: true,
    readingProgress: { bookId: 1, page: 42, pageCount: 350, updatedAt: "2026-03-01T00:00:00Z" },
  };
}

function mockBookNotFavorite(): BookDetail {
  return {
    ...mockBook(),
    isFavorite: false,
    readingProgress: null,
  };
}

function mockSimilarBooks(): SimilarBook[] {
  return [
    { id: 2, title: "Clean Architecture", author: "Robert Martin", category: "Technology", thumbnailUrl: "/api/books/2/thumbnail" },
    { id: 3, title: "The Pragmatic Programmer", author: "David Thomas", category: "Technology", thumbnailUrl: "/api/books/3/thumbnail" },
  ];
}

describe("pdfc-member-book", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it("renders loading state initially", async () => {
    const deferred = deferredPromise<Response>();
    vi.mocked(fetch).mockReturnValue(deferred.promise);

    const { PdfcMemberBook } = await import("../components/pdfc-member-book");
    const el = document.createElement("pdfc-member-book") as PdfcMemberBook;
    el.setAttribute("bookId", "1");
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector(".spinner")).toBeTruthy();

    deferred.resolve(createMockResponse(mockBook()));
    document.body.removeChild(el);
  });

  it("renders book title, author, and metadata", async () => {
    const book = mockBook();
    vi.mocked(fetch).mockResolvedValue(createMockResponse(book));

    const { PdfcMemberBook } = await import("../components/pdfc-member-book");
    const el = document.createElement("pdfc-member-book") as PdfcMemberBook;
    el.setAttribute("bookId", "1");
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".title")).toBeTruthy();
    });

    const title = el.shadowRoot!.querySelector(".title");
    expect(title!.textContent).toContain("Advanced TypeScript");

    const meta = el.shadowRoot!.querySelector(".meta");
    expect(meta!.textContent).toContain("Jane Doe");
    expect(meta!.textContent).toContain("Technology");
    expect(meta!.textContent).toContain("350");

    document.body.removeChild(el);
  });

  it("shows Continue Reading button when progress exists", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse(mockBook()));

    const { PdfcMemberBook } = await import("../components/pdfc-member-book");
    const el = document.createElement("pdfc-member-book") as PdfcMemberBook;
    el.setAttribute("bookId", "1");
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".title")).toBeTruthy();
    });

    const buttons = el.shadowRoot!.querySelectorAll(".btn-primary");
    const continueBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Continue reading")
    );
    expect(continueBtn).toBeTruthy();

    document.body.removeChild(el);
  });

  it("shows Start Reading button when no progress", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse(mockBookNotFavorite()));

    const { PdfcMemberBook } = await import("../components/pdfc-member-book");
    const el = document.createElement("pdfc-member-book") as PdfcMemberBook;
    el.setAttribute("bookId", "1");
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".title")).toBeTruthy();
    });

    const buttons = el.shadowRoot!.querySelectorAll(".btn-primary");
    const startBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Start Reading")
    );
    expect(startBtn).toBeTruthy();

    document.body.removeChild(el);
  });

  it("renders error state on API failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const { PdfcMemberBook } = await import("../components/pdfc-member-book");
    const el = document.createElement("pdfc-member-book") as PdfcMemberBook;
    el.setAttribute("bookId", "1");
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".error-state")).toBeTruthy();
    });

    document.body.removeChild(el);
  });

  it("renders similar books rail", async () => {
    const book = mockBook();
    vi.mocked(fetch)
      .mockResolvedValueOnce(createMockResponse(book))
      .mockResolvedValueOnce(createMockResponse(mockSimilarBooks()));

    const { PdfcMemberBook } = await import("../components/pdfc-member-book");
    const el = document.createElement("pdfc-member-book") as PdfcMemberBook;
    el.setAttribute("bookId", "1");
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".similar-rail")).toBeTruthy();
    });

    const similarCards = el.shadowRoot!.querySelectorAll(".similar-card");
    expect(similarCards.length).toBe(2);

    document.body.removeChild(el);
  });
});
