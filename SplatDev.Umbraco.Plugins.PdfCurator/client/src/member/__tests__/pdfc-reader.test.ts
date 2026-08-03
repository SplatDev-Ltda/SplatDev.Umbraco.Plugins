import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function createMockResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(data),
    headers: new Headers(),
  } as Response;
}

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 10,
      getPage: () =>
        Promise.resolve({
          getViewport: () => ({ width: 800, height: 1000 }),
          render: () => ({ promise: Promise.resolve() }),
        }),
    }),
  }),
}));

describe("pdfc-reader", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderReader(bookId = 1, bookTitle = "Test Book") {
    const { PdfcReader } = await import("../components/pdfc-reader");
    const el = document.createElement("pdfc-reader") as PdfcReader;
    el.setAttribute("bookId", String(bookId));
    el.setAttribute("bookTitle", bookTitle);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  function queryReader(el: HTMLElement, selector: string) {
    return el.shadowRoot!.querySelector(selector);
  }

  it("renders loading state with spinner", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse({}));
    const el = await renderReader();

    expect(queryReader(el, ".spinner")).toBeTruthy();
    expect(queryReader(el, '[role="dialog"]')).toBeTruthy();

    document.body.removeChild(el);
  });

  it("renders toolbar with close button", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse({}));
    const el = await renderReader();

    const toolbar = queryReader(el, ".toolbar");
    expect(toolbar).toBeTruthy();
    expect(toolbar!.textContent).toContain("Close Reader");

    document.body.removeChild(el);
  });

  it("progresses past loading to loaded state with canvas", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse({}));
    const el = await renderReader();

    await vi.waitFor(
      () => {
        expect(queryReader(el, ".spinner")).toBeFalsy();
      },
      { timeout: 5000 }
    );

    const canvas = queryReader(el, "canvas");
    expect(canvas).toBeTruthy();

    document.body.removeChild(el);
  });

  it("sets role='dialog' with book title when loaded", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse({}));
    const el = await renderReader(1, "Test Book");

    await vi.waitFor(
      () => {
        expect(queryReader(el, ".spinner")).toBeFalsy();
      },
      { timeout: 5000 }
    );

    const dialog = queryReader(el, '[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toContain("Test Book");

    document.body.removeChild(el);
  });

  it("close button dispatches pdfc-close-reader event", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse({}));
    const el = await renderReader();

    const toolbar = queryReader(el, ".toolbar");
    expect(toolbar).toBeTruthy();

    const closeEvent = new Promise<CustomEvent>((resolve) => {
      el.addEventListener("pdfc-close-reader", resolve as EventListener, { once: true });
    });

    const buttons = el.shadowRoot!.querySelectorAll(".btn");
    const closeBtn = Array.from(buttons).find((b) =>
      b.textContent!.includes("Close Reader")
    );
    (closeBtn as HTMLButtonElement).click();

    const event = await closeEvent;
    expect(event.type).toBe("pdfc-close-reader");

    document.body.removeChild(el);
  });

  it("dispatches progress saved toast after debounce", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue(createMockResponse({}));
    const el = await renderReader();

    await vi.waitFor(
      () => {
        expect(queryReader(el, ".spinner")).toBeFalsy();
      },
      { timeout: 5000 }
    );

    await vi.advanceTimersByTimeAsync(3100);

    await vi.waitFor(
      () => {
        const toast = queryReader(el, ".saved-toast");
        if (toast) return true;
      },
      { timeout: 2000 }
    );

    expect(queryReader(el, ".saved-toast")).toBeTruthy();

    document.body.removeChild(el);
  });
});
