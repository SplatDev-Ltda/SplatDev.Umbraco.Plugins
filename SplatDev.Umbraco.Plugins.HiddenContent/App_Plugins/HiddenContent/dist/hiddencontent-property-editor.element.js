import { LitElement as x, html as u, nothing as C, css as E, property as g, state as l, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as H } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as T } from "@umbraco-cms/backoffice/event";
import { UMB_PROPERTY_DATASET_CONTEXT as P } from "@umbraco-cms/backoffice/property";
import { c as S } from "./chunks/auth-fetch-BzMCmNwW.js";
var O = Object.defineProperty, U = Object.getOwnPropertyDescriptor, m = (t) => {
  throw TypeError(t);
}, a = (t, e, i, d) => {
  for (var o = d > 1 ? void 0 : d ? U(e, i) : e, p = t.length - 1, c; p >= 0; p--)
    (c = t[p]) && (o = (d ? c(e, i, o) : c(o)) || o);
  return d && o && O(e, i, o), o;
}, v = (t, e, i) => e.has(t) || m("Cannot " + i), y = (t, e, i) => (v(t, e, "read from private field"), i ? i.call(t) : e.get(t)), _ = (t, e, i) => e.has(t) ? m("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), r = (t, e, i) => (v(t, e, "access private method"), i), h, n, b, f, k, w;
let s = class extends H(x) {
  constructor() {
    super(), _(this, n), _(this, h, S(this)), this.value = "", this.readonly = !1, this._node = null, this._hidden = null, this._busy = !1, this._msg = null, this._api = "/umbraco/api/hiddencontent", this.consumeContext(P, (t) => {
      var i;
      const e = (i = t == null ? void 0 : t.getUnique) == null ? void 0 : i.call(t);
      e && (this._node = e), r(this, n, f).call(this);
    });
  }
  connectedCallback() {
    super.connectedCallback(), r(this, n, f).call(this);
  }
  render() {
    if (!this._node)
      return u`<p class="hint">This page has not been saved yet, so there is nothing to hide.</p>`;
    const t = this._hidden === !0;
    return u`
      <div class="row">
        <span class="state ${t ? "hidden" : "visible"}">
          <span class="dot"></span>${t ? "Hidden" : "Visible"}
        </span>
        <uui-button
          look="secondary"
          label=${t ? "Show this page in navigation" : "Hide this page from navigation"}
          ?disabled=${this.readonly || this._busy || this._hidden === null}
          @click=${() => r(this, n, w).call(this, !t)}
          >${this._busy ? "Working…" : t ? "Show" : "Hide"}</uui-button
        >
      </div>

      <p class="hint">
        Hiding removes the page from navigation. It stays published and reachable by its
        URL — this is not access control.
      </p>

      ${this._msg ? u`<div class="msg ${this._msg.ok ? "ok" : ""}" role="status">${this._msg.text}</div>` : C}
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
b = function() {
  const t = window.location.pathname.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return t ? t[0] : null;
};
f = async function() {
  if (this._node ?? (this._node = r(this, n, b).call(this)), !!this._node)
    try {
      const t = await y(this, h).call(this, `${this._api}/IsHidden?node=${encodeURIComponent(this._node)}`);
      if (t.ok) {
        const e = await t.json();
        this._hidden = typeof e == "boolean" ? e : (e == null ? void 0 : e.hidden) ?? (e == null ? void 0 : e.isHidden) ?? null;
      }
    } catch {
      this._msg = { ok: !1, text: "Could not read this page's visibility." };
    }
};
k = function(t) {
  const e = t ? "hidden" : "";
  this.value !== e && (this.value = e, this.dispatchEvent(new T()));
};
w = async function(t) {
  if (!(this.readonly || !this._node)) {
    this._busy = !0, this._msg = null;
    try {
      (await y(this, h).call(this, `${this._api}/${t ? "Hide" : "Show"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: [this._node] })
      })).ok ? (this._hidden = t, r(this, n, k).call(this, t), this._msg = { ok: !0, text: t ? "Hidden from navigation." : "Showing in navigation again." }) : this._msg = { ok: !1, text: "That change did not take." };
    } catch {
      this._msg = { ok: !1, text: "That change did not take." };
    } finally {
      this._busy = !1;
    }
  }
};
s.styles = E`
    :host { display: block; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .state {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 3px 10px; border-radius: 9999px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .state.hidden { background: #fef3c7; color: #92400e; }
    .state.visible { background: #d1fae5; color: #065f46; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .hint { margin: 8px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .msg {
      margin: 9px 0 0; padding: 8px 11px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;
a([
  g({ type: String })
], s.prototype, "value", 2);
a([
  g({ type: Boolean })
], s.prototype, "readonly", 2);
a([
  l()
], s.prototype, "_node", 2);
a([
  l()
], s.prototype, "_hidden", 2);
a([
  l()
], s.prototype, "_busy", 2);
a([
  l()
], s.prototype, "_msg", 2);
s = a([
  $("hiddencontent-property-editor")
], s);
const D = s;
export {
  s as HiddenContentPropertyEditorElement,
  D as default
};
