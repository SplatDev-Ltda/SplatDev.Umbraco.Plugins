import { LitElement as $, html as p, css as w, state as s, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function T(t) {
  let o = null, e = null;
  const d = t.consumeContext.bind(t), c = new Promise((n) => {
    d(E, async (i) => {
      var u;
      try {
        o = await ((u = i == null ? void 0 : i.getLatestToken) == null ? void 0 : u.call(i)) ?? null;
      } catch {
        o = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return d(S, (n) => {
    e = n;
  }), async (n, i = {}) => {
    await c;
    const u = new Headers(i.headers);
    o && !u.has("Authorization") && u.set("Authorization", `Bearer ${o}`);
    const l = await fetch(n, { ...i, credentials: "same-origin", headers: u });
    if (!l.ok) {
      const x = l.status === 401 || l.status === 403, y = x ? "Not authorised" : "Could not load data", v = x ? `The backoffice token was ${o ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(n)} — ${v}`), e == null || e.peek("danger", { data: { headline: y, message: v } });
    }
    return l;
  };
}
var L = Object.defineProperty, O = Object.getOwnPropertyDescriptor, m = (t) => {
  throw TypeError(t);
}, r = (t, o, e, d) => {
  for (var c = d > 1 ? void 0 : d ? O(o, e) : o, n = t.length - 1, i; n >= 0; n--)
    (i = t[n]) && (c = (d ? i(o, e, c) : i(c)) || c);
  return d && c && L(o, e, c), c;
}, R = (t, o, e) => o.has(t) || m("Cannot " + e), b = (t, o, e) => (R(t, o, "read from private field"), e ? e.call(t) : o.get(t)), A = (t, o, e) => o.has(t) ? m("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(t) : o.set(t, e), h;
const _ = "/umbraco/api/pagseguro", f = "#00B1EB", g = "#0ECC8B";
let a = class extends k($) {
  constructor() {
    super(...arguments), A(this, h, T(this)), this._connStatus = "unknown", this._config = null, this._configError = "", this._txOrderRef = "", this._txAmount = "10.00", this._txDescription = "", this._txLoading = !1, this._txCheckoutUrl = "", this._txError = "", this._stCode = "", this._stLoading = !1, this._stStatus = "", this._stError = "";
  }
  // ── Lifecycle ──
  connectedCallback() {
    super.connectedCallback(), this._loadConfig();
  }
  // ── API calls ──
  async _loadConfig() {
    this._connStatus = "checking", this._configError = "";
    try {
      const t = await b(this, h).call(this, `${_}/GetConfig`);
      t.ok ? (this._config = await t.json(), this._connStatus = "connected") : (this._connStatus = "error", this._configError = `HTTP ${t.status}: ${t.statusText}`);
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
        const o = await b(this, h).call(this, `${_}/CreateTransaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderRef: this._txOrderRef.trim(),
            amount: t,
            description: this._txDescription.trim() || void 0
          })
        });
        if (o.ok) {
          const e = await o.json();
          this._txCheckoutUrl = e.checkoutUrl ?? "";
        } else {
          const e = await o.text();
          this._txError = `HTTP ${o.status}: ${e || o.statusText}`;
        }
      } catch (o) {
        this._txError = o instanceof Error ? o.message : String(o);
      } finally {
        this._txLoading = !1;
      }
    }
  }
  async _getTransactionStatus() {
    if (this._stCode.trim()) {
      this._stLoading = !0, this._stStatus = "", this._stError = "";
      try {
        const t = await b(this, h).call(this, `${_}/GetTransactionStatus?code=${encodeURIComponent(this._stCode.trim())}`);
        if (t.ok) {
          const o = await t.json();
          this._stStatus = o.status ?? "(sem status)";
        } else {
          const o = await t.text();
          this._stError = `HTTP ${t.status}: ${o || t.statusText}`;
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
  // ── Render ──
  render() {
    var t;
    return p`
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
      ${this._configError ? p`<div class="notice notice--error">
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
              @input=${(o) => this._txOrderRef = o.target.value}
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
              @input=${(o) => this._txAmount = o.target.value}
            />
          </div>
          <div class="form-col">
            <span class="field-label">Descrição</span>
            <input
              class="native-input"
              type="text"
              placeholder="Descrição opcional"
              .value=${this._txDescription}
              @input=${(o) => this._txDescription = o.target.value}
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
            style="--uui-button-background-color:${f};--uui-button-background-color-hover:${g};--uui-button-contrast:#fff;--uui-button-contrast-hover:#fff"
          >
            ${this._txLoading ? "Criando…" : "Criar transação"}
          </uui-button>
        </div>

        ${this._txError ? p`<div class="notice notice--error" style="margin-top:12px;margin-bottom:0">
              ${this._txError}
            </div>` : ""}

        ${this._txCheckoutUrl ? p`
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
              @input=${(o) => this._stCode = o.target.value}
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

        ${this._stError ? p`<div class="notice notice--error" style="margin-top:12px;margin-bottom:0">
              ${this._stError}
            </div>` : ""}

        ${this._stStatus ? p`
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
a.styles = w`
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
      background: linear-gradient(135deg, ${f}, ${g});
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
    .info-card__value--green { color: ${g}; }
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
    .notice--success { background: #d1fae5; color: #064e3b; border-left: 3px solid ${g}; }
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
      color: ${g};
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
  `;
r([
  s()
], a.prototype, "_connStatus", 2);
r([
  s()
], a.prototype, "_config", 2);
r([
  s()
], a.prototype, "_configError", 2);
r([
  s()
], a.prototype, "_txOrderRef", 2);
r([
  s()
], a.prototype, "_txAmount", 2);
r([
  s()
], a.prototype, "_txDescription", 2);
r([
  s()
], a.prototype, "_txLoading", 2);
r([
  s()
], a.prototype, "_txCheckoutUrl", 2);
r([
  s()
], a.prototype, "_txError", 2);
r([
  s()
], a.prototype, "_stCode", 2);
r([
  s()
], a.prototype, "_stLoading", 2);
r([
  s()
], a.prototype, "_stStatus", 2);
r([
  s()
], a.prototype, "_stError", 2);
a = r([
  C("pagseguro-dashboard")
], a);
const B = a;
export {
  a as PagSeguroDashboardElement,
  B as default
};
