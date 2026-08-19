import { LitElement as D, nothing as d, html as l, css as E, state as h, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as T } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as N } from "@umbraco-cms/backoffice/auth";
function C(e) {
  let t = null;
  const i = new Promise((a) => {
    e.consumeContext(N, async (s) => {
      var u;
      try {
        t = await ((u = s == null ? void 0 : s.getLatestToken) == null ? void 0 : u.call(s)) ?? null;
      } catch {
        t = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return async (a, s = {}) => {
    await i;
    const u = new Headers(s.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const c = await fetch(a, { ...s, credentials: "same-origin", headers: u });
    return (c.status === 401 || c.status === 403) && console.error(
      `[SplatDev] ${c.status} from ${String(a)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), c;
  };
}
var O = Object.defineProperty, G = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, p = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? G(t, i) : t, u = e.length - 1, c; u >= 0; u--)
    (c = e[u]) && (s = (a ? c(t, i, s) : c(s)) || s);
  return a && s && O(t, i, s), s;
}, $ = (e, t, i) => t.has(e) || _("Cannot " + i), b = (e, t, i) => ($(e, t, "read from private field"), i ? i.call(e) : t.get(e)), y = (e, t, i) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), n = (e, t, i) => ($(e, t, "access private method"), i), g, o, m, f, w, x, k, v;
const z = {
  id: 0,
  groupId: 0,
  key: "",
  value: "",
  type: "text",
  description: null
};
let r = class extends T(D) {
  constructor() {
    super(...arguments), y(this, o), y(this, g, C(this)), this._groups = [], this._settings = [], this._loading = !0, this._busy = !1, this._msg = null, this._draft = null, this._groupDraft = null, this._api = "/umbraco/api/SettingsApi";
  }
  connectedCallback() {
    super.connectedCallback(), n(this, o, m).call(this);
  }
  render() {
    return l`
      <h1>Site settings</h1>
      <p class="description">
        Key/value settings for the site, organised into groups. Each setting declares a type,
        and the editor and the save validation both follow it.
      </p>

      <div class="row">
        <uui-button look="primary" ?disabled=${this._busy}
          @click=${() => this._draft = { ...z }}>New setting</uui-button>
        <uui-button look="secondary" ?disabled=${this._busy}
          @click=${() => this._groupDraft = { id: 0, name: "", alias: "", description: null, sortOrder: 0 }}>New group</uui-button>
      </div>

      ${this._msg ? l`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>` : d}

      ${n(this, o, x).call(this)}
      ${n(this, o, k).call(this)}

      ${this._loading ? l`<uui-loader style="margin-top:16px;"></uui-loader>` : l`
            ${this._groups.map((e) => n(this, o, v).call(this, e))}
            ${n(this, o, v).call(this, null)}
            ${this._groups.length === 0 && this._settings.length === 0 ? l`<p class="empty" style="margin-top:16px;">
                       No settings yet. Create a group, then add settings to it.
                     </p>` : d}
          `}
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
m = async function() {
  this._loading = !0;
  try {
    const [e, t] = await Promise.all([
      b(this, g).call(this, `${this._api}/GetGroups`, { credentials: "same-origin" }),
      b(this, g).call(this, `${this._api}/GetAll`, { credentials: "same-origin" })
    ]);
    e.ok && (this._groups = await e.json()), t.ok && (this._settings = await t.json());
  } finally {
    this._loading = !1;
  }
};
f = async function(e, t, i) {
  this._busy = !0, this._msg = null;
  try {
    const a = await b(this, g).call(this, `${this._api}/${e}`, {
      method: t,
      credentials: "same-origin",
      headers: i ? { "Content-Type": "application/json" } : void 0,
      body: i ? JSON.stringify(i) : void 0
    }), s = a.status === 204 ? { success: !0, message: "Deleted.", value: null } : await a.json();
    return this._msg = { ok: s.success, text: s.message }, s.success && await n(this, o, m).call(this), s;
  } catch (a) {
    return this._msg = { ok: !1, text: `The request failed: ${a.message}` }, null;
  } finally {
    this._busy = !1;
  }
};
w = function(e) {
  const t = (i) => this._draft = { ...e, value: i };
  switch (e.type) {
    case "boolean":
      return l`
          <div class="field">
            <label>Value</label>
            <uui-toggle
              ?checked=${e.value === "true" || e.value === "1"}
              @change=${(i) => t(i.target.checked ? "true" : "false")}></uui-toggle>
          </div>`;
    case "number":
      return l`
          <div class="field">
            <label for="v">Value</label>
            <input id="v" type="number" .value=${e.value ?? ""}
              @input=${(i) => t(i.target.value)} />
          </div>`;
    case "json":
      return l`
          <div class="field grow">
            <label for="v">Value</label>
            <textarea id="v" spellcheck="false" .value=${e.value ?? ""}
              @input=${(i) => t(i.target.value)}></textarea>
            <span class="hint">Validated as JSON on save.</span>
          </div>`;
    default:
      return l`
          <div class="field grow">
            <label for="v">Value</label>
            <input id="v" .value=${e.value ?? ""}
              @input=${(i) => t(i.target.value)} />
          </div>`;
  }
};
x = function() {
  const e = this._draft;
  return e ? l`
      <uui-box headline=${e.id > 0 ? `Edit ${e.key}` : "New setting"} style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="k">Key</label>
            <input id="k" .value=${e.key}
              @input=${(t) => this._draft = { ...e, key: t.target.value }} />
          </div>

          <div class="field">
            <label for="ty">Type</label>
            <select id="ty" .value=${e.type}
              @change=${(t) => this._draft = { ...e, type: t.target.value }}>
              <option value="text">Text</option>
              <option value="boolean">Boolean</option>
              <option value="number">Number</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div class="field">
            <label for="gr">Group</label>
            <select id="gr" .value=${String(e.groupId)}
              @change=${(t) => this._draft = { ...e, groupId: Number(t.target.value) }}>
              <option value="0">Ungrouped</option>
              ${this._groups.map((t) => l`<option value=${t.id}>${t.name}</option>`)}
            </select>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          ${n(this, o, w).call(this, e)}
          <div class="field grow">
            <label for="ds">Description</label>
            <input id="ds" .value=${e.description ?? ""}
              @input=${(t) => this._draft = { ...e, description: t.target.value }} />
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => {
    const t = await n(this, o, f).call(this, "Save", "POST", this._draft);
    t != null && t.success && (this._draft = null);
  }}>
            ${this._busy ? "Saving…" : e.id > 0 ? "Save changes" : "Create setting"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._draft = null}>Cancel</uui-button>
        </div>
      </uui-box>
    ` : d;
};
k = function() {
  const e = this._groupDraft;
  return e ? l`
      <uui-box headline=${e.id > 0 ? `Edit ${e.name}` : "New group"} style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="gn">Name</label>
            <input id="gn" .value=${e.name}
              @input=${(t) => this._groupDraft = { ...e, name: t.target.value }} />
          </div>
          <div class="field">
            <label for="ga">Alias <span class="hint">(optional)</span></label>
            <input id="ga" .value=${e.alias}
              @input=${(t) => this._groupDraft = { ...e, alias: t.target.value }} />
          </div>
          <div class="field">
            <label for="gs">Sort order</label>
            <input id="gs" type="number" style="min-width:100px;" .value=${String(e.sortOrder)}
              @input=${(t) => this._groupDraft = { ...e, sortOrder: Number(t.target.value) }} />
          </div>
          <div class="field grow">
            <label for="gd">Description</label>
            <input id="gd" .value=${e.description ?? ""}
              @input=${(t) => this._groupDraft = { ...e, description: t.target.value }} />
          </div>
        </div>
        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => {
    const t = await n(this, o, f).call(this, "SaveGroup", "POST", this._groupDraft);
    t != null && t.success && (this._groupDraft = null);
  }}>
            ${this._busy ? "Saving…" : e.id > 0 ? "Save changes" : "Create group"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._groupDraft = null}>Cancel</uui-button>
        </div>
      </uui-box>
    ` : d;
};
v = function(e) {
  const t = (e == null ? void 0 : e.id) ?? 0, i = this._settings.filter((a) => a.groupId === t);
  return !e && i.length === 0 ? d : l`
      <uui-box style="margin-top:16px;">
        <div slot="headline" class="group-head">
          <span>${(e == null ? void 0 : e.name) ?? "Ungrouped"}</span>
          ${e ? l`<span class="alias">${e.alias}</span>` : d}
        </div>

        ${e ? l`
              <div slot="header-actions">
                <uui-button look="secondary" compact label="Edit group"
                  @click=${() => this._groupDraft = { ...e }}>Edit</uui-button>
                <uui-button look="secondary" color="danger" compact label="Delete group"
                  ?disabled=${this._busy}
                  @click=${() => n(this, o, f).call(this, "DeleteGroup?id=" + e.id, "DELETE")}>Delete</uui-button>
              </div>` : d}

        ${e != null && e.description ? l`<p class="hint">${e.description}</p>` : d}

        ${i.length === 0 ? l`<p class="empty">No settings in this group.</p>` : l`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Key</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Value</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${i.map((a) => l`
                  <uui-table-row>
                    <uui-table-cell>
                      <span class="key">${a.key}</span>
                      ${a.description ? l`<div class="hint">${a.description}</div>` : d}
                    </uui-table-cell>
                    <uui-table-cell>${a.type}</uui-table-cell>
                    <uui-table-cell class="hint" style="max-width:280px;overflow-wrap:anywhere;">
                      ${a.value ?? l`<em>not set</em>`}
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;white-space:nowrap;">
                      <uui-button look="secondary" compact label="Edit"
                        @click=${() => this._draft = { ...a }}>Edit</uui-button>
                      <uui-button look="secondary" color="danger" compact label="Delete"
                        ?disabled=${this._busy}
                        @click=${() => confirm(`Delete "${a.key}"?`) && n(this, o, f).call(this, "Delete?id=" + a.id, "DELETE")}>Delete</uui-button>
                    </uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>`}
      </uui-box>
    `;
};
r.styles = E`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input, .field select, .field textarea {
      padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px; font: inherit; min-width: 180px; box-sizing: border-box;
    }
    .field textarea { min-width: 320px; min-height: 96px; font-family: var(--uui-font-monospace, monospace); }
    .grow { flex: 1 1 240px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .group-head { display: flex; align-items: baseline; gap: 10px; }
    .alias { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem;
             font-family: var(--uui-font-monospace, monospace); }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 10px 0; }
    .key { font-family: var(--uui-font-monospace, monospace); font-weight: 600; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    uui-table { width: 100%; }
  `;
p([
  h()
], r.prototype, "_groups", 2);
p([
  h()
], r.prototype, "_settings", 2);
p([
  h()
], r.prototype, "_loading", 2);
p([
  h()
], r.prototype, "_busy", 2);
p([
  h()
], r.prototype, "_msg", 2);
p([
  h()
], r.prototype, "_draft", 2);
p([
  h()
], r.prototype, "_groupDraft", 2);
r = p([
  S("settings-dashboard")
], r);
const j = r;
export {
  r as SettingsDashboardElement,
  j as default
};
