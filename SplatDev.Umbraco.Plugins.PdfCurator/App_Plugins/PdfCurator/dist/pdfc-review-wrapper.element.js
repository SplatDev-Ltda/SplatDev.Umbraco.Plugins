import { LitElement as s, html as u, css as n, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as d } from "@umbraco-cms/backoffice/element-api";
var m = Object.getOwnPropertyDescriptor, v = (p, i, o, l) => {
  for (var e = l > 1 ? void 0 : l ? m(i, o) : i, t = p.length - 1, a; t >= 0; t--)
    (a = p[t]) && (e = a(e) || e);
  return e;
};
let r = class extends d(s) {
  render() {
    return u`
      <uui-box headline="Review Queue">
        <!-- TODO(PDFC-W0): Swap for <pdfc-review> real component -->
        <pdfc-review-placeholder></pdfc-review-placeholder>
      </uui-box>
    `;
  }
};
r.styles = n`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }
  `;
r = v([
  c("pdfc-review-wrapper")
], r);
const x = r;
export {
  r as PdfcReviewWrapperElement,
  x as default
};
//# sourceMappingURL=pdfc-review-wrapper.element.js.map
