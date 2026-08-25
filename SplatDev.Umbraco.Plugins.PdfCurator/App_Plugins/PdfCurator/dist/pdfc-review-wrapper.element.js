import { customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { P as l } from "./chunks/pdfc-section-wrapper-CqiCQvAb.js";
var s = Object.getOwnPropertyDescriptor, v = (p, a, o, n) => {
  for (var e = n > 1 ? void 0 : n ? s(a, o) : a, r = p.length - 1, c; r >= 0; r--)
    (c = p[r]) && (e = c(e) || e);
  return e;
};
let t = class extends l {
  get headline() {
    return "Review Queue";
  }
  get componentTag() {
    return "pdfc-review";
  }
};
t = v([
  f("pdfc-review-wrapper")
], t);
const u = t;
export {
  t as PdfcReviewWrapperElement,
  u as default
};
//# sourceMappingURL=pdfc-review-wrapper.element.js.map
