import { LitElement as s, html as n, css as c, customElement as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as d } from "@umbraco-cms/backoffice/element-api";
var m = Object.getOwnPropertyDescriptor, b = (t, l, o, p) => {
  for (var r = p > 1 ? void 0 : p ? m(l, o) : l, a = t.length - 1, i; a >= 0; a--)
    (i = t[a]) && (r = i(r) || r);
  return r;
};
let e = class extends d(s) {
  render() {
    return n`
      <uui-box headline="Library">
        <!-- TODO(PDFC-W0): Swap for <pdfc-library> real component -->
        <pdfc-library-placeholder></pdfc-library-placeholder>
      </uui-box>
    `;
  }
};
e.styles = c`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }
  `;
e = b([
  u("pdfc-library-wrapper")
], e);
const x = e;
export {
  e as PdfcLibraryWrapperElement,
  x as default
};
//# sourceMappingURL=pdfc-library-wrapper.element.js.map
