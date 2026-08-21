import { LitElement as _, html as c, css as b, state as m, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function $(e) {
  let t = null, s = null;
  const o = e.consumeContext.bind(e), r = new Promise((i) => {
    o(T, async (a) => {
      var d;
      try {
        t = await ((d = a == null ? void 0 : a.getLatestToken) == null ? void 0 : d.call(a)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return o(S, (i) => {
    s = i;
  }), async (i, a = {}) => {
    await r;
    const d = new Headers(a.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const n = await fetch(i, { ...a, credentials: "same-origin", headers: d });
    if (!n.ok) {
      const p = n.status === 401 || n.status === 403, f = p ? "Not authorised" : "Could not load data", g = p ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(i)} — ${g}`), s == null || s.peek("danger", { data: { headline: f, message: g } });
    }
    return n;
  };
}
var x = Object.defineProperty, z = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, u = (e, t, s, o) => {
  for (var r = o > 1 ? void 0 : o ? z(t, s) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (r = (o ? a(t, s, r) : a(r)) || r);
  return o && r && x(t, s, r), r;
}, E = (e, t, s) => t.has(e) || v("Cannot " + s), A = (e, t, s) => (E(e, t, "read from private field"), s ? s.call(e) : t.get(e)), C = (e, t, s) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), h;
let l = class extends w(_) {
  constructor() {
    super(...arguments), C(this, h, $(this)), this._email = "", this._sendState = "idle", this._message = "";
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
      const e = await A(this, h).call(this, `/umbraco/backoffice/api/MailerApi/SendTestAsync?email=${encodeURIComponent(this._email)}`, {
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
    return c`
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

          ${this._sendState === "success" ? c`<div class="message message--success">${this._message}</div>` : ""}
          ${this._sendState === "error" ? c`<div class="message message--error">${this._message}</div>` : ""}
        </uui-box>
      </div>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
l.styles = b`
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
u([
  m()
], l.prototype, "_email", 2);
u([
  m()
], l.prototype, "_sendState", 2);
u([
  m()
], l.prototype, "_message", 2);
l = u([
  y("mailer-dashboard")
], l);
const P = l;
export {
  l as MailerDashboardElement,
  P as default
};
