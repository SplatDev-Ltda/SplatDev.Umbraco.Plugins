import { LitElement as T, html as d, css as k, state as m, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as O } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as A } from "@umbraco-cms/backoffice/notification";
function M(t) {
  let e = null, s = null;
  const n = t.consumeContext.bind(t), a = new Promise((r) => {
    n(O, async (i) => {
      var h;
      try {
        e = await ((h = i == null ? void 0 : i.getLatestToken) == null ? void 0 : h.call(i)) ?? null;
      } catch {
        e = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return n(A, (r) => {
    s = r;
  }), async (r, i = {}) => {
    await a;
    const h = new Headers(i.headers);
    e && !h.has("Authorization") && h.set("Authorization", `Bearer ${e}`);
    const o = await fetch(r, { ...i, credentials: "same-origin", headers: h });
    if (!o.ok) {
      const _ = o.status === 401 || o.status === 403, S = _ ? "Not authorised" : "Could not load data", b = _ ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${o.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${o.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${o.status} from ${String(r)} — ${b}`), s == null || s.peek("danger", { data: { headline: S, message: b } });
    }
    return o;
  };
}
var z = Object.defineProperty, D = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, u = (t, e, s, n) => {
  for (var a = n > 1 ? void 0 : n ? D(e, s) : e, r = t.length - 1, i; r >= 0; r--)
    (i = t[r]) && (a = (n ? i(e, s, a) : i(a)) || a);
  return n && a && z(e, s, a), a;
}, y = (t, e, s) => e.has(t) || v("Cannot " + s), $ = (t, e, s) => (y(t, e, "read from private field"), s ? s.call(t) : e.get(t)), w = (t, e, s) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), p = (t, e, s) => (y(t, e, "access private method"), s), f, c, x, E, g;
let l = class extends P(T) {
  constructor() {
    super(...arguments), w(this, c), w(this, f, M(this)), this._settings = null, this._loading = !0, this._sending = !1, this._loadError = null, this._recipient = "", this._result = null, this._api = "/umbraco/api/smtp";
  }
  connectedCallback() {
    super.connectedCallback(), p(this, c, x).call(this);
  }
  render() {
    var t, e, s, n, a, r, i, h, o;
    return d`
      <h1>SMTP</h1>
      <p class="description">
        The mail configuration this site is running with, and a test that sends through it.
      </p>

      ${this._loading ? d`<uui-loader></uui-loader>` : this._loadError ? d`<div class="msg error">${this._loadError}</div>` : d`
              <uui-box headline="Current configuration">
                <dl>
                  <dt>Host</dt><dd>${p(this, c, g).call(this, (t = this._settings) == null ? void 0 : t.host)}</dd>
                  <dt>Port</dt><dd>${((e = this._settings) == null ? void 0 : e.port) ?? "—"}</dd>
                  <dt>SSL</dt><dd>${(s = this._settings) != null && s.enableSsl ? "enabled" : "disabled"}</dd>
                  <dt>Username</dt><dd>${p(this, c, g).call(this, (n = this._settings) == null ? void 0 : n.username)}</dd>
                  <dt>Password</dt>
                  <dd>${(a = this._settings) != null && a.password ? d`•••••••• <span class="hint">(never sent to the browser)</span>` : d`<span class="unset">not set</span>`}</dd>
                  <dt>From</dt><dd>${p(this, c, g).call(this, (r = this._settings) == null ? void 0 : r.fromEmail)}</dd>
                  <dt>From name</dt><dd>${p(this, c, g).call(this, (i = this._settings) == null ? void 0 : i.fromName)}</dd>
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
                    placeholder=${((h = this._settings) == null ? void 0 : h.fromEmail) || "recipient@example.com"}
                    .value=${this._recipient}
                    @input=${(_) => this._recipient = _.target.value} />
                  <uui-button
                    look="primary"
                    ?disabled=${this._sending || !((o = this._settings) != null && o.host)}
                    @click=${p(this, c, E)}>
                    ${this._sending ? "Sending…" : "Send test"}
                  </uui-button>
                </div>
                <p class="hint">
                  Leave blank to send to the configured from-address. The message is sent with
                  the credentials above, which stay on the server.
                </p>

                ${this._result ? d`
                      <div class="msg ${this._result.success ? "success" : "error"}">
                        ${this._result.message}
                        ${this._result.error ? d`<code>${this._result.error}</code>` : ""}
                      </div>
                    ` : ""}
              </uui-box>
            `}
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
x = async function() {
  this._loading = !0, this._loadError = null;
  try {
    const t = await $(this, f).call(this, `${this._api}/GetSettings`, { credentials: "same-origin" });
    if (!t.ok) throw new Error(`${t.status}`);
    this._settings = await t.json();
  } catch (t) {
    this._loadError = `Could not read the SMTP configuration (${t.message}).`;
  } finally {
    this._loading = !1;
  }
};
E = async function() {
  this._sending = !0, this._result = null;
  try {
    const t = this._recipient ? `?to=${encodeURIComponent(this._recipient)}` : "", e = await $(this, f).call(this, `${this._api}/SendTest${t}`, {
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
g = function(t) {
  return t ? d`${t}` : d`<span class="unset">not set</span>`;
};
l.styles = k`
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
u([
  m()
], l.prototype, "_settings", 2);
u([
  m()
], l.prototype, "_loading", 2);
u([
  m()
], l.prototype, "_sending", 2);
u([
  m()
], l.prototype, "_loadError", 2);
u([
  m()
], l.prototype, "_recipient", 2);
u([
  m()
], l.prototype, "_result", 2);
l = u([
  C("smtp-dashboard")
], l);
const I = l;
export {
  l as SmtpDashboardElement,
  I as default
};
