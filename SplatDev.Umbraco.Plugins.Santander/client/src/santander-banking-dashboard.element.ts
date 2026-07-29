import {
  LitElement,
  html,
  css,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  UmbNotificationContext,
  UMB_NOTIFICATION_CONTEXT,
} from "@umbraco-cms/backoffice/notification";

type Tab =
  | "diagnostics"
  | "balance"
  | "statement"
  | "pix"
  | "payments"
  | "boletos"
  | "fx"
  | "vouchers";

const API_BASE = "/umbraco/backoffice/santander-banking";
const AUTH_HEADER = "X-RISIN-Api-Key";

@customElement("santander-banking-dashboard")
export class SantanderBankingDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
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

  @state() private _activeTab: Tab = "diagnostics";

  @state() private _apiKey: string = "";
  @state() private _loading: boolean = false;

  @state() private _diagnostics: Record<string, any> | null = null;

  @state() private _balanceResult: any = null;
  @state() private _statementResult: any = null;
  @state() private _statementFrom: string = "";
  @state() private _statementTo: string = "";
  @state() private _statementPage: number = 1;

  @state() private _pixValor: number = 0;
  @state() private _pixDescricao: string = "";
  @state() private _pixTxid: string = "";
  @state() private _pixExpiracao: number = 3600;
  @state() private _pixSearchTxid: string = "";
  @state() private _pixResult: any = null;
  @state() private _pixLookupResult: any = null;

  @state() private _paymentPayload: string = "";
  @state() private _paymentId: string = "";
  @state() private _paymentResult: any = null;
  @state() private _paymentLookupResult: any = null;

  @state() private _boletoPayload: string = "";
  @state() private _boletoWorkspaceId: string = "";
  @state() private _boletoBillId: string = "";
  @state() private _boletoResult: any = null;
  @state() private _boletoLookupResult: any = null;
  @state() private _workspacesResult: any = null;

  @state() private _fxPayload: string = "";
  @state() private _fxId: string = "";
  @state() private _fxResult: any = null;
  @state() private _fxLookupResult: any = null;

  @state() private _voucherFrom: string = "";
  @state() private _voucherTo: string = "";
  @state() private _voucherId: string = "";
  @state() private _voucherResult: any = null;
  @state() private _voucherLookupResult: any = null;

  private _notificationContext?: UmbNotificationContext;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx) => {
      this._notificationContext = ctx;
    });
  }

  private _notify(level: "default" | "positive" | "warning" | "danger", msg: string) {
    this._notificationContext?.peek(msg, {
      color: level === "danger" ? "danger" : level === "warning" ? "warning" : level === "positive" ? "positive" : undefined,
    });
  }

  private _headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this._apiKey) h[AUTH_HEADER] = this._apiKey;
    return h;
  }

  private async _api<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: this._headers(),
        ...options,
      });
      if (res.status === 204) return null as T;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.title || `HTTP ${res.status}`);
        return json as T;
      }
      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
      return text as unknown as T;
    } catch (err: any) {
      this._notify("danger", err.message || "Request failed");
      return null;
    }
  }

  // ── Tabs ──

  private _switchTab(tab: Tab) {
    this._activeTab = tab;
    if (tab === "diagnostics") this._runDiagnostics();
  }

  // ── Diagnostics ──

  private async _runDiagnostics() {
    this._loading = true;
    const d = await this._api<Record<string, any>>("/diagnostics");
    this._diagnostics = d;
    this._loading = false;
  }

  // ── Balance ──

  private async _getBalance() {
    this._loading = true;
    this._balanceResult = await this._api("/balance");
    this._loading = false;
  }

  // ── Statement ──

  private async _getStatement() {
    if (!this._statementFrom || !this._statementTo) {
      this._notify("warning", "From and To dates are required.");
      return;
    }
    this._loading = true;
    this._statementResult = await this._api(
      `/statement?from=${this._statementFrom}&to=${this._statementTo}&page=${this._statementPage}`
    );
    this._loading = false;
  }

  // ── PIX QR Code ──

  private async _criarPix() {
    if (!this._pixValor || !this._pixDescricao) {
      this._notify("warning", "Amount and description are required.");
      return;
    }
    this._loading = true;
    this._pixResult = await this._api("/pix/qrcode", {
      method: "POST",
      body: JSON.stringify({
        valor: this._pixValor,
        descricao: this._pixDescricao,
        txid: this._pixTxid || null,
        expiracaoSegundos: this._pixExpiracao,
      }),
    });
    this._loading = false;
  }

  private async _consultarPix() {
    if (!this._pixSearchTxid) {
      this._notify("warning", "TXID is required.");
      return;
    }
    this._loading = true;
    this._pixLookupResult = await this._api(`/pix/qrcode/${this._pixSearchTxid}`);
    this._loading = false;
  }

  // ── Payments ──

  private async _initPayment() {
    if (!this._paymentPayload) {
      this._notify("warning", "Payment payload JSON is required.");
      return;
    }
    let body: any;
    try {
      body = JSON.parse(this._paymentPayload);
    } catch {
      this._notify("danger", "Invalid JSON payload.");
      return;
    }
    this._loading = true;
    this._paymentResult = await this._api("/payments", { method: "POST", body: JSON.stringify(body) });
    this._loading = false;
  }

  private async _lookupPayment() {
    if (!this._paymentId) {
      this._notify("warning", "Payment ID is required.");
      return;
    }
    this._loading = true;
    this._paymentLookupResult = await this._api(`/payments/${this._paymentId}`);
    this._loading = false;
  }

  // ── Boletos ──

  private async _listWorkspaces() {
    this._loading = true;
    this._workspacesResult = await this._api("/boletos/workspaces");
    this._loading = false;
  }

  private async _emitirBoleto() {
    if (!this._boletoPayload) {
      this._notify("warning", "Boleto payload JSON is required.");
      return;
    }
    let body: any;
    try {
      body = JSON.parse(this._boletoPayload);
    } catch {
      this._notify("danger", "Invalid JSON payload.");
      return;
    }
    let url = "/boletos";
    if (this._boletoWorkspaceId) url += `?workspaceId=${encodeURIComponent(this._boletoWorkspaceId)}`;
    this._loading = true;
    this._boletoResult = await this._api(url, { method: "POST", body: JSON.stringify(body) });
    this._loading = false;
  }

  private async _consultarBoleto() {
    if (!this._boletoBillId) {
      this._notify("warning", "Bill ID is required.");
      return;
    }
    let url = `/boletos/${this._boletoBillId}`;
    if (this._boletoWorkspaceId) url += `?workspaceId=${encodeURIComponent(this._boletoWorkspaceId)}`;
    this._loading = true;
    this._boletoLookupResult = await this._api(url);
    this._loading = false;
  }

  // ── FX ──

  private async _cotarFx() {
    if (!this._fxPayload) {
      this._notify("warning", "FX payload JSON is required.");
      return;
    }
    let body: any;
    try {
      body = JSON.parse(this._fxPayload);
    } catch {
      this._notify("danger", "Invalid JSON payload.");
      return;
    }
    this._loading = true;
    this._fxResult = await this._api("/fx/quotes", { method: "POST", body: JSON.stringify(body) });
    this._loading = false;
  }

  private async _consultarFx() {
    if (!this._fxId) {
      this._notify("warning", "Operation ID is required.");
      return;
    }
    this._loading = true;
    this._fxLookupResult = await this._api(`/fx/${this._fxId}`);
    this._loading = false;
  }

  // ── Vouchers ──

  private async _listVouchers() {
    if (!this._voucherFrom || !this._voucherTo) {
      this._notify("warning", "From and To dates are required.");
      return;
    }
    this._loading = true;
    this._voucherResult = await this._api(
      `/vouchers?from=${this._voucherFrom}&to=${this._voucherTo}`
    );
    this._loading = false;
  }

  private async _getVoucher() {
    if (!this._voucherId) {
      this._notify("warning", "Voucher ID is required.");
      return;
    }
    this._loading = true;
    this._voucherLookupResult = await this._api(`/vouchers/${this._voucherId}`);
    this._loading = false;
  }

  // ── Render ──

  private _renderDiagnostics() {
    const d = this._diagnostics;
    return html`
      <uui-box headline="Diagnostics">
        <uui-button look="primary" label="Run Diagnostics" @click=${this._runDiagnostics}>
          Run Diagnostics
        </uui-button>

        ${d
          ? html`
              <div class="diag-grid" style="margin-top:var(--uui-size-space-4,12px);">
                <div class="diag-card">
                  <div class="diag-label">Environment</div>
                  <div class="diag-value">
                    <span class="status-dot ${d.environment}"></span>
                    ${d.environment}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Base URL</div>
                  <div class="diag-value" style="font-size:0.7rem;word-break:break-all;">
                    ${d.baseUrl}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Client Id</div>
                  <div class="diag-value ${d.hasClientId ? "on" : "off"}">
                    ${d.hasClientId ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Client Secret</div>
                  <div class="diag-value ${d.hasClientSecret ? "on" : "off"}">
                    ${d.hasClientSecret ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Certificate</div>
                  <div class="diag-value ${d.hasCertificate ? "on" : "off"}">
                    ${d.hasCertificate ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">PIX Key</div>
                  <div class="diag-value ${d.hasPixKey ? "on" : "off"}">
                    ${d.hasPixKey ? "Configured" : "Missing"}
                  </div>
                </div>
                <div class="diag-card">
                  <div class="diag-label">Workspace ID</div>
                  <div class="diag-value ${d.hasWorkspaceId ? "on" : "off"}">
                    ${d.hasWorkspaceId ? "Configured" : "Missing"}
                  </div>
                </div>
              </div>

              <p style="font-size:0.75rem;font-weight:600;margin:16px 0 8px;color:var(--uui-color-text-alt);">Product Status</p>
              <div class="diag-grid">
                ${Object.entries(d.products as Record<string, { baseUrl: string | null; basePath: string }>).map(
                  ([key, val]) => html`
                    <div class="diag-card">
                      <div class="diag-label">${key}</div>
                      <div class="diag-value ${val.baseUrl ? "on" : "off"}">
                        ${val.baseUrl ? val.baseUrl : "Not configured"}
                      </div>
                    </div>
                  `
                )}
              </div>
            `
          : html`
              <div style="margin-top:var(--uui-size-space-4,12px);color:var(--uui-color-text-alt,#6b7280);">
                Click "Run Diagnostics" to check Santander API configuration.
              </div>
            `}
      </uui-box>
    `;
  }

  private _renderBalance() {
    return html`
      <uui-box headline="Balance">
        <uui-button look="primary" label="Get Balance" @click=${this._getBalance}>
          Get Balance
        </uui-button>
        ${this._balanceResult
          ? html`<div class="result-box">${this._asJson(this._balanceResult)}</div>`
          : nothing}
      </uui-box>
    `;
  }

  private _renderStatement() {
    return html`
      <uui-box headline="Statement">
        <div class="form-grid">
          <div class="form-field">
            <label>From (YYYY-MM-DD)</label>
            <input type="date" .value=${this._statementFrom} @input=${(e: InputEvent) => {
              this._statementFrom = (e.target as HTMLInputElement).value;
            }} />
          </div>
          <div class="form-field">
            <label>To (YYYY-MM-DD)</label>
            <input type="date" .value=${this._statementTo} @input=${(e: InputEvent) => {
              this._statementTo = (e.target as HTMLInputElement).value;
            }} />
          </div>
          <div class="form-field">
            <label>Page</label>
            <input type="number" min="1" .value=${String(this._statementPage)} @input=${(e: InputEvent) => {
              this._statementPage = parseInt((e.target as HTMLInputElement).value) || 1;
            }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="Get Statement" @click=${this._getStatement}>
              Get Statement
            </uui-button>
          </div>
        </div>
        ${this._statementResult
          ? html`<div class="result-box">${this._asJson(this._statementResult)}</div>`
          : nothing}
      </uui-box>
    `;
  }

  private _renderPix() {
    return html`
      <uui-box headline="PIX QR Code — Create">
        <div class="form-grid">
          <div class="form-field">
            <label>Amount (decimal)</label>
            <input type="number" step="0.01" .value=${this._pixValor || ""} @input=${(e: InputEvent) => {
              this._pixValor = parseFloat((e.target as HTMLInputElement).value) || 0;
            }} />
          </div>
          <div class="form-field">
            <label>Description</label>
            <input .value=${this._pixDescricao} @input=${(e: InputEvent) => {
              this._pixDescricao = (e.target as HTMLInputElement).value;
            }} />
          </div>
          <div class="form-field">
            <label>TXID (optional)</label>
            <input .value=${this._pixTxid} @input=${(e: InputEvent) => {
              this._pixTxid = (e.target as HTMLInputElement).value;
            }} />
          </div>
          <div class="form-field">
            <label>Expiration (seconds)</label>
            <input type="number" .value=${String(this._pixExpiracao)} @input=${(e: InputEvent) => {
              this._pixExpiracao = parseInt((e.target as HTMLInputElement).value) || 3600;
            }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="Create PIX" @click=${this._criarPix}>
              Create PIX QR Code
            </uui-button>
          </div>
        </div>
        ${this._pixResult
          ? html`<div class="result-box">${this._asJson(this._pixResult)}</div>`
          : nothing}
      </uui-box>

      <uui-box headline="PIX QR Code — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="TXID"
            .value=${this._pixSearchTxid}
            @input=${(e: InputEvent) => {
              this._pixSearchTxid = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._consultarPix}>Lookup</uui-button>
        </div>
        ${this._pixLookupResult
          ? html`<div class="result-box">${this._asJson(this._pixLookupResult)}</div>`
          : nothing}
      </uui-box>
    `;
  }

  private _renderPayments() {
    return html`
      <uui-box headline="Payments — Initiate">
        <div class="form-field full-width" style="max-width:640px;">
          <label>Payload (JSON)</label>
          <textarea
            rows="6"
            style="width:100%;padding:8px;border:1px solid var(--uui-color-border,#d1d5db);border-radius:4px;font-family:monospace;font-size:0.8rem;box-sizing:border-box;"
            placeholder='{ "key": "value" }'
            .value=${this._paymentPayload}
            @input=${(e: InputEvent) => {
              this._paymentPayload = (e.target as HTMLTextAreaElement).value;
            }}
          ></textarea>
        </div>
        <div style="margin-top:8px;">
          <uui-button look="primary" label="Initiate Payment" @click=${this._initPayment}>
            Initiate Payment
          </uui-button>
        </div>
        ${this._paymentResult
          ? html`<div class="result-box">${this._asJson(this._paymentResult)}</div>`
          : nothing}
      </uui-box>

      <uui-box headline="Payments — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Payment ID"
            .value=${this._paymentId}
            @input=${(e: InputEvent) => {
              this._paymentId = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._lookupPayment}>Lookup</uui-button>
        </div>
        ${this._paymentLookupResult
          ? html`<div class="result-box">${this._asJson(this._paymentLookupResult)}</div>`
          : nothing}
      </uui-box>
    `;
  }

  private _renderBoletos() {
    return html`
      <uui-box headline="Boletos — Workspaces">
        <uui-button look="primary" label="List Workspaces" @click=${this._listWorkspaces}>
          List Workspaces
        </uui-button>
        ${this._workspacesResult
          ? html`<div class="result-box">${this._asJson(this._workspacesResult)}</div>`
          : nothing}
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
              @input=${(e: InputEvent) => {
                this._boletoPayload = (e.target as HTMLTextAreaElement).value;
              }}
            ></textarea>
          </div>
          <div class="form-field">
            <label>Workspace ID</label>
            <input .value=${this._boletoWorkspaceId} @input=${(e: InputEvent) => {
              this._boletoWorkspaceId = (e.target as HTMLInputElement).value;
            }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="Emit Boleto" @click=${this._emitirBoleto}>
              Emit Boleto
            </uui-button>
          </div>
        </div>
        ${this._boletoResult
          ? html`<div class="result-box">${this._asJson(this._boletoResult)}</div>`
          : nothing}
      </uui-box>

      <uui-box headline="Boletos — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Bill ID"
            .value=${this._boletoBillId}
            @input=${(e: InputEvent) => {
              this._boletoBillId = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._consultarBoleto}>Lookup</uui-button>
        </div>
        ${this._boletoLookupResult
          ? html`<div class="result-box">${this._asJson(this._boletoLookupResult)}</div>`
          : nothing}
      </uui-box>
    `;
  }

  private _renderFx() {
    return html`
      <uui-box headline="FX — Quote">
        <div class="form-field full-width" style="max-width:640px;">
          <label>Payload (JSON)</label>
          <textarea
            rows="6"
            style="width:100%;padding:8px;border:1px solid var(--uui-color-border,#d1d5db);border-radius:4px;font-family:monospace;font-size:0.8rem;box-sizing:border-box;"
            placeholder='{ "key": "value" }'
            .value=${this._fxPayload}
            @input=${(e: InputEvent) => {
              this._fxPayload = (e.target as HTMLTextAreaElement).value;
            }}
          ></textarea>
        </div>
        <div style="margin-top:8px;">
          <uui-button look="primary" label="Get Quote" @click=${this._cotarFx}>
            Get FX Quote
          </uui-button>
        </div>
        ${this._fxResult
          ? html`<div class="result-box">${this._asJson(this._fxResult)}</div>`
          : nothing}
      </uui-box>

      <uui-box headline="FX — Lookup" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Operation ID"
            .value=${this._fxId}
            @input=${(e: InputEvent) => {
              this._fxId = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <uui-button look="primary" label="Lookup" @click=${this._consultarFx}>Lookup</uui-button>
        </div>
        ${this._fxLookupResult
          ? html`<div class="result-box">${this._asJson(this._fxLookupResult)}</div>`
          : nothing}
      </uui-box>
    `;
  }

  private _renderVouchers() {
    return html`
      <uui-box headline="Vouchers — List">
        <div class="form-grid">
          <div class="form-field">
            <label>From (YYYY-MM-DD)</label>
            <input type="date" .value=${this._voucherFrom} @input=${(e: InputEvent) => {
              this._voucherFrom = (e.target as HTMLInputElement).value;
            }} />
          </div>
          <div class="form-field">
            <label>To (YYYY-MM-DD)</label>
            <input type="date" .value=${this._voucherTo} @input=${(e: InputEvent) => {
              this._voucherTo = (e.target as HTMLInputElement).value;
            }} />
          </div>
          <div class="form-field full-width">
            <uui-button look="primary" label="List Vouchers" @click=${this._listVouchers}>
              List Vouchers
            </uui-button>
          </div>
        </div>
        ${this._voucherResult
          ? html`<div class="result-box">${this._asJson(this._voucherResult)}</div>`
          : nothing}
      </uui-box>

      <uui-box headline="Vouchers — Get" style="margin-top:var(--uui-size-space-4,12px);">
        <div class="toolbar">
          <uui-input
            placeholder="Voucher ID"
            .value=${this._voucherId}
            @input=${(e: InputEvent) => {
              this._voucherId = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <uui-button look="primary" label="Get Voucher" @click=${this._getVoucher}>Get Voucher</uui-button>
        </div>
        ${this._voucherLookupResult
          ? html`<div class="result-box">${this._asJson(this._voucherLookupResult)}</div>`
          : nothing}
      </uui-box>
    `;
  }

  private _asJson(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  override render() {
    const tabs: { key: Tab; label: string }[] = [
      { key: "diagnostics", label: "Diagnostics" },
      { key: "balance", label: "Balance" },
      { key: "statement", label: "Statement" },
      { key: "pix", label: "PIX QR Code" },
      { key: "payments", label: "Payments" },
      { key: "boletos", label: "Boletos" },
      { key: "fx", label: "FX" },
      { key: "vouchers", label: "Vouchers" },
    ];

    return html`
      <h1>Santander Banking</h1>
      <p class="description">
        Santander Open Banking suite — diagnostics, balance, statement, PIX, payments, boletos, FX, and vouchers.
      </p>

      <div class="api-key-bar">
        <uui-input
          type="password"
          placeholder="X-RISIN-Api-Key"
          .value=${this._apiKey}
          @input=${(e: InputEvent) => {
            this._apiKey = (e.target as HTMLInputElement).value;
          }}
        >
          <span slot="prepend">API Key</span>
        </uui-input>
      </div>

      <uui-tab-group>
        ${tabs.map(
          (t) => html`
            <uui-tab
              label=${t.label}
              ?active=${this._activeTab === t.key}
              @click=${() => this._switchTab(t.key)}
            >
              ${t.label}
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

      ${this._loading
        ? html`<uui-loader-bar style="margin-top:var(--uui-size-space-4,12px);"></uui-loader-bar>`
        : nothing}
    `;
  }
}

export default SantanderBankingDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "santander-banking-dashboard": SantanderBankingDashboardElement;
  }
}
