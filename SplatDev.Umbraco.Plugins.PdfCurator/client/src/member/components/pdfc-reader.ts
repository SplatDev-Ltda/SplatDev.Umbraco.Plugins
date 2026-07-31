import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import type { ComponentState } from "../types";
import { bookFileUrl, updateProgress } from "../services/api";
import { t } from "../services/i18n";
import tokensRaw from "../styles/tokens.css?inline";

interface PDFPageProxy {
  getViewport(params: { scale: number }): { width: number; height: number };
  render(params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

@customElement("pdfc-reader")
export class PdfcReader extends LitElement {
  static override styles = [
    unsafeCSS(tokensRaw),
    css`
      :host {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.85);
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .reader-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--pdfc-space-sm);
        padding: var(--pdfc-space-sm) var(--pdfc-space-md);
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        flex-shrink: 0;
        flex-wrap: wrap;
      }

      .toolbar-left,
      .toolbar-center,
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: var(--pdfc-space-sm);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--pdfc-radius-sm);
        background: transparent;
        color: #fff;
        font-size: 0.875rem;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s;
        white-space: nowrap;
      }

      .btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
      }

      .btn:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
      }

      .btn:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .page-indicator {
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .page-input {
        width: 2.5rem;
        padding: 0.375rem 0.25rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: var(--pdfc-radius-sm);
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 0.875rem;
        font-family: inherit;
        text-align: center;
      }

      .page-input:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.8);
      }

      .zoom-label {
        font-size: 0.8125rem;
        font-variant-numeric: tabular-nums;
      }

      .canvas-area {
        flex: 1;
        overflow: auto;
        display: flex;
        justify-content: center;
        padding: var(--pdfc-space-md);
      }

      canvas {
        max-width: 100%;
        height: auto;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
      }

      .state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #fff;
        gap: var(--pdfc-space-md);
      }

      .spinner {
        width: 2.5rem;
        height: 2.5rem;
        border: 3px solid rgba(255, 255, 255, 0.2);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      .saved-toast {
        position: fixed;
        bottom: var(--pdfc-space-lg);
        left: 50%;
        transform: translateX(-50%);
        padding: var(--pdfc-space-sm) var(--pdfc-space-lg);
        background: rgba(0, 0, 0, 0.85);
        color: #fff;
        border-radius: var(--pdfc-radius);
        font-size: 0.875rem;
        animation: toastIn 0.3s ease, toastOut 0.3s ease 1.5s forwards;
        z-index: 10000;
      }

      @keyframes toastIn {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(0.5rem);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      @keyframes toastOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `,
  ];

  @property({ type: Number }) bookId = 0;
  @property({ type: String }) bookTitle = "";

  @state() private _page = 1;
  @state() private _numPages = 0;
  @state() private _scale = 1.0;
  @state() private _state: ComponentState = "loading";
  @state() private _showSavedToast = false;

  private _pdfDoc: PDFDocumentProxy | null = null;
  private _canvasEl: HTMLCanvasElement | null = null;
  private _progressTimer: ReturnType<typeof setTimeout> | null = null;
  private _focusTrapEl: HTMLElement | null = null;
  private _pinchDist = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this._onKeyDown);
    this._load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._onKeyDown);
    if (this._progressTimer) clearTimeout(this._progressTimer);
    this._pdfDoc = null;
  }

  protected override firstUpdated(): void {
    this._focusTrapEl = this.shadowRoot!.querySelector(".reader-container");
    this._focusTrapEl?.focus();
  }

  private async _load(): Promise<void> {
    this._state = "loading";
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const loadingTask = pdfjsLib.getDocument(bookFileUrl(this.bookId));
      this._pdfDoc = (await loadingTask.promise) as PDFDocumentProxy;
      this._numPages = this._pdfDoc.numPages;
      this._state = "loaded";
      await this._renderPage();
    } catch {
      this._state = "error";
    }
  }

  private async _renderPage(): Promise<void> {
    if (!this._canvasEl || !this._pdfDoc) return;
    const page = await this._pdfDoc.getPage(this._page);
    const viewport = page.getViewport({ scale: this._scale });

    const canvas = this._canvasEl;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    this._debounceProgress();
  }

  private _debounceProgress(): void {
    if (this._progressTimer) clearTimeout(this._progressTimer);
    this._progressTimer = setTimeout(() => {
      updateProgress(this.bookId, this._page)
        .then(() => {
          this._showSavedToast = true;
          setTimeout(() => (this._showSavedToast = false), 2000);
        })
        .catch(() => {});
    }, 3000);
  }

  private _goToPage(page: number): void {
    const clamped = Math.max(1, Math.min(page, this._numPages));
    if (clamped === this._page) return;
    this._page = clamped;
    this._renderPage();
  }

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this._state !== "loaded") return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        this._goToPage(this._page + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        this._goToPage(this._page - 1);
        break;
      case "Home":
        e.preventDefault();
        this._goToPage(1);
        break;
      case "End":
        e.preventDefault();
        this._goToPage(this._numPages);
        break;
      case "Escape":
        e.preventDefault();
        this._close();
        break;
    }
  };

  private _onPageInput(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) this._goToPage(val);
  }

  private _zoomIn(): void {
    this._scale = Math.min(3, +(this._scale + 0.25).toFixed(2));
    this._renderPage();
  }

  private _zoomOut(): void {
    this._scale = Math.max(0.5, +(this._scale - 0.25).toFixed(2));
    this._renderPage();
  }

  private _onCanvasTouchStart(e: TouchEvent): void {
    if (e.touches.length === 2) {
      this._pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  private _onCanvasTouchMove(e: TouchEvent): void {
    if (e.touches.length === 2 && this._pinchDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (dist > this._pinchDist + 30) {
        this._zoomIn();
        this._pinchDist = dist;
      } else if (dist < this._pinchDist - 30) {
        this._zoomOut();
        this._pinchDist = dist;
      }
    }
  }

  private _onCanvasTouchEnd(): void {
    this._pinchDist = 0;
  }

  private _close(): void {
    if (this._progressTimer) clearTimeout(this._progressTimer);
    updateProgress(this.bookId, this._page).catch(() => {});
    this.dispatchEvent(
      new CustomEvent("pdfc-close-reader", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderLoading() {
    return html`
      <div class="state">
        <span class="spinner"></span>
        <span>${t("reader_loading")}</span>
      </div>
    `;
  }

  private _renderError() {
    return html`
      <div class="state">
        <span>${t("reader_error")}</span>
        <button class="btn" @click=${this._close}>${t("reader_close")}</button>
      </div>
    `;
  }

  private _renderToolbar() {
    return html`
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="page-indicator">${this.bookTitle}</span>
        </div>
        <div class="toolbar-center">
          <button
            class="btn"
            @click=${() => this._goToPage(1)}
            ?disabled=${this._page <= 1}
            aria-label="First page"
          >
            &#171;
          </button>
          <button
            class="btn"
            @click=${() => this._goToPage(this._page - 1)}
            ?disabled=${this._page <= 1}
            aria-label=${t("reader_previous")}
          >
            &#8249;
          </button>
          <input
            class="page-input"
            type="number"
            .value=${String(this._page)}
            min="1"
            .max=${String(this._numPages)}
            @change=${this._onPageInput}
            aria-label="Go to page"
          />
          <span class="page-indicator">${t("reader_of")} ${this._numPages}</span>
          <button
            class="btn"
            @click=${() => this._goToPage(this._page + 1)}
            ?disabled=${this._page >= this._numPages}
            aria-label=${t("reader_next")}
          >
            &#8250;
          </button>
          <button
            class="btn"
            @click=${() => this._goToPage(this._numPages)}
            ?disabled=${this._page >= this._numPages}
            aria-label="Last page"
          >
            &#187;
          </button>
        </div>
        <div class="toolbar-right">
          <button
            class="btn"
            @click=${this._zoomOut}
            aria-label=${t("reader_zoom_out")}
          >
            &minus;
          </button>
          <span class="zoom-label">${Math.round(this._scale * 100)}%</span>
          <button
            class="btn"
            @click=${this._zoomIn}
            aria-label=${t("reader_zoom_in")}
          >
            +
          </button>
          <button class="btn" @click=${this._close}>
            ${t("reader_close")}
          </button>
        </div>
      </div>
    `;
  }

  override render() {
    if (this._state === "loading") {
      return html`
        <div class="reader-container" tabindex="-1" role="dialog" aria-label="PDF Reader">
          ${this._renderToolbar()} ${this._renderLoading()}
        </div>
      `;
    }

    if (this._state === "error") {
      return html`
        <div class="reader-container" tabindex="-1" role="dialog" aria-label="PDF Reader">
          ${this._renderToolbar()} ${this._renderError()}
        </div>
      `;
    }

    return html`
      <div
        class="reader-container"
        tabindex="-1"
        role="dialog"
        aria-label=${`Reading: ${this.bookTitle}`}
      >
        ${this._renderToolbar()}
        <div class="canvas-area">
          <canvas
            @touchstart=${this._onCanvasTouchStart}
            @touchmove=${this._onCanvasTouchMove}
            @touchend=${this._onCanvasTouchEnd}
            aria-label=${`${t("reader_page")} ${this._page} ${t("reader_of")} ${this._numPages}`}
          ></canvas>
        </div>
        ${this._showSavedToast
          ? html`<div class="saved-toast" role="status" aria-live="polite">
              ${t("reader_progress_saved")}
            </div>`
          : null}
      </div>
    `;
  }

  protected override updated(): void {
    this._canvasEl = this.shadowRoot?.querySelector("canvas") ?? null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-reader": PdfcReader;
  }
}
