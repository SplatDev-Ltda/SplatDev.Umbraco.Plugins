import { LitElement as x, html as r, css as y, state as c, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
var E = Object.defineProperty, S = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, d = (t, e, s, o) => {
  for (var i = o > 1 ? void 0 : o ? S(e, s) : e, l = t.length - 1, h; l >= 0; l--)
    (h = t[l]) && (i = (o ? h(e, s, i) : h(i)) || i);
  return o && i && E(e, s, i), i;
}, C = (t, e, s) => e.has(t) || _("Cannot " + s), k = (t, e, s) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), p = (t, e, s) => (C(t, e, "access private method"), s), n, f, v, u;
let a = class extends $(x) {
  constructor() {
    super(...arguments), k(this, n), this._settings = null, this._loading = !0, this._sending = !1, this._loadError = null, this._recipient = "", this._result = null, this._api = "/umbraco/api/smtp";
  }
  connectedCallback() {
    super.connectedCallback(), p(this, n, f).call(this);
  }
  render() {
    var t, e, s, o, i, l, h, m, g;
    return r`
      <h1>SMTP</h1>
      <p class="description">
        The mail configuration this site is running with, and a test that sends through it.
      </p>

      ${this._loading ? r`<uui-loader></uui-loader>` : this._loadError ? r`<div class="msg error">${this._loadError}</div>` : r`
              <uui-box headline="Current configuration">
                <dl>
                  <dt>Host</dt><dd>${p(this, n, u).call(this, (t = this._settings) == null ? void 0 : t.host)}</dd>
                  <dt>Port</dt><dd>${((e = this._settings) == null ? void 0 : e.port) ?? "—"}</dd>
                  <dt>SSL</dt><dd>${(s = this._settings) != null && s.enableSsl ? "enabled" : "disabled"}</dd>
                  <dt>Username</dt><dd>${p(this, n, u).call(this, (o = this._settings) == null ? void 0 : o.username)}</dd>
                  <dt>Password</dt>
                  <dd>${(i = this._settings) != null && i.password ? r`•••••••• <span class="hint">(never sent to the browser)</span>` : r`<span class="unset">not set</span>`}</dd>
                  <dt>From</dt><dd>${p(this, n, u).call(this, (l = this._settings) == null ? void 0 : l.fromEmail)}</dd>
                  <dt>From name</dt><dd>${p(this, n, u).call(this, (h = this._settings) == null ? void 0 : h.fromName)}</dd>
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
                    placeholder=${((m = this._settings) == null ? void 0 : m.fromEmail) || "recipient@example.com"}
                    .value=${this._recipient}
                    @input=${(b) => this._recipient = b.target.value} />
                  <uui-button
                    look="primary"
                    ?disabled=${this._sending || !((g = this._settings) != null && g.host)}
                    @click=${p(this, n, v)}>
                    ${this._sending ? "Sending…" : "Send test"}
                  </uui-button>
                </div>
                <p class="hint">
                  Leave blank to send to the configured from-address. The message is sent with
                  the credentials above, which stay on the server.
                </p>

                ${this._result ? r`
                      <div class="msg ${this._result.success ? "success" : "error"}">
                        ${this._result.message}
                        ${this._result.error ? r`<code>${this._result.error}</code>` : ""}
                      </div>
                    ` : ""}
              </uui-box>
            `}
    `;
  }
};
n = /* @__PURE__ */ new WeakSet();
f = async function() {
  this._loading = !0, this._loadError = null;
  try {
    const t = await fetch(`${this._api}/GetSettings`, { credentials: "same-origin" });
    if (!t.ok) throw new Error(`${t.status}`);
    this._settings = await t.json();
  } catch (t) {
    this._loadError = `Could not read the SMTP configuration (${t.message}).`;
  } finally {
    this._loading = !1;
  }
};
v = async function() {
  this._sending = !0, this._result = null;
  try {
    const t = this._recipient ? `?to=${encodeURIComponent(this._recipient)}` : "", e = await fetch(`${this._api}/SendTest${t}`, {
      method: "POST",
      credentials: "same-origin"
    });
    if (!e.ok) throw new Error(`${e.status}`);
    this._result = await e.json();
  } catch (t) {
    this._result = {
      success: !1,
      message: "The request failed.",
      error: t.message
    };
  } finally {
    this._sending = !1;
  }
};
u = function(t) {
  return t ? r`${t}` : r`<span class="unset">not set</span>`;
};
a.styles = y`
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
d([
  c()
], a.prototype, "_settings", 2);
d([
  c()
], a.prototype, "_loading", 2);
d([
  c()
], a.prototype, "_sending", 2);
d([
  c()
], a.prototype, "_loadError", 2);
d([
  c()
], a.prototype, "_recipient", 2);
d([
  c()
], a.prototype, "_result", 2);
a = d([
  w("smtp-dashboard")
], a);
const D = a;
export {
  a as SmtpDashboardElement,
  D as default
};
