import { LitElement as v, html as c, css as b, state as g, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as S } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as $ } from "@umbraco-cms/backoffice/notification";
function L(e) {
  let t = null, a = null;
  const r = e.consumeContext.bind(e), i = new Promise((o) => {
    r(T, async (s) => {
      var d;
      try {
        t = await ((d = s == null ? void 0 : s.getLatestToken) == null ? void 0 : d.call(s)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return r($, (o) => {
    a = o;
  }), async (o, s = {}) => {
    await i;
    const d = new Headers(s.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const n = await fetch(o, { ...s, credentials: "same-origin", headers: d });
    if (!n.ok) {
      const p = n.status === 401 || n.status === 403, y = p ? "Not authorised" : "Could not load data", _ = p ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(o)} — ${_}`), a == null || a.peek("danger", { data: { headline: y, message: _ } });
    }
    return n;
  };
}
var k = Object.defineProperty, z = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, h = (e, t, a, r) => {
  for (var i = r > 1 ? void 0 : r ? z(t, a) : t, o = e.length - 1, s; o >= 0; o--)
    (s = e[o]) && (i = (r ? s(t, a, i) : s(i)) || i);
  return r && i && k(t, a, i), i;
}, C = (e, t, a) => t.has(e) || f("Cannot " + a), m = (e, t, a) => (C(e, t, "read from private field"), a ? a.call(e) : t.get(e)), E = (e, t, a) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), u;
let l = class extends S(v) {
  constructor() {
    super(...arguments), E(this, u, L(this)), this._settings = { enabled: !0, placeholder: "", lazyLoadIframes: !0 }, this._loading = !0, this._saved = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSettings();
  }
  async _loadSettings() {
    try {
      const e = await m(this, u).call(this, "/umbraco/api/lazyload/GetSettings");
      this._settings = await e.json();
    } finally {
      this._loading = !1;
    }
  }
  async _saveSettings() {
    await m(this, u).call(this, "/umbraco/api/lazyload/SaveSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this._settings)
    }), this._saved = !0, setTimeout(() => {
      this._saved = !1;
    }, 3e3);
  }
  _toggle(e) {
    this._settings = { ...this._settings, [e]: !this._settings[e] };
  }
  render() {
    return this._loading ? c`<uui-loader></uui-loader>` : c`
      <uui-box headline="Lazy Load Settings">
        <div class="form-row">
          <label>Enabled</label>
          <uui-toggle ?checked=${this._settings.enabled} @change=${() => this._toggle("enabled")}></uui-toggle>
        </div>
        <div class="form-row">
          <label>Lazy Load Iframes</label>
          <uui-toggle ?checked=${this._settings.lazyLoadIframes} @change=${() => this._toggle("lazyLoadIframes")}></uui-toggle>
        </div>
        <div class="form-row">
          <label>Placeholder</label>
          <input type="text" .value=${this._settings.placeholder}
            @input=${(e) => this._settings = { ...this._settings, placeholder: e.target.value }} />
        </div>
        <uui-button look="primary" @click=${this._saveSettings}>Save Settings</uui-button>
        ${this._saved ? c`<uui-tag color="positive" look="secondary">Saved!</uui-tag>` : ""}
      </uui-box>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
l.styles = b`
    :host { display: block; padding: 1rem; }
    .form-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    label { min-width: 160px; font-weight: 600; }
    input[type="text"] { flex: 1; padding: 0.4rem; border: 1px solid var(--uui-color-border); border-radius: 4px; }
  `;
h([
  g()
], l.prototype, "_settings", 2);
h([
  g()
], l.prototype, "_loading", 2);
h([
  g()
], l.prototype, "_saved", 2);
l = h([
  w("lazyload-dashboard")
], l);
const N = l;
export {
  l as LazyLoadDashboardElement,
  N as default
};
//# sourceMappingURL=lazyload-dashboard.element.js.map
