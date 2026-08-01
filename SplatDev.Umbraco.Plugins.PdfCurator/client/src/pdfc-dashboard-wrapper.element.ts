import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { PdfcSectionWrapper } from "./pdfc-section-wrapper";

@customElement("pdfc-dashboard-wrapper")
export class PdfcDashboardWrapperElement extends PdfcSectionWrapper {
  protected get headline() {
    return "Dashboard";
  }
  protected get componentTag() {
    return "pdfc-dashboard";
  }
}

export default PdfcDashboardWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-dashboard-wrapper": PdfcDashboardWrapperElement;
  }
}
