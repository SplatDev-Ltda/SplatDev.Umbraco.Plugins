import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

// TODO(PDFC-W0): Replace <pdfc-review-placeholder> mount with real <pdfc-review> component
// from the PdfCurator.Web package once the PDF Curator project publishes its web bundle.

@customElement("pdfc-review-wrapper")
export class PdfcReviewWrapperElement extends UmbElementMixin(LitElement) {
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
      <uui-box headline="Review Queue">
        <!-- TODO(PDFC-W0): Swap for <pdfc-review> real component -->
        <pdfc-review-placeholder></pdfc-review-placeholder>
      </uui-box>
    `;
  }
}

export default PdfcReviewWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-review-wrapper": PdfcReviewWrapperElement;
  }
}
