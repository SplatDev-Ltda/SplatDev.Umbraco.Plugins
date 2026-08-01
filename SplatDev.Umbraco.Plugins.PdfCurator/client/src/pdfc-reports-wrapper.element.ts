import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { PdfcSectionWrapper } from "./pdfc-section-wrapper";

@customElement("pdfc-reports-wrapper")
export class PdfcReportsWrapperElement extends PdfcSectionWrapper {
  protected get headline() {
    return "Reports";
  }
  protected get componentTag() {
    return "pdfc-reports";
  }
}

export default PdfcReportsWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-reports-wrapper": PdfcReportsWrapperElement;
  }
}
