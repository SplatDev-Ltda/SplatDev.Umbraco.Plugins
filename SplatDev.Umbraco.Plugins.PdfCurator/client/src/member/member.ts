import "./components/pdfc-member-library";
import "./components/pdfc-member-book";
import "./components/pdfc-member-favorites";
import "./components/pdfc-reader";
import { setLanguage, t } from "./services/i18n";
import type { Language } from "./types";

interface PdfCuratorShell extends HTMLElement {
  language?: string;
}

class PdfCuratorApp {
  private _host!: PdfCuratorShell;

  constructor() {
    const host = document.getElementById("pdfc-app") as PdfCuratorShell | null;
    if (!host) {
      console.warn("pdfc-app container not found");
      return;
    }
    this._host = host;

    const lang = (host.dataset.lang || "en") as Language;
    setLanguage(lang);

    this._listen();
    this._route();
  }

  private _listen(): void {
    document.addEventListener("pdfc-navigate", ((e: CustomEvent) => {
      this._handleNavigate(e.detail);
    }) as EventListener);

    document.addEventListener("pdfc-open-reader", ((e: CustomEvent) => {
      this._openReader(e.detail);
    }) as EventListener);

    document.addEventListener("pdfc-close-reader", (() => {
      this._closeReader();
    }) as EventListener);
  }

  private _handleNavigate(detail: { route: string; bookId?: number }): void {
    if (detail.route === "book" && detail.bookId) {
      this._showBook(detail.bookId);
    } else {
      this._showLibrary();
    }
  }

  private _showLibrary(): void {
    this._host.innerHTML = "<pdfc-member-library></pdfc-member-library>";
    window.history.pushState({}, "", window.location.pathname);
  }

  private _showBook(bookId: number): void {
    this._host.innerHTML = `<pdfc-member-book bookId="${bookId}"></pdfc-member-book>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private _openReader(detail: { bookId: number; title?: string }): void {
    const existing = document.querySelector("pdfc-reader");
    if (existing) existing.remove();

    const reader = document.createElement("pdfc-reader") as HTMLElement & {
      bookId: number;
      bookTitle: string;
    };
    reader.bookId = detail.bookId;
    reader.bookTitle = detail.title || "";
    document.body.appendChild(reader);
  }

  private _closeReader(): void {
    const reader = document.querySelector("pdfc-reader");
    if (reader) reader.remove();
  }

  private _route(): void {
    const path = window.location.hash.replace("#", "");
    if (path.startsWith("book/")) {
      const bookId = parseInt(path.split("/")[1], 10);
      if (!isNaN(bookId)) {
        this._showBook(bookId);
        return;
      }
    }
    if (path === "favorites") {
      this._host.innerHTML = "<pdfc-member-favorites></pdfc-member-favorites>";
      return;
    }
    this._showLibrary();
  }
}

const app = new PdfCuratorApp();
Object.assign(window, { __pdfCuratorApp: app });

export { PdfCuratorApp };
export { setLanguage, t };
