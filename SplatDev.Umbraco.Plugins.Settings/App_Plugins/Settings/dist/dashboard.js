import { LitElement as $, nothing as u, html as a, css as x, state as c, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
var D = Object.defineProperty, E = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, d = (e, t, i, l) => {
  for (var o = l > 1 ? void 0 : l ? E(t, i) : t, h = e.length - 1, g; h >= 0; h--)
    (g = e[h]) && (o = (l ? g(t, i, o) : g(o)) || o);
  return l && o && D(t, i, o), o;
}, S = (e, t, i) => t.has(e) || f("Cannot " + i), N = (e, t, i) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), n = (e, t, i) => (S(e, t, "access private method"), i), s, v, p, m, _, y, b;
const C = {
  id: 0,
  groupId: 0,
  key: "",
  value: "",
  type: "text",
  description: null
};
let r = class extends k($) {
  constructor() {
    super(...arguments), N(this, s), this._groups = [], this._settings = [], this._loading = !0, this._busy = !1, this._msg = null, this._draft = null, this._groupDraft = null, this._api = "/umbraco/api/SettingsApi";
  }
  connectedCallback() {
    super.connectedCallback(), n(this, s, v).call(this);
  }
  render() {
    return a`
      <h1>Site settings</h1>
      <p class="description">
        Key/value settings for the site, organised into groups. Each setting declares a type,
        and the editor and the save validation both follow it.
      </p>

      <div class="row">
        <uui-button look="primary" ?disabled=${this._busy}
          @click=${() => this._draft = { ...C }}>New setting</uui-button>
        <uui-button look="secondary" ?disabled=${this._busy}
          @click=${() => this._groupDraft = { id: 0, name: "", alias: "", description: null, sortOrder: 0 }}>New group</uui-button>
      </div>

      ${this._msg ? a`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>` : u}

      ${n(this, s, _).call(this)}
      ${n(this, s, y).call(this)}

      ${this._loading ? a`<uui-loader style="margin-top:16px;"></uui-loader>` : a`
            ${this._groups.map((e) => n(this, s, b).call(this, e))}
            ${n(this, s, b).call(this, null)}
            ${this._groups.length === 0 && this._settings.length === 0 ? a`<p class="empty" style="margin-top:16px;">
                       No settings yet. Create a group, then add settings to it.
                     </p>` : u}
          `}
    `;
  }
};
s = /* @__PURE__ */ new WeakSet();
v = async function() {
  this._loading = !0;
  try {
    const [e, t] = await Promise.all([
      fetch(`${this._api}/GetGroups`, { credentials: "same-origin" }),
      fetch(`${this._api}/GetAll`, { credentials: "same-origin" })
    ]);
    e.ok && (this._groups = await e.json()), t.ok && (this._settings = await t.json());
  } finally {
    this._loading = !1;
  }
};
p = async function(e, t, i) {
  this._busy = !0, this._msg = null;
  try {
    const l = await fetch(`${this._api}/${e}`, {
      method: t,
      credentials: "same-origin",
      headers: i ? { "Content-Type": "application/json" } : void 0,
      body: i ? JSON.stringify(i) : void 0
    }), o = l.status === 204 ? { success: !0, message: "Deleted.", value: null } : await l.json();
    return this._msg = { ok: o.success, text: o.message }, o.success && await n(this, s, v).call(this), o;
  } catch (l) {
    return this._msg = { ok: !1, text: `The request failed: ${l.message}` }, null;
  } finally {
    this._busy = !1;
  }
};
m = function(e) {
  const t = (i) => this._draft = { ...e, value: i };
  switch (e.type) {
    case "boolean":
      return a`
          <div class="field">
            <label>Value</label>
            <uui-toggle
              ?checked=${e.value === "true" || e.value === "1"}
              @change=${(i) => t(i.target.checked ? "true" : "false")}></uui-toggle>
          </div>`;
    case "number":
      return a`
          <div class="field">
            <label for="v">Value</label>
            <input id="v" type="number" .value=${e.value ?? ""}
              @input=${(i) => t(i.target.value)} />
          </div>`;
    case "json":
      return a`
          <div class="field grow">
            <label for="v">Value</label>
            <textarea id="v" spellcheck="false" .value=${e.value ?? ""}
              @input=${(i) => t(i.target.value)}></textarea>
            <span class="hint">Validated as JSON on save.</span>
          </div>`;
    default:
      return a`
          <div class="field grow">
            <label for="v">Value</label>
            <input id="v" .value=${e.value ?? ""}
              @input=${(i) => t(i.target.value)} />
          </div>`;
  }
};
_ = function() {
  const e = this._draft;
  return e ? a`
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
              ${this._groups.map((t) => a`<option value=${t.id}>${t.name}</option>`)}
            </select>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          ${n(this, s, m).call(this, e)}
          <div class="field grow">
            <label for="ds">Description</label>
            <input id="ds" .value=${e.description ?? ""}
              @input=${(t) => this._draft = { ...e, description: t.target.value }} />
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => {
    const t = await n(this, s, p).call(this, "Save", "POST", this._draft);
    t != null && t.success && (this._draft = null);
  }}>
            ${this._busy ? "Saving…" : e.id > 0 ? "Save changes" : "Create setting"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._draft = null}>Cancel</uui-button>
        </div>
      </uui-box>
    ` : u;
};
y = function() {
  const e = this._groupDraft;
  return e ? a`
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
    const t = await n(this, s, p).call(this, "SaveGroup", "POST", this._groupDraft);
    t != null && t.success && (this._groupDraft = null);
  }}>
            ${this._busy ? "Saving…" : e.id > 0 ? "Save changes" : "Create group"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._groupDraft = null}>Cancel</uui-button>
        </div>
      </uui-box>
    ` : u;
};
b = function(e) {
  const t = (e == null ? void 0 : e.id) ?? 0, i = this._settings.filter((l) => l.groupId === t);
  return !e && i.length === 0 ? u : a`
      <uui-box style="margin-top:16px;">
        <div slot="headline" class="group-head">
          <span>${(e == null ? void 0 : e.name) ?? "Ungrouped"}</span>
          ${e ? a`<span class="alias">${e.alias}</span>` : u}
        </div>

        ${e ? a`
              <div slot="header-actions">
                <uui-button look="secondary" compact label="Edit group"
                  @click=${() => this._groupDraft = { ...e }}>Edit</uui-button>
                <uui-button look="secondary" color="danger" compact label="Delete group"
                  ?disabled=${this._busy}
                  @click=${() => n(this, s, p).call(this, "DeleteGroup?id=" + e.id, "DELETE")}>Delete</uui-button>
              </div>` : u}

        ${e != null && e.description ? a`<p class="hint">${e.description}</p>` : u}

        ${i.length === 0 ? a`<p class="empty">No settings in this group.</p>` : a`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Key</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Value</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${i.map((l) => a`
                  <uui-table-row>
                    <uui-table-cell>
                      <span class="key">${l.key}</span>
                      ${l.description ? a`<div class="hint">${l.description}</div>` : u}
                    </uui-table-cell>
                    <uui-table-cell>${l.type}</uui-table-cell>
                    <uui-table-cell class="hint" style="max-width:280px;overflow-wrap:anywhere;">
                      ${l.value ?? a`<em>not set</em>`}
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;white-space:nowrap;">
                      <uui-button look="secondary" compact label="Edit"
                        @click=${() => this._draft = { ...l }}>Edit</uui-button>
                      <uui-button look="secondary" color="danger" compact label="Delete"
                        ?disabled=${this._busy}
                        @click=${() => confirm(`Delete "${l.key}"?`) && n(this, s, p).call(this, "Delete?id=" + l.id, "DELETE")}>Delete</uui-button>
                    </uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>`}
      </uui-box>
    `;
};
r.styles = x`
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
d([
  c()
], r.prototype, "_groups", 2);
d([
  c()
], r.prototype, "_settings", 2);
d([
  c()
], r.prototype, "_loading", 2);
d([
  c()
], r.prototype, "_busy", 2);
d([
  c()
], r.prototype, "_msg", 2);
d([
  c()
], r.prototype, "_draft", 2);
d([
  c()
], r.prototype, "_groupDraft", 2);
r = d([
  w("settings-dashboard")
], r);
const G = r;
export {
  r as SettingsDashboardElement,
  G as default
};
