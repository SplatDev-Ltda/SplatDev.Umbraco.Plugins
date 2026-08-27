import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { BUNDLE_URL, SECTION_WRAPPER_STYLES } from "./pdfc-constants";
import { API_BASE } from "./auth-adapter";
import { createAuthFetch } from "./auth-fetch";

const styles = css([SECTION_WRAPPER_STYLES] as unknown as TemplateStringsArray);

export abstract class PdfcSectionWrapper extends UmbElementMixin(LitElement) {
  protected abstract get headline(): string;
  protected abstract get componentTag(): string;

  static override styles = styles;

  @state() private _bundleLoaded = false;
  @state() private _loadError: string | null = null;
  private _reportedMissing = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#installAuthBridge();
    this._loadPdfcBundle();
  }

  /**
   * Routes the PdfCurator components' own fetches through an authorised one.
   *
   * The components ship in PdfCurator.Web's bundle and call plain fetch, which on Umbraco
   * 17 carries no Authorization header - the cookie alone is not enough, so every call to a
   * BackOfficeAccess endpoint would answer 401. The bundle cannot be changed from here, so
   * requests to this plugin's API prefix are delegated to createAuthFetch instead. Anything
   * else is left exactly as it was.
   */
  #installAuthBridge(): void {
    const w = window as Window & { __pdfcAuthBridge?: boolean };
    if (w.__pdfcAuthBridge) return;
    w.__pdfcAuthBridge = true;

    const original = window.fetch.bind(window);
    const authFetch = createAuthFetch(this, original);

    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string" ? input
        : input instanceof URL ? input.toString()
        : input.url;
      return url.startsWith(API_BASE) ? authFetch(input, init) : original(input, init);
    };
  }

  private async _loadPdfcBundle(): Promise<void> {
    if (customElements.get(this.componentTag)) {
      this._bundleLoaded = true;
      return;
    }

    try {
      await import(BUNDLE_URL);
      this._bundleLoaded = true;
    } catch (err) {
      this._loadError =
        err instanceof Error ? err.message : "Failed to load PdfCurator components";
    }
  }

  override render() {
    if (this._loadError) {
      return html`
        <uui-box headline="${this.headline}">
          <div class="error-state">
            <uui-icon
              name="icon-alert"
              style="font-size:3rem;color:var(--uui-color-danger)"
            ></uui-icon>
            <p>
              Failed to load PdfCurator components. Please rebuild the
              project and ensure PdfCurator.Web is installed.
            </p>
          </div>
        </uui-box>
      `;
    }

    if (!this._bundleLoaded) {
      return html`
        <uui-box headline="${this.headline}">
          <div class="loading-state">
            <uui-loader-circle></uui-loader-circle>
            <p>Loading PdfCurator components…</p>
          </div>
        </uui-box>
      `;
    }

    // The component tag is only known at runtime, and a lit `html` template cannot
    // interpolate one: `<${tag}>` is not parsed as an element, so the box rendered with no
    // child at all. That is why all four PdfCurator views showed an empty card rather than
    // failing - nothing threw, nothing was logged, and the panel simply had nothing in it.
    // Lit's static-html would be the idiomatic answer, but the backoffice re-exports only
    // `html` from lit, so the element is created imperatively instead.
    return html`
      <uui-box headline="${this.headline}">
        <div id="host"></div>
      </uui-box>
    `;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (!this._bundleLoaded || this._loadError) return;

    const host = this.shadowRoot?.querySelector("#host");
    if (!host) return;

    // A bundle that loads but never defines the element leaves the panel blank, which is
    // indistinguishable from a working dashboard with nothing to show. Say so instead.
    if (!customElements.get(this.componentTag)) {
      if (!this._reportedMissing) {
        this._reportedMissing = true;
        this._loadError =
          `The PdfCurator bundle loaded but did not define <${this.componentTag}>.`;
      }
      return;
    }

    if (host.firstElementChild?.tagName.toLowerCase() === this.componentTag) return;

    // Set before appending: the component reads apiBase on its first update, and the
    // default of "" sends every call to the site root.
    const el = document.createElement(this.componentTag) as HTMLElement & { apiBase?: string };
    el.apiBase = API_BASE;
    host.replaceChildren(el);
  }
}
