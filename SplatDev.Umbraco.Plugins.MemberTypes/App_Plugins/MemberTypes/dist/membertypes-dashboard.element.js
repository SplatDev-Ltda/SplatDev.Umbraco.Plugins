import { LitElement as S, nothing as y, html as i, css as U, state as l, customElement as z } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as B } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as q } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as I } from "@umbraco-cms/backoffice/notification";
function R(e) {
  let t = null, a = null;
  const h = e.consumeContext.bind(e), u = new Promise((p) => {
    h(q, async (d) => {
      var b;
      try {
        t = await ((b = d == null ? void 0 : d.getLatestToken) == null ? void 0 : b.call(d)) ?? null;
      } catch {
        t = null;
      }
      p();
    }), setTimeout(p, 3e3);
  });
  return h(I, (p) => {
    a = p;
  }), async (p, d = {}) => {
    await u;
    const b = new Headers(d.headers);
    t && !b.has("Authorization") && b.set("Authorization", `Bearer ${t}`);
    const c = await fetch(p, { ...d, credentials: "same-origin", headers: b });
    if (!c.ok) {
      const $ = c.status === 401 || c.status === 403, P = $ ? "Not authorised" : "Could not load data", w = $ ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(p)} — ${w}`), a == null || a.peek("danger", { data: { headline: P, message: w } });
    }
    return c;
  };
}
var L = Object.defineProperty, j = Object.getOwnPropertyDescriptor, k = (e) => {
  throw TypeError(e);
}, n = (e, t, a, h) => {
  for (var u = h > 1 ? void 0 : h ? j(t, a) : t, p = e.length - 1, d; p >= 0; p--)
    (d = e[p]) && (u = (h ? d(t, a, u) : d(u)) || u);
  return h && u && L(t, a, u), u;
}, T = (e, t, a) => t.has(e) || k("Cannot " + a), _ = (e, t, a) => (T(e, t, "read from private field"), a ? a.call(e) : t.get(e)), x = (e, t, a) => t.has(e) ? k("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), r = (e, t, a) => (T(e, t, "access private method"), a), m, s, v, g, f, A, D, C, N, E, O, M;
let o = class extends B(S) {
  constructor() {
    super(...arguments), x(this, s), x(this, m, R(this)), this._memberTypes = [], this._loading = !1, this._busy = "", this._loadError = null, this._message = null, this._newAlias = "", this._newName = "", this._newDescription = "", this._editingAlias = null, this._editName = "", this._editDescription = "", this._expanded = null, this._detail = null, this._apiBase = "/umbraco/api/membertypes";
  }
  connectedCallback() {
    super.connectedCallback(), r(this, s, f).call(this);
  }
  render() {
    return i`
      <h1>Member Types</h1>
      <p class="description">
        The member types this site defines, the properties each one carries, and the
        controls to add, rename and remove them.
      </p>

      ${this._loadError ? i`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : y}
      ${this._message ? i`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : y}

      <uui-box headline="Member types (${this._memberTypes.length})">
        ${this._loading ? i`<uui-loader></uui-loader>` : this._memberTypes.length === 0 ? i`<p class="empty">No member types are defined yet. Add one below.</p>` : i`
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Alias</th><th>Description</th>
                      <th>Properties</th><th>Updated</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._memberTypes.map((e) => {
      const t = this._editingAlias === e.alias;
      return i`
                        <tr>
                          <td>
                            ${t ? i`<uui-input
                                  label="Name"
                                  .value=${this._editName}
                                  @input=${(a) => this._editName = a.target.value}
                                ></uui-input>` : i`<strong>${e.name}</strong>`}
                          </td>
                          <td><code>${e.alias}</code></td>
                          <td>
                            ${t ? i`<uui-input
                                  label="Description"
                                  .value=${this._editDescription}
                                  @input=${(a) => this._editDescription = a.target.value}
                                ></uui-input>` : i`<span class="muted">${e.description || "—"}</span>`}
                          </td>
                          <td class="num">
                            <uui-button
                              compact
                              look="secondary"
                              label="Show the properties on ${e.name}"
                              @click=${() => r(this, s, E).call(this, e)}
                              >${e.propertyCount} ${this._expanded === e.alias ? "▾" : "▸"}</uui-button
                            >
                          </td>
                          <td class="num muted">${r(this, s, O).call(this, e.updateDate)}</td>
                          <td class="right">
                            ${t ? i`
                                  <uui-button
                                    compact
                                    look="primary"
                                    color="positive"
                                    label="Save ${e.name}"
                                    ?disabled=${this._busy === `edit:${e.alias}`}
                                    @click=${r(this, s, C)}
                                    >Save</uui-button
                                  >
                                  <uui-button compact look="secondary" label="Cancel"
                                    @click=${() => this._editingAlias = null}>Cancel</uui-button>
                                ` : i`
                                  <uui-button compact look="secondary" label="Rename ${e.name}"
                                    @click=${() => r(this, s, D).call(this, e)}>Rename</uui-button>
                                  <uui-button
                                    compact
                                    look="secondary"
                                    color="danger"
                                    label="Delete ${e.name}"
                                    ?disabled=${this._busy === `delete:${e.alias}`}
                                    @click=${() => r(this, s, N).call(this, e)}
                                    >Delete</uui-button
                                  >
                                `}
                          </td>
                        </tr>
                        ${this._expanded === e.alias ? i`<tr><td colspan="6">${r(this, s, M).call(this)}</td></tr>` : y}
                      `;
    })}
                  </tbody>
                </table>
              `}
      </uui-box>

      <uui-box headline="Add a member type">
        <div class="grid">
          <div>
            <span class="field-label">Alias</span>
            <uui-input
              label="Alias"
              placeholder="e.g. premiumMember"
              .value=${this._newAlias}
              @input=${(e) => this._newAlias = e.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Name</span>
            <uui-input
              label="Name"
              placeholder="e.g. Premium Member"
              .value=${this._newName}
              @input=${(e) => this._newName = e.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Description</span>
            <uui-input
              label="Description"
              placeholder="Optional"
              .value=${this._newDescription}
              @input=${(e) => this._newDescription = e.target.value}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          The alias is what templates and code refer to, and it cannot be changed later —
          the name and description can. Use letters and numbers, no spaces.
        </p>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Add member type"
            ?disabled=${this._busy === "create"}
            @click=${r(this, s, A)}
            >${this._busy === "create" ? "Adding…" : "Add member type"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
v = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
g = async function(e, t) {
  try {
    const a = await e.text();
    return a ? `${t} ${a.slice(0, 300)}` : t;
  } catch {
    return t;
  }
};
f = async function() {
  this._loading = !0;
  try {
    const e = await _(this, m).call(this, `${this._apiBase}/GetAll`);
    r(this, s, v).call(this, e) && (this._memberTypes = await e.json());
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._memberTypes = [];
  } finally {
    this._loading = !1;
  }
};
A = async function() {
  const e = this._newAlias.trim(), t = this._newName.trim();
  if (!e || !t) {
    this._message = { ok: !1, text: "A member type needs both an alias and a name." };
    return;
  }
  this._busy = "create";
  try {
    const a = await _(this, m).call(this, `${this._apiBase}/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias: e, name: t, description: this._newDescription.trim() })
    });
    a.ok ? (this._message = { ok: !0, text: `Created ${t}.` }, this._newAlias = this._newName = this._newDescription = "", await r(this, s, f).call(this)) : this._message = { ok: !1, text: await r(this, s, g).call(this, a, "Could not create that member type.") };
  } catch {
    this._message = { ok: !1, text: "Could not create that member type." };
  } finally {
    this._busy = "";
  }
};
D = function(e) {
  this._editingAlias = e.alias, this._editName = e.name, this._editDescription = e.description ?? "", this._message = null;
};
C = async function() {
  const e = this._editingAlias;
  if (!e) return;
  const t = this._editName.trim();
  if (!t) {
    this._message = { ok: !1, text: "A member type needs a name." };
    return;
  }
  this._busy = `edit:${e}`;
  try {
    const a = await _(this, m).call(this, `${this._apiBase}/Update?alias=${encodeURIComponent(e)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: t, description: this._editDescription.trim() })
    });
    a.ok ? (this._message = { ok: !0, text: `Updated ${t}.` }, this._editingAlias = null, await r(this, s, f).call(this)) : this._message = { ok: !1, text: await r(this, s, g).call(this, a, "Could not update that member type.") };
  } catch {
    this._message = { ok: !1, text: "Could not update that member type." };
  } finally {
    this._busy = "";
  }
};
N = async function(e) {
  if (window.confirm(
    `Delete the member type "${e.name}"?

Any members of this type, and the values held in its ${e.propertyCount} propert${e.propertyCount === 1 ? "y" : "ies"}, go with it. This cannot be undone.`
  )) {
    this._busy = `delete:${e.alias}`;
    try {
      const a = await _(this, m).call(this, `${this._apiBase}/Delete?alias=${encodeURIComponent(e.alias)}`, {
        method: "DELETE"
      });
      a.ok ? (this._message = { ok: !0, text: `Deleted ${e.name}.` }, this._expanded === e.alias && (this._expanded = null), await r(this, s, f).call(this)) : this._message = { ok: !1, text: await r(this, s, g).call(this, a, "Could not delete that member type.") };
    } catch {
      this._message = { ok: !1, text: "Could not delete that member type." };
    } finally {
      this._busy = "";
    }
  }
};
E = async function(e) {
  if (this._expanded === e.alias) {
    this._expanded = null;
    return;
  }
  this._expanded = e.alias, this._detail = null;
  try {
    const t = await _(this, m).call(this, `${this._apiBase}/GetByAlias?alias=${encodeURIComponent(e.alias)}`);
    r(this, s, v).call(this, t) && (this._detail = await t.json());
  } catch {
    this._loadError ?? (this._loadError = "Could not load the properties for that member type.");
  }
};
O = function(e) {
  if (!e) return "—";
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString();
};
M = function() {
  return this._detail ? this._detail.properties.length === 0 ? i`<div class="props muted">This member type has no properties of its own.</div>` : i`
      <div class="props">
        <table>
          <thead>
            <tr><th>Property</th><th>Alias</th><th>Required</th><th>Description</th></tr>
          </thead>
          <tbody>
            ${this._detail.properties.map(
    (e) => i`
                <tr>
                  <td>${e.name}</td>
                  <td><code>${e.alias}</code></td>
                  <td>${e.mandatory ? i`<span class="tag req">required</span>` : i`<span class="muted">optional</span>`}</td>
                  <td class="muted">${e.description || "—"}</td>
                </tr>
              `
  )}
          </tbody>
        </table>
      </div>
    ` : i`<div class="props muted">Loading properties…</div>`;
};
o.styles = U`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 66ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    uui-input { width: 100%; }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 8px 0 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    td.right { text-align: right; white-space: nowrap; }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px;
    }
    .muted { color: var(--uui-color-text-alt, #6b7280); }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .props { margin: 6px 0 0; padding: 10px 12px; background: var(--uui-color-surface-alt, #f9fafb); border-radius: 4px; }
    .props table { font-size: 0.85rem; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.req { background: #fee2e2; color: #991b1b; }

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
n([
  l()
], o.prototype, "_memberTypes", 2);
n([
  l()
], o.prototype, "_loading", 2);
n([
  l()
], o.prototype, "_busy", 2);
n([
  l()
], o.prototype, "_loadError", 2);
n([
  l()
], o.prototype, "_message", 2);
n([
  l()
], o.prototype, "_newAlias", 2);
n([
  l()
], o.prototype, "_newName", 2);
n([
  l()
], o.prototype, "_newDescription", 2);
n([
  l()
], o.prototype, "_editingAlias", 2);
n([
  l()
], o.prototype, "_editName", 2);
n([
  l()
], o.prototype, "_editDescription", 2);
n([
  l()
], o.prototype, "_expanded", 2);
n([
  l()
], o.prototype, "_detail", 2);
o = n([
  z("membertypes-dashboard")
], o);
const J = o;
export {
  o as MemberTypesDashboardElement,
  J as default
};
