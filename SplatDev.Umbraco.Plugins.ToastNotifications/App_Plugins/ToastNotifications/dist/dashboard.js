import { LitElement as A, html as r, nothing as _, css as C, state as p, customElement as I } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as z } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as P } from "@umbraco-cms/backoffice/auth";
function N(t) {
  let e = null;
  const l = new Promise((o) => {
    t.consumeContext(P, async (s) => {
      var n;
      try {
        e = await ((n = s == null ? void 0 : s.getLatestToken) == null ? void 0 : n.call(s)) ?? null;
      } catch {
        e = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, s = {}) => {
    await l;
    const n = new Headers(s.headers);
    e && !n.has("Authorization") && n.set("Authorization", `Bearer ${e}`);
    const u = await fetch(o, { ...s, credentials: "same-origin", headers: n });
    return (u.status === 401 || u.status === 403) && console.error(
      `[SplatDev] ${u.status} from ${String(o)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), u;
  };
}
var O = Object.defineProperty, M = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, h = (t, e, l, o) => {
  for (var s = o > 1 ? void 0 : o ? M(e, l) : e, n = t.length - 1, u; n >= 0; n--)
    (u = t[n]) && (s = (o ? u(e, l, s) : u(s)) || s);
  return o && s && O(e, l, s), s;
}, w = (t, e, l) => e.has(t) || $("Cannot " + l), y = (t, e, l) => (w(t, e, "read from private field"), l ? l.call(t) : e.get(t)), v = (t, e, l) => e.has(t) ? $("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, l), a = (t, e, l) => (w(t, e, "access private method"), l), f, i, b, x, c, D, g, k, T, m, E;
const S = {
  title: "",
  body: "",
  type: "info",
  isActive: !0,
  startDate: null,
  endDate: null
};
let d = class extends z(A) {
  constructor() {
    super(...arguments), v(this, i), v(this, f, N(this)), this._toasts = [], this._loading = !0, this._busy = !1, this._editingId = null, this._draft = { ...S }, this._msg = null, this._api = "/umbraco/api/toastnotifications";
  }
  connectedCallback() {
    super.connectedCallback(), a(this, i, b).call(this);
  }
  render() {
    return r`
      <h1>Toast notifications</h1>
      <p class="description">
        Short messages shown to editors in the backoffice. A toast can be scheduled with a
        start and end time, or left open-ended to show until you disable it.
      </p>

      ${a(this, i, E).call(this)}

      <uui-box headline="All toasts" style="margin-top:16px;">
        ${this._loading ? r`<uui-loader></uui-loader>` : this._toasts.length === 0 ? r`<p class="empty">No toasts yet.</p>` : r`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Title</uui-table-head-cell>
                    <uui-table-head-cell>Type</uui-table-head-cell>
                    <uui-table-head-cell>State</uui-table-head-cell>
                    <uui-table-head-cell>Window</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._toasts.map((t) => {
      const e = a(this, i, x).call(this, t);
      return r`
                      <uui-table-row>
                        <uui-table-cell>
                          <strong>${t.title}</strong>
                          ${t.body ? r`<div class="body-cell">${t.body}</div>` : _}
                        </uui-table-cell>
                        <uui-table-cell>${t.type}</uui-table-cell>
                        <uui-table-cell>
                          <uui-tag look=${e.look}>${e.label}</uui-tag>
                        </uui-table-cell>
                        <uui-table-cell class="body-cell">
                          ${t.startDate || t.endDate ? r`${t.startDate ? new Date(t.startDate).toLocaleString() : "any time"}
                                   &rarr;
                                   ${t.endDate ? new Date(t.endDate).toLocaleString() : "no end"}` : "always"}
                        </uui-table-cell>
                        <uui-table-cell style="text-align:right;white-space:nowrap;">
                          <uui-button look="secondary" compact label="Edit"
                            @click=${() => a(this, i, D).call(this, t)}>Edit</uui-button>
                          <uui-button look="secondary" color="danger" compact label="Delete"
                            ?disabled=${this._busy}
                            @click=${() => a(this, i, T).call(this, t)}>Delete</uui-button>
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
f = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
b = async function() {
  this._loading = !0;
  try {
    const t = await y(this, f).call(this, `${this._api}/GetAll`, { credentials: "same-origin" });
    t.ok && (this._toasts = await t.json());
  } finally {
    this._loading = !1;
  }
};
x = function(t) {
  const e = Date.now();
  return t.isActive ? t.startDate && Date.parse(t.startDate) > e ? { label: "Scheduled", look: "warning" } : t.endDate && Date.parse(t.endDate) < e ? { label: "Expired", look: "danger" } : { label: "Showing", look: "positive" } : { label: "Disabled", look: "secondary" };
};
c = function(t, e) {
  this._draft = { ...this._draft, [t]: e };
};
D = function(t) {
  this._editingId = t.id, this._draft = {
    title: t.title,
    body: t.body,
    type: t.type,
    isActive: t.isActive,
    startDate: t.startDate,
    endDate: t.endDate
  }, this._msg = null, this.scrollIntoView({ behavior: "smooth", block: "start" });
};
g = function() {
  this._editingId = null, this._draft = { ...S }, this._msg = null;
};
k = async function() {
  if (!this._draft.title.trim()) {
    this._msg = { ok: !1, text: "Give the toast a title." };
    return;
  }
  this._busy = !0, this._msg = null;
  try {
    const t = this._editingId !== null, e = t ? `${this._api}/Update?id=${this._editingId}` : `${this._api}/Create`, l = await y(this, f).call(this, e, {
      method: t ? "PUT" : "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this._draft)
    });
    if (!l.ok) throw new Error(`${l.status}`);
    this._msg = { ok: !0, text: t ? "Toast updated." : "Toast created." }, a(this, i, g).call(this), await a(this, i, b).call(this);
  } catch (t) {
    this._msg = { ok: !1, text: `Could not save the toast (${t.message}).` };
  } finally {
    this._busy = !1;
  }
};
T = async function(t) {
  if (confirm(`Delete "${t.title}"?`)) {
    this._busy = !0, this._msg = null;
    try {
      const e = await y(this, f).call(this, `${this._api}/Delete?id=${t.id}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      if (!e.ok) throw new Error(`${e.status}`);
      this._msg = { ok: !0, text: `"${t.title}" deleted.` }, this._editingId === t.id && a(this, i, g).call(this), await a(this, i, b).call(this);
    } catch (e) {
      this._msg = { ok: !1, text: `Could not delete (${e.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
m = function(t) {
  return t ? t.slice(0, 16) : "";
};
E = function() {
  const t = this._editingId !== null;
  return r`
      <uui-box headline=${t ? "Edit toast" : "New toast"}>
        <div class="grid">
          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-title">Title</label>
            <input id="t-title" .value=${this._draft.title}
              @input=${(e) => a(this, i, c).call(this, "title", e.target.value)} />
          </div>

          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-body">Message</label>
            <textarea id="t-body" .value=${this._draft.body}
              @input=${(e) => a(this, i, c).call(this, "body", e.target.value)}></textarea>
          </div>

          <div class="field">
            <label for="t-type">Type</label>
            <select id="t-type" .value=${this._draft.type}
              @change=${(e) => a(this, i, c).call(this, "type", e.target.value)}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div class="field">
            <label for="t-start">Show from <span style="font-weight:400;">(optional)</span></label>
            <input id="t-start" type="datetime-local" .value=${a(this, i, m).call(this, this._draft.startDate)}
              @input=${(e) => a(this, i, c).call(this, "startDate", e.target.value || null)} />
          </div>

          <div class="field">
            <label for="t-end">Show until <span style="font-weight:400;">(optional)</span></label>
            <input id="t-end" type="datetime-local" .value=${a(this, i, m).call(this, this._draft.endDate)}
              @input=${(e) => a(this, i, c).call(this, "endDate", e.target.value || null)} />
          </div>

          <div class="field">
            <label>Enabled</label>
            <uui-toggle
              ?checked=${this._draft.isActive}
              @change=${(e) => a(this, i, c).call(this, "isActive", e.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy} @click=${a(this, i, k)}>
            ${this._busy ? "Saving…" : t ? "Save changes" : "Create toast"}
          </uui-button>
          ${t ? r`<uui-button look="secondary" @click=${a(this, i, g)}>Cancel</uui-button>` : _}
        </div>

        ${this._msg ? r`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>` : _}
      </uui-box>
    `;
};
d.styles = C`
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
h([
  p()
], d.prototype, "_toasts", 2);
h([
  p()
], d.prototype, "_loading", 2);
h([
  p()
], d.prototype, "_busy", 2);
h([
  p()
], d.prototype, "_editingId", 2);
h([
  p()
], d.prototype, "_draft", 2);
h([
  p()
], d.prototype, "_msg", 2);
d = h([
  I("toastnotifications-dashboard")
], d);
const G = d;
export {
  d as ToastNotificationsDashboardElement,
  G as default
};
