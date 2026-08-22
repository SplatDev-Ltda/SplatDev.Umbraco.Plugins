import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface Status {
  sandbox: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasCertificate: boolean;
  hasWebhookSecret: boolean;
}

interface Transaction {
  id: number;
  type: string;
  txid: string | null;
  nossoNumero: string | null;
  externalRef: string | null;
  amount: number;
  status: string;
  createdAt: string;
}

/**
 * Banco Inter charges, boletos and account movement.
 *
 * The dashboard made no requests at all, so none of the eight operations behind it could
 * be reached. Because these create real payment instruments when the plugin is not in
 * sandbox mode, the mode is stated at the top rather than left to be inferred.
 */
@customElement("splatdev-bancinter-dashboard")
export class SplatdevBancoInterPaymentsDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 18px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    uui-input, uui-select { width: 100%; }

    .mode {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 16px; margin: 0 0 18px; border-radius: 4px;
      border-left: 4px solid var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
    .mode.live {
      border-left-color: var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
    }
    .mode strong { font-size: 1rem; }

    .balance { font-size: 1.9rem; font-weight: 600; font-variant-numeric: tabular-nums; margin: 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 9px 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    code { font-family: var(--uui-font-monospace, monospace); font-size: 0.85em; word-break: break-all; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.good { background: #d1fae5; color: #065f46; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .msg, .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;

  @state() private _status: Status | null = null;
  @state() private _transactions: Transaction[] = [];
  @state() private _balance: string | null = null;
  @state() private _loading = true;
  @state() private _busy = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  @state() private _pixAmount = "";
  @state() private _pixKey = "";
  @state() private _pixDescription = "";
  @state() private _lastQrCode: string | null = null;

  @state() private _webhookPixKey = "";

  readonly #fetch = createAuthFetch(this);
  private readonly _api = "/umbraco/api/bancointersandbox";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }
    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to use the banking integration. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const [statusResponse, txResponse] = await Promise.all([
        this.#fetch(`${this._api}/GetStatus`),
        this.#fetch(`${this._api}/GetTransactions`),
      ]);
      if (this.#responseOk(statusResponse)) this._status = await statusResponse.json();
      if (txResponse.ok) this._transactions = await txResponse.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
    } finally {
      this._loading = false;
    }
  }

  async #loadBalance(): Promise<void> {
    this._busy = "balance";
    try {
      const response = await this.#fetch(`${this._api}/GetBalance`);
      if (this.#responseOk(response)) {
        const b = await response.json();
        // The field name varies with Inter's account type; show whichever is present.
        const value = b?.disponivel ?? b?.available ?? b?.saldo ?? null;
        this._balance = value === null ? JSON.stringify(b) : String(value);
      }
    } catch {
      this._message = { ok: false, text: "Could not read the balance." };
    } finally {
      this._busy = "";
    }
  }

  async #createPix(): Promise<void> {
    const amount = Number(this._pixAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      this._message = { ok: false, text: "Enter an amount greater than zero." };
      return;
    }
    if (!this._pixKey.trim()) {
      this._message = { ok: false, text: "A Pix key is required." };
      return;
    }

    this._busy = "pix";
    this._lastQrCode = null;
    try {
      const response = await this.#fetch(`${this._api}/CreatePixCharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          pixKey: this._pixKey.trim(),
          description: this._pixDescription.trim() || null,
        }),
      });
      if (this.#responseOk(response)) {
        const result = await response.json();
        this._lastQrCode = result?.qrCode ?? result?.pixCopiaECola ?? null;
        this._message = {
          ok: true,
          text: `Charge created${result?.txid ? ` — txid ${result.txid}` : ""}.`,
        };
        this._pixAmount = "";
        this._pixDescription = "";
        await this.#load();
      }
    } catch {
      this._message = { ok: false, text: "Could not create that charge." };
    } finally {
      this._busy = "";
    }
  }

  async #registerWebhook(): Promise<void> {
    if (!this._webhookPixKey.trim()) {
      this._message = { ok: false, text: "Enter the Pix key the webhook is for." };
      return;
    }

    this._busy = "webhook";
    try {
      const response = await this.#fetch(`${this._api}/RegisterPixWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No URL: the server builds it and appends the secret, so the secret never
        // passes through this page.
        body: JSON.stringify({ pixKey: this._webhookPixKey.trim() }),
      });
      if (response.ok) {
        this._message = { ok: true, text: "Webhook registered with Banco Inter." };
      } else {
        const detail = await response.text();
        this._message = { ok: false, text: detail?.slice(0, 200) || "Could not register the webhook." };
      }
    } catch {
      this._message = { ok: false, text: "Could not register the webhook." };
    } finally {
      this._busy = "";
    }
  }

  #money(v: number): string {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }

  #when(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  #renderMode() {
    const s = this._status;
    if (!s) return nothing;

    const missing: string[] = [];
    if (!s.hasClientId) missing.push("client id");
    if (!s.hasClientSecret) missing.push("client secret");
    if (!s.sandbox && !s.hasCertificate) missing.push("mTLS certificate");
    if (!s.hasWebhookSecret) missing.push("webhook secret");

    return html`
      <div class="mode ${s.sandbox ? "" : "live"}">
        <strong>${s.sandbox ? "Sandbox" : "Production"}</strong>
        <span>
          ${s.sandbox
            ? "Charges created here are test instruments against Inter's sandbox."
            : "Charges created here are real. Money moves."}
        </span>
        ${missing.length
          ? html`<span class="tag">not configured: ${missing.join(", ")}</span>`
          : html`<span class="tag good">configured</span>`}
      </div>
      ${!s.hasWebhookSecret
        ? html`<p class="hint">
            Without <code>BancoInter:WebhookSecret</code> this site rejects every callback
            from Inter, so a charge stays pending even after it has been paid.
          </p>`
        : nothing}
    `;
  }

  override render() {
    return html`
      <h1>Banco Inter</h1>
      <p class="description">
        Pix charges, boletos and account movement for the configured Inter account.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>`
        : nothing}
      ${this._loading ? html`<uui-loader></uui-loader>` : this.#renderMode()}

      <uui-box headline="Account">
        ${this._balance !== null
          ? html`<p class="balance">${this._balance}</p>`
          : html`<p class="hint">Balance is read on demand rather than on every page load.</p>`}
        <div class="actions">
          <uui-button
            look="secondary"
            label="Read balance"
            ?disabled=${this._busy === "balance"}
            @click=${this.#loadBalance}
            >${this._busy === "balance" ? "Reading…" : "Read balance"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Create a Pix charge">
        <div class="grid">
          <div>
            <span class="field-label">Amount (BRL)</span>
            <uui-input
              type="number"
              step="0.01"
              placeholder="0.00"
              .value=${this._pixAmount}
              @input=${(e: Event) => (this._pixAmount = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Pix key</span>
            <uui-input
              placeholder="The key that receives the payment"
              .value=${this._pixKey}
              @input=${(e: Event) => (this._pixKey = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Description (optional)</span>
            <uui-input
              .value=${this._pixDescription}
              @input=${(e: Event) => (this._pixDescription = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>

        ${this._lastQrCode
          ? html`<p class="hint">Pix copia e cola:</p>
              <code>${this._lastQrCode}</code>`
          : nothing}

        <div class="actions">
          <uui-button
            look="primary"
            color=${this._status && !this._status.sandbox ? "danger" : "positive"}
            label="Create charge"
            ?disabled=${this._busy === "pix"}
            @click=${this.#createPix}
            >${this._busy === "pix"
              ? "Creating…"
              : this._status && !this._status.sandbox
                ? "Create a real charge"
                : "Create charge"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Settlement callbacks">
        <div class="grid">
          <div>
            <span class="field-label">Pix key</span>
            <uui-input
              placeholder="The key to receive callbacks for"
              .value=${this._webhookPixKey}
              @input=${(e: Event) => (this._webhookPixKey = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          Registers this site's callback URL with Banco Inter. The server assembles the URL
          and appends the configured secret, so the secret never passes through the browser.
        </p>
        <div class="actions">
          <uui-button
            look="secondary"
            label="Register webhook"
            ?disabled=${this._busy === "webhook" || !this._status?.hasWebhookSecret}
            @click=${this.#registerWebhook}
            >${this._busy === "webhook" ? "Registering…" : "Register webhook"}</uui-button
          >
          ${this._status && !this._status.hasWebhookSecret
            ? html`<span class="hint">Set BancoInter:WebhookSecret first.</span>`
            : nothing}
        </div>
      </uui-box>

      <uui-box headline="Charges and boletos">
        ${this._transactions.length === 0
          ? html`<p class="empty">Nothing created yet.</p>`
          : html`
              <table>
                <thead>
                  <tr><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th><th>Created</th></tr>
                </thead>
                <tbody>
                  ${this._transactions.map(
                    (t) => html`
                      <tr>
                        <td><span class="tag">${t.type}</span></td>
                        <td><code>${t.txid ?? t.nossoNumero ?? t.externalRef ?? "—"}</code></td>
                        <td class="num">${this.#money(t.amount)}</td>
                        <td>
                          <span class="tag ${t.status === "RECEBIDO" ? "good" : ""}">${t.status}</span>
                        </td>
                        <td class="num">${this.#when(t.createdAt)}</td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            `}
      </uui-box>
    `;
  }
}

export default SplatdevBancoInterPaymentsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "splatdev-bancinter-dashboard": SplatdevBancoInterPaymentsDashboardElement;
  }
}
