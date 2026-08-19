import { LitElement as h, html as l, nothing as u, css as g, state as p, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as b } from "@umbraco-cms/backoffice/auth";
function w(a) {
  let e = null;
  const o = new Promise((r) => {
    a.consumeContext(b, async (t) => {
      var i;
      try {
        e = await ((i = t == null ? void 0 : t.getLatestToken) == null ? void 0 : i.call(t)) ?? null;
      } catch {
        e = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, t = {}) => {
    await o;
    const i = new Headers(t.headers);
    e && !i.has("Authorization") && i.set("Authorization", `Bearer ${e}`);
    const n = await fetch(r, { ...t, credentials: "same-origin", headers: i });
    return (n.status === 401 || n.status === 403) && console.error(
      `[SplatDev] ${n.status} from ${String(r)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), n;
  };
}
var _ = Object.defineProperty, x = Object.getOwnPropertyDescriptor, f = (a) => {
  throw TypeError(a);
}, d = (a, e, o, r) => {
  for (var t = r > 1 ? void 0 : r ? x(e, o) : e, i = a.length - 1, n; i >= 0; i--)
    (n = a[i]) && (t = (r ? n(e, o, t) : n(t)) || t);
  return r && t && _(e, o, t), t;
}, y = (a, e, o) => e.has(a) || f("Cannot " + o), C = (a, e, o) => (y(a, e, "read from private field"), o ? o.call(a) : e.get(a)), k = (a, e, o) => e.has(a) ? f("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(a) : e.set(a, o), c;
let s = class extends v(h) {
  constructor() {
    super(), k(this, c, w(this)), this._config = null, this._loading = !0, this._error = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadConfig();
  }
  async _loadConfig() {
    this._loading = !0, this._error = !1;
    try {
      const a = await C(this, c).call(this, "/umbraco/api/charlimit/GetConfig");
      if (!a.ok) throw new Error(`HTTP ${a.status}`);
      this._config = await a.json();
    } catch {
      this._error = !0;
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return this._loading ? l`<uui-loader-circle></uui-loader-circle>` : l`
      <h1>Character Limit</h1>
      <p class="subtitle">Enforces a maximum character count on text input properties with an optional countdown display.</p>

      ${this._error ? l`
        <div class="error-state">
          Could not load configuration from the API. Ensure the CharLimit package is installed and the site is running.
        </div>
      ` : this._config ? l`
        <div class="card">
          <h2>Configuration</h2>
          <div class="info-row">
            <span class="info-label">Default Max Characters</span>
            <span class="info-value">${this._config.maxChars}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Show Countdown</span>
            <span class="badge ${this._config.showCountdown ? "on" : "off"}">
              ${this._config.showCountdown ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      ` : u}

      <div class="card">
        <h2>How to Use</h2>
        <div class="info-row">
          <span class="info-label">1. Create a Data Type</span>
          <span class="info-value">Select "Character Limit" as the property editor in the Settings section</span>
        </div>
        <div class="info-row">
          <span class="info-label">2. Configure Limits</span>
          <span class="info-value">Set max characters and toggle the countdown display per data type</span>
        </div>
        <div class="info-row">
          <span class="info-label">3. Add to Document Type</span>
          <span class="info-value">Add the property to any document type that needs character validation</span>
        </div>
      </div>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
s.styles = g`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      color: var(--uui-color-text, #1b264f);
      font-family: var(--uui-font-family);
    }
    h1 {
      font-size: 1.5rem; font-weight: 700; margin: 0 0 4px;
    }
    .subtitle {
      color: var(--uui-color-text-alt, #6b7280);
      font-size: .875rem; margin: 0 0 24px; max-width: 480px; line-height: 1.5;
    }
    .card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: var(--uui-border-radius, 8px);
      padding: 20px; margin-bottom: 16px;
    }
    .card h2 {
      font-size: 1rem; font-weight: 600; margin: 0 0 12px;
    }
    .info-row {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 0; border-bottom: 1px solid var(--uui-color-border, #f0f0f0);
      font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; min-width: 180px; }
    .info-value { color: var(--uui-color-text-alt, #555); }
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 10px; border-radius: 9999px;
      font-size: 12px; font-weight: 600;
    }
    .badge.on { background: #ecfdf5; color: #065f46; }
    .badge.off { background: #fef2f2; color: #991b1b; }
    .error-state {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
      padding: 16px; color: #991b1b; font-size: 14px;
    }
  `;
d([
  p()
], s.prototype, "_config", 2);
d([
  p()
], s.prototype, "_loading", 2);
d([
  p()
], s.prototype, "_error", 2);
s = d([
  m("charlimit-dashboard")
], s);
export {
  s as CharLimitDashboard
};
//# sourceMappingURL=charlimit-dashboard.js.map
