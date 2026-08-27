import { customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { P as f } from "./chunks/pdfc-section-wrapper-AqI5vaU0.js";
var l = Object.getOwnPropertyDescriptor, m = (p, o, n, s) => {
  for (var e = s > 1 ? void 0 : s ? l(o, n) : o, r = p.length - 1, a; r >= 0; r--)
    (a = p[r]) && (e = a(e) || e);
  return e;
};
let t = class extends f {
  get headline() {
    return "Reports";
  }
  get componentTag() {
    return "pdfc-reports";
  }
};
t = m([
  c("pdfc-reports-wrapper")
], t);
const P = t;
export {
  t as PdfcReportsWrapperElement,
  P as default
};
//# sourceMappingURL=pdfc-reports-wrapper.element.js.map
