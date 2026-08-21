import { LitElement as z, html as n, nothing as y, css as P, state as b, customElement as M } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as U } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as L } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as W } from "@umbraco-cms/backoffice/notification";
function B(t) {
  let e = null, a = null;
  const u = t.consumeContext.bind(t), d = new Promise((o) => {
    u(L, async (l) => {
      var f;
      try {
        e = await ((f = l == null ? void 0 : l.getLatestToken) == null ? void 0 : f.call(l)) ?? null;
      } catch {
        e = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return u(W, (o) => {
    a = o;
  }), async (o, l = {}) => {
    await d;
    const f = new Headers(l.headers);
    e && !f.has("Authorization") && f.set("Authorization", `Bearer ${e}`);
    const c = await fetch(o, { ...l, credentials: "same-origin", headers: f });
    if (!c.ok) {
      const $ = c.status === 401 || c.status === 403, O = $ ? "Not authorised" : "Could not load data", x = $ ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(o)} — ${x}`), a == null || a.peek("danger", { data: { headline: O, message: x } });
    }
    return c;
  };
}
var F = Object.defineProperty, G = Object.getOwnPropertyDescriptor, D = (t) => {
  throw TypeError(t);
}, p = (t, e, a, u) => {
  for (var d = u > 1 ? void 0 : u ? G(e, a) : e, o = t.length - 1, l; o >= 0; o--)
    (l = t[o]) && (d = (u ? l(e, a, d) : l(d)) || d);
  return u && d && F(e, a, d), d;
}, T = (t, e, a) => e.has(t) || D("Cannot " + a), w = (t, e, a) => (T(t, e, "read from private field"), a ? a.call(t) : e.get(t)), k = (t, e, a) => e.has(t) ? D("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), s = (t, e, a) => (T(t, e, "access private method"), a), g, i, _, E, h, A, m, C, S, v, I;
const N = {
  title: "",
  body: "",
  type: "info",
  isActive: !0,
  startDate: null,
  endDate: null
};
let r = class extends U(z) {
  constructor() {
    super(...arguments), k(this, i), k(this, g, B(this)), this._toasts = [], this._loading = !0, this._busy = !1, this._editingId = null, this._draft = { ...N }, this._msg = null, this._api = "/umbraco/api/toastnotifications";
  }
  connectedCallback() {
    super.connectedCallback(), s(this, i, _).call(this);
  }
  render() {
    return n`
      <h1>Toast notifications</h1>
      <p class="description">
        Short messages shown to editors in the backoffice. A toast can be scheduled with a
        start and end time, or left open-ended to show until you disable it.
      </p>

      ${s(this, i, I).call(this)}

      <uui-box headline="All toasts" style="margin-top:16px;">
        ${this._loading ? n`<uui-loader></uui-loader>` : this._toasts.length === 0 ? n`<p class="empty">No toasts yet.</p>` : n`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Title</uui-table-head-cell>
                    <uui-table-head-cell>Type</uui-table-head-cell>
                    <uui-table-head-cell>State</uui-table-head-cell>
                    <uui-table-head-cell>Window</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._toasts.map((t) => {
      const e = s(this, i, E).call(this, t);
      return n`
                      <uui-table-row>
                        <uui-table-cell>
                          <strong>${t.title}</strong>
                          ${t.body ? n`<div class="body-cell">${t.body}</div>` : y}
                        </uui-table-cell>
                        <uui-table-cell>${t.type}</uui-table-cell>
                        <uui-table-cell>
                          <uui-tag look=${e.look}>${e.label}</uui-tag>
                        </uui-table-cell>
                        <uui-table-cell class="body-cell">
                          ${t.startDate || t.endDate ? n`${t.startDate ? new Date(t.startDate).toLocaleString() : "any time"}
                                   &rarr;
                                   ${t.endDate ? new Date(t.endDate).toLocaleString() : "no end"}` : "always"}
                        </uui-table-cell>
                        <uui-table-cell style="text-align:right;white-space:nowrap;">
                          <uui-button look="secondary" compact label="Edit"
                            @click=${() => s(this, i, A).call(this, t)}>Edit</uui-button>
                          <uui-button look="secondary" color="danger" compact label="Delete"
                            ?disabled=${this._busy}
                            @click=${() => s(this, i, S).call(this, t)}>Delete</uui-button>
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
g = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
_ = async function() {
  this._loading = !0;
  try {
    const t = await w(this, g).call(this, `${this._api}/GetAll`, { credentials: "same-origin" });
    t.ok && (this._toasts = await t.json());
  } finally {
    this._loading = !1;
  }
};
E = function(t) {
  const e = Date.now();
  return t.isActive ? t.startDate && Date.parse(t.startDate) > e ? { label: "Scheduled", look: "warning" } : t.endDate && Date.parse(t.endDate) < e ? { label: "Expired", look: "danger" } : { label: "Showing", look: "positive" } : { label: "Disabled", look: "secondary" };
};
h = function(t, e) {
  this._draft = { ...this._draft, [t]: e };
};
A = function(t) {
  this._editingId = t.id, this._draft = {
    title: t.title,
    body: t.body,
    type: t.type,
    isActive: t.isActive,
    startDate: t.startDate,
    endDate: t.endDate
  }, this._msg = null, this.scrollIntoView({ behavior: "smooth", block: "start" });
};
m = function() {
  this._editingId = null, this._draft = { ...N }, this._msg = null;
};
C = async function() {
  if (!this._draft.title.trim()) {
    this._msg = { ok: !1, text: "Give the toast a title." };
    return;
  }
  this._busy = !0, this._msg = null;
  try {
    const t = this._editingId !== null, e = t ? `${this._api}/Update?id=${this._editingId}` : `${this._api}/Create`, a = await w(this, g).call(this, e, {
      method: t ? "PUT" : "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this._draft)
    });
    if (!a.ok) throw new Error(`${a.status}`);
    this._msg = { ok: !0, text: t ? "Toast updated." : "Toast created." }, s(this, i, m).call(this), await s(this, i, _).call(this);
  } catch (t) {
    this._msg = { ok: !1, text: `Could not save the toast (${t.message}).` };
  } finally {
    this._busy = !1;
  }
};
S = async function(t) {
  if (confirm(`Delete "${t.title}"?`)) {
    this._busy = !0, this._msg = null;
    try {
      const e = await w(this, g).call(this, `${this._api}/Delete?id=${t.id}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      if (!e.ok) throw new Error(`${e.status}`);
      this._msg = { ok: !0, text: `"${t.title}" deleted.` }, this._editingId === t.id && s(this, i, m).call(this), await s(this, i, _).call(this);
    } catch (e) {
      this._msg = { ok: !1, text: `Could not delete (${e.message}).` };
    } finally {
      this._busy = !1;
    }
  }
};
v = function(t) {
  return t ? t.slice(0, 16) : "";
};
I = function() {
  const t = this._editingId !== null;
  return n`
      <uui-box headline=${t ? "Edit toast" : "New toast"}>
        <div class="grid">
          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-title">Title</label>
            <input id="t-title" .value=${this._draft.title}
              @input=${(e) => s(this, i, h).call(this, "title", e.target.value)} />
          </div>

          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-body">Message</label>
            <textarea id="t-body" .value=${this._draft.body}
              @input=${(e) => s(this, i, h).call(this, "body", e.target.value)}></textarea>
          </div>

          <div class="field">
            <label for="t-type">Type</label>
            <select id="t-type" .value=${this._draft.type}
              @change=${(e) => s(this, i, h).call(this, "type", e.target.value)}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div class="field">
            <label for="t-start">Show from <span style="font-weight:400;">(optional)</span></label>
            <input id="t-start" type="datetime-local" .value=${s(this, i, v).call(this, this._draft.startDate)}
              @input=${(e) => s(this, i, h).call(this, "startDate", e.target.value || null)} />
          </div>

          <div class="field">
            <label for="t-end">Show until <span style="font-weight:400;">(optional)</span></label>
            <input id="t-end" type="datetime-local" .value=${s(this, i, v).call(this, this._draft.endDate)}
              @input=${(e) => s(this, i, h).call(this, "endDate", e.target.value || null)} />
          </div>

          <div class="field">
            <label>Enabled</label>
            <uui-toggle
              ?checked=${this._draft.isActive}
              @change=${(e) => s(this, i, h).call(this, "isActive", e.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy} @click=${s(this, i, C)}>
            ${this._busy ? "Saving…" : t ? "Save changes" : "Create toast"}
          </uui-button>
          ${t ? n`<uui-button look="secondary" @click=${s(this, i, m)}>Cancel</uui-button>` : y}
        </div>

        ${this._msg ? n`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>` : y}
      </uui-box>
    `;
};
r.styles = P`
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
p([
  b()
], r.prototype, "_toasts", 2);
p([
  b()
], r.prototype, "_loading", 2);
p([
  b()
], r.prototype, "_busy", 2);
p([
  b()
], r.prototype, "_editingId", 2);
p([
  b()
], r.prototype, "_draft", 2);
p([
  b()
], r.prototype, "_msg", 2);
r = p([
  M("toastnotifications-dashboard")
], r);
const J = r;
export {
  r as ToastNotificationsDashboardElement,
  J as default
};
