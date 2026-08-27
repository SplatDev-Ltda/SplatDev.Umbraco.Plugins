import { css as p, LitElement as h, html as n, state as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
const f = "/_content/PdfCurator.Web/pdfc.js", g = `
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
var b = Object.defineProperty, c = (d, t, r, o) => {
  for (var e = void 0, a = d.length - 1, l; a >= 0; a--)
    (l = d[a]) && (e = l(t, r, e) || e);
  return e && b(t, r, e), e;
};
const _ = p([g]), s = class s extends m(h) {
  constructor() {
    super(...arguments), this._bundleLoaded = !1, this._loadError = null, this._reportedMissing = !1;
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
      await import(f), this._bundleLoaded = !0;
    } catch (t) {
      this._loadError = t instanceof Error ? t.message : "Failed to load PdfCurator components";
    }
  }
  render() {
    return this._loadError ? n`
        <uui-box headline="${this.headline}">
          <div class="error-state">
            <uui-icon
              name="icon-alert"
              style="font-size:3rem;color:var(--uui-color-danger)"
            ></uui-icon>
            <p>
              Failed to load PdfCurator components. Please rebuild the
              project and ensure PdfCurator.Web is installed.
            </p>
          </div>
        </uui-box>
      ` : this._bundleLoaded ? n`
      <uui-box headline="${this.headline}">
        <div id="host"></div>
      </uui-box>
    ` : n`
        <uui-box headline="${this.headline}">
          <div class="loading-state">
            <uui-loader-circle></uui-loader-circle>
            <p>Loading PdfCurator components…</p>
          </div>
        </uui-box>
      `;
  }
  updated(t) {
    var o, e;
    if (super.updated(t), !this._bundleLoaded || this._loadError) return;
    const r = (o = this.shadowRoot) == null ? void 0 : o.querySelector("#host");
    if (r) {
      if (!customElements.get(this.componentTag)) {
        this._reportedMissing || (this._reportedMissing = !0, this._loadError = `The PdfCurator bundle loaded but did not define <${this.componentTag}>.`);
        return;
      }
      ((e = r.firstElementChild) == null ? void 0 : e.tagName.toLowerCase()) !== this.componentTag && r.replaceChildren(document.createElement(this.componentTag));
    }
  }
};
s.styles = _;
let i = s;
c([
  u()
], i.prototype, "_bundleLoaded");
c([
  u()
], i.prototype, "_loadError");
export {
  i as P
};
//# sourceMappingURL=pdfc-section-wrapper-nn4PGSKg.js.map
