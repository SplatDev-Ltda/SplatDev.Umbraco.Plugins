import { LitElement as y, html as r, nothing as u, css as x, state as s, customElement as k } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as w } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as m } from "@umbraco-cms/backoffice/notification";
function I(t) {
  let e = null, o = null;
  const p = t.consumeContext.bind(t), n = new Promise((l) => {
    p(w, async (d) => {
      var h;
      try {
        e = await ((h = d == null ? void 0 : d.getLatestToken) == null ? void 0 : h.call(d)) ?? null;
      } catch {
        e = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return p(m, (l) => {
    o = l;
  }), async (l, d = {}) => {
    await n;
    const h = new Headers(d.headers);
    e && !h.has("Authorization") && h.set("Authorization", `Bearer ${e}`);
    const c = await fetch(l, { ...d, credentials: "same-origin", headers: h });
    if (!c.ok) {
      const v = c.status === 401 || c.status === 403, g = v ? "Not authorised" : "Could not load data", b = v ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(l)} — ${b}`), o == null || o.peek("danger", { data: { headline: g, message: b } });
    }
    return c;
  };
}
var R = Object.defineProperty, P = Object.getOwnPropertyDescriptor, f = (t) => {
  throw TypeError(t);
}, a = (t, e, o, p) => {
  for (var n = p > 1 ? void 0 : p ? P(e, o) : e, l = t.length - 1, d; l >= 0; l--)
    (d = t[l]) && (n = (p ? d(e, o, n) : d(n)) || n);
  return p && n && R(e, o, n), n;
}, T = (t, e, o) => e.has(t) || f("Cannot " + o), S = (t, e, o) => (T(t, e, "read from private field"), o ? o.call(t) : e.get(t)), L = (t, e, o) => e.has(t) ? f("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), _;
const z = "/umbraco/backoffice/santander-banking", D = "X-RISIN-Api-Key";
let i = class extends $(y) {
  constructor() {
    super(), L(this, _, I(this)), this._activeTab = "diagnostics", this._apiKey = "", this._loading = !1, this._diagnostics = null, this._balanceResult = null, this._statementResult = null, this._statementFrom = "", this._statementTo = "", this._statementPage = 1, this._pixValor = 0, this._pixDescricao = "", this._pixTxid = "", this._pixExpiracao = 3600, this._pixSearchTxid = "", this._pixResult = null, this._pixLookupResult = null, this._paymentPayload = "", this._paymentId = "", this._paymentResult = null, this._paymentLookupResult = null, this._boletoPayload = "", this._boletoWorkspaceId = "", this._boletoBillId = "", this._boletoResult = null, this._boletoLookupResult = null, this._workspacesResult = null, this._fxPayload = "", this._fxId = "", this._fxResult = null, this._fxLookupResult = null, this._voucherFrom = "", this._voucherTo = "", this._voucherId = "", this._voucherResult = null, this._voucherLookupResult = null, this.consumeContext(m, (t) => {
      this._notificationContext = t;
    });
  }
  _notify(t, e) {
    var o;
    (o = this._notificationContext) == null || o.peek(e, {
      color: t === "danger" ? "danger" : t === "warning" ? "warning" : t === "positive" ? "positive" : void 0
    });
  }
  _headers() {
    const t = { "Content-Type": "application/json" };
    return this._apiKey && (t[D] = this._apiKey), t;
  }
  async _api(t, e) {
    try {
      const o = await S(this, _).call(this, `${z}${t}`, {
        headers: this._headers(),
        ...e
      });
      if (o.status === 204) return null;
      if ((o.headers.get("content-type") || "").includes("application/json")) {
        const l = await o.json();
        if (!o.ok) throw new Error(l.error || l.title || `HTTP ${o.status}`);
        return l;
      }
      const n = await o.text();
      if (!o.ok) throw new Error(n || `HTTP ${o.status}`);
      return n;
    } catch (o) {
      return this._notify("danger", o.message || "Request failed"), null;
    }
  }
  // ── Tabs ──
  _switchTab(t) {
    this._activeTab = t, t === "diagnostics" && this._runDiagnostics();
  }
  // ── Diagnostics ──
  async _runDiagnostics() {
    this._loading = !0;
    const t = await this._api("/diagnostics");
    this._diagnostics = t, this._loading = !1;
  }
  // ── Balance ──
  async _getBalance() {
    this._loading = !0, this._balanceResult = await this._api("/balance"), this._loading = !1;
  }
  // ── Statement ──
  async _getStatement() {
    if (!this._statementFrom || !this._statementTo) {
      this._notify("warning", "From and To dates are required.");
      return;
    }
    this._loading = !0, this._statementResult = await this._api(
      `/statement?from=${this._statementFrom}&to=${this._statementTo}&page=${this._statementPage}`
    ), this._loading = !1;
  }
  // ── PIX QR Code ──
  async _criarPix() {
    if (!this._pixValor || !this._pixDescricao) {
      this._notify("warning", "Amount and description are required.");
      return;
    }
    this._loading = !0, this._pixResult = await this._api("/pix/qrcode", {
      method: "POST",
      body: JSON.stringify({
        valor: this._pixValor,
        descricao: this._pixDescricao,
        txid: this._pixTxid || null,
        expiracaoSegundos: this._pixExpiracao
      })
    }), this._loading = !1;
  }
  async _consultarPix() {
    if (!this._pixSearchTxid) {
      this._notify("warning", "TXID is required.");
      return;
    }
    this._loading = !0, this._pixLookupResult = await this._api(`/pix/qrcode/${this._pixSearchTxid}`), this._loading = !1;
  }
  // ── Payments ──
  async _initPayment() {
    if (!this._paymentPayload) {
      this._notify("warning", "Payment payload JSON is required.");
      return;
    }
    let t;
    try {
      t = JSON.parse(this._paymentPayload);
    } catch {
      this._notify("danger", "Invalid JSON payload.");
      return;
    }
    this._loading = !0, this._paymentResult = await this._api("/payments", { method: "POST", body: JSON.stringify(t) }), this._loading = !1;
  }
  async _lookupPayment() {
    if (!this._paymentId) {
      this._notify("warning", "Payment ID is required.");
      return;
    }
    this._loading = !0, this._paymentLookupResult = await this._api(`/payments/${this._paymentId}`), this._loading = !1;
  }
  // ── Boletos ──
  async _listWorkspaces() {
    this._loading = !0, this._workspacesResult = await this._api("/boletos/workspaces"), this._loading = !1;
  }
  async _emitirBoleto() {
    if (!this._boletoPayload) {
      this._notify("warning", "Boleto payload JSON is required.");
      return;
    }
    let t;
    try {
      t = JSON.parse(this._boletoPayload);
    } catch {
      this._notify("danger", "Invalid JSON payload.");
      return;
    }
    let e = "/boletos";
    this._boletoWorkspaceId && (e += `?workspaceId=${encodeURIComponent(this._boletoWorkspaceId)}`), this._loading = !0, this._boletoResult = await this._api(e, { method: "POST", body: JSON.stringify(t) }), this._loading = !1;
  }
  async _consultarBoleto() {
    if (!this._boletoBillId) {
      this._notify("warning", "Bill ID is required.");
      return;
    }
    let t = `/boletos/${this._boletoBillId}`;
    this._boletoWorkspaceId && (t += `?workspaceId=${encodeURIComponent(this._boletoWorkspaceId)}`), this._loading = !0, this._boletoLookupResult = await this._api(t), this._loading = !1;
  }
  // ── FX ──
  async _cotarFx() {
    if (!this._fxPayload) {
      this._notify("warning", "FX payload JSON is required.");
      return;
    }
    let t;
    try {
      t = JSON.parse(this._fxPayload);
    } catch {
      this._notify("danger", "Invalid JSON payload.");
      return;
    }
    this._loading = !0, this._fxResult = await this._api("/fx/quotes", { method: "POST", body: JSON.stringify(t) }), this._loading = !1;
  }
  async _consultarFx() {
    if (!this._fxId) {
      this._notify("warning", "Operation ID is required.");
      return;
    }
    this._loading = !0, this._fxLookupResult = await this._api(`/fx/${this._fxId}`), this._loading = !1;
  }
  // ── Vouchers ──
  async _listVouchers() {
    if (!this._voucherFrom || !this._voucherTo) {
      this._notify("warning", "From and To dates are required.");
      return;
    }
    this._loading = !0, this._voucherResult = await this._api(
      `/vouchers?from=${this._voucherFrom}&to=${this._voucherTo}`
    ), this._loading = !1;
  }
  async _getVoucher() {
    if (!this._voucherId) {
      this._notify("warning", "Voucher ID is required.");
      return;
    }
    this._loading = !0, this._voucherLookupResult = await this._api(`/vouchers/${this._voucherId}`), this._loading = !1;
  }
  // ── Render ──
  _renderDiagnostics() {
    const t = this._diagnostics;
    return r`
      <uui-box headline="Diagnostics">
        <uui-button look="primary" label="Run Diagnostics" @click=${this._runDiagnostics}>
          Run Diagnostics
        </uui-button>

        ${t ? r`
              <div class="diag-grid" style="margin-top:var(--uui-size-space-4,12px);">
                <div class="diag-card">
                  <div class="diag-label">Environment</div>
                  <div class="diag-value">
                    <span class="status-dot ${t.environment}"></span>
                    ${t.environment}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Base URL</div>
                  <div class="diag-value" style="font-size:0.7rem;word-break:break-all;">
                    ${t.baseUrl}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Client Id</div>
                  <div class="diag-value ${t.hasClientId ? "on" : "off"}">
                    ${t.hasClientId ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Client Secret</div>
                  <div class="diag-value ${t.hasClientSecret ? "on" : "off"}">
                    ${t.hasClientSecret ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Certificate</div>
                  <div class="diag-value ${t.hasCertificate ? "on" : "off"}">
                    ${t.hasCertificate ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">PIX Key</div>
                  <div class="diag-value ${t.hasPixKey ? "on" : "off"}">
                    ${t.hasPixKey ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Workspace ID</div>
                  <div class="diag-value ${t.hasWorkspaceId ? "on" : "off"}">
                    ${t.hasWorkspaceId ? "Configured" : "Missing"}
                  </div>
                </div>
              </div>

              <p style="font-size:0.75rem;font-weight:600;margin:16px 0 8px;color:var(--uui-color-text-alt);">Product Status</p>
              <div class="diag-grid">
                ${Object.entries(t.products).map(
      ([e, o]) => r`
                    <div class="diag-card">
                      <div class="diag-label">${e}</div>
                      <div class="diag-value ${o.baseUrl ? "on" : "off"}">
                        ${o.baseUrl ? o.baseUrl : "Not configured"}
                      </div>
                    </div>
                  `
    )}
              </div>
            ` : r`
              <div style="margin-top:var(--uui-size-space-4,12px);color:var(--uui-color-text-alt,#6b7280);">
                Click "Run Diagnostics" to check Santander API configuration.
              </div>
            `}
      </uui-box>
    `;
  }
  _renderBalance() {
    return r`
      <uui-box headline="Balance">
        <uui-button look="primary" label="Get Balance" @click=${this._getBalance}>
          Get Balance
        </uui-button>
        ${this._balanceResult ? r`<div class="result-box">${this._asJson(this._balanceResult)}</div>` : u}
      </uui-box>
    `;
  }
  _renderStatement() {
    return r`
      <uui-box headline="Statement">
        <div class="form-grid">
          <div class="form-field">
            <label>From (YYYY-MM-DD)</label>
            <input type="date" .value=${this._statementFrom} @input=${(t) => {
      this._statementFrom = t.target.value;
    }} />
          </div>
          <div class="form-field">
            <label>To (YYYY-MM-DD)</label>
            <input type="date" .value=${this._statementTo} @input=${(t) => {
      this._statementTo = t.target.value;
    }} />
          </div>
          <div class="form-field">
            <label>Page</label>
            <input type="number" min="1" .value=${String(this._statementPage)} @input=${(t) => {
      this._statementPage = parseInt(t.target.value) || 1;
    }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="Get Statement" @click=${this._getStatement}>
              Get Statement
            </uui-button>
          </div>
        </div>
        ${this._statementResult ? r`<div class="result-box">${this._asJson(this._statementResult)}</div>` : u}
      </uui-box>
    `;
  }
  _renderPix() {
    return r`
      <uui-box headline="PIX QR Code — Create">
        <div class="form-grid">
          <div class="form-field">
            <label>Amount (decimal)</label>
            <input type="number" step="0.01" .value=${this._pixValor || ""} @input=${(t) => {
      this._pixValor = parseFloat(t.target.value) || 0;
    }} />
          </div>
          <div class="form-field">
            <label>Description</label>
            <input .value=${this._pixDescricao} @input=${(t) => {
      this._pixDescricao = t.target.value;
    }} />
          </div>
          <div class="form-field">
            <label>TXID (optional)</label>
            <input .value=${this._pixTxid} @input=${(t) => {
      this._pixTxid = t.target.value;
    }} />
          </div>
          <div class="form-field">
            <label>Expiration (seconds)</label>
            <input type="number" .value=${String(this._pixExpiracao)} @input=${(t) => {
      this._pixExpiracao = parseInt(t.target.value) || 3600;
    }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="Create PIX" @click=${this._criarPix}>
              Create PIX QR Code
            </uui-button>
          </div>
        </div>
        ${this._pixResult ? r`<div class="result-box">${this._asJson(this._pixResult)}</div>` : u}
      </uui-box>

      <uui-box headline="PIX QR Code — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="TXID"
            .value=${this._pixSearchTxid}
            @input=${(t) => {
      this._pixSearchTxid = t.target.value;
    }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._consultarPix}>Lookup</uui-button>
        </div>
        ${this._pixLookupResult ? r`<div class="result-box">${this._asJson(this._pixLookupResult)}</div>` : u}
      </uui-box>
    `;
  }
  _renderPayments() {
    return r`
      <uui-box headline="Payments — Initiate">
        <div class="form-field full-width" style="max-width:640px;">
          <label>Payload (JSON)</label>
          <textarea
            rows="6"
            style="width:100%;padding:8px;border:1px solid var(--uui-color-border,#d1d5db);border-radius:4px;font-family:monospace;font-size:0.8rem;box-sizing:border-box;"
            placeholder='{ "key": "value" }'
            .value=${this._paymentPayload}
            @input=${(t) => {
      this._paymentPayload = t.target.value;
    }}
          ></textarea>
        </div>
        <div style="margin-top:8px;">
          <uui-button look="primary" label="Initiate Payment" @click=${this._initPayment}>
            Initiate Payment
          </uui-button>
        </div>
        ${this._paymentResult ? r`<div class="result-box">${this._asJson(this._paymentResult)}</div>` : u}
      </uui-box>

      <uui-box headline="Payments — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Payment ID"
            .value=${this._paymentId}
            @input=${(t) => {
      this._paymentId = t.target.value;
    }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._lookupPayment}>Lookup</uui-button>
        </div>
        ${this._paymentLookupResult ? r`<div class="result-box">${this._asJson(this._paymentLookupResult)}</div>` : u}
      </uui-box>
    `;
  }
  _renderBoletos() {
    return r`
      <uui-box headline="Boletos — Workspaces">
        <uui-button look="primary" label="List Workspaces" @click=${this._listWorkspaces}>
          List Workspaces
        </uui-button>
        ${this._workspacesResult ? r`<div class="result-box">${this._asJson(this._workspacesResult)}</div>` : u}
      </uui-box>

      <uui-box headline="Boletos — Emit" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="form-grid">
          <div class="form-field full-width">
            <label>Payload (JSON)</label>
            <textarea
              rows="6"
              style="width:100%;padding:8px;border:1px solid var(--uui-color-border,#d1d5db);border-radius:4px;font-family:monospace;font-size:0.8rem;box-sizing:border-box;"
              placeholder='{ "key": "value" }'
              .value=${this._boletoPayload}
              @input=${(t) => {
      this._boletoPayload = t.target.value;
    }}
            ></textarea>
          </div>
          <div class="form-field">
            <label>Workspace ID</label>
            <input .value=${this._boletoWorkspaceId} @input=${(t) => {
      this._boletoWorkspaceId = t.target.value;
    }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="Emit Boleto" @click=${this._emitirBoleto}>
              Emit Boleto
            </uui-button>
          </div>
        </div>
        ${this._boletoResult ? r`<div class="result-box">${this._asJson(this._boletoResult)}</div>` : u}
      </uui-box>

      <uui-box headline="Boletos — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Bill ID"
            .value=${this._boletoBillId}
            @input=${(t) => {
      this._boletoBillId = t.target.value;
    }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._consultarBoleto}>Lookup</uui-button>
        </div>
        ${this._boletoLookupResult ? r`<div class="result-box">${this._asJson(this._boletoLookupResult)}</div>` : u}
      </uui-box>
    `;
  }
  _renderFx() {
    return r`
      <uui-box headline="FX — Quote">
        <div class="form-field full-width" style="max-width:640px;">
          <label>Payload (JSON)</label>
          <textarea
            rows="6"
            style="width:100%;padding:8px;border:1px solid var(--uui-color-border,#d1d5db);border-radius:4px;font-family:monospace;font-size:0.8rem;box-sizing:border-box;"
            placeholder='{ "key": "value" }'
            .value=${this._fxPayload}
            @input=${(t) => {
      this._fxPayload = t.target.value;
    }}
          ></textarea>
        </div>
        <div style="margin-top:8px;">
          <uui-button look="primary" label="Get Quote" @click=${this._cotarFx}>
            Get FX Quote
          </uui-button>
        </div>
        ${this._fxResult ? r`<div class="result-box">${this._asJson(this._fxResult)}</div>` : u}
      </uui-box>

      <uui-box headline="FX — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Operation ID"
            .value=${this._fxId}
            @input=${(t) => {
      this._fxId = t.target.value;
    }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._consultarFx}>Lookup</uui-button>
        </div>
        ${this._fxLookupResult ? r`<div class="result-box">${this._asJson(this._fxLookupResult)}</div>` : u}
      </uui-box>
    `;
  }
  _renderVouchers() {
    return r`
      <uui-box headline="Vouchers — List">
        <div class="form-grid">
          <div class="form-field">
            <label>From (YYYY-MM-DD)</label>
            <input type="date" .value=${this._voucherFrom} @input=${(t) => {
      this._voucherFrom = t.target.value;
    }} />
          </div>
          <div class="form-field">
            <label>To (YYYY-MM-DD)</label>
            <input type="date" .value=${this._voucherTo} @input=${(t) => {
      this._voucherTo = t.target.value;
    }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="List Vouchers" @click=${this._listVouchers}>
              List Vouchers
            </uui-button>
          </div>
        </div>
        ${this._voucherResult ? r`<div class="result-box">${this._asJson(this._voucherResult)}</div>` : u}
      </uui-box>

      <uui-box headline="Vouchers — Get" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Voucher ID"
            .value=${this._voucherId}
            @input=${(t) => {
      this._voucherId = t.target.value;
    }}
          ></uui-input>
          <uui-button look="primary" label="Get Voucher" @click=${this._getVoucher}>Get Voucher</uui-button>
        </div>
        ${this._voucherLookupResult ? r`<div class="result-box">${this._asJson(this._voucherLookupResult)}</div>` : u}
      </uui-box>
    `;
  }
  _asJson(t) {
    try {
      return JSON.stringify(t, null, 2);
    } catch {
      return String(t);
    }
  }
  render() {
    const t = [
      { key: "diagnostics", label: "Diagnostics" },
      { key: "balance", label: "Balance" },
      { key: "statement", label: "Statement" },
      { key: "pix", label: "PIX QR Code" },
      { key: "payments", label: "Payments" },
      { key: "boletos", label: "Boletos" },
      { key: "fx", label: "FX" },
      { key: "vouchers", label: "Vouchers" }
    ];
    return r`
      <h1>Santander Banking</h1>
      <p class="description">
        Santander Open Banking suite — diagnostics, balance, statement, PIX, payments, boletos, FX, and vouchers.
      </p>

      <div class="api-key-bar">
        <uui-input
          type="password"
          placeholder="X-RISIN-Api-Key"
          .value=${this._apiKey}
          @input=${(e) => {
      this._apiKey = e.target.value;
    }}
        >
          <span slot="prepend">API Key</span>
        </uui-input>
      </div>

      <uui-tab-group>
        ${t.map(
      (e) => r`
            <uui-tab
              label=${e.label}
              ?active=${this._activeTab === e.key}
              @click=${() => this._switchTab(e.key)}
            >
              ${e.label}
            </uui-tab>
          `
    )}
      </uui-tab-group>

      <div class="tab-content">
        ${(() => {
      switch (this._activeTab) {
        case "diagnostics":
          return this._renderDiagnostics();
        case "balance":
          return this._renderBalance();
        case "statement":
          return this._renderStatement();
        case "pix":
          return this._renderPix();
        case "payments":
          return this._renderPayments();
        case "boletos":
          return this._renderBoletos();
        case "fx":
          return this._renderFx();
        case "vouchers":
          return this._renderVouchers();
      }
    })()}
      </div>

      ${this._loading ? r`<uui-loader-bar style="margin-top:var(--uui-size-space-4,12px);"></uui-loader-bar>` : u}
    `;
  }
};
_ = /* @__PURE__ */ new WeakMap();
i.styles = x`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--uui-size-space-1, 4px);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 var(--uui-size-space-5, 16px);
      font-size: 0.875rem;
    }

    uui-tab-group {
      margin-bottom: var(--uui-size-space-5, 16px);
      overflow-x: auto;
      white-space: nowrap;
      padding-bottom: 4px;
    }

    .tab-content {
      margin-top: var(--uui-size-space-5, 16px);
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-4, 12px);
      margin-bottom: var(--uui-size-space-4, 12px);
      flex-wrap: wrap;
    }

    uui-input {
      min-width: 280px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-space-4, 12px);
      max-width: 640px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .form-field input,
    .form-field select {
      padding: 8px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: var(--uui-border-radius, 4px);
      font-size: 0.875rem;
      font-family: inherit;
      background: var(--uui-color-surface, #fff);
      color: var(--uui-color-text, #111827);
      box-sizing: border-box;
      width: 100%;
    }

    .result-box {
      margin-top: var(--uui-size-space-4, 12px);
      background: var(--uui-color-surface-alt, #f9fafb);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-space-4, 12px);
      font-family: "Fira Code", "Consolas", monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 480px;
      overflow-y: auto;
      color: var(--uui-color-text, #111827);
    }

    .status-row {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 8px);
      margin-bottom: var(--uui-size-space-4, 12px);
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .status-dot.sandbox {
      background: #f59e0b;
    }
    .status-dot.production {
      background: #10b981;
    }
    .status-dot.disconnected {
      background: #ef4444;
    }

    .diag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--uui-size-space-3, 8px);
    }

    .diag-card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    }

    .diag-card .diag-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .diag-card .diag-value {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--uui-color-text, #111827);
      margin-top: 2px;
    }

    .diag-card .diag-value.on {
      color: #10b981;
    }
    .diag-card .diag-value.off {
      color: #ef4444;
    }

    .api-key-bar {
      margin-bottom: var(--uui-size-space-5, 16px);
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 8px);
    }
  `;
a([
  s()
], i.prototype, "_activeTab", 2);
a([
  s()
], i.prototype, "_apiKey", 2);
a([
  s()
], i.prototype, "_loading", 2);
a([
  s()
], i.prototype, "_diagnostics", 2);
a([
  s()
], i.prototype, "_balanceResult", 2);
a([
  s()
], i.prototype, "_statementResult", 2);
a([
  s()
], i.prototype, "_statementFrom", 2);
a([
  s()
], i.prototype, "_statementTo", 2);
a([
  s()
], i.prototype, "_statementPage", 2);
a([
  s()
], i.prototype, "_pixValor", 2);
a([
  s()
], i.prototype, "_pixDescricao", 2);
a([
  s()
], i.prototype, "_pixTxid", 2);
a([
  s()
], i.prototype, "_pixExpiracao", 2);
a([
  s()
], i.prototype, "_pixSearchTxid", 2);
a([
  s()
], i.prototype, "_pixResult", 2);
a([
  s()
], i.prototype, "_pixLookupResult", 2);
a([
  s()
], i.prototype, "_paymentPayload", 2);
a([
  s()
], i.prototype, "_paymentId", 2);
a([
  s()
], i.prototype, "_paymentResult", 2);
a([
  s()
], i.prototype, "_paymentLookupResult", 2);
a([
  s()
], i.prototype, "_boletoPayload", 2);
a([
  s()
], i.prototype, "_boletoWorkspaceId", 2);
a([
  s()
], i.prototype, "_boletoBillId", 2);
a([
  s()
], i.prototype, "_boletoResult", 2);
a([
  s()
], i.prototype, "_boletoLookupResult", 2);
a([
  s()
], i.prototype, "_workspacesResult", 2);
a([
  s()
], i.prototype, "_fxPayload", 2);
a([
  s()
], i.prototype, "_fxId", 2);
a([
  s()
], i.prototype, "_fxResult", 2);
a([
  s()
], i.prototype, "_fxLookupResult", 2);
a([
  s()
], i.prototype, "_voucherFrom", 2);
a([
  s()
], i.prototype, "_voucherTo", 2);
a([
  s()
], i.prototype, "_voucherId", 2);
a([
  s()
], i.prototype, "_voucherResult", 2);
a([
  s()
], i.prototype, "_voucherLookupResult", 2);
i = a([
  k("santander-banking-dashboard")
], i);
const J = i;
export {
  i as SantanderBankingDashboardElement,
  J as default
};
