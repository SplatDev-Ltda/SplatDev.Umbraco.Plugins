import { LitElement as n, html as c, css as u, customElement as i } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as d } from "@umbraco-cms/backoffice/element-api";
var m = Object.getOwnPropertyDescriptor, f = (p, o, a, s) => {
  for (var e = s > 1 ? void 0 : s ? m(o, a) : o, t = p.length - 1, l; t >= 0; t--)
    (l = p[t]) && (e = l(e) || e);
  return e;
};
let r = class extends d(n) {
  render() {
    return c`
      <uui-box headline="Reports">
        <!-- TODO(PDFC-W0): Swap for <pdfc-reports> real component -->
        <pdfc-reports-placeholder></pdfc-reports-placeholder>
      </uui-box>
    `;
  }
};
r.styles = u`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }
  `;
r = f([
  i("pdfc-reports-wrapper")
], r);
const v = r;
export {
  r as PdfcReportsWrapperElement,
  v as default
};
//# sourceMappingURL=pdfc-reports-wrapper.element.js.map
