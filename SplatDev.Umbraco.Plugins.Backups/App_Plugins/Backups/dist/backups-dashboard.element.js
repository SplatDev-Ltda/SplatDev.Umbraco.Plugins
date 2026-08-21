import { LitElement as A, nothing as u, html as r, css as L, state as c, customElement as j } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as I } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as q } from "@umbraco-cms/backoffice/notification";
function W(e) {
  let t = null, s = null;
  const l = e.consumeContext.bind(e), d = new Promise((p) => {
    l(U, async (h) => {
      var f;
      try {
        t = await ((f = h == null ? void 0 : h.getLatestToken) == null ? void 0 : f.call(h)) ?? null;
      } catch {
        t = null;
      }
      p();
    }), setTimeout(p, 3e3);
  });
  return l(q, (p) => {
    s = p;
  }), async (p, h = {}) => {
    await d;
    const f = new Headers(h.headers);
    t && !f.has("Authorization") && f.set("Authorization", `Bearer ${t}`);
    const y = await fetch(p, { ...h, credentials: "same-origin", headers: f });
    if (!y.ok) {
      const x = y.status === 401 || y.status === 403, R = x ? "Not authorised" : "Could not load data", w = x ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${y.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${y.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${y.status} from ${String(p)} — ${w}`), s == null || s.peek("danger", { data: { headline: R, message: w } });
    }
    return y;
  };
}
var G = Object.defineProperty, F = Object.getOwnPropertyDescriptor, C = (e) => {
  throw TypeError(e);
}, n = (e, t, s, l) => {
  for (var d = l > 1 ? void 0 : l ? F(t, s) : t, p = e.length - 1, h; p >= 0; p--)
    (h = e[p]) && (d = (l ? h(t, s, d) : h(d)) || d);
  return l && d && G(t, s, d), d;
}, E = (e, t, s) => t.has(e) || C("Cannot " + s), b = (e, t, s) => (E(e, t, "read from private field"), s ? s.call(e) : t.get(e)), T = (e, t, s) => t.has(e) ? C("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), o = (e, t, s) => (E(e, t, "access private method"), s), g, i, m, P, v, S, B, O, K, z, D, M, $, N, k;
const _ = {
  Content: 1,
  Media: 2,
  Database: 4
};
let a = class extends I(A) {
  constructor() {
    super(...arguments), T(this, i), this._backups = [], this._providers = [], this._loading = !0, this._busy = "", this._loadError = null, this._message = null, this._name = "", this._scope = _.Content | _.Media, this._compress = !0, this._encrypt = !1, this._encryptionKey = "", this._keepLocal = !0, this._selectedProviders = [], this._restoreTarget = null, this._restoreScope = _.Content | _.Media | _.Database, this._overwrite = !1, this._decryptionKey = "", T(this, g, W(this)), this._api = "/umbraco/api/backups";
  }
  connectedCallback() {
    super.connectedCallback(), o(this, i, P).call(this);
  }
  render() {
    return r`
      <h1>Backups</h1>
      <p class="description">
        Take a backup of content, media and the database, restore one, or send copies to a
        configured cloud provider.
      </p>

      ${this._loadError ? r`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : u}
      ${this._message ? r`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">
            ${this._message.text}
          </div>` : u}

      <uui-box headline="Take a backup">
        <div class="grid">
          <fieldset>
            <legend>What to include</legend>
            ${o(this, i, k).call(this, "_scope")}
          </fieldset>

          <fieldset>
            <legend>Storage</legend>
            <div class="stack">
              <uui-toggle
                label="Compress"
                ?checked=${this._compress}
                @change=${(e) => this._compress = e.target.checked}
                >Compress the archive</uui-toggle
              >
              <uui-toggle
                label="Encrypt"
                ?checked=${this._encrypt}
                @change=${(e) => this._encrypt = e.target.checked}
                >Encrypt the archive</uui-toggle
              >
              ${this._encrypt ? r`
                    <uui-input
                      type="password"
                      placeholder="Encryption key"
                      .value=${this._encryptionKey}
                      @input=${(e) => this._encryptionKey = e.target.value}
                    ></uui-input>
                    <p class="hint">
                      Keep this key. Without it the archive cannot be restored — nothing
                      here can recover it for you.
                    </p>
                  ` : u}
            </div>
          </fieldset>

          <fieldset>
            <legend>Cloud copies</legend>
            ${this._providers.length ? r`
                  <div class="stack">
                    ${this._providers.map(
      (e) => r`
                        <div class="row">
                          <uui-checkbox
                            label=${e.id}
                            ?disabled=${!e.enabled}
                            ?checked=${this._selectedProviders.includes(e.id)}
                            @change=${(t) => o(this, i, O).call(this, e.id, t.target.checked)}
                            >${e.id}
                            <span class="tag">${e.providerType}</span>
                            ${e.enabled ? u : r`<span class="tag">disabled</span>`}
                          </uui-checkbox>
                          <uui-button
                            compact
                            look="secondary"
                            label="Test ${e.id}"
                            ?disabled=${this._busy === `test:${e.id}`}
                            @click=${() => o(this, i, M).call(this, e.id)}
                            >${this._busy === `test:${e.id}` ? "Testing…" : "Test"}</uui-button
                          >
                        </div>
                      `
    )}
                    <uui-toggle
                      label="Keep local copy"
                      ?checked=${this._keepLocal}
                      @change=${(e) => this._keepLocal = e.target.checked}
                      >Keep a local copy as well</uui-toggle
                    >
                  </div>
                ` : r`<p class="hint">
                  No cloud providers are configured, so the backup stays on this server.
                </p>`}
          </fieldset>
        </div>

        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Take backup"
            ?disabled=${this._busy === "create"}
            @click=${o(this, i, K)}
            >${this._busy === "create" ? "Backing up…" : "Take backup"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Existing backups">
        ${this._loading ? r`<uui-loader></uui-loader>` : this._backups.length === 0 ? r`<p class="empty">No backups yet. Take one above.</p>` : r`
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Taken</th><th>Size</th><th></th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._backups.map(
      (e) => r`
                        <tr>
                          <td>${e.name}</td>
                          <td class="num">${o(this, i, N).call(this, e.createdAt)}</td>
                          <td class="num">${o(this, i, $).call(this, e.sizeBytes)}</td>
                          <td>
                            ${e.isCompressed ? r`<span class="tag">zipped</span>` : u}
                            ${e.isEncrypted ? r`<span class="tag">encrypted</span>` : u}
                          </td>
                          <td>
                            <div class="row">
                              <uui-button
                                compact
                                look="secondary"
                                label="Restore ${e.name}"
                                @click=${() => {
        this._restoreTarget = e, this._message = null;
      }}
                                >Restore…</uui-button
                              >
                              <uui-button
                                compact
                                look="secondary"
                                color="danger"
                                label="Delete ${e.name}"
                                ?disabled=${this._busy === `delete:${e.name}`}
                                @click=${() => o(this, i, D).call(this, e.name)}
                                >Delete</uui-button
                              >
                            </div>
                          </td>
                        </tr>
                      `
    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      ${this._restoreTarget ? r`
            <uui-box headline="Restore ${this._restoreTarget.name}">
              <div class="grid">
                <fieldset>
                  <legend>What to restore</legend>
                  ${o(this, i, k).call(this, "_restoreScope")}
                </fieldset>
                <fieldset>
                  <legend>Options</legend>
                  <div class="stack">
                    <uui-toggle
                      label="Overwrite existing"
                      ?checked=${this._overwrite}
                      @change=${(e) => this._overwrite = e.target.checked}
                      >Overwrite items that already exist</uui-toggle
                    >
                    ${this._restoreTarget.isEncrypted ? r`<uui-input
                          type="password"
                          placeholder="Decryption key"
                          .value=${this._decryptionKey}
                          @input=${(e) => this._decryptionKey = e.target.value}
                        ></uui-input>` : u}
                  </div>
                </fieldset>
              </div>

              <div class="danger-zone">
                <p class="hint">
                  Restoring writes over this site's content.
                  ${this._overwrite ? "Overwrite is on, so existing items with the same identity will be replaced." : "Overwrite is off, so existing items are left alone."}
                </p>
                <div class="actions">
                  <uui-button
                    look="primary"
                    color="danger"
                    label="Restore now"
                    ?disabled=${this._busy === "restore"}
                    @click=${o(this, i, z)}
                    >${this._busy === "restore" ? "Restoring…" : "Restore now"}</uui-button
                  >
                  <uui-button
                    look="secondary"
                    label="Cancel"
                    @click=${() => this._restoreTarget = null}
                    >Cancel</uui-button
                  >
                </div>
              </div>
            </uui-box>
          ` : u}
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
m = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to manage backups. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
P = async function() {
  this._loading = !0, await Promise.all([o(this, i, v).call(this), o(this, i, S).call(this)]), this._loading = !1;
};
v = async function() {
  try {
    const e = await b(this, g).call(this, `${this._api}/GetAll`);
    o(this, i, m).call(this, e) && (this._backups = await e.json());
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
  }
};
S = async function() {
  try {
    const e = await b(this, g).call(this, `${this._api}/GetCloudProviders`);
    o(this, i, m).call(this, e) && (this._providers = await e.json());
  } catch {
  }
};
B = function(e, t, s) {
  const l = s === "_scope" ? this._scope : this._restoreScope, d = t ? l | e : l & ~e;
  s === "_scope" ? this._scope = d : this._restoreScope = d;
};
O = function(e, t) {
  this._selectedProviders = t ? [...this._selectedProviders, e] : this._selectedProviders.filter((s) => s !== e);
};
K = async function() {
  if (this._encrypt && !this._encryptionKey.trim()) {
    this._message = { ok: !1, text: "Set an encryption key, or turn encryption off." };
    return;
  }
  if (this._scope === 0) {
    this._message = { ok: !1, text: "Choose at least one thing to back up." };
    return;
  }
  this._busy = "create", this._message = null;
  try {
    const e = await b(this, g).call(this, `${this._api}/CreateAdvanced`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: this._scope,
        compress: this._compress,
        encrypt: this._encrypt,
        encryptionKey: this._encryptionKey,
        cloudProviderIds: this._selectedProviders,
        keepLocal: this._keepLocal
      })
    });
    if (!o(this, i, m).call(this, e)) return;
    const t = await e.json(), s = (t.cloudUploads ?? []).filter((l) => !l.success);
    this._message = {
      ok: s.length === 0,
      text: `Backed up ${t.contentCount} content item(s) and ${t.mediaCount} media item(s) to ${t.name} (${o(this, i, $).call(this, t.sizeBytes)}).` + (s.length ? ` Cloud upload failed for ${s.map((l) => l.providerName).join(", ")}.` : "")
    }, this._encryptionKey = "", await o(this, i, v).call(this);
  } catch {
    this._message = { ok: !1, text: "The backup request failed." };
  } finally {
    this._busy = "";
  }
};
z = async function() {
  if (this._restoreTarget) {
    this._busy = "restore", this._message = null;
    try {
      const e = await b(this, g).call(this, `${this._api}/Restore?backupPath=${encodeURIComponent(this._restoreTarget.name)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: this._restoreScope,
          overwriteExisting: this._overwrite,
          decryptionKey: this._decryptionKey
        })
      });
      if (!o(this, i, m).call(this, e)) return;
      const t = await e.json();
      this._message = {
        ok: t.success,
        text: t.success ? `Restored ${t.restoredContentCount} content item(s) and ${t.restoredMediaCount} media item(s).` : `Restore failed: ${(t.errors ?? []).join("; ") || "no reason given"}.`
      }, this._restoreTarget = null, this._decryptionKey = "";
    } catch {
      this._message = { ok: !1, text: "The restore request failed." };
    } finally {
      this._busy = "";
    }
  }
};
D = async function(e) {
  this._busy = `delete:${e}`;
  try {
    const t = await b(this, g).call(this, `${this._api}/Delete?name=${encodeURIComponent(e)}`, {
      method: "DELETE"
    });
    o(this, i, m).call(this, t) && (this._message = { ok: !0, text: `Deleted ${e}.` }, await o(this, i, v).call(this));
  } catch {
    this._message = { ok: !1, text: `Could not delete ${e}.` };
  } finally {
    this._busy = "";
  }
};
M = async function(e) {
  this._busy = `test:${e}`;
  try {
    const t = await b(this, g).call(this, `${this._api}/TestProvider?providerId=${encodeURIComponent(e)}`, { method: "POST" });
    if (o(this, i, m).call(this, t)) {
      const s = await t.json();
      this._message = {
        ok: !!s,
        text: s ? `${e} answered.` : `${e} did not answer. Check its credentials.`
      };
    }
  } catch {
    this._message = { ok: !1, text: `Could not reach ${e}.` };
  } finally {
    this._busy = "";
  }
};
$ = function(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], s = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / 1024 ** s).toFixed(s === 0 ? 0 : 1)} ${t[s]}`;
};
N = function(e) {
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? e : t.toLocaleString();
};
k = function(e) {
  const t = e === "_scope" ? this._scope : this._restoreScope;
  return r`
      <div class="stack">
        ${[
    ["Content", _.Content],
    ["Media", _.Media],
    ["Database", _.Database]
  ].map(
    ([s, l]) => r`
            <uui-checkbox
              label=${s}
              ?checked=${(t & l) !== 0}
              @change=${(d) => o(this, i, B).call(this, l, d.target.checked, e)}
              >${s}</uui-checkbox
            >
          `
  )}
      </div>
    `;
};
a.styles = L`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 62ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
    fieldset { border: none; margin: 0; padding: 0; }
    legend, .field-label {
      font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 8px; padding: 0;
    }
    .stack { display: flex; flex-direction: column; gap: 8px; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    tr:last-child td { border-bottom: none; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6); margin-right: 4px;
    }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .splatdev-load-error, .msg {
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
    .danger-zone { border-top: 1px solid var(--uui-color-border, #e5e7eb); margin-top: 16px; padding-top: 16px; }
  `;
n([
  c()
], a.prototype, "_backups", 2);
n([
  c()
], a.prototype, "_providers", 2);
n([
  c()
], a.prototype, "_loading", 2);
n([
  c()
], a.prototype, "_busy", 2);
n([
  c()
], a.prototype, "_loadError", 2);
n([
  c()
], a.prototype, "_message", 2);
n([
  c()
], a.prototype, "_name", 2);
n([
  c()
], a.prototype, "_scope", 2);
n([
  c()
], a.prototype, "_compress", 2);
n([
  c()
], a.prototype, "_encrypt", 2);
n([
  c()
], a.prototype, "_encryptionKey", 2);
n([
  c()
], a.prototype, "_keepLocal", 2);
n([
  c()
], a.prototype, "_selectedProviders", 2);
n([
  c()
], a.prototype, "_restoreTarget", 2);
n([
  c()
], a.prototype, "_restoreScope", 2);
n([
  c()
], a.prototype, "_overwrite", 2);
n([
  c()
], a.prototype, "_decryptionKey", 2);
a = n([
  j("backups-dashboard")
], a);
const Q = a;
export {
  a as BackupsBackupsDashboardElement,
  Q as default
};
