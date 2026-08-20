import { LitElement as S, html as o, css as E, state as p, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
function P(t) {
  let e = null;
  const i = new Promise((r) => {
    t.consumeContext(C, async (s) => {
      var a;
      try {
        e = await ((a = s == null ? void 0 : s.getLatestToken) == null ? void 0 : a.call(s)) ?? null;
      } catch {
        e = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, s = {}) => {
    await i;
    const a = new Headers(s.headers);
    e && !a.has("Authorization") && a.set("Authorization", `Bearer ${e}`);
    const n = await fetch(r, { ...s, credentials: "same-origin", headers: a });
    return (n.status === 401 || n.status === 403) && console.error(
      `[SplatDev] ${n.status} from ${String(r)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), n;
  };
}
var z = Object.defineProperty, D = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, h = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? D(e, i) : e, a = t.length - 1, n; a >= 0; a--)
    (n = t[a]) && (s = (r ? n(e, i, s) : n(s)) || s);
  return r && s && z(e, i, s), s;
}, b = (t, e, i) => e.has(t) || v("Cannot " + i), w = (t, e, i) => (b(t, e, "read from private field"), i ? i.call(t) : e.get(t)), f = (t, e, i) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), c = (t, e, i) => (b(t, e, "access private method"), i), m, l, y, $, u;
let d = class extends k(S) {
  constructor() {
    super(...arguments), f(this, l), f(this, m, P(this)), this._settings = null, this._loading = !0, this._sending = !1, this._loadError = null, this._recipient = "", this._result = null, this._api = "/umbraco/api/smtp";
  }
  connectedCallback() {
    super.connectedCallback(), c(this, l, y).call(this);
  }
  render() {
    var t, e, i, r, s, a, n, g, _;
    return o`
      <h1>SMTP</h1>
      <p class="description">
        The mail configuration this site is running with, and a test that sends through it.
      </p>

      ${this._loading ? o`<uui-loader></uui-loader>` : this._loadError ? o`<div class="msg error">${this._loadError}</div>` : o`
              <uui-box headline="Current configuration">
                <dl>
                  <dt>Host</dt><dd>${c(this, l, u).call(this, (t = this._settings) == null ? void 0 : t.host)}</dd>
                  <dt>Port</dt><dd>${((e = this._settings) == null ? void 0 : e.port) ?? "—"}</dd>
                  <dt>SSL</dt><dd>${(i = this._settings) != null && i.enableSsl ? "enabled" : "disabled"}</dd>
                  <dt>Username</dt><dd>${c(this, l, u).call(this, (r = this._settings) == null ? void 0 : r.username)}</dd>
                  <dt>Password</dt>
                  <dd>${(s = this._settings) != null && s.password ? o`•••••••• <span class="hint">(never sent to the browser)</span>` : o`<span class="unset">not set</span>`}</dd>
                  <dt>From</dt><dd>${c(this, l, u).call(this, (a = this._settings) == null ? void 0 : a.fromEmail)}</dd>
                  <dt>From name</dt><dd>${c(this, l, u).call(this, (n = this._settings) == null ? void 0 : n.fromName)}</dd>
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
                    placeholder=${((g = this._settings) == null ? void 0 : g.fromEmail) || "recipient@example.com"}
                    .value=${this._recipient}
                    @input=${(x) => this._recipient = x.target.value} />
                  <uui-button
                    look="primary"
                    ?disabled=${this._sending || !((_ = this._settings) != null && _.host)}
                    @click=${c(this, l, $)}>
                    ${this._sending ? "Sending…" : "Send test"}
                  </uui-button>
                </div>
                <p class="hint">
                  Leave blank to send to the configured from-address. The message is sent with
                  the credentials above, which stay on the server.
                </p>

                ${this._result ? o`
                      <div class="msg ${this._result.success ? "success" : "error"}">
                        ${this._result.message}
                        ${this._result.error ? o`<code>${this._result.error}</code>` : ""}
                      </div>
                    ` : ""}
              </uui-box>
            `}
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
y = async function() {
  this._loading = !0, this._loadError = null;
  try {
    const t = await w(this, m).call(this, `${this._api}/GetSettings`, { credentials: "same-origin" });
    if (!t.ok) throw new Error(`${t.status}`);
    this._settings = await t.json();
  } catch (t) {
    this._loadError = `Could not read the SMTP configuration (${t.message}).`;
  } finally {
    this._loading = !1;
  }
};
$ = async function() {
  this._sending = !0, this._result = null;
  try {
    const t = this._recipient ? `?to=${encodeURIComponent(this._recipient)}` : "", e = await w(this, m).call(this, `${this._api}/SendTest${t}`, {
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
  return t ? o`${t}` : o`<span class="unset">not set</span>`;
};
d.styles = E`
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
h([
  p()
], d.prototype, "_settings", 2);
h([
  p()
], d.prototype, "_loading", 2);
h([
  p()
], d.prototype, "_sending", 2);
h([
  p()
], d.prototype, "_loadError", 2);
h([
  p()
], d.prototype, "_recipient", 2);
h([
  p()
], d.prototype, "_result", 2);
d = h([
  T("smtp-dashboard")
], d);
const U = d;
export {
  d as SmtpDashboardElement,
  U as default
};
