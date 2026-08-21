import { LitElement as v, html as c, nothing as w, css as _, state as u, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as T } from "@umbraco-cms/backoffice/notification";
function k(e) {
  let a = null, t = null;
  const s = e.consumeContext.bind(e), i = new Promise((r) => {
    s(C, async (o) => {
      var l;
      try {
        a = await ((l = o == null ? void 0 : o.getLatestToken) == null ? void 0 : l.call(o)) ?? null;
      } catch {
        a = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return s(T, (r) => {
    t = r;
  }), async (r, o = {}) => {
    await i;
    const l = new Headers(o.headers);
    a && !l.has("Authorization") && l.set("Authorization", `Bearer ${a}`);
    const n = await fetch(r, { ...o, credentials: "same-origin", headers: l });
    if (!n.ok) {
      const h = n.status === 401 || n.status === 403, b = h ? "Not authorised" : "Could not load data", g = h ? `The backoffice token was ${a ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${g}`), t == null || t.peek("danger", { data: { headline: b, message: g } });
    }
    return n;
  };
}
var $ = Object.defineProperty, A = Object.getOwnPropertyDescriptor, m = (e) => {
  throw TypeError(e);
}, p = (e, a, t, s) => {
  for (var i = s > 1 ? void 0 : s ? A(a, t) : a, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (i = (s ? o(a, t, i) : o(i)) || i);
  return s && i && $(a, t, i), i;
}, E = (e, a, t) => a.has(e) || m("Cannot " + t), z = (e, a, t) => (E(e, a, "read from private field"), t ? t.call(e) : a.get(e)), D = (e, a, t) => a.has(e) ? m("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, t), f;
let d = class extends x(v) {
  constructor() {
    super(), D(this, f, k(this)), this._config = null, this._loading = !0, this._error = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadConfig();
  }
  async _loadConfig() {
    this._loading = !0, this._error = !1;
    try {
      const e = await z(this, f).call(this, "/umbraco/api/charlimit/GetConfig");
      if (!e.ok) throw new Error(`HTTP ${e.status}`);
      this._config = await e.json();
    } catch {
      this._error = !0;
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return this._loading ? c`<uui-loader-circle></uui-loader-circle>` : c`
      <h1>Character Limit</h1>
      <p class="subtitle">Enforces a maximum character count on text input properties with an optional countdown display.</p>

      ${this._error ? c`
        <div class="error-state">
          Could not load configuration from the API. Ensure the CharLimit package is installed and the site is running.
        </div>
      ` : this._config ? c`
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
      ` : w}

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
f = /* @__PURE__ */ new WeakMap();
d.styles = _`
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
p([
  u()
], d.prototype, "_config", 2);
p([
  u()
], d.prototype, "_loading", 2);
p([
  u()
], d.prototype, "_error", 2);
d = p([
  y("charlimit-dashboard")
], d);
export {
  d as CharLimitDashboard
};
//# sourceMappingURL=charlimit-dashboard.js.map
