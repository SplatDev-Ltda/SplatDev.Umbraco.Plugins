import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { BUNDLE_URL, SECTION_WRAPPER_STYLES } from "./pdfc-constants";

const styles = css([SECTION_WRAPPER_STYLES] as unknown as TemplateStringsArray);

export abstract class PdfcSectionWrapper extends UmbElementMixin(LitElement) {
  protected abstract get headline(): string;
  protected abstract get componentTag(): string;

  static override styles = styles;

  @state() private _bundleLoaded = false;
  @state() private _loadError: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadPdfcBundle();
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

    return html`
      <uui-box headline="${this.headline}">
        <${this.componentTag}></${this.componentTag}>
      </uui-box>
    `;
  }
}
