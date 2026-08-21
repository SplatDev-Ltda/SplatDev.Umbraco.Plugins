import { LitElement as S, html as u, css as T, state as s, customElement as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as L } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as R } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as P } from "@umbraco-cms/backoffice/notification";
function A(t) {
  let e = null, o = null;
  const l = t.consumeContext.bind(t), d = new Promise((n) => {
    l(R, async (i) => {
      var p;
      try {
        e = await ((p = i == null ? void 0 : i.getLatestToken) == null ? void 0 : p.call(i)) ?? null;
      } catch {
        e = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return l(P, (n) => {
    o = n;
  }), async (n, i = {}) => {
    await d;
    const p = new Headers(i.headers);
    e && !p.has("Authorization") && p.set("Authorization", `Bearer ${e}`);
    const c = await fetch(n, { ...i, credentials: "same-origin", headers: p });
    if (!c.ok) {
      const y = c.status === 401 || c.status === 403, E = y ? "Not authorised" : "Could not load data", $ = y ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(n)} — ${$}`), o == null || o.peek("danger", { data: { headline: E, message: $ } });
    }
    return c;
  };
}
var z = Object.defineProperty, D = Object.getOwnPropertyDescriptor, k = (t) => {
  throw TypeError(t);
}, a = (t, e, o, l) => {
  for (var d = l > 1 ? void 0 : l ? D(e, o) : e, n = t.length - 1, i; n >= 0; n--)
    (i = t[n]) && (d = (l ? i(e, o, d) : i(d)) || d);
  return l && d && z(e, o, d), d;
}, C = (t, e, o) => e.has(t) || k("Cannot " + o), x = (t, e, o) => (C(t, e, "read from private field"), o ? o.call(t) : e.get(t)), w = (t, e, o) => e.has(t) ? k("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), v = (t, e, o) => (C(t, e, "access private method"), o), h, g, _;
const m = "/umbraco/api/pagseguro", f = "#00B1EB", b = "#0ECC8B";
let r = class extends L(S) {
  constructor() {
    super(...arguments), w(this, g), w(this, h, A(this)), this._connStatus = "unknown", this._config = null, this._configError = "", this._txOrderRef = "", this._txAmount = "10.00", this._txDescription = "", this._txLoading = !1, this._txCheckoutUrl = "", this._txError = "", this._stCode = "", this._stLoading = !1, this._stStatus = "", this._stError = "", this._loadError = null;
  }
  // ── Lifecycle ──
  connectedCallback() {
    super.connectedCallback(), this._loadConfig();
  }
  // ── API calls ──
  async _loadConfig() {
    this._connStatus = "checking", this._configError = "";
    try {
      const t = await x(this, h).call(this, `${m}/GetConfig`);
      v(this, g, _).call(this, t) ? (this._config = await t.json(), this._connStatus = "connected") : (this._connStatus = "error", this._configError = `HTTP ${t.status}: ${t.statusText}`);
    } catch (t) {
      this._connStatus = "error", this._configError = t instanceof Error ? t.message : String(t);
    }
  }
  async _createTransaction() {
    if (!this._txOrderRef.trim()) return;
    const t = parseFloat(this._txAmount);
    if (!(isNaN(t) || t <= 0)) {
      this._txLoading = !0, this._txCheckoutUrl = "", this._txError = "";
      try {
        const e = await x(this, h).call(this, `${m}/CreateTransaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderRef: this._txOrderRef.trim(),
            amount: t,
            description: this._txDescription.trim() || void 0
          })
        });
        if (v(this, g, _).call(this, e)) {
          const o = await e.json();
          this._txCheckoutUrl = o.checkoutUrl ?? "";
        } else {
          const o = await e.text();
          this._txError = `HTTP ${e.status}: ${o || e.statusText}`;
        }
      } catch (e) {
        this._txError = e instanceof Error ? e.message : String(e);
      } finally {
        this._txLoading = !1;
      }
    }
  }
  async _getTransactionStatus() {
    if (this._stCode.trim()) {
      this._stLoading = !0, this._stStatus = "", this._stError = "";
      try {
        const t = await x(this, h).call(this, `${m}/GetTransactionStatus?code=${encodeURIComponent(this._stCode.trim())}`);
        if (v(this, g, _).call(this, t)) {
          const e = await t.json();
          this._stStatus = e.status ?? "(sem status)";
        } else {
          const e = await t.text();
          this._stError = `HTTP ${t.status}: ${e || t.statusText}`;
        }
      } catch (t) {
        this._stError = t instanceof Error ? t.message : String(t);
      } finally {
        this._stLoading = !1;
      }
    }
  }
  // ── Helpers ──
  _connLabel() {
    switch (this._connStatus) {
      case "checking":
        return "Verificando…";
      case "connected":
        return "Conectado";
      case "error":
        return "Falha de conexão";
      default:
        return "Desconhecido";
    }
  }
  render() {
    var t;
    return u`
      ${this._loadError ? u`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <!-- Header -->
      <div class="dashboard-header">
        <div class="brand-logo"><span>PS</span></div>
        <div>
          <h1>PagSeguro Payments</h1>
          <p>Checkout · Transações · Status — plugin para Umbraco 13/17</p>
        </div>
        <span class="status-pill status-pill--${this._connStatus}">
          <span class="status-dot"></span>
          ${this._connLabel()}
        </span>
      </div>

      <!-- Config error notice -->
      ${this._configError ? u`<div class="notice notice--error">
            <strong>Erro ao carregar configuração:</strong> ${this._configError}.
            Verifique as credenciais em <code>appsettings.json</code> (seção
            <code>PagSeguro</code>).
          </div>` : ""}

      <!-- Config info cards -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-card__label">E-mail da conta</div>
          <div class="info-card__value info-card__value--blue">
            ${this._config && this._config.email || "—"}
          </div>
        </div>
        <div class="info-card">
          <div class="info-card__label">Modo sandbox</div>
          <div class="info-card__value ${(t = this._config) != null && t.sandbox ? "info-card__value--warn" : "info-card__value--green"}">
            ${this._config == null ? "—" : this._config.sandbox ? "Ativo (sandbox)" : "Desativado (produção)"}
          </div>
        </div>
        <div class="info-card">
          <div class="info-card__label">API Status</div>
          <div class="info-card__value ${this._connStatus === "connected" ? "info-card__value--green" : ""}">
            ${this._connLabel()}
          </div>
        </div>
      </div>

      <!-- Create Transaction -->
      <uui-box headline="Criar transação (teste)">
        <div class="notice notice--warn">
          Esta ação cria uma transação no ambiente configurado (sandbox ou
          produção). Use apenas para testes e validação da integração.
        </div>

        <div class="form-row">
          <div class="form-col">
            <span class="field-label">Ref. do pedido *</span>
            <input
              class="native-input"
              type="text"
              placeholder="ex.: ORDER-001"
              .value=${this._txOrderRef}
              @input=${(e) => this._txOrderRef = e.target.value}
            />
          </div>
          <div class="form-col">
            <span class="field-label">Valor (BRL) *</span>
            <input
              class="native-input"
              type="number"
              step="0.01"
              min="0.01"
              .value=${this._txAmount}
              @input=${(e) => this._txAmount = e.target.value}
            />
          </div>
          <div class="form-col">
            <span class="field-label">Descrição</span>
            <input
              class="native-input"
              type="text"
              placeholder="Descrição opcional"
              .value=${this._txDescription}
              @input=${(e) => this._txDescription = e.target.value}
            />
          </div>
        </div>

        <div class="btn-row">
          <uui-button
            look="primary"
            color="default"
            label="Criar transação"
            ?disabled=${this._txLoading || !this._txOrderRef.trim()}
            @click=${this._createTransaction}
            style="--uui-button-background-color:${f};--uui-button-background-color-hover:${b};--uui-button-contrast:#fff;--uui-button-contrast-hover:#fff"
          >
            ${this._txLoading ? "Criando…" : "Criar transação"}
          </uui-button>
        </div>

        ${this._txError ? u`<div class="notice notice--error" style="margin-top:12px;margin-bottom:0">
              ${this._txError}
            </div>` : ""}

        ${this._txCheckoutUrl ? u`
            <div class="result-box">
              <div class="result-label">URL de checkout</div>
              <a href="${this._txCheckoutUrl}" target="_blank" rel="noopener noreferrer">
                ${this._txCheckoutUrl}
              </a>
            </div>` : ""}
      </uui-box>

      <!-- Get Transaction Status -->
      <uui-box headline="Consultar status da transação">
        <div class="form-row">
          <div class="form-col">
            <span class="field-label">Código da transação *</span>
            <input
              class="native-input"
              type="text"
              placeholder="ex.: 9E884542-81B3-4419-9A75-BCC6FB495EF1"
              .value=${this._stCode}
              @input=${(e) => this._stCode = e.target.value}
            />
          </div>
        </div>

        <div class="btn-row">
          <uui-button
            look="secondary"
            label="Consultar status"
            ?disabled=${this._stLoading || !this._stCode.trim()}
            @click=${this._getTransactionStatus}
          >
            ${this._stLoading ? "Consultando…" : "Consultar status"}
          </uui-button>
        </div>

        ${this._stError ? u`<div class="notice notice--error" style="margin-top:12px;margin-bottom:0">
              ${this._stError}
            </div>` : ""}

        ${this._stStatus ? u`
            <div class="result-box">
              <div class="result-label">Status</div>
              <span class="tx-status-badge">${this._stStatus}</span>
              <div style="margin-top:6px;font-size:.8125rem;color:var(--uui-color-text-alt,#6b7280)">
                Código: <code>${this._stCode}</code>
              </div>
            </div>` : ""}
      </uui-box>

      <!-- Config hint -->
      <uui-box headline="Configuração">
        <div class="notice notice--info" style="margin-bottom:0">
          As credenciais (Token, Email, Sandbox) são gerenciadas em
          <code>appsettings.json</code> na seção <code>PagSeguro</code>.
          Defina <code>Sandbox: true</code> para testes e <code>false</code>
          para produção.
        </div>
        <div style="margin-top:12px">
          <uui-button
            look="secondary"
            label="Recarregar configuração"
            ?disabled=${this._connStatus === "checking"}
            @click=${this._loadConfig}
          >
            ${this._connStatus === "checking" ? "Carregando…" : "↻ Recarregar configuração"}
          </uui-button>
        </div>
      </uui-box>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakSet();
_ = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
r.styles = T`
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
      background: linear-gradient(135deg, ${f}, ${b});
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 177, 235, 0.35);
    }
    .brand-logo span {
      color: #fff;
      font-weight: 900;
      font-size: 17px;
      line-height: 1;
      letter-spacing: -0.5px;
    }
    .dashboard-header h1 {
      margin: 0 0 3px;
      font-size: 1.45rem;
      font-weight: 700;
    }
    .dashboard-header p {
      margin: 0;
      color: var(--uui-color-text-alt, #6b7280);
      font-size: 0.875rem;
    }

    /* ── Status badge ── */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-left: auto;
      white-space: nowrap;
    }
    .status-pill--unknown  { background: #f3f4f6; color: #374151; }
    .status-pill--checking { background: #e0f5fd; color: #0369a1; }
    .status-pill--connected { background: #d1fae5; color: #065f46; }
    .status-pill--error    { background: #fee2e2; color: #dc2626; }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    /* ── Info cards grid ── */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 10px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .info-card__label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--uui-color-text-alt, #9ca3af);
    }
    .info-card__value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--uui-color-text, #111827);
      word-break: break-all;
    }
    .info-card__value--blue  { color: ${f}; }
    .info-card__value--green { color: ${b}; }
    .info-card__value--warn  { color: #d97706; }

    /* ── Form rows ── */
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
      font-weight: 500;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .native-input {
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 6px;
      padding: 8px 11px;
      font-size: 0.875rem;
      background: var(--uui-color-surface, #fff);
      color: var(--uui-color-text, #111827);
      transition: border-color 0.15s;
      outline: none;
    }
    .native-input:focus {
      border-color: ${f};
      box-shadow: 0 0 0 3px rgba(0, 177, 235, 0.15);
    }

    /* ── Notices ── */
    .notice {
      padding: 11px 15px;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 14px;
      line-height: 1.5;
    }
    .notice--info    { background: #e0f5fd; color: #0c4a6e; border-left: 3px solid ${f}; }
    .notice--success { background: #d1fae5; color: #064e3b; border-left: 3px solid ${b}; }
    .notice--warn    { background: #fffbeb; color: #92400e; border-left: 3px solid #f59e0b; }
    .notice--error   { background: #fef2f2; color: #991b1b; border-left: 3px solid #ef4444; }

    /* ── Result areas ── */
    .result-box {
      margin-top: 14px;
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      border: 1px solid var(--uui-color-border, #e5e7eb);
      background: var(--uui-color-surface-alt, #f9fafb);
    }
    .result-box a {
      color: ${f};
      font-weight: 600;
      word-break: break-all;
    }
    .result-box a:hover {
      color: ${b};
    }
    .result-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt, #6b7280);
      margin-bottom: 6px;
    }

    /* ── Status badge inline ── */
    .tx-status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      background: #e0f5fd;
      color: #0c4a6e;
    }

    /* ── Misc ── */
    uui-box {
      margin-bottom: 20px;
    }
    .section-divider {
      border: none;
      border-top: 1px solid var(--uui-color-border, #e5e7eb);
      margin: 20px 0;
    }
    .btn-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
a([
  s()
], r.prototype, "_connStatus", 2);
a([
  s()
], r.prototype, "_config", 2);
a([
  s()
], r.prototype, "_configError", 2);
a([
  s()
], r.prototype, "_txOrderRef", 2);
a([
  s()
], r.prototype, "_txAmount", 2);
a([
  s()
], r.prototype, "_txDescription", 2);
a([
  s()
], r.prototype, "_txLoading", 2);
a([
  s()
], r.prototype, "_txCheckoutUrl", 2);
a([
  s()
], r.prototype, "_txError", 2);
a([
  s()
], r.prototype, "_stCode", 2);
a([
  s()
], r.prototype, "_stLoading", 2);
a([
  s()
], r.prototype, "_stStatus", 2);
a([
  s()
], r.prototype, "_stError", 2);
a([
  s()
], r.prototype, "_loadError", 2);
r = a([
  O("pagseguro-dashboard")
], r);
const H = r;
export {
  r as PagSeguroDashboardElement,
  H as default
};
