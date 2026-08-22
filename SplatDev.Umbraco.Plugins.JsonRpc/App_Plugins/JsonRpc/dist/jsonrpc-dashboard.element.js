import { LitElement as E, nothing as b, html as d, css as O, state as u, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as z } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as R } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as D } from "@umbraco-cms/backoffice/notification";
function I(e) {
  let t = null, a = null;
  const h = e.consumeContext.bind(e), l = new Promise((r) => {
    h(R, async (o) => {
      var m;
      try {
        t = await ((m = o == null ? void 0 : o.getLatestToken) == null ? void 0 : m.call(o)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return h(D, (r) => {
    a = r;
  }), async (r, o = {}) => {
    await l;
    const m = new Headers(o.headers);
    t && !m.has("Authorization") && m.set("Authorization", `Bearer ${t}`);
    const p = await fetch(r, { ...o, credentials: "same-origin", headers: m });
    if (!p.ok) {
      const w = p.status === 401 || p.status === 403, A = w ? "Not authorised" : "Could not load data", x = w ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${p.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${p.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${p.status} from ${String(r)} — ${x}`), a == null || a.peek("danger", { data: { headline: A, message: x } });
    }
    return p;
  };
}
var J = Object.defineProperty, M = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, c = (e, t, a, h) => {
  for (var l = h > 1 ? void 0 : h ? M(t, a) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (l = (h ? o(t, a, l) : o(l)) || l);
  return h && l && J(t, a, l), l;
}, C = (e, t, a) => t.has(e) || $("Cannot " + a), v = (e, t, a) => (C(e, t, "read from private field"), a ? a.call(e) : t.get(e)), k = (e, t, a) => t.has(e) ? $("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), n = (e, t, a) => (C(e, t, "access private method"), a), f, s, y, g, T, N, P, _;
let i = class extends z(E) {
  constructor() {
    super(...arguments), k(this, s), this._keys = [], this._loading = !0, this._busy = "", this._loadError = null, this._message = null, this._newName = "", this._newPermissions = "*", this._created = null, k(this, f, I(this)), this._api = "/umbraco/api/jsonrpc/apikey";
  }
  connectedCallback() {
    super.connectedCallback(), n(this, s, g).call(this);
  }
  render() {
    return d`
      <h1>JSON-RPC</h1>
      <p class="description">
        API keys that authorise JSON-RPC calls against this site. A key is shown once when
        it is created — only its hash is stored, so it cannot be shown again.
      </p>

      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : b}
      ${this._message ? d`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : b}

      ${this._created ? d`
            <div class="reveal" role="alert">
              <strong>Copy ${this._created.name} now.</strong>
              <code>${this._created.rawKey}</code>
              This is the only time it will be shown. Only its hash is stored, so if you
              lose it you will need to create another key.
              <div class="actions">
                <uui-button
                  look="primary"
                  label="Copy key"
                  @click=${() => n(this, s, P).call(this, this._created.rawKey)}
                  >Copy key</uui-button
                >
                <uui-button look="secondary" label="Dismiss" @click=${() => this._created = null}
                  >I have stored it</uui-button
                >
              </div>
            </div>
          ` : b}

      <uui-box headline="Keys">
        ${this._loading ? d`<uui-loader></uui-loader>` : this._keys.length === 0 ? d`<p class="empty">No API keys yet. Create one below.</p>` : d`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Permissions</th><th>Status</th><th>Created</th><th>Last used</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._keys.map(
      (e) => d`
                        <tr>
                          <td>${e.name}</td>
                          <td><code>${e.permissions}</code></td>
                          <td>
                            <span class="tag ${e.isActive ? "good" : "off"}"
                              >${e.isActive ? "active" : "revoked"}</span
                            >
                          </td>
                          <td class="num">${n(this, s, _).call(this, e.createdAt)}</td>
                          <td class="num">${n(this, s, _).call(this, e.lastUsedAt)}</td>
                          <td>
                            ${e.isActive ? d`<uui-button
                                  compact
                                  look="secondary"
                                  color="danger"
                                  label="Revoke ${e.name}"
                                  ?disabled=${this._busy === `revoke:${e.id}`}
                                  @click=${() => n(this, s, N).call(this, e)}
                                  >Revoke</uui-button
                                >` : b}
                          </td>
                        </tr>
                      `
    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      <uui-box headline="Create a key">
        <div class="grid">
          <div>
            <span class="field-label">Name</span>
            <uui-input
              placeholder="e.g. Mobile app"
              .value=${this._newName}
              @input=${(e) => this._newName = e.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Permissions</span>
            <uui-input
              placeholder="*"
              .value=${this._newPermissions}
              @input=${(e) => this._newPermissions = e.target.value}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          Permissions are method prefixes, comma separated — <code>*</code> for everything,
          or something narrower like <code>content.get,content.search</code>.
        </p>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Create key"
            ?disabled=${this._busy === "create"}
            @click=${n(this, s, T)}
            >${this._busy === "create" ? "Creating…" : "Create key"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to manage API keys. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
g = async function() {
  this._loading = !0;
  try {
    const e = await v(this, f).call(this, `${this._api}/GetAll`);
    n(this, s, y).call(this, e) && (this._keys = await e.json());
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
  } finally {
    this._loading = !1;
  }
};
T = async function() {
  const e = this._newName.trim();
  if (!e) {
    this._message = { ok: !1, text: "Give the key a name so you can recognise it later." };
    return;
  }
  this._busy = "create", this._created = null;
  try {
    const t = await v(this, f).call(this, `${this._api}/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: e, permissions: this._newPermissions.trim() || "*" })
    });
    n(this, s, y).call(this, t) && (this._created = await t.json(), this._message = null, this._newName = "", await n(this, s, g).call(this));
  } catch {
    this._message = { ok: !1, text: "Could not create that key." };
  } finally {
    this._busy = "";
  }
};
N = async function(e) {
  this._busy = `revoke:${e.id}`;
  try {
    const t = await v(this, f).call(this, `${this._api}/Revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id })
    });
    n(this, s, y).call(this, t) && (this._message = { ok: !0, text: `Revoked ${e.name}.` }, await n(this, s, g).call(this));
  } catch {
    this._message = { ok: !1, text: `Could not revoke ${e.name}.` };
  } finally {
    this._busy = "";
  }
};
P = async function(e) {
  try {
    await navigator.clipboard.writeText(e), this._message = { ok: !0, text: "Key copied to the clipboard." };
  } catch {
    this._message = { ok: !1, text: "Could not copy — select the key and copy it manually." };
  }
};
_ = function(e) {
  if (!e) return "never";
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? e : t.toLocaleString();
};
i.styles = O`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    uui-input { width: 100%; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    code { font-family: var(--uui-font-monospace, monospace); background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.good { background: #d1fae5; color: #065f46; }
    .tag.off { background: #fee2e2; color: #991b1b; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .reveal {
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
      padding: 14px 16px; margin: 0 0 16px; border-radius: 3px;
    }
    .reveal code { display: block; margin: 8px 0; word-break: break-all; font-size: 0.88rem; }

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
c([
  u()
], i.prototype, "_keys", 2);
c([
  u()
], i.prototype, "_loading", 2);
c([
  u()
], i.prototype, "_busy", 2);
c([
  u()
], i.prototype, "_loadError", 2);
c([
  u()
], i.prototype, "_message", 2);
c([
  u()
], i.prototype, "_newName", 2);
c([
  u()
], i.prototype, "_newPermissions", 2);
c([
  u()
], i.prototype, "_created", 2);
i = c([
  S("jsonrpc-dashboard")
], i);
const L = i;
export {
  i as JsonRpcDashboardElement,
  L as default
};
