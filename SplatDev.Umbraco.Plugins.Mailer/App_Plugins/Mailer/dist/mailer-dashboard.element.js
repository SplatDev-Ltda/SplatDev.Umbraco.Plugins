import { LitElement as x, html as c, css as T, state as h, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as S } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as z } from "@umbraco-cms/backoffice/notification";
function A(e) {
  let t = null, a = null;
  const n = e.consumeContext.bind(e), r = new Promise((i) => {
    n(S, async (s) => {
      var d;
      try {
        t = await ((d = s == null ? void 0 : s.getLatestToken) == null ? void 0 : d.call(s)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return n(z, (i) => {
    a = i;
  }), async (i, s = {}) => {
    await r;
    const d = new Headers(s.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const l = await fetch(i, { ...s, credentials: "same-origin", headers: d });
    if (!l.ok) {
      const v = l.status === 401 || l.status === 403, w = v ? "Not authorised" : "Could not load data", f = v ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(i)} — ${f}`), a == null || a.peek("danger", { data: { headline: w, message: f } });
    }
    return l;
  };
}
var M = Object.defineProperty, k = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, u = (e, t, a, n) => {
  for (var r = n > 1 ? void 0 : n ? k(t, a) : t, i = e.length - 1, s; i >= 0; i--)
    (s = e[i]) && (r = (n ? s(t, a, r) : s(r)) || r);
  return n && r && M(t, a, r), r;
}, b = (e, t, a) => t.has(e) || _("Cannot " + a), C = (e, t, a) => (b(e, t, "read from private field"), a ? a.call(e) : t.get(e)), g = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), O = (e, t, a) => (b(e, t, "access private method"), a), m, p, y;
let o = class extends E(x) {
  constructor() {
    super(...arguments), g(this, p), g(this, m, A(this)), this._email = "", this._sendState = "idle", this._message = "", this._loadError = null;
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
      const e = await C(this, m).call(this, `/umbraco/backoffice/api/MailerApi/SendTestAsync?email=${encodeURIComponent(this._email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (O(this, p, y).call(this, e))
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
      ${this._loadError ? c`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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
m = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
o.styles = T`
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
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
u([
  h()
], o.prototype, "_email", 2);
u([
  h()
], o.prototype, "_sendState", 2);
u([
  h()
], o.prototype, "_message", 2);
u([
  h()
], o.prototype, "_loadError", 2);
o = u([
  $("mailer-dashboard")
], o);
const G = o;
export {
  o as MailerDashboardElement,
  G as default
};
