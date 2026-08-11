import {
  LitElement,
  html,
  css,
  nothing,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { WhatsAppApi } from "./api";
import { sharedStyles } from "./shared-styles";
import type { WhatsAppStatus } from "./types";

/** Connection health and setup guidance for the WhatsApp integration. */
@customElement("wa-status")
export class WaStatusElement extends UmbElementMixin(LitElement) {
  static override styles = [
    sharedStyles,
    css`
      dl {
        display: grid;
        grid-template-columns: minmax(140px, auto) 1fr;
        gap: var(--uui-size-space-2, 4px) var(--uui-size-space-5, 16px);
        margin: 0;
        font-size: 0.875rem;
      }

      dt {
        font-weight: 600;
        color: var(--uui-color-text-alt);
      }

      dd {
        margin: 0;
        overflow-wrap: anywhere;
      }

      .pill {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .pill.good {
        background: var(--uui-color-positive);
        color: var(--uui-color-selected-contrast, #fff);
      }

      .pill.bad {
        background: var(--uui-color-danger);
        color: var(--uui-color-selected-contrast, #fff);
      }

      .pill.mid {
        background: var(--uui-color-warning);
        color: var(--uui-color-warning-contrast, #000);
      }

      uui-box {
        margin-bottom: var(--uui-size-space-5, 16px);
      }
    `,
  ];

  #api = new WhatsAppApi(this);

  @state() private _status?: WhatsAppStatus;
  @state() private _error = "";
  @state() private _loading = true;

  override connectedCallback() {
    super.connectedCallback();
    void this.#load();
  }

  async #load() {
    this._loading = true;
    this._error = "";
    try {
      this._status = await this.#api.getStatus();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
    }
  }

  #pill(value: string | null | undefined) {
    if (!value) return html`<span class="pill mid">unknown</span>`;
    const upper = value.toUpperCase();
    const tone = upper === "GREEN" ? "good" : upper === "RED" ? "bad" : upper === "YELLOW" ? "mid" : "mid";
    return html`<span class="pill ${tone}">${value}</span>`;
  }

  #renderSetup(status: WhatsAppStatus) {
    const origin = window.location.origin;

    return html`
      <uui-box headline="Setup">
        ${status.configured
          ? nothing
          : html`<div class="error">
              <span>
                Not configured. Set <code>SplatDev:WhatsApp:PhoneNumberId</code> and
                <code>SplatDev:WhatsApp:AccessToken</code> before sending.
              </span>
            </div>`}
        ${status.signatureValidation
          ? nothing
          : html`<div class="warn">
              <span>
                <code>AppSecret</code> is not set, so incoming webhooks are accepted without
                verifying <code>X-Hub-Signature-256</code>. Set it before production — anyone
                who learns the URL could otherwise post fake messages.
              </span>
            </div>`}
        ${status.webhookConfigured
          ? nothing
          : html`<div class="warn">
              <span>
                No <code>WebhookVerifyToken</code> is set, so Meta's verification handshake
                will fail and inbound messages will never arrive.
              </span>
            </div>`}
        <dl>
          <dt>Callback URL</dt>
          <dd><code>${origin}${status.webhookPath}</code></dd>
          <dt>Phone number ID</dt>
          <dd><code>${status.phoneNumberId || "—"}</code></dd>
          <dt>Business account ID</dt>
          <dd><code>${status.businessAccountId || "—"}</code></dd>
          <dt>Service window</dt>
          <dd>${status.windowHours} hours</dd>
        </dl>
      </uui-box>
    `;
  }

  #renderPhone(status: WhatsAppStatus) {
    const phone = status.phone;
    if (!phone) {
      return html`
        <uui-box headline="Phone number">
          <div class="empty">
            Could not reach the WhatsApp API. Check the access token and try again.
          </div>
        </uui-box>
      `;
    }

    const verificationExpired =
      phone.codeVerificationStatus?.toUpperCase() === "EXPIRED";

    return html`
      <uui-box headline="Phone number">
        <dl>
          <dt>Number</dt>
          <dd>${phone.displayPhoneNumber ?? "—"}</dd>
          <dt>Verified name</dt>
          <dd>${phone.verifiedName ?? "—"}</dd>
          <dt>Quality rating</dt>
          <dd>${this.#pill(phone.qualityRating)}</dd>
          <dt>Platform</dt>
          <dd>${phone.platformType ?? "—"}</dd>
          <dt>Verification</dt>
          <dd>
            ${phone.codeVerificationStatus ?? "—"}
            ${verificationExpired
              ? html`<span class="pill mid">re-verify</span>`
              : nothing}
          </dd>
          <dt>Webhook override</dt>
          <dd>
            ${phone.webhookUrl
              ? html`<code>${phone.webhookUrl}</code>`
              : html`<span class="hint">none — uses the app default</span>`}
          </dd>
        </dl>
      </uui-box>
    `;
  }

  override render() {
    return html`
      <div class="head">
        <h1>WhatsApp status</h1>
        <p>Connection health for the WhatsApp Business Cloud API.</p>
      </div>

      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      ${this._loading
        ? html`<uui-loader></uui-loader>`
        : this._status
          ? html`
              ${this.#renderSetup(this._status)}
              ${this.#renderPhone(this._status)}
            `
          : nothing}

      <uui-button
        look="secondary"
        label="Refresh status"
        ?disabled=${this._loading}
        @click=${() => void this.#load()}
      >Refresh</uui-button>
    `;
  }
}

export default WaStatusElement;

declare global {
  interface HTMLElementTagNameMap {
    "wa-status": WaStatusElement;
  }
}
