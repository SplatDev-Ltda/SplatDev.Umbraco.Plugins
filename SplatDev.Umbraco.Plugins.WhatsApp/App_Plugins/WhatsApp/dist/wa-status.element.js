import { LitElement as y, nothing as d, html as a, css as k, state as f, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as S } from "@umbraco-cms/backoffice/element-api";
import { W as E, s as W } from "./chunks/shared-styles-DntHce3s.js";
var P = Object.defineProperty, C = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, c = (e, t, o, i) => {
  for (var r = i > 1 ? void 0 : i ? C(t, o) : t, u = e.length - 1, p; u >= 0; u--)
    (p = e[u]) && (r = (i ? p(t, o, r) : p(r)) || r);
  return i && r && P(t, o, r), r;
}, _ = (e, t, o) => t.has(e) || g("Cannot " + o), A = (e, t, o) => (_(e, t, "read from private field"), o ? o.call(e) : t.get(e)), m = (e, t, o) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), l = (e, t, o) => (_(e, t, "access private method"), o), v, s, h, b, w, $;
let n = class extends S(y) {
  constructor() {
    super(...arguments), m(this, s), m(this, v, new E(this)), this._error = "", this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), l(this, s, h).call(this);
  }
  render() {
    return a`
      <div class="head">
        <h1>WhatsApp status</h1>
        <p>Connection health for the WhatsApp Business Cloud API.</p>
      </div>

      ${this._error ? a`<div class="error">${this._error}</div>` : d}
      ${this._loading ? a`<uui-loader></uui-loader>` : this._status ? a`
              ${l(this, s, w).call(this, this._status)}
              ${l(this, s, $).call(this, this._status)}
            ` : d}

      <uui-button
        look="secondary"
        label="Refresh status"
        ?disabled=${this._loading}
        @click=${() => void l(this, s, h).call(this)}
      >Refresh</uui-button>
    `;
  }
};
v = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
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
  if (!e) return a`<span class="pill mid">unknown</span>`;
  const t = e.toUpperCase();
  return a`<span class="pill ${t === "GREEN" ? "good" : t === "RED" ? "bad" : "mid"}">${e}</span>`;
};
w = function(e) {
  const t = window.location.origin;
  return a`
      <uui-box headline="Setup">
        ${e.configured ? d : a`<div class="error">
              <span>
                Not configured. Set <code>SplatDev:WhatsApp:PhoneNumberId</code> and
                <code>SplatDev:WhatsApp:AccessToken</code> before sending.
              </span>
            </div>`}
        ${e.signatureValidation ? d : a`<div class="warn">
              <span>
                <code>AppSecret</code> is not set, so incoming webhooks are accepted without
                verifying <code>X-Hub-Signature-256</code>. Set it before production — anyone
                who learns the URL could otherwise post fake messages.
              </span>
            </div>`}
        ${e.webhookConfigured ? d : a`<div class="warn">
              <span>
                No <code>WebhookVerifyToken</code> is set, so Meta's verification handshake
                will fail and inbound messages will never arrive.
              </span>
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
  var i;
  const t = e.phone;
  if (!t)
    return a`
        <uui-box headline="Phone number">
          <div class="empty">
            Could not reach the WhatsApp API. Check the access token and try again.
          </div>
        </uui-box>
      `;
  const o = ((i = t.codeVerificationStatus) == null ? void 0 : i.toUpperCase()) === "EXPIRED";
  return a`
      <uui-box headline="Phone number">
        <dl>
          <dt>Number</dt>
          <dd>${t.displayPhoneNumber ?? "—"}</dd>
          <dt>Verified name</dt>
          <dd>${t.verifiedName ?? "—"}</dd>
          <dt>Quality rating</dt>
          <dd>${l(this, s, b).call(this, t.qualityRating)}</dd>
          <dt>Platform</dt>
          <dd>${t.platformType ?? "—"}</dd>
          <dt>Verification</dt>
          <dd>
            ${t.codeVerificationStatus ?? "—"}
            ${o ? a`<span class="pill mid">re-verify</span>` : d}
          </dd>
          <dt>Webhook override</dt>
          <dd>
            ${t.webhookUrl ? a`<code>${t.webhookUrl}</code>` : a`<span class="hint">none — uses the app default</span>`}
          </dd>
        </dl>
      </uui-box>
    `;
};
n.styles = [
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
], n.prototype, "_status", 2);
c([
  f()
], n.prototype, "_error", 2);
c([
  f()
], n.prototype, "_loading", 2);
n = c([
  x("wa-status")
], n);
const R = n;
export {
  n as WaStatusElement,
  R as default
};
//# sourceMappingURL=wa-status.element.js.map
