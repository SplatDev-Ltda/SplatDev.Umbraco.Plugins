import { customElement as n } from "@umbraco-cms/backoffice/external/lit";
import { P as c } from "./chunks/pdfc-section-wrapper-AqI5vaU0.js";
var f = Object.getOwnPropertyDescriptor, l = (t, o, d, p) => {
  for (var e = p > 1 ? void 0 : p ? f(o, d) : o, r = t.length - 1, s; r >= 0; r--)
    (s = t[r]) && (e = s(e) || e);
  return e;
};
let a = class extends c {
  get headline() {
    return "Dashboard";
  }
  get componentTag() {
    return "pdfc-dashboard";
  }
};
a = l([
  n("pdfc-dashboard-wrapper")
], a);
const u = a;
export {
  a as PdfcDashboardWrapperElement,
  u as default
};
//# sourceMappingURL=pdfc-dashboard-wrapper.element.js.map
