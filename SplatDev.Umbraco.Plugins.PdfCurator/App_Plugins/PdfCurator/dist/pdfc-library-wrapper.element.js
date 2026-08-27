import { customElement as o } from "@umbraco-cms/backoffice/external/lit";
import { P as f } from "./chunks/pdfc-section-wrapper-nn4PGSKg.js";
var s = Object.getOwnPropertyDescriptor, i = (a, p, c, n) => {
  for (var r = n > 1 ? void 0 : n ? s(p, c) : p, e = a.length - 1, l; e >= 0; e--)
    (l = a[e]) && (r = l(r) || r);
  return r;
};
let t = class extends f {
  get headline() {
    return "Library";
  }
  get componentTag() {
    return "pdfc-library";
  }
};
t = i([
  o("pdfc-library-wrapper")
], t);
const u = t;
export {
  t as PdfcLibraryWrapperElement,
  u as default
};
//# sourceMappingURL=pdfc-library-wrapper.element.js.map
