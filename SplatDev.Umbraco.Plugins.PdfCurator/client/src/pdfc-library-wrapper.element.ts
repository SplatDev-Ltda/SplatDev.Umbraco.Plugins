import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

// TODO(PDFC-W0): Replace <pdfc-library-placeholder> mount with real <pdfc-library> component
// from the PdfCurator.Web package once the PDF Curator project publishes its web bundle.

@customElement("pdfc-library-wrapper")
export class PdfcLibraryWrapperElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }
  `;

  override render() {
    return html`
      <uui-box headline="Library">
        <!-- TODO(PDFC-W0): Swap for <pdfc-library> real component -->
        <pdfc-library-placeholder></pdfc-library-placeholder>
      </uui-box>
    `;
  }
}

export default PdfcLibraryWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-library-wrapper": PdfcLibraryWrapperElement;
  }
}
