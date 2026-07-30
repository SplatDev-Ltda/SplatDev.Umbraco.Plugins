import { LitElement as i, html as s, css as p, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as u } from "@umbraco-cms/backoffice/element-api";
var b = Object.getOwnPropertyDescriptor, m = (o, t, d, l) => {
  for (var e = l > 1 ? void 0 : l ? b(t, d) : t, a = o.length - 1, n; a >= 0; a--)
    (n = o[a]) && (e = n(e) || e);
  return e;
};
let r = class extends u(i) {
  render() {
    return s`
      <uui-box headline="Dashboard">
        <!-- TODO(PDFC-W0): Swap for <pdfc-dashboard> real component -->
        <pdfc-dashboard-placeholder></pdfc-dashboard-placeholder>
      </uui-box>
    `;
  }
};
r.styles = p`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .placeholder-banner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-space-10, 48px);
      text-align: center;
    }

    .placeholder-banner uui-icon {
      font-size: 3rem;
      margin-bottom: var(--uui-size-space-4, 12px);
      color: var(--uui-color-disabled-text, #bdbdbd);
    }

    .placeholder-banner p {
      color: var(--uui-color-text-alt, #6b7280);
      font-size: 0.875rem;
      margin: 0;
    }
  `;
r = m([
  c("pdfc-dashboard-wrapper")
], r);
const x = r;
export {
  r as PdfcDashboardWrapperElement,
  x as default
};
//# sourceMappingURL=pdfc-dashboard-wrapper.element.js.map
