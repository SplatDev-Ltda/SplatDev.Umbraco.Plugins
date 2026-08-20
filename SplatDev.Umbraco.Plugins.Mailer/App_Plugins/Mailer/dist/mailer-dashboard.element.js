import { LitElement as m, html as d, css as p, state as c, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as g } from "@umbraco-cms/backoffice/auth";
function _(e) {
  let t = null;
  const s = new Promise((i) => {
    e.consumeContext(g, async (a) => {
      var r;
      try {
        t = await ((r = a == null ? void 0 : a.getLatestToken) == null ? void 0 : r.call(a)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return async (i, a = {}) => {
    await s;
    const r = new Headers(a.headers);
    t && !r.has("Authorization") && r.set("Authorization", `Bearer ${t}`);
    const o = await fetch(i, { ...a, credentials: "same-origin", headers: r });
    return (o.status === 401 || o.status === 403) && console.error(
      `[SplatDev] ${o.status} from ${String(i)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), o;
  };
}
var b = Object.defineProperty, y = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, l = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? y(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (a = (i ? o(t, s, a) : o(a)) || a);
  return i && a && b(t, s, a), a;
}, S = (e, t, s) => t.has(e) || h("Cannot " + s), x = (e, t, s) => (S(e, t, "read from private field"), s ? s.call(e) : t.get(e)), $ = (e, t, s) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), u;
let n = class extends f(m) {
  constructor() {
    super(...arguments), $(this, u, _(this)), this._email = "", this._sendState = "idle", this._message = "";
  }
  _handleEmailInput(e) {
    const t = e.target;
    this._email = t.value;
  }
  async _sendTestEmail() {
    if (!this._email.trim()) {
      this._sendState = "error", this._message = "Please enter a valid email address.";
      return;
    }
    this._sendState = "loading", this._message = "";
    try {
      const e = await x(this, u).call(this, `/umbraco/backoffice/api/MailerApi/SendTestAsync?email=${encodeURIComponent(this._email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (e.ok)
        this._sendState = "success", this._message = `Test email sent successfully to ${this._email}.`;
      else {
        const t = await e.text();
        this._sendState = "error", this._message = `Failed to send email: ${e.status} ${e.statusText}${t ? ` — ${t}` : ""}`;
      }
    } catch (e) {
      this._sendState = "error", this._message = `Unexpected error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  render() {
    return d`
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

          ${this._sendState === "success" ? d`<div class="message message--success">${this._message}</div>` : ""}
          ${this._sendState === "error" ? d`<div class="message message--error">${this._message}</div>` : ""}
        </uui-box>
      </div>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
n.styles = p`
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
l([
  c()
], n.prototype, "_email", 2);
l([
  c()
], n.prototype, "_sendState", 2);
l([
  c()
], n.prototype, "_message", 2);
n = l([
  v("mailer-dashboard")
], n);
const E = n;
export {
  n as MailerDashboardElement,
  E as default
};
