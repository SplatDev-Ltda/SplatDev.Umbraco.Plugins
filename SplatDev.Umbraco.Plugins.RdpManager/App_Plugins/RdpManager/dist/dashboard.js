import { LitElement as M, nothing as m, html as s, css as L, state as c, customElement as z } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as F } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as H } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as W } from "@umbraco-cms/backoffice/notification";
function B(e) {
  let t = null, i = null;
  const r = e.consumeContext.bind(e), o = new Promise((h) => {
    r(H, async (d) => {
      var _;
      try {
        t = await ((_ = d == null ? void 0 : d.getLatestToken) == null ? void 0 : _.call(d)) ?? null;
      } catch {
        t = null;
      }
      h();
    }), setTimeout(h, 3e3);
  });
  return r(W, (h) => {
    i = h;
  }), async (h, d = {}) => {
    await o;
    const _ = new Headers(d.headers);
    t && !_.has("Authorization") && _.set("Authorization", `Bearer ${t}`);
    const g = await fetch(h, { ...d, credentials: "same-origin", headers: _ });
    if (!g.ok) {
      const $ = g.status === 401 || g.status === 403, O = $ ? "Not authorised" : "Could not load data", x = $ ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${g.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${g.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${g.status} from ${String(h)} — ${x}`), i == null || i.peek("danger", { data: { headline: O, message: x } });
    }
    return g;
  };
}
var I = Object.defineProperty, J = Object.getOwnPropertyDescriptor, U = (e) => {
  throw TypeError(e);
}, u = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? J(t, i) : t, h = e.length - 1, d; h >= 0; h--)
    (d = e[h]) && (o = (r ? d(t, i, o) : d(o)) || o);
  return r && o && I(t, i, o), o;
}, C = (e, t, i) => t.has(e) || U("Cannot " + i), f = (e, t, i) => (C(e, t, "read from private field"), i ? i.call(e) : t.get(e)), k = (e, t, i) => t.has(e) ? U("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), l = (e, t, i) => (C(e, t, "access private method"), i), b, a, v, N, w, y, T, S, D, E, R, j, p, P;
const q = {
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
}, A = {
  login: "",
  givenName: "",
  surname: "",
  displayName: "",
  email: "",
  department: "",
  jobTitle: "",
  telephone: "",
  requirePasswordChange: !0,
  enabled: !0
};
let n = class extends F(M) {
  constructor() {
    super(...arguments), k(this, a), k(this, b, B(this)), this._items = [], this._draft = null, this._loading = !0, this._busy = !1, this._msg = null, this._dir = null, this._dirTerm = "", this._dirResults = [], this._dirSearching = !1, this._showCreateUser = !1, this._newUser = { ...A }, this._createdUser = null, this._api = "/umbraco/api/RdpManagerApi", this._dirApi = "/umbraco/api/RdpDirectory";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, a, v).call(this), l(this, a, N).call(this);
  }
  render() {
    return s`
      <h1>RDP connections</h1>
      <p class="description">
        Saved remote desktop connections. Download generates a standard <code>.rdp</code>
        file for the host, resolution and colour depth below — it never contains a password.
      </p>

      <div class="row">
        <uui-button look="primary" ?disabled=${this._busy}
          @click=${() => this._draft = { ...q }}>New connection</uui-button>
      </div>

      ${this._msg ? s`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : m}

      ${l(this, a, P).call(this)}

      ${l(this, a, S).call(this)}

      <uui-box headline="Connections" style="margin-top:16px;">
        ${this._loading ? s`<uui-loader></uui-loader>` : this._items.length === 0 ? s`<p class="empty">No connections yet.</p>` : s`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Name</uui-table-head-cell>
                    <uui-table-head-cell>Host</uui-table-head-cell>
                    <uui-table-head-cell>Sign in as</uui-table-head-cell>
                    <uui-table-head-cell>Display</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._items.map((e) => s`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${e.name}</strong>
                        ${e.notes ? s`<div class="hint">${e.notes}</div>` : m}
                      </uui-table-cell>
                      <uui-table-cell class="mono">${e.host}:${e.port}</uui-table-cell>
                      <uui-table-cell class="mono">
                        ${e.username ? s`${e.domain ? `${e.domain}\\` : ""}${e.username}` : s`<span class="hint">not set</span>`}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${e.fullScreen ? "full screen" : `${e.width}×${e.height}`} · ${e.colorDepth}-bit
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Download"
                          @click=${() => l(this, a, j).call(this, e)}>Download</uui-button>
                        <uui-button look="secondary" compact label="Edit"
                          @click=${() => this._draft = { ...e }}>Edit</uui-button>
                        <uui-button look="secondary" color="danger" compact label="Delete"
                          ?disabled=${this._busy} @click=${() => l(this, a, R).call(this, e)}>Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>`)}
                </uui-table>`}
      </uui-box>`;
  }
};
b = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
v = async function() {
  this._loading = !0;
  try {
    const e = await f(this, b).call(this, `${this._api}/GetAll`, { credentials: "same-origin" });
    e.ok && (this._items = await e.json());
  } finally {
    this._loading = !1;
  }
};
N = async function() {
  try {
    const e = await f(this, b).call(this, `${this._dirApi}/Status`, { credentials: "same-origin" });
    e.ok && (this._dir = await e.json());
  } catch {
    this._dir = null;
  }
};
w = async function() {
  const e = this._dirTerm.trim();
  if (!e) {
    this._dirResults = [];
    return;
  }
  this._dirSearching = !0;
  try {
    const t = await f(this, b).call(this, `${this._dirApi}/Search?term=${encodeURIComponent(e)}`, {
      credentials: "same-origin"
    });
    this._dirResults = t.ok ? await t.json() : [], t.ok && this._dirResults.length === 0 && (this._msg = { ok: !1, text: `No account matched "${e}".` });
  } catch {
    this._msg = { ok: !1, text: "The directory could not be searched." }, this._dirResults = [];
  } finally {
    this._dirSearching = !1;
  }
};
y = function(e) {
  this._draft || (this._draft = { ...q }), this._draft = {
    ...this._draft,
    username: e.login,
    domain: e.domain ?? this._draft.domain,
    notes: this._draft.notes || [e.displayName, e.jobTitle, e.department].filter(Boolean).join(" · ")
  }, this._dirResults = [], this._dirTerm = "", this._msg = { ok: !0, text: `Filled in from ${e.source ?? "the directory"}: ${e.login}.` };
};
T = async function() {
  const e = this._newUser;
  if (!e.login.trim() || !e.givenName.trim() || !e.surname.trim()) {
    this._msg = { ok: !1, text: "A login, first name and surname are required." };
    return;
  }
  this._busy = !0, this._createdUser = null;
  try {
    const i = await (await f(this, b).call(this, `${this._dirApi}/CreateUser`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: e.login.trim(),
        givenName: e.givenName.trim(),
        surname: e.surname.trim(),
        displayName: e.displayName.trim() || null,
        email: e.email.trim() || null,
        department: e.department.trim() || null,
        jobTitle: e.jobTitle.trim() || null,
        telephone: e.telephone.trim() || null,
        requirePasswordChange: e.requirePasswordChange,
        enabled: e.enabled
      })
    })).json();
    this._createdUser = i.user ?? null, this._msg = { ok: i.succeeded === !0, text: i.message ?? "Nothing happened." }, i.succeeded && (this._newUser = { ...A }, this._showCreateUser = !1);
  } catch {
    this._msg = { ok: !1, text: "The account could not be created." };
  } finally {
    this._busy = !1;
  }
};
S = function() {
  const e = this._dir;
  return e ? e.configured ? s`
      <uui-box headline="Directory — ${e.provider}" style="margin-top:16px;">
        <p class="description" style="margin-top:0">
          Find someone in ${e.provider} to fill a connection's username and domain from,
          rather than typing them and hoping they match.
        </p>

        <div class="row">
          <div class="field grow">
            <label for="dq">Search</label>
            <uui-input id="dq" placeholder="name, login or e-mail"
              .value=${this._dirTerm}
              @input=${(t) => this._dirTerm = t.target.value}
              @keydown=${(t) => {
    t.key === "Enter" && l(this, a, w).call(this);
  }}
            ></uui-input>
          </div>
          <uui-button look="secondary" ?disabled=${this._dirSearching}
            @click=${() => l(this, a, w).call(this)}>
            ${this._dirSearching ? "Searching…" : "Search"}
          </uui-button>
          ${e.canCreateUsers ? s`<uui-button look="primary" color="positive"
                @click=${() => {
    this._showCreateUser = !this._showCreateUser, this._createdUser = null;
  }}>
                ${this._showCreateUser ? "Cancel" : "Create user"}
              </uui-button>` : m}
        </div>

        ${!e.canCreateUsers && e.reason ? s`<p class="hint" style="margin-top:8px">${e.reason}</p>` : m}

        ${this._dirResults.length > 0 ? s`
              <uui-table style="margin-top:12px">
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Login</uui-table-head-cell>
                  <uui-table-head-cell>E-mail</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._dirResults.map(
    (t) => s`
                    <uui-table-row>
                      <uui-table-cell><strong>${t.displayName || "—"}</strong></uui-table-cell>
                      <uui-table-cell><code>${t.login}</code></uui-table-cell>
                      <uui-table-cell>${t.email || "—"}</uui-table-cell>
                      <uui-table-cell>${t.isEnabled ? "enabled" : "disabled"}</uui-table-cell>
                      <uui-table-cell>
                        <uui-button compact look="secondary" label="Use ${t.login}"
                          @click=${() => l(this, a, y).call(this, t)}>Use</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
  )}
              </uui-table>` : m}

        ${this._createdUser ? s`
              <div class="msg ok" style="margin-top:12px">
                <strong>${this._createdUser.login}</strong>
                ${this._createdUser.displayName ? s` — ${this._createdUser.displayName}` : m}
                <uui-button compact look="secondary" style="margin-left:8px"
                  @click=${() => l(this, a, y).call(this, this._createdUser)}>Use for a connection</uui-button>
              </div>` : m}

        ${this._showCreateUser && e.canCreateUsers ? l(this, a, D).call(this) : m}
      </uui-box>` : s`
        <uui-box headline="Directory" style="margin-top:16px;">
          <p class="empty">${e.reason}</p>
        </uui-box>` : m;
};
D = function() {
  const e = this._newUser, t = (i) => (r) => this._newUser = { ...this._newUser, [i]: r.target.value };
  return s`
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--uui-color-border,#e5e7eb)">
        <div class="row">
          <div class="field grow">
            <label for="cl">Login <span class="hint">(required)</span></label>
            <uui-input id="cl" .value=${e.login} @input=${t("login")}></uui-input>
          </div>
          <div class="field grow">
            <label for="cg">First name <span class="hint">(required)</span></label>
            <uui-input id="cg" .value=${e.givenName} @input=${t("givenName")}></uui-input>
          </div>
          <div class="field grow">
            <label for="cs">Surname <span class="hint">(required)</span></label>
            <uui-input id="cs" .value=${e.surname} @input=${t("surname")}></uui-input>
          </div>
        </div>
        <div class="row">
          <div class="field grow">
            <label for="cd">Display name <span class="hint">(optional)</span></label>
            <uui-input id="cd" placeholder="built from the names when empty"
              .value=${e.displayName} @input=${t("displayName")}></uui-input>
          </div>
          <div class="field grow">
            <label for="ce">E-mail <span class="hint">(optional)</span></label>
            <uui-input id="ce" type="email" .value=${e.email} @input=${t("email")}></uui-input>
          </div>
        </div>
        <div class="row">
          <div class="field grow">
            <label for="cdep">Department <span class="hint">(optional)</span></label>
            <uui-input id="cdep" .value=${e.department} @input=${t("department")}></uui-input>
          </div>
          <div class="field grow">
            <label for="cjt">Job title <span class="hint">(optional)</span></label>
            <uui-input id="cjt" .value=${e.jobTitle} @input=${t("jobTitle")}></uui-input>
          </div>
          <div class="field grow">
            <label for="ctel">Telephone <span class="hint">(optional)</span></label>
            <uui-input id="ctel" .value=${e.telephone} @input=${t("telephone")}></uui-input>
          </div>
        </div>
        <div class="row" style="align-items:center;gap:18px">
          <uui-toggle label="Must change password at first sign-in"
            ?checked=${e.requirePasswordChange}
            @change=${(i) => this._newUser = { ...this._newUser, requirePasswordChange: i.target.checked }}
            >Must change password at first sign-in</uui-toggle>
        </div>
        <p class="hint">
          No password is set from here. The account is created needing one, and an
          administrator sets it in the directory — a password typed into this form would
          travel through the browser and the request log to get there.
        </p>
        <div class="row">
          <uui-button look="primary" color="positive" ?disabled=${this._busy}
            @click=${() => l(this, a, T).call(this)}>
            ${this._busy ? "Creating…" : "Create"}
          </uui-button>
        </div>
      </div>`;
};
E = async function() {
  if (this._draft) {
    this._busy = !0, this._msg = null;
    try {
      const e = this._draft.id > 0, t = await f(this, b).call(this, `${this._api}/${e ? "Update" : "Create"}`, {
        method: e ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._draft)
      }), i = await t.json();
      this._msg = { ok: t.ok, text: i.message ?? (t.ok ? "Saved." : "Could not save.") }, t.ok && (this._draft = null, await l(this, a, v).call(this));
    } catch (e) {
      this._msg = { ok: !1, text: `The request failed: ${e.message}` };
    } finally {
      this._busy = !1;
    }
  }
};
R = async function(e) {
  var t;
  if (confirm(`Delete "${e.name}"?`)) {
    this._busy = !0, this._msg = null;
    try {
      const i = await f(this, b).call(this, `${this._api}/Delete?id=${e.id}`, {
        method: "DELETE",
        credentials: "same-origin"
      }), r = await i.json();
      this._msg = { ok: i.ok, text: r.message ?? "Deleted." }, ((t = this._draft) == null ? void 0 : t.id) === e.id && (this._draft = null), await l(this, a, v).call(this);
    } catch (i) {
      this._msg = { ok: !1, text: `The request failed: ${i.message}` };
    } finally {
      this._busy = !1;
    }
  }
};
j = async function(e) {
  this._msg = null;
  try {
    const t = await f(this, b).call(this, `${this._api}/DownloadRdpFile?id=${e.id}`, { credentials: "same-origin" });
    if (!t.ok) throw new Error(String(t.status));
    const i = await t.blob(), r = URL.createObjectURL(i), o = document.createElement("a");
    o.href = r, o.download = `${e.name.replace(/[^\w.-]+/g, "_")}.rdp`, o.click(), URL.revokeObjectURL(r);
  } catch (t) {
    this._msg = { ok: !1, text: `Could not download the file (${t.message}).` };
  }
};
p = function(e, t) {
  this._draft && (this._draft = { ...this._draft, [e]: t });
};
P = function() {
  const e = this._draft;
  return e ? s`
      <uui-box headline=${e.id > 0 ? `Edit ${e.name}` : "New connection"} style="margin-top:16px;">
        <div class="row">
          <div class="field grow">
            <label for="n">Name</label>
            <input id="n" .value=${e.name}
              @input=${(t) => l(this, a, p).call(this, "name", t.target.value)} />
          </div>
          <div class="field grow">
            <label for="h">Host</label>
            <input id="h" .value=${e.host} placeholder="server.example.com"
              @input=${(t) => l(this, a, p).call(this, "host", t.target.value)} />
          </div>
          <div class="field narrow">
            <label for="p">Port</label>
            <input id="p" type="number" min="1" max="65535" .value=${String(e.port)}
              @input=${(t) => l(this, a, p).call(this, "port", Number(t.target.value))} />
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field">
            <label for="u">Username <span class="hint">(optional)</span></label>
            <input id="u" .value=${e.username ?? ""}
              @input=${(t) => l(this, a, p).call(this, "username", t.target.value)} />
          </div>
          <div class="field">
            <label for="dm">Domain <span class="hint">(optional)</span></label>
            <input id="dm" .value=${e.domain ?? ""}
              @input=${(t) => l(this, a, p).call(this, "domain", t.target.value)} />
          </div>
          <div class="field narrow">
            <label for="w">Width</label>
            <input id="w" type="number" min="640" .value=${String(e.width)}
              @input=${(t) => l(this, a, p).call(this, "width", Number(t.target.value))} />
          </div>
          <div class="field narrow">
            <label for="ht">Height</label>
            <input id="ht" type="number" min="480" .value=${String(e.height)}
              @input=${(t) => l(this, a, p).call(this, "height", Number(t.target.value))} />
          </div>
          <div class="field narrow">
            <label for="cd">Colour depth</label>
            <select id="cd" .value=${String(e.colorDepth)}
              @change=${(t) => l(this, a, p).call(this, "colorDepth", Number(t.target.value))}>
              <option value="15">15</option><option value="16">16</option>
              <option value="24">24</option><option value="32">32</option>
            </select>
          </div>
          <div class="field narrow">
            <label>Full screen</label>
            <uui-toggle ?checked=${e.fullScreen}
              @change=${(t) => l(this, a, p).call(this, "fullScreen", t.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="nt">Notes</label>
            <textarea id="nt" .value=${e.notes ?? ""}
              @input=${(t) => l(this, a, p).call(this, "notes", t.target.value)}></textarea>
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy} @click=${l(this, a, E)}>
            ${this._busy ? "Saving…" : e.id > 0 ? "Save changes" : "Create"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._draft = null}>Cancel</uui-button>
        </div>
      </uui-box>` : m;
};
n.styles = L`
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
u([
  c()
], n.prototype, "_items", 2);
u([
  c()
], n.prototype, "_draft", 2);
u([
  c()
], n.prototype, "_loading", 2);
u([
  c()
], n.prototype, "_busy", 2);
u([
  c()
], n.prototype, "_msg", 2);
u([
  c()
], n.prototype, "_dir", 2);
u([
  c()
], n.prototype, "_dirTerm", 2);
u([
  c()
], n.prototype, "_dirResults", 2);
u([
  c()
], n.prototype, "_dirSearching", 2);
u([
  c()
], n.prototype, "_showCreateUser", 2);
u([
  c()
], n.prototype, "_newUser", 2);
u([
  c()
], n.prototype, "_createdUser", 2);
n = u([
  z("rdpmanager-dashboard")
], n);
const Q = n;
export {
  n as RdpManagerDashboardElement,
  Q as default
};
