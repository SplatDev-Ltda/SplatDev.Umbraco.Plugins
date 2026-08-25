import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { PdfcSectionWrapper } from "./pdfc-section-wrapper";

@customElement("pdfc-library-wrapper")
export class PdfcLibraryWrapperElement extends PdfcSectionWrapper {
  protected get headline() {
    return "Library";
  }
  protected get componentTag() {
    return "pdfc-library";
  }
}

export default PdfcLibraryWrapperElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdfc-library-wrapper": PdfcLibraryWrapperElement;
  }
}
