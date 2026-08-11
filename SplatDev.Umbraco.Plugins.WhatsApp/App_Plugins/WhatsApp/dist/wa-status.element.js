import { LitElement as y, nothing as n, html as i, css as k, state as f, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as S } from "@umbraco-cms/backoffice/element-api";
import { W as E, s as W } from "./chunks/shared-styles-CFbg5_yF.js";
var P = Object.defineProperty, C = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, c = (e, t, o, r) => {
  for (var a = r > 1 ? void 0 : r ? C(t, o) : t, u = e.length - 1, p; u >= 0; u--)
    (p = e[u]) && (a = (r ? p(t, o, a) : p(a)) || a);
  return r && a && P(t, o, a), a;
}, _ = (e, t, o) => t.has(e) || g("Cannot " + o), A = (e, t, o) => (_(e, t, "read from private field"), o ? o.call(e) : t.get(e)), m = (e, t, o) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), l = (e, t, o) => (_(e, t, "access private method"), o), v, d, h, b, w, $;
let s = class extends S(y) {
  constructor() {
    super(...arguments), m(this, d), m(this, v, new E(this)), this._error = "", this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), l(this, d, h).call(this);
  }
  render() {
    return i`
      <div class="head">
        <h1>WhatsApp status</h1>
        <p>Connection health for the WhatsApp Business Cloud API.</p>
      </div>

      ${this._error ? i`<div class="error">${this._error}</div>` : n}
      ${this._loading ? i`<uui-loader></uui-loader>` : this._status ? i`
              ${l(this, d, w).call(this, this._status)}
              ${l(this, d, $).call(this, this._status)}
            ` : n}

      <uui-button
        look="secondary"
        label="Refresh status"
        ?disabled=${this._loading}
        @click=${() => void l(this, d, h).call(this)}
      >Refresh</uui-button>
    `;
  }
};
v = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakSet();
h = async function() {
  this._loading = !0, this._error = "";
  try {
    this._status = await A(this, v).getStatus();
  } catch (e) {
    this._error = e instanceof Error ? e.message : String(e);
  } finally {
    this._loading = !1;
  }
};
b = function(e) {
  if (!e) return i`<span class="pill mid">unknown</span>`;
  const t = e.toUpperCase();
  return i`<span class="pill ${t === "GREEN" ? "good" : t === "RED" ? "bad" : "mid"}">${e}</span>`;
};
w = function(e) {
  const t = window.location.origin;
  return i`
      <uui-box headline="Setup">
        ${e.configured ? n : i`<div class="error">
              Not configured. Set <code>SplatDev:WhatsApp:PhoneNumberId</code> and
              <code>SplatDev:WhatsApp:AccessToken</code> before sending.
            </div>`}
        ${e.signatureValidation ? n : i`<div class="warn">
              <code>AppSecret</code> is not set, so incoming webhooks are accepted without
              verifying <code>X-Hub-Signature-256</code>. Set it before production — anyone
              who learns the URL could otherwise post fake messages.
            </div>`}
        ${e.webhookConfigured ? n : i`<div class="warn">
              No <code>WebhookVerifyToken</code> is set, so Meta's verification handshake
              will fail and inbound messages will never arrive.
            </div>`}
        <dl>
          <dt>Callback URL</dt>
          <dd><code>${t}${e.webhookPath}</code></dd>
          <dt>Phone number ID</dt>
          <dd><code>${e.phoneNumberId || "—"}</code></dd>
          <dt>Business account ID</dt>
          <dd><code>${e.businessAccountId || "—"}</code></dd>
          <dt>Service window</dt>
          <dd>${e.windowHours} hours</dd>
        </dl>
      </uui-box>
    `;
};
$ = function(e) {
  var r;
  const t = e.phone;
  if (!t)
    return i`
        <uui-box headline="Phone number">
          <div class="empty">
            Could not reach the WhatsApp API. Check the access token and try again.
          </div>
        </uui-box>
      `;
  const o = ((r = t.codeVerificationStatus) == null ? void 0 : r.toUpperCase()) === "EXPIRED";
  return i`
      <uui-box headline="Phone number">
        <dl>
          <dt>Number</dt>
          <dd>${t.displayPhoneNumber ?? "—"}</dd>
          <dt>Verified name</dt>
          <dd>${t.verifiedName ?? "—"}</dd>
          <dt>Quality rating</dt>
          <dd>${l(this, d, b).call(this, t.qualityRating)}</dd>
          <dt>Platform</dt>
          <dd>${t.platformType ?? "—"}</dd>
          <dt>Verification</dt>
          <dd>
            ${t.codeVerificationStatus ?? "—"}
            ${o ? i`<span class="pill mid">re-verify</span>` : n}
          </dd>
          <dt>Webhook override</dt>
          <dd>
            ${t.webhookUrl ? i`<code>${t.webhookUrl}</code>` : i`<span class="hint">none — uses the app default</span>`}
          </dd>
        </dl>
      </uui-box>
    `;
};
s.styles = [
  W,
  k`
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
    `
];
c([
  f()
], s.prototype, "_status", 2);
c([
  f()
], s.prototype, "_error", 2);
c([
  f()
], s.prototype, "_loading", 2);
s = c([
  x("wa-status")
], s);
const R = s;
export {
  s as WaStatusElement,
  R as default
};
//# sourceMappingURL=wa-status.element.js.map
