import { LitElement as R, nothing as f, html as i, css as I, state as l, customElement as N } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as D } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as O } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as z } from "@umbraco-cms/backoffice/notification";
function K(e) {
  let t = null, a = null;
  const d = e.consumeContext.bind(e), h = new Promise((c) => {
    d(O, async (n) => {
      var m;
      try {
        t = await ((m = n == null ? void 0 : n.getLatestToken) == null ? void 0 : m.call(n)) ?? null;
      } catch {
        t = null;
      }
      c();
    }), setTimeout(c, 3e3);
  });
  return d(z, (c) => {
    a = c;
  }), async (c, n = {}) => {
    await h;
    const m = new Headers(n.headers);
    t && !m.has("Authorization") && m.set("Authorization", `Bearer ${t}`);
    const p = await fetch(c, { ...n, credentials: "same-origin", headers: m });
    if (!p.ok) {
      const y = p.status === 401 || p.status === 403, B = y ? "Not authorised" : "Could not load data", v = y ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${p.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${p.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${p.status} from ${String(c)} — ${v}`), a == null || a.peek("danger", { data: { headline: B, message: v } });
    }
    return p;
  };
}
var W = Object.defineProperty, L = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, r = (e, t, a, d) => {
  for (var h = d > 1 ? void 0 : d ? L(t, a) : t, c = e.length - 1, n; c >= 0; c--)
    (n = e[c]) && (h = (d ? n(t, a, h) : n(h)) || h);
  return d && h && W(t, a, h), h;
}, $ = (e, t, a) => t.has(e) || w("Cannot " + a), g = (e, t, a) => ($(e, t, "read from private field"), a ? a.call(e) : t.get(e)), k = (e, t, a) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), u = (e, t, a) => ($(e, t, "access private method"), a), b, o, _, x, C, P, S, T, E, A;
let s = class extends D(R) {
  constructor() {
    super(...arguments), k(this, o), this._status = null, this._transactions = [], this._balance = null, this._loading = !0, this._busy = "", this._loadError = null, this._message = null, this._pixAmount = "", this._pixKey = "", this._pixDescription = "", this._lastQrCode = null, this._webhookPixKey = "", k(this, b, K(this)), this._api = "/umbraco/api/bancointersandbox";
  }
  connectedCallback() {
    super.connectedCallback(), u(this, o, x).call(this);
  }
  render() {
    var e;
    return i`
      <h1>Banco Inter</h1>
      <p class="description">
        Pix charges, boletos and account movement for the configured Inter account.
      </p>

      ${this._loadError ? i`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : f}
      ${this._message ? i`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : f}
      ${this._loading ? i`<uui-loader></uui-loader>` : u(this, o, A).call(this)}

      <uui-box headline="Account">
        ${this._balance !== null ? i`<p class="balance">${this._balance}</p>` : i`<p class="hint">Balance is read on demand rather than on every page load.</p>`}
        <div class="actions">
          <uui-button
            look="secondary"
            label="Read balance"
            ?disabled=${this._busy === "balance"}
            @click=${u(this, o, C)}
            >${this._busy === "balance" ? "Reading…" : "Read balance"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Create a Pix charge">
        <div class="grid">
          <div>
            <span class="field-label">Amount (BRL)</span>
            <uui-input
              type="number"
              step="0.01"
              placeholder="0.00"
              .value=${this._pixAmount}
              @input=${(t) => this._pixAmount = t.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Pix key</span>
            <uui-input
              placeholder="The key that receives the payment"
              .value=${this._pixKey}
              @input=${(t) => this._pixKey = t.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Description (optional)</span>
            <uui-input
              .value=${this._pixDescription}
              @input=${(t) => this._pixDescription = t.target.value}
            ></uui-input>
          </div>
        </div>

        ${this._lastQrCode ? i`<p class="hint">Pix copia e cola:</p>
              <code>${this._lastQrCode}</code>` : f}

        <div class="actions">
          <uui-button
            look="primary"
            color=${this._status && !this._status.sandbox ? "danger" : "positive"}
            label="Create charge"
            ?disabled=${this._busy === "pix"}
            @click=${u(this, o, P)}
            >${this._busy === "pix" ? "Creating…" : this._status && !this._status.sandbox ? "Create a real charge" : "Create charge"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Settlement callbacks">
        <div class="grid">
          <div>
            <span class="field-label">Pix key</span>
            <uui-input
              placeholder="The key to receive callbacks for"
              .value=${this._webhookPixKey}
              @input=${(t) => this._webhookPixKey = t.target.value}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          Registers this site's callback URL with Banco Inter. The server assembles the URL
          and appends the configured secret, so the secret never passes through the browser.
        </p>
        <div class="actions">
          <uui-button
            look="secondary"
            label="Register webhook"
            ?disabled=${this._busy === "webhook" || !((e = this._status) != null && e.hasWebhookSecret)}
            @click=${u(this, o, S)}
            >${this._busy === "webhook" ? "Registering…" : "Register webhook"}</uui-button
          >
          ${this._status && !this._status.hasWebhookSecret ? i`<span class="hint">Set BancoInter:WebhookSecret first.</span>` : f}
        </div>
      </uui-box>

      <uui-box headline="Charges and boletos">
        ${this._transactions.length === 0 ? i`<p class="empty">Nothing created yet.</p>` : i`
              <table>
                <thead>
                  <tr><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th><th>Created</th></tr>
                </thead>
                <tbody>
                  ${this._transactions.map(
      (t) => i`
                      <tr>
                        <td><span class="tag">${t.type}</span></td>
                        <td><code>${t.txid ?? t.nossoNumero ?? t.externalRef ?? "—"}</code></td>
                        <td class="num">${u(this, o, T).call(this, t.amount)}</td>
                        <td>
                          <span class="tag ${t.status === "RECEBIDO" ? "good" : ""}">${t.status}</span>
                        </td>
                        <td class="num">${u(this, o, E).call(this, t.createdAt)}</td>
                      </tr>
                    `
    )}
                </tbody>
              </table>
            `}
      </uui-box>
    `;
  }
};
b = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
_ = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to use the banking integration. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
x = async function() {
  this._loading = !0;
  try {
    const [e, t] = await Promise.all([
      g(this, b).call(this, `${this._api}/GetStatus`),
      g(this, b).call(this, `${this._api}/GetTransactions`)
    ]);
    u(this, o, _).call(this, e) && (this._status = await e.json()), t.ok && (this._transactions = await t.json());
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
  } finally {
    this._loading = !1;
  }
};
C = async function() {
  this._busy = "balance";
  try {
    const e = await g(this, b).call(this, `${this._api}/GetBalance`);
    if (u(this, o, _).call(this, e)) {
      const t = await e.json(), a = (t == null ? void 0 : t.disponivel) ?? (t == null ? void 0 : t.available) ?? (t == null ? void 0 : t.saldo) ?? null;
      this._balance = a === null ? JSON.stringify(t) : String(a);
    }
  } catch {
    this._message = { ok: !1, text: "Could not read the balance." };
  } finally {
    this._busy = "";
  }
};
P = async function() {
  const e = Number(this._pixAmount);
  if (!Number.isFinite(e) || e <= 0) {
    this._message = { ok: !1, text: "Enter an amount greater than zero." };
    return;
  }
  if (!this._pixKey.trim()) {
    this._message = { ok: !1, text: "A Pix key is required." };
    return;
  }
  this._busy = "pix", this._lastQrCode = null;
  try {
    const t = await g(this, b).call(this, `${this._api}/CreatePixCharge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: e,
        pixKey: this._pixKey.trim(),
        description: this._pixDescription.trim() || null
      })
    });
    if (u(this, o, _).call(this, t)) {
      const a = await t.json();
      this._lastQrCode = (a == null ? void 0 : a.qrCode) ?? (a == null ? void 0 : a.pixCopiaECola) ?? null, this._message = {
        ok: !0,
        text: `Charge created${a != null && a.txid ? ` — txid ${a.txid}` : ""}.`
      }, this._pixAmount = "", this._pixDescription = "", await u(this, o, x).call(this);
    }
  } catch {
    this._message = { ok: !1, text: "Could not create that charge." };
  } finally {
    this._busy = "";
  }
};
S = async function() {
  if (!this._webhookPixKey.trim()) {
    this._message = { ok: !1, text: "Enter the Pix key the webhook is for." };
    return;
  }
  this._busy = "webhook";
  try {
    const e = await g(this, b).call(this, `${this._api}/RegisterPixWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // No URL: the server builds it and appends the secret, so the secret never
      // passes through this page.
      body: JSON.stringify({ pixKey: this._webhookPixKey.trim() })
    });
    if (e.ok)
      this._message = { ok: !0, text: "Webhook registered with Banco Inter." };
    else {
      const t = await e.text();
      this._message = { ok: !1, text: (t == null ? void 0 : t.slice(0, 200)) || "Could not register the webhook." };
    }
  } catch {
    this._message = { ok: !1, text: "Could not register the webhook." };
  } finally {
    this._busy = "";
  }
};
T = function(e) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(e);
};
E = function(e) {
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? e : t.toLocaleString();
};
A = function() {
  const e = this._status;
  if (!e) return f;
  const t = [];
  return e.hasClientId || t.push("client id"), e.hasClientSecret || t.push("client secret"), !e.sandbox && !e.hasCertificate && t.push("mTLS certificate"), e.hasWebhookSecret || t.push("webhook secret"), i`
      <div class="mode ${e.sandbox ? "" : "live"}">
        <strong>${e.sandbox ? "Sandbox" : "Production"}</strong>
        <span>
          ${e.sandbox ? "Charges created here are test instruments against Inter's sandbox." : "Charges created here are real. Money moves."}
        </span>
        ${t.length ? i`<span class="tag">not configured: ${t.join(", ")}</span>` : i`<span class="tag good">configured</span>`}
      </div>
      ${e.hasWebhookSecret ? f : i`<p class="hint">
            Without <code>BancoInter:WebhookSecret</code> this site rejects every callback
            from Inter, so a charge stays pending even after it has been paid.
          </p>`}
    `;
};
s.styles = I`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 18px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    uui-input, uui-select { width: 100%; }

    .mode {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 16px; margin: 0 0 18px; border-radius: 4px;
      border-left: 4px solid var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
    .mode.live {
      border-left-color: var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
    }
    .mode strong { font-size: 1rem; }

    .balance { font-size: 1.9rem; font-weight: 600; font-variant-numeric: tabular-nums; margin: 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 9px 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    code { font-family: var(--uui-font-monospace, monospace); font-size: 0.85em; word-break: break-all; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.good { background: #d1fae5; color: #065f46; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .msg, .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;
r([
  l()
], s.prototype, "_status", 2);
r([
  l()
], s.prototype, "_transactions", 2);
r([
  l()
], s.prototype, "_balance", 2);
r([
  l()
], s.prototype, "_loading", 2);
r([
  l()
], s.prototype, "_busy", 2);
r([
  l()
], s.prototype, "_loadError", 2);
r([
  l()
], s.prototype, "_message", 2);
r([
  l()
], s.prototype, "_pixAmount", 2);
r([
  l()
], s.prototype, "_pixKey", 2);
r([
  l()
], s.prototype, "_pixDescription", 2);
r([
  l()
], s.prototype, "_lastQrCode", 2);
r([
  l()
], s.prototype, "_webhookPixKey", 2);
s = r([
  N("splatdev-bancinter-dashboard")
], s);
const U = s;
export {
  s as SplatdevBancoInterPaymentsDashboardElement,
  U as default
};
