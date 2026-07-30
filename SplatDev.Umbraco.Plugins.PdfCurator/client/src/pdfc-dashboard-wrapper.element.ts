import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { LocalizationHelper } from "./localization-helper";

// TODO(PDFC-W0): Replace <pdfc-dashboard-placeholder> mount with real <pdfc-dashboard> component
// from the PdfCurator.Web package once the PDF Curator project publishes its web bundle.

@customElement("pdfc-dashboard-wrapper")
export class PdfcDashboardWrapperElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .placeholder-banner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-space-10, 48px);
      text-align: center;
    }

    .placeholder-banner uui-icon {
      font-size: 3rem;
      margin-bottom: var(--uui-size-space-4, 12px);
      color: var(--uui-color-disabled-text, #bdbdbd);
    }

    .placeholder-banner p {
      color: var(--uui-color-text-alt, #6b7280);
      font-size: 0.875rem;
      margin: 0;
    }
  `;

  override render() {
    return html`
      <uui-box headline="Dashboard">
        <!-- TODO(PDFC-W0): Swap for <pdfc-dashboard> real component -->
        <pdfc-dashboard-placeholder></pdfc-dashboard-placeholder>
      </uui-box>
    `;
  }
}

export default PdfcDashboardWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-dashboard-wrapper": PdfcDashboardWrapperElement;
  }
}
