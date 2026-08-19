import { LitElement as x, html as l, css as _, state as s, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as y } from "@umbraco-cms/backoffice/auth";
function $(t) {
  let o = null;
  const r = new Promise((n) => {
    t.consumeContext(y, async (a) => {
      var c;
      try {
        o = await ((c = a == null ? void 0 : a.getLatestToken) == null ? void 0 : c.call(a)) ?? null;
      } catch {
        o = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return async (n, a = {}) => {
    await r;
    const c = new Headers(a.headers);
    o && !c.has("Authorization") && c.set("Authorization", `Bearer ${o}`);
    const d = await fetch(n, { ...a, credentials: "same-origin", headers: c });
    return (d.status === 401 || d.status === 403) && console.error(
      `[SplatDev] ${d.status} from ${String(n)} — the backoffice token was ${o ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), d;
  };
}
var k = Object.defineProperty, C = Object.getOwnPropertyDescriptor, b = (t) => {
  throw TypeError(t);
}, i = (t, o, r, n) => {
  for (var a = n > 1 ? void 0 : n ? C(o, r) : o, c = t.length - 1, d; c >= 0; c--)
    (d = t[c]) && (a = (n ? d(o, r, a) : d(a)) || a);
  return n && a && k(o, r, a), a;
}, w = (t, o, r) => o.has(t) || b("Cannot " + r), h = (t, o, r) => (w(t, o, "read from private field"), r ? r.call(t) : o.get(t)), E = (t, o, r) => o.has(t) ? b("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(t) : o.set(t, r), p;
const g = "/umbraco/api/pagseguro", u = "#00B1EB", f = "#0ECC8B";
let e = class extends m(x) {
  constructor() {
    super(...arguments), E(this, p, $(this)), this._connStatus = "unknown", this._config = null, this._configError = "", this._txOrderRef = "", this._txAmount = "10.00", this._txDescription = "", this._txLoading = !1, this._txCheckoutUrl = "", this._txError = "", this._stCode = "", this._stLoading = !1, this._stStatus = "", this._stError = "";
  }
  // ── Lifecycle ──
  connectedCallback() {
    super.connectedCallback(), this._loadConfig();
  }
  // ── API calls ──
  async _loadConfig() {
    this._connStatus = "checking", this._configError = "";
    try {
      const t = await h(this, p).call(this, `${g}/GetConfig`);
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
        const o = await h(this, p).call(this, `${g}/CreateTransaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderRef: this._txOrderRef.trim(),
            amount: t,
            description: this._txDescription.trim() || void 0
          })
        });
        if (o.ok) {
          const r = await o.json();
          this._txCheckoutUrl = r.checkoutUrl ?? "";
        } else {
          const r = await o.text();
          this._txError = `HTTP ${o.status}: ${r || o.statusText}`;
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
        const t = await h(this, p).call(this, `${g}/GetTransactionStatus?code=${encodeURIComponent(this._stCode.trim())}`);
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
    return l`
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
      ${this._configError ? l`<div class="notice notice--error">
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
            style="--uui-button-background-color:${u};--uui-button-background-color-hover:${f};--uui-button-contrast:#fff;--uui-button-contrast-hover:#fff"
          >
            ${this._txLoading ? "Criando…" : "Criar transação"}
          </uui-button>
        </div>

        ${this._txError ? l`<div class="notice notice--error" style="margin-top:12px;margin-bottom:0">
              ${this._txError}
            </div>` : ""}

        ${this._txCheckoutUrl ? l`
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

        ${this._stError ? l`<div class="notice notice--error" style="margin-top:12px;margin-bottom:0">
              ${this._stError}
            </div>` : ""}

        ${this._stStatus ? l`
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
p = /* @__PURE__ */ new WeakMap();
e.styles = _`
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
      background: linear-gradient(135deg, ${u}, ${f});
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
    .info-card__value--blue  { color: ${u}; }
    .info-card__value--green { color: ${f}; }
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
      border-color: ${u};
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
    .notice--info    { background: #e0f5fd; color: #0c4a6e; border-left: 3px solid ${u}; }
    .notice--success { background: #d1fae5; color: #064e3b; border-left: 3px solid ${f}; }
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
      color: ${u};
      font-weight: 600;
      word-break: break-all;
    }
    .result-box a:hover {
      color: ${f};
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
i([
  s()
], e.prototype, "_connStatus", 2);
i([
  s()
], e.prototype, "_config", 2);
i([
  s()
], e.prototype, "_configError", 2);
i([
  s()
], e.prototype, "_txOrderRef", 2);
i([
  s()
], e.prototype, "_txAmount", 2);
i([
  s()
], e.prototype, "_txDescription", 2);
i([
  s()
], e.prototype, "_txLoading", 2);
i([
  s()
], e.prototype, "_txCheckoutUrl", 2);
i([
  s()
], e.prototype, "_txError", 2);
i([
  s()
], e.prototype, "_stCode", 2);
i([
  s()
], e.prototype, "_stLoading", 2);
i([
  s()
], e.prototype, "_stStatus", 2);
i([
  s()
], e.prototype, "_stError", 2);
e = i([
  v("pagseguro-dashboard")
], e);
const R = e;
export {
  e as PagSeguroDashboardElement,
  R as default
};
