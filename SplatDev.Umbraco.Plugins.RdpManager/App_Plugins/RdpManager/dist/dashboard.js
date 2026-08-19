import { LitElement as D, nothing as g, html as u, css as S, state as m, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as N } from "@umbraco-cms/backoffice/auth";
function T(e) {
  let t = null;
  const a = new Promise((o) => {
    e.consumeContext(N, async (i) => {
      var r;
      try {
        t = await ((r = i == null ? void 0 : i.getLatestToken) == null ? void 0 : r.call(i)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, i = {}) => {
    await a;
    const r = new Headers(i.headers);
    t && !r.has("Authorization") && r.set("Authorization", `Bearer ${t}`);
    const c = await fetch(o, { ...i, credentials: "same-origin", headers: r });
    return (c.status === 401 || c.status === 403) && console.error(
      `[SplatDev] ${c.status} from ${String(o)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), c;
  };
}
var R = Object.defineProperty, U = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, h = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? U(t, a) : t, r = e.length - 1, c; r >= 0; r--)
    (c = e[r]) && (i = (o ? c(t, a, i) : c(i)) || i);
  return o && i && R(t, a, i), i;
}, w = (e, t, a) => t.has(e) || _("Cannot " + a), f = (e, t, a) => (w(e, t, "read from private field"), a ? a.call(e) : t.get(e)), v = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), s = (e, t, a) => (w(e, t, "access private method"), a), p, l, b, $, y, x, n, k;
const O = {
  id: 0,
  name: "",
  host: "",
  port: 3389,
  username: null,
  domain: null,
  notes: null,
  colorDepth: 32,
  fullScreen: !0,
  width: 1920,
  height: 1080
};
let d = class extends C(D) {
  constructor() {
    super(...arguments), v(this, l), v(this, p, T(this)), this._items = [], this._draft = null, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/RdpManagerApi";
  }
  connectedCallback() {
    super.connectedCallback(), s(this, l, b).call(this);
  }
  render() {
    return u`
      <h1>RDP connections</h1>
      <p class="description">
        Saved remote desktop connections. Download generates a standard <code>.rdp</code>
        file for the host, resolution and colour depth below — it never contains a password.
      </p>

      <div class="row">
        <uui-button look="primary" ?disabled=${this._busy}
          @click=${() => this._draft = { ...O }}>New connection</uui-button>
      </div>

      ${this._msg ? u`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : g}

      ${s(this, l, k).call(this)}

      <uui-box headline="Connections" style="margin-top:16px;">
        ${this._loading ? u`<uui-loader></uui-loader>` : this._items.length === 0 ? u`<p class="empty">No connections yet.</p>` : u`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Name</uui-table-head-cell>
                    <uui-table-head-cell>Host</uui-table-head-cell>
                    <uui-table-head-cell>Sign in as</uui-table-head-cell>
                    <uui-table-head-cell>Display</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._items.map((e) => u`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${e.name}</strong>
                        ${e.notes ? u`<div class="hint">${e.notes}</div>` : g}
                      </uui-table-cell>
                      <uui-table-cell class="mono">${e.host}:${e.port}</uui-table-cell>
                      <uui-table-cell class="mono">
                        ${e.username ? u`${e.domain ? `${e.domain}\\` : ""}${e.username}` : u`<span class="hint">not set</span>`}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${e.fullScreen ? "full screen" : `${e.width}×${e.height}`} · ${e.colorDepth}-bit
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Download"
                          @click=${() => s(this, l, x).call(this, e)}>Download</uui-button>
                        <uui-button look="secondary" compact label="Edit"
                          @click=${() => this._draft = { ...e }}>Edit</uui-button>
                        <uui-button look="secondary" color="danger" compact label="Delete"
                          ?disabled=${this._busy} @click=${() => s(this, l, y).call(this, e)}>Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>`)}
                </uui-table>`}
      </uui-box>`;
  }
};
p = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
b = async function() {
  this._loading = !0;
  try {
    const e = await f(this, p).call(this, `${this._api}/GetAll`, { credentials: "same-origin" });
    e.ok && (this._items = await e.json());
  } finally {
    this._loading = !1;
  }
};
$ = async function() {
  if (this._draft) {
    this._busy = !0, this._msg = null;
    try {
      const e = this._draft.id > 0, t = await f(this, p).call(this, `${this._api}/${e ? "Update" : "Create"}`, {
        method: e ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._draft)
      }), a = await t.json();
      this._msg = { ok: t.ok, text: a.message ?? (t.ok ? "Saved." : "Could not save.") }, t.ok && (this._draft = null, await s(this, l, b).call(this));
    } catch (e) {
      this._msg = { ok: !1, text: `The request failed: ${e.message}` };
    } finally {
      this._busy = !1;
    }
  }
};
y = async function(e) {
  var t;
  if (confirm(`Delete "${e.name}"?`)) {
    this._busy = !0, this._msg = null;
    try {
      const a = await f(this, p).call(this, `${this._api}/Delete?id=${e.id}`, {
        method: "DELETE",
        credentials: "same-origin"
      }), o = await a.json();
      this._msg = { ok: a.ok, text: o.message ?? "Deleted." }, ((t = this._draft) == null ? void 0 : t.id) === e.id && (this._draft = null), await s(this, l, b).call(this);
    } catch (a) {
      this._msg = { ok: !1, text: `The request failed: ${a.message}` };
    } finally {
      this._busy = !1;
    }
  }
};
x = async function(e) {
  this._msg = null;
  try {
    const t = await f(this, p).call(this, `${this._api}/DownloadRdpFile?id=${e.id}`, { credentials: "same-origin" });
    if (!t.ok) throw new Error(String(t.status));
    const a = await t.blob(), o = URL.createObjectURL(a), i = document.createElement("a");
    i.href = o, i.download = `${e.name.replace(/[^\w.-]+/g, "_")}.rdp`, i.click(), URL.revokeObjectURL(o);
  } catch (t) {
    this._msg = { ok: !1, text: `Could not download the file (${t.message}).` };
  }
};
n = function(e, t) {
  this._draft && (this._draft = { ...this._draft, [e]: t });
};
k = function() {
  const e = this._draft;
  return e ? u`
      <uui-box headline=${e.id > 0 ? `Edit ${e.name}` : "New connection"} style="margin-top:16px;">
        <div class="row">
          <div class="field grow">
            <label for="n">Name</label>
            <input id="n" .value=${e.name}
              @input=${(t) => s(this, l, n).call(this, "name", t.target.value)} />
          </div>
          <div class="field grow">
            <label for="h">Host</label>
            <input id="h" .value=${e.host} placeholder="server.example.com"
              @input=${(t) => s(this, l, n).call(this, "host", t.target.value)} />
          </div>
          <div class="field narrow">
            <label for="p">Port</label>
            <input id="p" type="number" min="1" max="65535" .value=${String(e.port)}
              @input=${(t) => s(this, l, n).call(this, "port", Number(t.target.value))} />
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field">
            <label for="u">Username <span class="hint">(optional)</span></label>
            <input id="u" .value=${e.username ?? ""}
              @input=${(t) => s(this, l, n).call(this, "username", t.target.value)} />
          </div>
          <div class="field">
            <label for="dm">Domain <span class="hint">(optional)</span></label>
            <input id="dm" .value=${e.domain ?? ""}
              @input=${(t) => s(this, l, n).call(this, "domain", t.target.value)} />
          </div>
          <div class="field narrow">
            <label for="w">Width</label>
            <input id="w" type="number" min="640" .value=${String(e.width)}
              @input=${(t) => s(this, l, n).call(this, "width", Number(t.target.value))} />
          </div>
          <div class="field narrow">
            <label for="ht">Height</label>
            <input id="ht" type="number" min="480" .value=${String(e.height)}
              @input=${(t) => s(this, l, n).call(this, "height", Number(t.target.value))} />
          </div>
          <div class="field narrow">
            <label for="cd">Colour depth</label>
            <select id="cd" .value=${String(e.colorDepth)}
              @change=${(t) => s(this, l, n).call(this, "colorDepth", Number(t.target.value))}>
              <option value="15">15</option><option value="16">16</option>
              <option value="24">24</option><option value="32">32</option>
            </select>
          </div>
          <div class="field narrow">
            <label>Full screen</label>
            <uui-toggle ?checked=${e.fullScreen}
              @change=${(t) => s(this, l, n).call(this, "fullScreen", t.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="nt">Notes</label>
            <textarea id="nt" .value=${e.notes ?? ""}
              @input=${(t) => s(this, l, n).call(this, "notes", t.target.value)}></textarea>
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy} @click=${s(this, l, $)}>
            ${this._busy ? "Saving…" : e.id > 0 ? "Save changes" : "Create"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._draft = null}>Cancel</uui-button>
        </div>
      </uui-box>` : g;
};
d.styles = S`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input, .field select, .field textarea {
      padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px; font: inherit; min-width: 170px; box-sizing: border-box; }
    .field.narrow input, .field.narrow select { min-width: 110px; }
    .field textarea { min-width: 320px; min-height: 60px; }
    .grow { flex: 1 1 220px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.ok { background: #d1fae5; color: #065f46; }
    .msg.bad { background: #fee2e2; color: #991b1b; }
    .mono { font-family: var(--uui-font-monospace, monospace); font-size: 0.8125rem; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 0; }
    uui-table { width: 100%; }
  `;
h([
  m()
], d.prototype, "_items", 2);
h([
  m()
], d.prototype, "_draft", 2);
h([
  m()
], d.prototype, "_loading", 2);
h([
  m()
], d.prototype, "_busy", 2);
h([
  m()
], d.prototype, "_msg", 2);
d = h([
  E("rdpmanager-dashboard")
], d);
const A = d;
export {
  d as RdpManagerDashboardElement,
  A as default
};
