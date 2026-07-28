import { LitElement as c, html as a, css as m, state as b, customElement as n } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as d } from "@umbraco-cms/backoffice/element-api";
var h = Object.defineProperty, y = Object.getOwnPropertyDescriptor, p = (e, i, r, s) => {
  for (var t = s > 1 ? void 0 : s ? y(i, r) : i, u = e.length - 1, o; u >= 0; u--)
    (o = e[u]) && (t = (s ? o(i, r, t) : o(t)) || t);
  return s && t && h(i, r, t), t;
};
let l = class extends d(c) {
  constructor() {
    super(...arguments), this._memberTypes = [], this._loading = !1, this._apiBase = "/umbraco/api/membertypes";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await fetch(`${this._apiBase}/GetAll`);
      e.ok && (this._memberTypes = await e.json());
    } catch {
      this._memberTypes = [];
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return a`
      <h1>Member Types</h1>
      <p class="description">Manage custom member types and their properties.</p>

      <uui-box headline="Member Types (${this._memberTypes.length})">
        ${this._loading ? a`<p>Loading...</p>` : this._memberTypes.length === 0 ? a`<p class="empty">No member types found.</p>` : a`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                  <uui-table-head-cell>Properties</uui-table-head-cell>
                </uui-table-head>
                ${this._memberTypes.map(
      (e) => a`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${e.alias}</code></uui-table-cell>
                      <uui-table-cell>${e.description}</uui-table-cell>
                      <uui-table-cell>${e.propertyCount}</uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
};
l.styles = m`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
  `;
p([
  b()
], l.prototype, "_memberTypes", 2);
p([
  b()
], l.prototype, "_loading", 2);
l = p([
  n("membertypes-dashboard")
], l);
const g = l;
export {
  l as MemberTypesDashboardElement,
  g as default
};
