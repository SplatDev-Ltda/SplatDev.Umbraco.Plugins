import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

type SendState = "idle" | "loading" | "success" | "error";

@customElement("mailer-dashboard")
export class MailerDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-layout-2);
    }

    .dashboard-header h1 {
      margin: 0 0 var(--uui-size-4) 0;
      font-size: var(--uui-size-10);
      font-weight: 700;
      color: var(--uui-color-text);
    }

    .dashboard-header p {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-size-5);
    }

    .section {
      margin-bottom: var(--uui-size-layout-2);
    }

    .send-test-form {
      display: flex;
      gap: var(--uui-size-4);
      align-items: flex-end;
      flex-wrap: wrap;
      margin-top: var(--uui-size-4);
    }

    .send-test-form uui-input {
      flex: 1;
      min-width: 280px;
    }

    .message {
      margin-top: var(--uui-size-4);
      padding: var(--uui-size-4);
      border-radius: var(--uui-border-radius);
      font-size: var(--uui-size-5);
    }

    .message--success {
      background-color: var(--uui-color-positive-emphasis);
      color: var(--uui-color-positive-standalone);
    }

    .message--error {
      background-color: var(--uui-color-danger-emphasis);
      color: var(--uui-color-danger-standalone);
    }

    .info-box-content {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-3);
      font-size: var(--uui-size-5);
      color: var(--uui-color-text-alt);
      line-height: 1.6;
    }

    .info-box-content strong {
      color: var(--uui-color-text);
    }
  `;

  @state()
  private _email = "";

  @state()
  private _sendState: SendState = "idle";

  @state()
  private _message = "";

  private _handleEmailInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._email = input.value;
  }

  private async _sendTestEmail(): Promise<void> {
    if (!this._email.trim()) {
      this._sendState = "error";
      this._message = "Please enter a valid email address.";
      return;
    }

    this._sendState = "loading";
    this._message = "";

    try {
      const response = await this.#fetch(
        `/umbraco/backoffice/api/MailerApi/SendTestAsync?email=${encodeURIComponent(this._email)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        this._sendState = "success";
        this._message = `Test email sent successfully to ${this._email}.`;
      } else {
        const errorText = await response.text();
        this._sendState = "error";
        this._message = `Failed to send email: ${response.status} ${response.statusText}${errorText ? ` — ${errorText}` : ""}`;
      }
    } catch (err) {
      this._sendState = "error";
      this._message = `Unexpected error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  override render() {
    return html`
      <div class="dashboard-header">
        <h1>Mailer Dashboard</h1>
        <p>
          Manage and test the Microsoft Graph email service integration for this
          Umbraco installation.
        </p>
      </div>

      <div class="section">
        <uui-box headline="About the Mailer Plugin">
          <div class="info-box-content">
            <p>
              <strong>Microsoft Graph API</strong> is used to send emails from
              this Umbraco site. Authentication is handled via OAuth 2.0 client
              credentials, allowing the application to send emails on behalf of
              a configured mailbox without user interaction.
            </p>
            <p>
              Configure the Graph API credentials (Tenant ID, Client ID, Client
              Secret, and Sender Address) in
              <code>appsettings.json</code> under the
              <code>Mailer</code> section.
            </p>
          </div>
        </uui-box>
      </div>

      <div class="section">
        <uui-box headline="Send Test Email">
          <p>
            Use the form below to send a test email and verify that the
            Microsoft Graph integration is configured correctly.
          </p>
          <div class="send-test-form">
            <uui-input
              type="email"
              placeholder="recipient@example.com"
              label="Email address"
              .value=${this._email}
              @input=${this._handleEmailInput}
            ></uui-input>
            <uui-button
              look="primary"
              color="positive"
              label="Send Test Email"
              ?disabled=${this._sendState === "loading"}
              @click=${this._sendTestEmail}
            >
              ${this._sendState === "loading" ? "Sending…" : "Send Test Email"}
            </uui-button>
          </div>

          ${this._sendState === "success"
            ? html`<div class="message message--success">${this._message}</div>`
            : ""}
          ${this._sendState === "error"
            ? html`<div class="message message--error">${this._message}</div>`
            : ""}
        </uui-box>
      </div>
    `;
  }
}

export default MailerDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "mailer-dashboard": MailerDashboardElement;
  }
}
