import { LitElement as b, html as l, nothing as x, css as E, property as f, state as p, customElement as k } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as P } from "@umbraco-cms/backoffice/event";
import { c as S } from "./chunks/auth-fetch-BzMCmNwW.js";
var $ = Object.defineProperty, O = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, i = (t, e, a, o) => {
  for (var s = o > 1 ? void 0 : o ? O(e, a) : e, h = t.length - 1, c; h >= 0; h--)
    (c = t[h]) && (s = (o ? c(e, a, s) : c(s)) || s);
  return o && s && $(e, a, s), s;
}, m = (t, e, a) => e.has(t) || _("Cannot " + a), A = (t, e, a) => (m(t, e, "read from private field"), a ? a.call(t) : e.get(t)), v = (t, e, a) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), d = (t, e, a) => (m(t, e, "access private method"), a), u, n, w, y, g;
let r = class extends C(b) {
  constructor() {
    super(...arguments), v(this, n), v(this, u, S(this)), this.readonly = !1, this._rows = [], this._loaded = !1, this._failed = !1;
  }
  connectedCallback() {
    super.connectedCallback(), d(this, n, w).call(this);
  }
  render() {
    return this._loaded ? this._failed ? l`<div class="warn">The list could not be loaded. See the browser console.</div>` : this._rows.length === 0 ? l`<div class="warn">
        There are no events yet. Create one on the RSVP dashboard, then choose it here.
      </div>` : l`
      <uui-select
        label="Event"
        ?disabled=${this.readonly}
        .value=${this.value === void 0 || this.value === null ? "" : String(this.value)}
        @change=${d(this, n, g)}
        .options=${[
      { name: "— none —", value: "", selected: this.value === void 0 || this.value === null },
      ...this._rows.map((t) => ({
        name: d(this, n, y).call(this, t),
        value: String(t.id),
        selected: t.id === this.value
      }))
    ]}
      ></uui-select>
      <p class="hint">Stores the event's id, which is what the page's view component takes.</p>
      ${x}
    ` : l`<uui-loader></uui-loader>`;
  }
};
u = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
w = async function() {
  try {
    const t = await A(this, u).call(this, "/umbraco/api/rsvp/GetEvents");
    if (t.ok) {
      const e = await t.json();
      this._rows = Array.isArray(e) ? e : (e == null ? void 0 : e.items) ?? [];
    } else
      this._failed = !0;
  } catch {
    this._failed = !0;
  } finally {
    this._loaded = !0;
  }
};
y = function(t) {
  const e = t.title;
  return typeof e == "string" && e.trim() ? e : `#${t.id}`;
};
g = function(t) {
  const e = t.target.value, a = e === "" ? void 0 : Number(e);
  a !== this.value && (this.value = a, this.dispatchEvent(new P()));
};
r.styles = E`
    :host { display: block; }
    uui-select { width: 100%; max-width: 460px; }
    .hint { margin: 6px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin: 6px 0 0; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
  `;
i([
  f({ type: Number })
], r.prototype, "value", 2);
i([
  f({ type: Boolean })
], r.prototype, "readonly", 2);
i([
  p()
], r.prototype, "_rows", 2);
i([
  p()
], r.prototype, "_loaded", 2);
i([
  p()
], r.prototype, "_failed", 2);
r = i([
  k("rsvp-picker")
], r);
const z = r;
export {
  r as RsvpPickerElement,
  z as default
};
