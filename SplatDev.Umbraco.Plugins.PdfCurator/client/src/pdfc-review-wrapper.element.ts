import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { PdfcSectionWrapper } from "./pdfc-section-wrapper";

@customElement("pdfc-review-wrapper")
export class PdfcReviewWrapperElement extends PdfcSectionWrapper {
  protected get headline() {
    return "Review Queue";
  }
  protected get componentTag() {
    return "pdfc-review";
  }
}

export default PdfcReviewWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-review-wrapper": PdfcReviewWrapperElement;
  }
}
