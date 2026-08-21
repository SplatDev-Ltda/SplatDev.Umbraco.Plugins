import { LitElement as x, html as i, css as y, state as c, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as P } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as $ } from "@umbraco-cms/backoffice/notification";
function C(e) {
  let t = null, o = null;
  const l = e.consumeContext.bind(e), d = new Promise((n) => {
    l(P, async (r) => {
      var p;
      try {
        t = await ((p = r == null ? void 0 : r.getLatestToken) == null ? void 0 : p.call(r)) ?? null;
      } catch {
        t = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return l($, (n) => {
    o = n;
  }), async (n, r = {}) => {
    await d;
    const p = new Headers(r.headers);
    t && !p.has("Authorization") && p.set("Authorization", `Bearer ${t}`);
    const u = await fetch(n, { ...r, credentials: "same-origin", headers: p });
    if (!u.ok) {
      const b = u.status === 401 || u.status === 403, v = b ? "Not authorised" : "Could not load data", m = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(n)} — ${m}`), o == null || o.peek("danger", { data: { headline: v, message: m } });
    }
    return u;
  };
}
var S = Object.defineProperty, R = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, s = (e, t, o, l) => {
  for (var d = l > 1 ? void 0 : l ? R(t, o) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (d = (l ? r(t, o, d) : r(d)) || d);
  return l && d && S(t, o, d), d;
}, E = (e, t, o) => t.has(e) || _("Cannot " + o), h = (e, t, o) => (E(e, t, "read from private field"), o ? o.call(e) : t.get(e)), O = (e, t, o) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), f;
const g = "/umbraco/api/mercadopago";
let a = class extends k(x) {
  constructor() {
    super(...arguments), O(this, f, C(this)), this._connStatus = "checking", this._config = null, this._configError = "", this._prefOrderRef = "", this._prefAmount = "", this._prefDescription = "", this._prefLoading = !1, this._prefResult = "", this._statusPaymentId = "", this._statusLoading = !1, this._statusResult = "";
  }
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  connectedCallback() {
    super.connectedCallback(), this._loadConfig();
  }
  // ── API calls ──────────────────────────────────────────────────────────────
  async _loadConfig() {
    this._connStatus = "checking", this._configError = "", this._config = null;
    try {
      const e = await h(this, f).call(this, `${g}/GetConfig`);
      e.ok ? (this._config = await e.json(), this._connStatus = "connected") : (this._connStatus = "error", this._configError = `HTTP ${e.status}: ${e.statusText}`);
    } catch (e) {
      this._connStatus = "error", this._configError = e instanceof Error ? e.message : String(e);
    }
  }
  async _createPreference() {
    this._prefLoading = !0, this._prefResult = "";
    try {
      const t = await (await h(this, f).call(this, `${g}/CreatePreference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: this._prefOrderRef.trim(),
          amount: parseFloat(this._prefAmount),
          description: this._prefDescription.trim() || void 0
        })
      })).json();
      this._prefResult = JSON.stringify(t, null, 2);
    } catch (e) {
      this._prefResult = e instanceof Error ? e.message : String(e);
    } finally {
      this._prefLoading = !1;
    }
  }
  async _getPaymentStatus() {
    this._statusLoading = !0, this._statusResult = "";
    try {
      const t = await (await h(this, f).call(this, `${g}/GetPaymentStatus?paymentId=${encodeURIComponent(this._statusPaymentId.trim())}`)).json();
      this._statusResult = JSON.stringify(t, null, 2);
    } catch (e) {
      this._statusResult = e instanceof Error ? e.message : String(e);
    } finally {
      this._statusLoading = !1;
    }
  }
  // ── Helpers ────────────────────────────────────────────────────────────────
  _connLabel() {
    switch (this._connStatus) {
      case "checking":
        return "Verificando…";
      case "connected":
        return "Conectado";
      case "error":
        return "Falha de conexão";
    }
  }
  _truncateKey(e) {
    return e.length <= 20 ? e : `${e.slice(0, 10)}…${e.slice(-6)}`;
  }
  _prefCanSubmit() {
    return this._prefOrderRef.trim().length > 0 && parseFloat(this._prefAmount) > 0 && !this._prefLoading;
  }
  // ── Render ─────────────────────────────────────────────────────────────────
  _renderConfig() {
    if (this._connStatus === "checking")
      return i`
        <uui-box headline="Connection Status">
          <div class="notice notice--info">Checking connection to MercadoPago API…</div>
        </uui-box>
      `;
    if (this._connStatus === "error")
      return i`
        <uui-box headline="Connection Status">
          <div class="notice notice--error">
            <strong>Connection failed:</strong> ${this._configError}<br />
            Verify your MercadoPago credentials in <code>appsettings.json</code>
            (section <code>MercadoPago</code>).
          </div>
          <uui-button look="secondary" label="Retry" @click=${this._loadConfig}>
            Retry
          </uui-button>
        </uui-box>
      `;
    const e = this._config;
    return i`
      <uui-box headline="Connection &amp; Configuration">
        <div class="config-grid">
          <div class="info-card">
            <div class="info-card__label">Public Key</div>
            <div class="info-card__value info-card__value--mono">
              ${this._truncateKey(e.publicKey)}
            </div>
          </div>
          <div class="info-card">
            <div class="info-card__label">Sandbox Mode</div>
            <div class="info-card__value">
              ${e.sandbox ? i`<span class="badge-yes">Yes — Sandbox</span>` : i`<span class="badge-no">No — Production</span>`}
            </div>
          </div>
        </div>
        ${e.sandbox ? i`
            <div class="notice notice--warn">
              Sandbox mode is active. Payments will not be charged. Switch
              <code>Sandbox: false</code> in <code>appsettings.json</code> for production.
            </div>` : i`
            <div class="notice notice--info">
              Production mode is active. Real charges will be processed.
            </div>`}
        <div class="section-actions">
          <uui-button look="secondary" label="Refresh config" @click=${this._loadConfig}>
            ↻ Refresh config
          </uui-button>
        </div>
      </uui-box>
    `;
  }
  _renderCreatePreference() {
    return i`
      <uui-box headline="Test Payment Preference">
        <div class="notice notice--warn">
          This action calls <code>CreatePreference</code> on the configured environment
          (sandbox or production). Use test order references during development.
        </div>
        <div class="form-row">
          <div class="form-col">
            <span class="field-label">Order Ref *</span>
            <input
              class="native-input"
              type="text"
              placeholder="e.g. ORDER-001"
              .value=${this._prefOrderRef}
              @input=${(e) => this._prefOrderRef = e.target.value}
            />
          </div>
          <div class="form-col">
            <span class="field-label">Amount (BRL) *</span>
            <input
              class="native-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="10.00"
              .value=${this._prefAmount}
              @input=${(e) => this._prefAmount = e.target.value}
            />
          </div>
          <div class="form-col">
            <span class="field-label">Description</span>
            <input
              class="native-input"
              type="text"
              placeholder="Optional description"
              .value=${this._prefDescription}
              @input=${(e) => this._prefDescription = e.target.value}
            />
          </div>
        </div>
        <uui-button
          look="primary"
          label="Create preference"
          ?disabled=${!this._prefCanSubmit()}
          @click=${this._createPreference}
          style="--uui-button-background-color: #009EE3; --uui-button-background-color-hover: #0082bb;"
        >
          ${this._prefLoading ? "Creating…" : "Create Preference"}
        </uui-button>
        ${this._prefResult ? i`<div class="response-box">${this._prefResult}</div>` : ""}
      </uui-box>
    `;
  }
  _renderPaymentStatus() {
    return i`
      <uui-box headline="Check Payment Status">
        <div class="form-row">
          <div class="form-col" style="max-width: 380px">
            <span class="field-label">Payment ID *</span>
            <input
              class="native-input"
              type="text"
              placeholder="e.g. 123456789"
              .value=${this._statusPaymentId}
              @input=${(e) => this._statusPaymentId = e.target.value}
            />
          </div>
        </div>
        <uui-button
          look="secondary"
          label="Check status"
          ?disabled=${!this._statusPaymentId.trim() || this._statusLoading}
          @click=${this._getPaymentStatus}
        >
          ${this._statusLoading ? "Checking…" : "Check Status"}
        </uui-button>
        ${this._statusResult ? i`<div class="response-box">${this._statusResult}</div>` : ""}
      </uui-box>
    `;
  }
  render() {
    return i`
      <div class="dashboard-header">
        <div class="brand-logo"><span>MP</span></div>
        <div>
          <h1>MercadoPago Payments</h1>
          <p>Payment preferences &amp; status — Umbraco 13/17 plugin</p>
        </div>
        <span class="status-pill status-pill--${this._connStatus}">
          <span class="status-dot"></span>
          ${this._connLabel()}
        </span>
      </div>

      ${this._renderConfig()}
      ${this._renderCreatePreference()}
      ${this._renderPaymentStatus()}
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
a.styles = y`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      font-family: var(--uui-font-family, sans-serif);
      color: var(--uui-color-text, #1a1a1a);
    }

    /* ── Header ── */
    .dashboard-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #009EE3;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-logo span {
      color: #fff;
      font-weight: 900;
      font-size: 18px;
      line-height: 1;
      letter-spacing: -1px;
    }
    .dashboard-header h1 {
      margin: 0 0 4px;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .dashboard-header p {
      margin: 0;
      color: var(--uui-color-text-alt, #6b7280);
      font-size: 0.875rem;
    }

    /* ── Status pill ── */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-left: auto;
      white-space: nowrap;
    }
    .status-pill--checking { background: #eff6ff; color: #1d4ed8; }
    .status-pill--connected { background: #dcfce7; color: #15803d; }
    .status-pill--error { background: #fee2e2; color: #dc2626; }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    /* ── Config info card ── */
    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .info-card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 8px;
      padding: 16px;
    }
    .info-card__label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt, #6b7280);
      margin-bottom: 6px;
    }
    .info-card__value {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--uui-color-text, #1a1a1a);
      word-break: break-all;
    }
    .info-card__value--mono {
      font-family: monospace;
      font-size: 0.875rem;
    }
    .badge-yes {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      background: #fef9c3;
      color: #854d0e;
      font-size: 0.8125rem;
      font-weight: 600;
    }
    .badge-no {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      background: #dcfce7;
      color: #15803d;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    /* ── Notices ── */
    .notice {
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }
    .notice--info  { background: #eff6ff; color: #1e40af; border-left: 3px solid #3b82f6; }
    .notice--warn  { background: #fffbeb; color: #92400e; border-left: 3px solid #f59e0b; }
    .notice--error { background: #fef2f2; color: #991b1b; border-left: 3px solid #ef4444; }

    /* ── Forms ── */
    .form-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .form-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 180px;
    }
    .field-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .native-input {
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 0.875rem;
      background: var(--uui-color-surface, #fff);
      color: var(--uui-color-text, #1a1a1a);
      transition: border-color 0.15s;
    }
    .native-input:focus {
      outline: none;
      border-color: #009EE3;
      box-shadow: 0 0 0 2px rgba(0, 158, 227, 0.15);
    }

    /* ── Response box ── */
    .response-box {
      background: #1e293b;
      color: #e2e8f0;
      padding: 14px 16px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.8125rem;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 260px;
      overflow-y: auto;
      margin-top: 12px;
    }

    /* ── Misc ── */
    uui-box { margin-bottom: 20px; }
    .section-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
  `;
s([
  c()
], a.prototype, "_connStatus", 2);
s([
  c()
], a.prototype, "_config", 2);
s([
  c()
], a.prototype, "_configError", 2);
s([
  c()
], a.prototype, "_prefOrderRef", 2);
s([
  c()
], a.prototype, "_prefAmount", 2);
s([
  c()
], a.prototype, "_prefDescription", 2);
s([
  c()
], a.prototype, "_prefLoading", 2);
s([
  c()
], a.prototype, "_prefResult", 2);
s([
  c()
], a.prototype, "_statusPaymentId", 2);
s([
  c()
], a.prototype, "_statusLoading", 2);
s([
  c()
], a.prototype, "_statusResult", 2);
a = s([
  w("mercadopago-dashboard")
], a);
const I = a;
export {
  a as MercadoPagoDashboardElement,
  I as default
};
