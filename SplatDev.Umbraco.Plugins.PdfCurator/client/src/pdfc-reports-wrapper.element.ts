import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

// TODO(PDFC-W0): Replace <pdfc-reports-placeholder> mount with real <pdfc-reports> component
// from the PdfCurator.Web package once the PDF Curator project publishes its web bundle.

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
  `;

  override render() {
    return html`
      <uui-box headline="Reports">
        <!-- TODO(PDFC-W0): Swap for <pdfc-reports> real component -->
        <pdfc-reports-placeholder></pdfc-reports-placeholder>
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
