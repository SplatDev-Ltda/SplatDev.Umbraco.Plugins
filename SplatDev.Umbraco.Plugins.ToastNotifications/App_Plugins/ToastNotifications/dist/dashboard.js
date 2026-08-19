import { LitElement as k, html as s, nothing as g, css as E, state as u, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as S } from "@umbraco-cms/backoffice/element-api";
var C = Object.defineProperty, I = Object.getOwnPropertyDescriptor, y = (t) => {
  throw TypeError(t);
}, d = (t, e, l, c) => {
  for (var n = c > 1 ? void 0 : c ? I(e, l) : e, b = t.length - 1, f; b >= 0; b--)
    (f = t[b]) && (n = (c ? f(e, l, n) : f(n)) || n);
  return c && n && C(e, l, n), n;
}, A = (t, e, l) => e.has(t) || y("Cannot " + l), P = (t, e, l) => e.has(t) ? y("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, l), a = (t, e, l) => (A(t, e, "access private method"), l), i, h, m, r, v, p, $, x, _, w;
const D = {
  title: "",
  body: "",
  type: "info",
  isActive: !0,
  startDate: null,
  endDate: null
};
let o = class extends S(k) {
  constructor() {
    super(...arguments), P(this, i), this._toasts = [], this._loading = !0, this._busy = !1, this._editingId = null, this._draft = { ...D }, this._msg = null, this._api = "/umbraco/api/toastnotifications";
  }
  connectedCallback() {
    super.connectedCallback(), a(this, i, h).call(this);
  }
  render() {
    return s`
      <h1>Toast notifications</h1>
      <p class="description">
        Short messages shown to editors in the backoffice. A toast can be scheduled with a
        start and end time, or left open-ended to show until you disable it.
      </p>

      ${a(this, i, w).call(this)}

      <uui-box headline="All toasts" style="margin-top:16px;">
        ${this._loading ? s`<uui-loader></uui-loader>` : this._toasts.length === 0 ? s`<p class="empty">No toasts yet.</p>` : s`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Title</uui-table-head-cell>
                    <uui-table-head-cell>Type</uui-table-head-cell>
                    <uui-table-head-cell>State</uui-table-head-cell>
                    <uui-table-head-cell>Window</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._toasts.map((t) => {
      const e = a(this, i, m).call(this, t);
      return s`
                      <uui-table-row>
                        <uui-table-cell>
                          <strong>${t.title}</strong>
                          ${t.body ? s`<div class="body-cell">${t.body}</div>` : g}
                        </uui-table-cell>
                        <uui-table-cell>${t.type}</uui-table-cell>
                        <uui-table-cell>
                          <uui-tag look=${e.look}>${e.label}</uui-tag>
                        </uui-table-cell>
                        <uui-table-cell class="body-cell">
                          ${t.startDate || t.endDate ? s`${t.startDate ? new Date(t.startDate).toLocaleString() : "any time"}
                                   &rarr;
                                   ${t.endDate ? new Date(t.endDate).toLocaleString() : "no end"}` : "always"}
                        </uui-table-cell>
                        <uui-table-cell style="text-align:right;white-space:nowrap;">
                          <uui-button look="secondary" compact label="Edit"
                            @click=${() => a(this, i, v).call(this, t)}>Edit</uui-button>
                          <uui-button look="secondary" color="danger" compact label="Delete"
                            ?disabled=${this._busy}
                            @click=${() => a(this, i, x).call(this, t)}>Delete</uui-button>
                        </uui-table-cell>
                      </uui-table-row>
                    `;
    })}
                </uui-table>
              `}
      </uui-box>
    `;
  }
};
i = /* @__PURE__ */ new WeakSet();
h = async function() {
  this._loading = !0;
  try {
    const t = await fetch(`${this._api}/GetAll`, { credentials: "same-origin" });
    t.ok && (this._toasts = await t.json());
  } finally {
    this._loading = !1;
  }
};
m = function(t) {
  const e = Date.now();
  return t.isActive ? t.startDate && Date.parse(t.startDate) > e ? { label: "Scheduled", look: "warning" } : t.endDate && Date.parse(t.endDate) < e ? { label: "Expired", look: "danger" } : { label: "Showing", look: "positive" } : { label: "Disabled", look: "secondary" };
};
r = function(t, e) {
  this._draft = { ...this._draft, [t]: e };
};
v = function(t) {
  this._editingId = t.id, this._draft = {
    title: t.title,
    body: t.body,
    type: t.type,
    isActive: t.isActive,
    startDate: t.startDate,
    endDate: t.endDate
  }, this._msg = null, this.scrollIntoView({ behavior: "smooth", block: "start" });
};
p = function() {
  this._editingId = null, this._draft = { ...D }, this._msg = null;
};
$ = async function() {
  if (!this._draft.title.trim()) {
    this._msg = { ok: !1, text: "Give the toast a title." };
    return;
  }
  this._busy = !0, this._msg = null;
  try {
    const t = this._editingId !== null, e = t ? `${this._api}/Update?id=${this._editingId}` : `${this._api}/Create`, l = await fetch(e, {
      method: t ? "PUT" : "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this._draft)
    });
    if (!l.ok) throw new Error(`${l.status}`);
    this._msg = { ok: !0, text: t ? "Toast updated." : "Toast created." }, a(this, i, p).call(this), await a(this, i, h).call(this);
  } catch (t) {
    this._msg = { ok: !1, text: `Could not save the toast (${t.message}).` };
  } finally {
    this._busy = !1;
  }
};
x = async function(t) {
  if (confirm(`Delete "${t.title}"?`)) {
    this._busy = !0, this._msg = null;
    try {
      const e = await fetch(`${this._api}/Delete?id=${t.id}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      if (!e.ok) throw new Error(`${e.status}`);
      this._msg = { ok: !0, text: `"${t.title}" deleted.` }, this._editingId === t.id && a(this, i, p).call(this), await a(this, i, h).call(this);
    } catch (e) {
      this._msg = { ok: !1, text: `Could not delete (${e.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
_ = function(t) {
  return t ? t.slice(0, 16) : "";
};
w = function() {
  const t = this._editingId !== null;
  return s`
      <uui-box headline=${t ? "Edit toast" : "New toast"}>
        <div class="grid">
          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-title">Title</label>
            <input id="t-title" .value=${this._draft.title}
              @input=${(e) => a(this, i, r).call(this, "title", e.target.value)} />
          </div>

          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-body">Message</label>
            <textarea id="t-body" .value=${this._draft.body}
              @input=${(e) => a(this, i, r).call(this, "body", e.target.value)}></textarea>
          </div>

          <div class="field">
            <label for="t-type">Type</label>
            <select id="t-type" .value=${this._draft.type}
              @change=${(e) => a(this, i, r).call(this, "type", e.target.value)}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div class="field">
            <label for="t-start">Show from <span style="font-weight:400;">(optional)</span></label>
            <input id="t-start" type="datetime-local" .value=${a(this, i, _).call(this, this._draft.startDate)}
              @input=${(e) => a(this, i, r).call(this, "startDate", e.target.value || null)} />
          </div>

          <div class="field">
            <label for="t-end">Show until <span style="font-weight:400;">(optional)</span></label>
            <input id="t-end" type="datetime-local" .value=${a(this, i, _).call(this, this._draft.endDate)}
              @input=${(e) => a(this, i, r).call(this, "endDate", e.target.value || null)} />
          </div>

          <div class="field">
            <label>Enabled</label>
            <uui-toggle
              ?checked=${this._draft.isActive}
              @change=${(e) => a(this, i, r).call(this, "isActive", e.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy} @click=${a(this, i, $)}>
            ${this._busy ? "Saving…" : t ? "Save changes" : "Create toast"}
          </uui-button>
          ${t ? s`<uui-button look="secondary" @click=${a(this, i, p)}>Cancel</uui-button>` : g}
        </div>

        ${this._msg ? s`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>` : g}
      </uui-box>
    `;
};
o.styles = E`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .field label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px; font: inherit; box-sizing: border-box;
    }
    .field textarea { min-height: 72px; resize: vertical; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 14px; flex-wrap: wrap; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 16px 0; }
    .body-cell { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    uui-table { width: 100%; }
  `;
d([
  u()
], o.prototype, "_toasts", 2);
d([
  u()
], o.prototype, "_loading", 2);
d([
  u()
], o.prototype, "_busy", 2);
d([
  u()
], o.prototype, "_editingId", 2);
d([
  u()
], o.prototype, "_draft", 2);
d([
  u()
], o.prototype, "_msg", 2);
o = d([
  T("toastnotifications-dashboard")
], o);
const O = o;
export {
  o as ToastNotificationsDashboardElement,
  O as default
};
