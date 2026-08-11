import { LitElement as y, nothing as b, html as o, css as w, state as u, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { W as C, s as E } from "./chunks/shared-styles-DntHce3s.js";
var W = Object.defineProperty, k = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, n = (t, e, a, l) => {
  for (var r = l > 1 ? void 0 : l ? k(e, a) : e, d = t.length - 1, p; d >= 0; d--)
    (p = t[d]) && (r = (l ? p(e, a, r) : p(r)) || r);
  return l && r && W(e, a, r), r;
}, f = (t, e, a) => e.has(t) || _("Cannot " + a), T = (t, e, a) => (f(t, e, "read from private field"), a ? a.call(t) : e.get(t)), m = (t, e, a) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), c = (t, e, a) => (f(t, e, "access private method"), a), v, i, h, g;
let s = class extends $(y) {
  constructor() {
    super(...arguments), m(this, i), m(this, v, new C(this)), this._templates = [], this._error = "", this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), c(this, i, h).call(this);
  }
  render() {
    return o`
      <div class="head">
        <h1>Message templates</h1>
        <p>
          Templates defined on your WhatsApp Business Account. Only approved templates can
          be sent; create and edit them in Meta Business Manager.
        </p>
      </div>

      ${this._error ? o`<div class="error">${this._error}</div>` : b}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh templates"
          ?disabled=${this._loading}
          @click=${() => void c(this, i, h).call(this)}
        >Refresh</uui-button>
      </div>

      <uui-box>
        ${this._loading ? o`<uui-loader></uui-loader>` : this._templates.length === 0 ? o`<div class="empty">
                No templates found. Check that the business account ID and access token are
                configured on the Status view.
              </div>` : o`
                <div class="scroll-x">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Language</th>
                        <th>Status</th>
                        <th>Category</th>
                        <th>Vars</th>
                        <th>Body</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this._templates.map((t) => c(this, i, g).call(this, t))}
                    </tbody>
                  </table>
                </div>
              `}
      </uui-box>
    `;
  }
};
v = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
h = async function() {
  this._loading = !0, this._error = "";
  try {
    this._templates = await T(this, v).getTemplates();
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._loading = !1;
  }
};
g = function(t) {
  return o`
      <tr>
        <td><strong>${t.name}</strong></td>
        <td>${t.language}</td>
        <td>
          <span class="pill ${t.isUsable ? "approved" : "other"}">
            ${t.status}
          </span>
        </td>
        <td>${t.category}</td>
        <td>${t.variableCount || "—"}</td>
        <td class="body-cell">${t.bodyText || "—"}</td>
      </tr>
    `;
};
s.styles = [
  E,
  w`
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        /* Keeps the body column from collapsing the layout on narrow screens. */
        min-width: 720px;
      }

      th,
      td {
        text-align: left;
        padding: var(--uui-size-space-3, 8px);
        border-bottom: 1px solid var(--uui-color-border);
        vertical-align: top;
      }

      th {
        font-weight: 600;
        color: var(--uui-color-text-alt);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .body-cell {
        color: var(--uui-color-text-alt);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        max-width: 420px;
      }

      .pill {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .pill.approved {
        background: var(--uui-color-positive);
        color: var(--uui-color-selected-contrast, #fff);
      }

      .pill.other {
        background: var(--uui-color-warning);
        color: var(--uui-color-warning-contrast, #000);
      }
    `
];
n([
  u()
], s.prototype, "_templates", 2);
n([
  u()
], s.prototype, "_error", 2);
n([
  u()
], s.prototype, "_loading", 2);
s = n([
  x("wa-templates")
], s);
const O = s;
export {
  s as WaTemplatesElement,
  O as default
};
//# sourceMappingURL=wa-templates.element.js.map
