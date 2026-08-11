import { LitElement as E, nothing as m, html as r, css as N, state as c, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
import { W, s as P } from "./chunks/shared-styles-DntHce3s.js";
import { c as M, a as O, f as _ } from "./chunks/types-BWOc9hyT.js";
var R = Object.defineProperty, T = Object.getOwnPropertyDescriptor, b = (a) => {
  throw TypeError(a);
}, l = (a, i, t, d) => {
  for (var n = d > 1 ? void 0 : d ? T(i, t) : i, f = a.length - 1, v; f >= 0; f--)
    (v = a[f]) && (n = (d ? v(i, t, n) : v(n)) || n);
  return d && n && R(i, t, n), n;
}, y = (a, i, t) => i.has(a) || b("Cannot " + t), g = (a, i, t) => (y(a, i, "read from private field"), t ? t.call(a) : i.get(a)), w = (a, i, t) => i.has(a) ? b("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(a) : i.set(a, t), s = (a, i, t) => (y(a, i, "access private method"), t), p, e, h, x, $, I, k, u, z, C;
let o = class extends A(E) {
  constructor() {
    super(...arguments), w(this, e), w(this, p, new W(this)), this._contacts = [], this._loading = !0, this._saving = !1, this._search = "", this._error = null, this._draft = null, this._editingId = null;
  }
  connectedCallback() {
    super.connectedCallback(), s(this, e, h).call(this);
  }
  render() {
    return r`
      <div class="page">
        <h2>Contacts</h2>
        <p class="hint">
          Names your team gives WhatsApp numbers. These are used across the inbox in place of
          the WhatsApp profile name, which is often missing and can change without warning.
        </p>

        <div class="toolbar">
          <uui-input
            label="Search contacts"
            placeholder="Search name, company, email or number…"
            .value=${this._search}
            @input=${(a) => {
      this._search = a.target.value;
    }}
            @change=${() => void s(this, e, h).call(this)}
          ></uui-input>
          <uui-button look="secondary" label="Search" @click=${() => void s(this, e, h).call(this)}></uui-button>
          <uui-button
            look="primary"
            color="positive"
            label="Add contact"
            @click=${() => s(this, e, x).call(this)}
          ></uui-button>
        </div>

        ${this._error ? r`<div class="error">${this._error}</div>` : m}
        ${s(this, e, z).call(this)}

        ${this._loading ? r`<uui-loader></uui-loader>` : this._contacts.length === 0 ? r`
                <div class="empty">
                  ${this._search ? "No contacts match that search." : "No contacts yet. Add one, or name a conversation from the Inbox."}
                </div>
              ` : r`<div class="list">${this._contacts.map((a) => s(this, e, C).call(this, a))}</div>`}
      </div>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
e = /* @__PURE__ */ new WeakSet();
h = async function() {
  this._loading = !0, this._error = null;
  try {
    this._contacts = await g(this, p).getContacts(this._search);
  } catch (a) {
    this._error = a instanceof Error ? a.message : String(a);
  } finally {
    this._loading = !1;
  }
};
x = function() {
  this._editingId = null, this._draft = { waId: "", displayName: "", company: "", email: "", notes: "" };
};
$ = function(a) {
  this._editingId = a.id, this._draft = {
    waId: a.waId,
    displayName: a.displayName ?? "",
    company: a.company ?? "",
    email: a.email ?? "",
    notes: a.notes ?? ""
  };
};
I = async function() {
  var a, i;
  if (!((i = (a = this._draft) == null ? void 0 : a.waId) != null && i.trim())) {
    this._error = "A WhatsApp number is required.";
    return;
  }
  this._saving = !0, this._error = null;
  try {
    await g(this, p).saveContact(this._draft), this._draft = null, this._editingId = null, await s(this, e, h).call(this);
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._saving = !1;
  }
};
k = async function(a) {
  const i = a.displayName || _(a.waId);
  if (confirm(`Remove the contact "${i}"?

The conversation and its messages are kept.`))
    try {
      await g(this, p).deleteContact(a.id), await s(this, e, h).call(this);
    } catch (t) {
      this._error = t instanceof Error ? t.message : String(t);
    }
};
u = function(a, i, t = "") {
  var d;
  return r`
      <div>
        <label>${a}</label>
        <uui-input
          .value=${((d = this._draft) == null ? void 0 : d[i]) ?? ""}
          placeholder=${t}
          @input=${(n) => {
    this._draft && (this._draft = {
      ...this._draft,
      [i]: n.target.value
    });
  }}
        ></uui-input>
      </div>
    `;
};
z = function() {
  return this._draft ? r`
      <div class="form">
        <strong>${this._editingId ? "Edit contact" : "New contact"}</strong>

        <div class="grid2">
          ${s(this, e, u).call(this, "WhatsApp number", "waId", "+55 15 99142-4586")}
          ${s(this, e, u).call(this, "Name", "displayName", "Maria Silva")}
          ${s(this, e, u).call(this, "Company", "company")}
          ${s(this, e, u).call(this, "Email", "email", "maria@example.com")}
        </div>

        <div>
          <label>Notes</label>
          <uui-textarea
            .value=${this._draft.notes ?? ""}
            rows="3"
            @input=${(a) => {
    this._draft && (this._draft = {
      ...this._draft,
      notes: a.target.value
    });
  }}
          ></uui-textarea>
        </div>

        <div class="form-actions">
          <uui-button
            label="Cancel"
            @click=${() => {
    this._draft = null, this._editingId = null;
  }}
          ></uui-button>
          <uui-button
            look="primary"
            color="positive"
            label=${this._saving ? "Saving…" : "Save contact"}
            ?disabled=${this._saving}
            @click=${() => void s(this, e, I).call(this)}
          ></uui-button>
        </div>
      </div>
    ` : m;
};
C = function(a) {
  const i = M(a.waId);
  return r`
      <div class="row">
        <span class="avatar" style="background: hsl(${i} 45% 45%)" aria-hidden="true">
          ${O(null, a.waId, a.displayName)}
        </span>
        <span class="who">
          <span class="name">${a.displayName || _(a.waId)}</span>
          <span class="sub">
            ${_(a.waId)}${a.company ? r` · ${a.company}` : m}
            ${a.email ? r` · ${a.email}` : m}
          </span>
        </span>
        <span class="actions">
          <uui-button
            look="secondary"
            label="Edit"
            @click=${() => s(this, e, $).call(this, a)}
          ></uui-button>
          <uui-button
            look="secondary"
            color="danger"
            label="Remove"
            @click=${() => void s(this, e, k).call(this, a)}
          ></uui-button>
        </span>
      </div>
    `;
};
o.styles = [
  P,
  N`
      .toolbar {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: var(--uui-size-space-4, 12px);
      }

      .toolbar uui-input {
        flex: 1;
        min-width: 220px;
      }

      .list {
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        overflow: hidden;
      }

      .row {
        display: flex;
        gap: var(--uui-size-space-4, 12px);
        align-items: center;
        padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
        border-bottom: 1px solid var(--wa-hairline);
      }

      .row:last-child {
        border-bottom: none;
      }

      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.74rem;
        font-weight: 700;
        color: #fff;
        flex: 0 0 auto;
        user-select: none;
      }

      .who {
        flex: 1;
        min-width: 0;
      }

      .who .name {
        font-weight: 600;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .who .sub {
        font-size: 0.78rem;
        opacity: 0.72;
        font-variant-numeric: tabular-nums;
      }

      .actions {
        display: flex;
        gap: var(--uui-size-space-2, 6px);
        flex: 0 0 auto;
      }

      .form {
        display: grid;
        gap: var(--uui-size-space-3, 8px);
        padding: var(--uui-size-space-4, 12px);
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        margin-bottom: var(--uui-size-space-4, 12px);
      }

      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--uui-size-space-3, 8px);
      }

      @media (max-width: 720px) {
        .grid2 {
          grid-template-columns: 1fr;
        }
      }

      label {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        margin-bottom: 3px;
        opacity: 0.85;
      }

      .form-actions {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        justify-content: flex-end;
      }
    `
];
l([
  c()
], o.prototype, "_contacts", 2);
l([
  c()
], o.prototype, "_loading", 2);
l([
  c()
], o.prototype, "_saving", 2);
l([
  c()
], o.prototype, "_search", 2);
l([
  c()
], o.prototype, "_error", 2);
l([
  c()
], o.prototype, "_draft", 2);
l([
  c()
], o.prototype, "_editingId", 2);
o = l([
  S("wa-contacts")
], o);
export {
  o as WaContactsElement
};
//# sourceMappingURL=wa-contacts.element.js.map
