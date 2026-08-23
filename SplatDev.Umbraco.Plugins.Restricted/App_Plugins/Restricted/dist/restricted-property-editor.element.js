import { LitElement as G, html as c, nothing as f, css as P, property as m, state as h, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as R } from "@umbraco-cms/backoffice/event";
import { UMB_PROPERTY_DATASET_CONTEXT as T } from "@umbraco-cms/backoffice/property";
import { c as U } from "./chunks/auth-fetch-BzMCmNwW.js";
var O = Object.defineProperty, A = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, i = (t, e, s, n) => {
  for (var o = n > 1 ? void 0 : n ? A(e, s) : e, u = t.length - 1, _; u >= 0; u--)
    (_ = t[u]) && (o = (n ? _(e, s, o) : _(o)) || o);
  return n && o && O(e, s, o), o;
}, k = (t, e, s) => e.has(t) || v("Cannot " + s), g = (t, e, s) => (k(t, e, "read from private field"), s ? s.call(t) : e.get(t)), b = (t, e, s) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), l = (t, e, s) => (k(t, e, "access private method"), s), p, a, w, d, y, x, $;
let r = class extends E(G) {
  constructor() {
    super(), b(this, a), b(this, p, U(this)), this.value = "", this.readonly = !1, this._node = null, this._state = null, this._groups = [], this._chosenGroup = "", this._busy = !1, this._msg = null, this._configGroups = [], this._loginPage = "", this._errorPage = "", this._api = "/umbraco/api/restricted", this.consumeContext(T, (t) => {
      var s;
      const e = (s = t == null ? void 0 : t.getUnique) == null ? void 0 : s.call(t);
      e && (this._node = e), l(this, a, d).call(this);
    });
  }
  set config(t) {
    if (!t) return;
    const e = t.getValueByAlias("memberGroups") ?? "";
    this._configGroups = e.split(",").map((s) => s.trim()).filter(Boolean), this._loginPage = t.getValueByAlias("loginPage") ?? "", this._errorPage = t.getValueByAlias("errorPage") ?? "";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, a, d).call(this);
  }
  render() {
    var e, s, n;
    if (!this._node)
      return c`<p class="hint">
        This page has not been saved yet, so there is nothing to restrict. Save it first.
      </p>`;
    const t = ((e = this._state) == null ? void 0 : e.restricted) === !0;
    return c`
      <div class="row">
        <span class="state ${t ? "on" : "off"}">
          <span class="dot"></span>${t ? "Restricted" : "Public"}
        </span>

        ${t ? c`<uui-button
              look="secondary"
              color="danger"
              label="Remove the restriction from this page"
              ?disabled=${this.readonly || this._busy}
              @click=${l(this, a, $)}
              >${this._busy ? "Working…" : "Unrestrict"}</uui-button
            >` : c`
              <uui-select
                label="Member group"
                .value=${this._chosenGroup}
                @change=${(o) => this._chosenGroup = o.target.value}
                .options=${this._groups.map((o) => ({
      name: o.name,
      value: o.name,
      selected: o.name === this._chosenGroup
    }))}
              ></uui-select>
              <uui-button
                look="primary"
                label="Restrict this page to a member group"
                ?disabled=${this.readonly || this._busy || this._groups.length === 0}
                @click=${l(this, a, x)}
                >${this._busy ? "Working…" : "Restrict"}</uui-button
              >
            `}
      </div>

      ${t && ((n = (s = this._state) == null ? void 0 : s.memberGroups) != null && n.length) ? c`<p class="detail">
            Visible to ${this._state.memberGroups.map((o, u) => c`${u ? ", " : ""}<code>${o}</code>`)}.
          </p>` : f}

      ${this._groups.length === 0 ? c`<p class="hint">
            There are no member groups yet. Create one before restricting anything —
            restricting to nobody would lock everyone out.
          </p>` : f}

      <p class="hint">
        This writes Umbraco's own public access, the same as the Restricted dashboard, so
        the page is protected everywhere — not only where this plugin renders.
      </p>

      ${this._msg ? c`<div class="msg ${this._msg.ok ? "ok" : ""}" role="status">${this._msg.text}</div>` : f}
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
w = function() {
  const t = window.location.pathname.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return t ? t[0] : null;
};
d = async function() {
  var t, e, s;
  if (this._node ?? (this._node = l(this, a, w).call(this)), !!this._node)
    try {
      const [n, o] = await Promise.all([
        g(this, p).call(this, `${this._api}/GetRestriction?node=${encodeURIComponent(this._node)}`),
        g(this, p).call(this, `${this._api}/GetMemberGroups`)
      ]);
      n.ok && (this._state = await n.json()), o.ok && (this._groups = await o.json()), this._chosenGroup || (this._chosenGroup = ((e = (t = this._state) == null ? void 0 : t.memberGroups) == null ? void 0 : e[0]) ?? this._configGroups[0] ?? ((s = this._groups[0]) == null ? void 0 : s.name) ?? "");
    } catch {
      this._msg = { ok: !1, text: "Could not read this page's access settings." };
    }
};
y = function(t) {
  const e = t ? "restricted" : "";
  this.value !== e && (this.value = e, this.dispatchEvent(new R()));
};
x = async function() {
  if (this.readonly || !this._node) return;
  const t = this._chosenGroup ? [this._chosenGroup] : this._configGroups.length ? this._configGroups : [];
  if (t.length === 0) {
    this._msg = { ok: !1, text: "Choose a member group first — restricting to nobody would lock everyone out." };
    return;
  }
  this._busy = !0, this._msg = null;
  try {
    (await g(this, p).call(this, `${this._api}/RestrictNode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        node: this._node,
        memberGroups: t,
        loginPage: this._loginPage || null,
        errorPage: this._errorPage || null
      })
    })).ok ? (this._msg = { ok: !0, text: `Restricted to ${t.join(", ")}.` }, l(this, a, y).call(this, !0), await l(this, a, d).call(this)) : this._msg = { ok: !1, text: "Could not restrict this page." };
  } catch {
    this._msg = { ok: !1, text: "Could not restrict this page." };
  } finally {
    this._busy = !1;
  }
};
$ = async function() {
  if (!(this.readonly || !this._node) && window.confirm(`Remove the restriction?

This page becomes visible to everyone, including anonymous visitors.`)) {
    this._busy = !0, this._msg = null;
    try {
      (await g(this, p).call(this, `${this._api}/UnrestrictNode?node=${encodeURIComponent(this._node)}`, { method: "DELETE" })).ok ? (this._msg = { ok: !0, text: "Restriction removed — this page is public again." }, l(this, a, y).call(this, !1), await l(this, a, d).call(this)) : this._msg = { ok: !1, text: "Could not remove the restriction." };
    } catch {
      this._msg = { ok: !1, text: "Could not remove the restriction." };
    } finally {
      this._busy = !1;
    }
  }
};
r.styles = P`
    :host { display: block; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .state {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 3px 10px; border-radius: 9999px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .state.on { background: #fee2e2; color: #991b1b; }
    .state.off { background: #d1fae5; color: #065f46; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .hint { margin: 8px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .detail { margin: 8px 0 0; font-size: 0.85rem; }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6);
      padding: 1px 5px; border-radius: 3px;
    }
    .msg {
      margin: 10px 0 0; padding: 9px 12px; border-radius: 3px; font-size: 0.86rem;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
    uui-select { min-width: 220px; }
  `;
i([
  m({ type: String })
], r.prototype, "value", 2);
i([
  m({ type: Boolean })
], r.prototype, "readonly", 2);
i([
  h()
], r.prototype, "_node", 2);
i([
  h()
], r.prototype, "_state", 2);
i([
  h()
], r.prototype, "_groups", 2);
i([
  h()
], r.prototype, "_chosenGroup", 2);
i([
  h()
], r.prototype, "_busy", 2);
i([
  h()
], r.prototype, "_msg", 2);
i([
  h()
], r.prototype, "_configGroups", 2);
i([
  h()
], r.prototype, "_loginPage", 2);
i([
  h()
], r.prototype, "_errorPage", 2);
i([
  m({ attribute: !1 })
], r.prototype, "config", 1);
r = i([
  C("restricted-property-editor")
], r);
const D = r;
export {
  r as RestrictedPropertyEditorElement,
  D as default
};
