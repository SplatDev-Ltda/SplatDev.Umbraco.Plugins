import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  enableSsl: boolean;
  fromEmail: string;
  fromName: string;
}

interface SmtpTestResult {
  success: boolean;
  message: string;
  error?: string | null;
}

/**
 * Shows the mail configuration the site is actually running with, and sends a real test
 * message through it.
 *
 * The previous version of this dashboard was a template shared with ~20 other plugins: a
 * hardcoded "Active" badge, a decorative toggle, and a Save button whose handler set a
 * flag for three seconds and wrote nothing. It never called the API. Settings come from
 * IConfiguration and are not writable from here, so this shows them read-only and points
 * at where they are actually set — which is what the plugin can honestly offer.
 */
@customElement("smtp-dashboard")
export class SmtpDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 20px; margin: 0; }
    dt { font-weight: 600; color: var(--uui-color-text-alt, #6b7280); }
    dd { margin: 0; font-family: var(--uui-font-monospace, monospace); overflow-wrap: anywhere; }
    .unset { color: #b45309; font-family: inherit; font-style: italic; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 4px; }
    input { padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db); border-radius: 4px; min-width: 260px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .msg code { display: block; margin-top: 6px; font-size: 0.8125rem; opacity: 0.85; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.875rem; margin-top: 12px; }
  `;

  @state() private _settings: SmtpSettings | null = null;
  @state() private _loading = true;
  @state() private _sending = false;
  @state() private _loadError: string | null = null;
  @state() private _recipient = "";
  @state() private _result: SmtpTestResult | null = null;

  private readonly _api = "/umbraco/api/smtp";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    this._loadError = null;
    try {
      const r = await fetch(`${this._api}/GetSettings`, { credentials: "same-origin" });
      if (!r.ok) throw new Error(`${r.status}`);
      this._settings = await r.json();
    } catch (e) {
      this._loadError = `Could not read the SMTP configuration (${(e as Error).message}).`;
    } finally {
      this._loading = false;
    }
  }

  async #sendTest(): Promise<void> {
    this._sending = true;
    this._result = null;
    try {
      const q = this._recipient ? `?to=${encodeURIComponent(this._recipient)}` : "";
      const r = await fetch(`${this._api}/SendTest${q}`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(`${r.status}`);
      this._result = await r.json();
    } catch (e) {
      this._result = {
        success: false,
        message: "The request failed.",
        error: (e as Error).message,
      };
    } finally {
      this._sending = false;
    }
  }

  #value(v: string | undefined) {
    return v ? html`${v}` : html`<span class="unset">not set</span>`;
  }

  override render() {
    return html`
      <h1>SMTP</h1>
      <p class="description">
        The mail configuration this site is running with, and a test that sends through it.
      </p>

      ${this._loading
        ? html`<uui-loader></uui-loader>`
        : this._loadError
          ? html`<div class="msg error">${this._loadError}</div>`
          : html`
              <uui-box headline="Current configuration">
                <dl>
                  <dt>Host</dt><dd>${this.#value(this._settings?.host)}</dd>
                  <dt>Port</dt><dd>${this._settings?.port ?? "—"}</dd>
                  <dt>SSL</dt><dd>${this._settings?.enableSsl ? "enabled" : "disabled"}</dd>
                  <dt>Username</dt><dd>${this.#value(this._settings?.username)}</dd>
                  <dt>Password</dt>
                  <dd>${this._settings?.password
                        ? html`•••••••• <span class="hint">(never sent to the browser)</span>`
                        : html`<span class="unset">not set</span>`}</dd>
                  <dt>From</dt><dd>${this.#value(this._settings?.fromEmail)}</dd>
                  <dt>From name</dt><dd>${this.#value(this._settings?.fromName)}</dd>
                </dl>
                <p class="hint">
                  Read from the <code>SmtpSettings</code> configuration section. Change it in
                  appsettings.json, user secrets, or environment variables — not from here.
                </p>
              </uui-box>

              <uui-box headline="Send a test message" style="margin-top:16px;">
                <div class="row">
                  <input
                    type="email"
                    placeholder=${this._settings?.fromEmail || "recipient@example.com"}
                    .value=${this._recipient}
                    @input=${(e: InputEvent) =>
                      (this._recipient = (e.target as HTMLInputElement).value)} />
                  <uui-button
                    look="primary"
                    ?disabled=${this._sending || !this._settings?.host}
                    @click=${this.#sendTest}>
                    ${this._sending ? "Sending…" : "Send test"}
                  </uui-button>
                </div>
                <p class="hint">
                  Leave blank to send to the configured from-address. The message is sent with
                  the credentials above, which stay on the server.
                </p>

                ${this._result
                  ? html`
                      <div class="msg ${this._result.success ? "success" : "error"}">
                        ${this._result.message}
                        ${this._result.error ? html`<code>${this._result.error}</code>` : ""}
                      </div>
                    `
                  : ""}
              </uui-box>
            `}
    `;
  }
}

export default SmtpDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "smtp-dashboard": SmtpDashboardElement;
  }
}
