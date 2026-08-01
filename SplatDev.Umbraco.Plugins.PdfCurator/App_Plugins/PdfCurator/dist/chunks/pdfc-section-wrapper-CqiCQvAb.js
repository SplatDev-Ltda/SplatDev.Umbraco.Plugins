import { css as c, LitElement as p, html as r, state as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
const h = "/_content/PdfCurator.Web/pdfc.js", b = `
:host {
  display: block;
  padding: var(--uui-size-layout-1, 24px);
}
uui-box {
  margin-bottom: var(--uui-size-space-5, 16px);
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--uui-size-space-10, 48px);
  text-align: center;
  color: var(--uui-color-text-alt, #6b7280);
}
.loading-state uui-loader-circle {
  margin-bottom: var(--uui-size-space-4, 12px);
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--uui-size-space-10, 48px);
  text-align: center;
}
.error-state p {
  color: var(--uui-color-danger, #ef4444);
  margin: var(--uui-size-space-3, 8px) 0 0;
}
`;
var f = Object.defineProperty, d = (n, t, s, g) => {
  for (var e = void 0, i = n.length - 1, l; i >= 0; i--)
    (l = n[i]) && (e = l(t, s, e) || e);
  return e && f(t, s, e), e;
};
const x = c([b]), a = class a extends m(p) {
  constructor() {
    super(...arguments), this._bundleLoaded = !1, this._loadError = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPdfcBundle();
  }
  async _loadPdfcBundle() {
    if (customElements.get(this.componentTag)) {
      this._bundleLoaded = !0;
      return;
    }
    try {
      await import(h), this._bundleLoaded = !0;
    } catch (t) {
      this._loadError = t instanceof Error ? t.message : "Failed to load PdfCurator components";
    }
  }
  render() {
    return this._loadError ? r`
        <uui-box headline="${this.headline}">
          <div class="error-state">
            <uui-icon
              name="icon-alert"
              style="font-size:3rem;color:var(--uui-color-danger)"
            ></uui-icon>
            <p>
              Failed to load Book Library components. Please rebuild the
              project and ensure PdfCurator.Web is installed.
            </p>
          </div>
        </uui-box>
      ` : this._bundleLoaded ? r`
      <uui-box headline="${this.headline}">
        <${this.componentTag}></${this.componentTag}>
      </uui-box>
    ` : r`
        <uui-box headline="${this.headline}">
          <div class="loading-state">
            <uui-loader-circle></uui-loader-circle>
            <p>Loading Book Library components…</p>
          </div>
        </uui-box>
      `;
  }
};
a.styles = x;
let o = a;
d([
  u()
], o.prototype, "_bundleLoaded");
d([
  u()
], o.prototype, "_loadError");
export {
  o as P
};
//# sourceMappingURL=pdfc-section-wrapper-CqiCQvAb.js.map
