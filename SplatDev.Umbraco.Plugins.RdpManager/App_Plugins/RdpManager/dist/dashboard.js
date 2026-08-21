import { LitElement as N, nothing as _, html as d, css as O, state as b, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as R } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as M } from "@umbraco-cms/backoffice/notification";
function P(e) {
  let t = null, a = null;
  const o = e.consumeContext.bind(e), s = new Promise((r) => {
    o(R, async (n) => {
      var p;
      try {
        t = await ((p = n == null ? void 0 : n.getLatestToken) == null ? void 0 : p.call(n)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return o(M, (r) => {
    a = r;
  }), async (r, n = {}) => {
    await s;
    const p = new Headers(n.headers);
    t && !p.has("Authorization") && p.set("Authorization", `Bearer ${t}`);
    const h = await fetch(r, { ...n, credentials: "same-origin", headers: p });
    if (!h.ok) {
      const w = h.status === 401 || h.status === 403, T = w ? "Not authorised" : "Could not load data", $ = w ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${h.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${h.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${h.status} from ${String(r)} — ${$}`), a == null || a.peek("danger", { data: { headline: T, message: $ } });
    }
    return h;
  };
}
var z = Object.defineProperty, L = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, m = (e, t, a, o) => {
  for (var s = o > 1 ? void 0 : o ? L(t, a) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (o ? n(t, a, s) : n(s)) || s);
  return o && s && z(t, a, s), s;
}, k = (e, t, a) => t.has(e) || x("Cannot " + a), g = (e, t, a) => (k(e, t, "read from private field"), a ? a.call(e) : t.get(e)), y = (e, t, a) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), l = (e, t, a) => (k(e, t, "access private method"), a), f, i, v, D, S, C, u, E;
const j = {
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
let c = class extends A(N) {
  constructor() {
    super(...arguments), y(this, i), y(this, f, P(this)), this._items = [], this._draft = null, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/RdpManagerApi";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, i, v).call(this);
  }
  render() {
    return d`
      <h1>RDP connections</h1>
      <p class="description">
        Saved remote desktop connections. Download generates a standard <code>.rdp</code>
        file for the host, resolution and colour depth below — it never contains a password.
      </p>

      <div class="row">
        <uui-button look="primary" ?disabled=${this._busy}
          @click=${() => this._draft = { ...j }}>New connection</uui-button>
      </div>

      ${this._msg ? d`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : _}

      ${l(this, i, E).call(this)}

      <uui-box headline="Connections" style="margin-top:16px;">
        ${this._loading ? d`<uui-loader></uui-loader>` : this._items.length === 0 ? d`<p class="empty">No connections yet.</p>` : d`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Name</uui-table-head-cell>
                    <uui-table-head-cell>Host</uui-table-head-cell>
                    <uui-table-head-cell>Sign in as</uui-table-head-cell>
                    <uui-table-head-cell>Display</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._items.map((e) => d`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${e.name}</strong>
                        ${e.notes ? d`<div class="hint">${e.notes}</div>` : _}
                      </uui-table-cell>
                      <uui-table-cell class="mono">${e.host}:${e.port}</uui-table-cell>
                      <uui-table-cell class="mono">
                        ${e.username ? d`${e.domain ? `${e.domain}\\` : ""}${e.username}` : d`<span class="hint">not set</span>`}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${e.fullScreen ? "full screen" : `${e.width}×${e.height}`} · ${e.colorDepth}-bit
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Download"
                          @click=${() => l(this, i, C).call(this, e)}>Download</uui-button>
                        <uui-button look="secondary" compact label="Edit"
                          @click=${() => this._draft = { ...e }}>Edit</uui-button>
                        <uui-button look="secondary" color="danger" compact label="Delete"
                          ?disabled=${this._busy} @click=${() => l(this, i, S).call(this, e)}>Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>`)}
                </uui-table>`}
      </uui-box>`;
  }
};
f = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
v = async function() {
  this._loading = !0;
  try {
    const e = await g(this, f).call(this, `${this._api}/GetAll`, { credentials: "same-origin" });
    e.ok && (this._items = await e.json());
  } finally {
    this._loading = !1;
  }
};
D = async function() {
  if (this._draft) {
    this._busy = !0, this._msg = null;
    try {
      const e = this._draft.id > 0, t = await g(this, f).call(this, `${this._api}/${e ? "Update" : "Create"}`, {
        method: e ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._draft)
      }), a = await t.json();
      this._msg = { ok: t.ok, text: a.message ?? (t.ok ? "Saved." : "Could not save.") }, t.ok && (this._draft = null, await l(this, i, v).call(this));
    } catch (e) {
      this._msg = { ok: !1, text: `The request failed: ${e.message}` };
    } finally {
      this._busy = !1;
    }
  }
};
S = async function(e) {
  var t;
  if (confirm(`Delete "${e.name}"?`)) {
    this._busy = !0, this._msg = null;
    try {
      const a = await g(this, f).call(this, `${this._api}/Delete?id=${e.id}`, {
        method: "DELETE",
        credentials: "same-origin"
      }), o = await a.json();
      this._msg = { ok: a.ok, text: o.message ?? "Deleted." }, ((t = this._draft) == null ? void 0 : t.id) === e.id && (this._draft = null), await l(this, i, v).call(this);
    } catch (a) {
      this._msg = { ok: !1, text: `The request failed: ${a.message}` };
    } finally {
      this._busy = !1;
    }
  }
};
C = async function(e) {
  this._msg = null;
  try {
    const t = await g(this, f).call(this, `${this._api}/DownloadRdpFile?id=${e.id}`, { credentials: "same-origin" });
    if (!t.ok) throw new Error(String(t.status));
    const a = await t.blob(), o = URL.createObjectURL(a), s = document.createElement("a");
    s.href = o, s.download = `${e.name.replace(/[^\w.-]+/g, "_")}.rdp`, s.click(), URL.revokeObjectURL(o);
  } catch (t) {
    this._msg = { ok: !1, text: `Could not download the file (${t.message}).` };
  }
};
u = function(e, t) {
  this._draft && (this._draft = { ...this._draft, [e]: t });
};
E = function() {
  const e = this._draft;
  return e ? d`
      <uui-box headline=${e.id > 0 ? `Edit ${e.name}` : "New connection"} style="margin-top:16px;">
        <div class="row">
          <div class="field grow">
            <label for="n">Name</label>
            <input id="n" .value=${e.name}
              @input=${(t) => l(this, i, u).call(this, "name", t.target.value)} />
          </div>
          <div class="field grow">
            <label for="h">Host</label>
            <input id="h" .value=${e.host} placeholder="server.example.com"
              @input=${(t) => l(this, i, u).call(this, "host", t.target.value)} />
          </div>
          <div class="field narrow">
            <label for="p">Port</label>
            <input id="p" type="number" min="1" max="65535" .value=${String(e.port)}
              @input=${(t) => l(this, i, u).call(this, "port", Number(t.target.value))} />
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field">
            <label for="u">Username <span class="hint">(optional)</span></label>
            <input id="u" .value=${e.username ?? ""}
              @input=${(t) => l(this, i, u).call(this, "username", t.target.value)} />
          </div>
          <div class="field">
            <label for="dm">Domain <span class="hint">(optional)</span></label>
            <input id="dm" .value=${e.domain ?? ""}
              @input=${(t) => l(this, i, u).call(this, "domain", t.target.value)} />
          </div>
          <div class="field narrow">
            <label for="w">Width</label>
            <input id="w" type="number" min="640" .value=${String(e.width)}
              @input=${(t) => l(this, i, u).call(this, "width", Number(t.target.value))} />
          </div>
          <div class="field narrow">
            <label for="ht">Height</label>
            <input id="ht" type="number" min="480" .value=${String(e.height)}
              @input=${(t) => l(this, i, u).call(this, "height", Number(t.target.value))} />
          </div>
          <div class="field narrow">
            <label for="cd">Colour depth</label>
            <select id="cd" .value=${String(e.colorDepth)}
              @change=${(t) => l(this, i, u).call(this, "colorDepth", Number(t.target.value))}>
              <option value="15">15</option><option value="16">16</option>
              <option value="24">24</option><option value="32">32</option>
            </select>
          </div>
          <div class="field narrow">
            <label>Full screen</label>
            <uui-toggle ?checked=${e.fullScreen}
              @change=${(t) => l(this, i, u).call(this, "fullScreen", t.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="nt">Notes</label>
            <textarea id="nt" .value=${e.notes ?? ""}
              @input=${(t) => l(this, i, u).call(this, "notes", t.target.value)}></textarea>
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy} @click=${l(this, i, D)}>
            ${this._busy ? "Saving…" : e.id > 0 ? "Save changes" : "Create"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._draft = null}>Cancel</uui-button>
        </div>
      </uui-box>` : _;
};
c.styles = O`
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
m([
  b()
], c.prototype, "_items", 2);
m([
  b()
], c.prototype, "_draft", 2);
m([
  b()
], c.prototype, "_loading", 2);
m([
  b()
], c.prototype, "_busy", 2);
m([
  b()
], c.prototype, "_msg", 2);
c = m([
  U("rdpmanager-dashboard")
], c);
const B = c;
export {
  c as RdpManagerDashboardElement,
  B as default
};
