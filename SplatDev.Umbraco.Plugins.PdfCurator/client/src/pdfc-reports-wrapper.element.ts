import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

const BUNDLE_URL = "/_content/PdfCurator.Web/pdfc.js";

@customElement("pdfc-reports-wrapper")
export class PdfcReportsWrapperElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-space-10, 48px);
      text-align: center;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .loading-state uui-loader-circle {
      margin-bottom: var(--uui-size-space-4, 12px);
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-space-10, 48px);
      text-align: center;
    }

    .error-state p {
      color: var(--uui-color-danger, #ef4444);
      margin: var(--uui-size-space-3, 8px) 0 0;
    }
  `;

  @state() private _bundleLoaded = false;
  @state() private _loadError: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadPdfcBundle();
  }

  private async _loadPdfcBundle(): Promise<void> {
    if (customElements.get("pdfc-reports")) {
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
        <uui-box headline="Reports">
          <div class="error-state">
            <uui-icon
              name="icon-alert"
              style="font-size:3rem;color:var(--uui-color-danger)"
            ></uui-icon>
            <p>
              Failed to load Book Library components. Please rebuild the project
              and ensure PdfCurator.Web is installed.
            </p>
          </div>
        </uui-box>
      `;
    }

    if (!this._bundleLoaded) {
      return html`
        <uui-box headline="Reports">
          <div class="loading-state">
            <uui-loader-circle></uui-loader-circle>
            <p>Loading Book Library components…</p>
          </div>
        </uui-box>
      `;
    }

    return html`
      <uui-box headline="Reports">
        <pdfc-reports></pdfc-reports>
      </uui-box>
    `;
  }
}

export default PdfcReportsWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-reports-wrapper": PdfcReportsWrapperElement;
  }
}
