import { LitElement as b, html as o, nothing as x, css as S, property as f, state as u, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as C } from "@umbraco-cms/backoffice/event";
import { c as P } from "./chunks/auth-fetch-BzMCmNwW.js";
var $ = Object.defineProperty, O = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, s = (t, e, r, n) => {
  for (var i = n > 1 ? void 0 : n ? O(e, r) : e, d = t.length - 1, h; d >= 0; d--)
    (h = t[d]) && (i = (n ? h(e, r, i) : h(i)) || i);
  return n && i && $(e, r, i), i;
}, m = (t, e, r) => e.has(t) || _("Cannot " + r), A = (t, e, r) => (m(t, e, "read from private field"), r ? r.call(t) : e.get(t)), v = (t, e, r) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), c = (t, e, r) => (m(t, e, "access private method"), r), p, l, w, y, g;
let a = class extends k(b) {
  constructor() {
    super(...arguments), v(this, l), v(this, p, P(this)), this.readonly = !1, this._rows = [], this._loaded = !1, this._failed = !1;
  }
  connectedCallback() {
    super.connectedCallback(), c(this, l, w).call(this);
  }
  render() {
    return this._loaded ? this._failed ? o`<div class="warn">The list could not be loaded. See the browser console.</div>` : this._rows.length === 0 ? o`<div class="warn">
        There are no sliders yet. Create one on the Sliders dashboard, then choose it here.
      </div>` : o`
      <uui-select
        label="Slider"
        ?disabled=${this.readonly}
        .value=${this.value === void 0 || this.value === null ? "" : String(this.value)}
        @change=${c(this, l, g)}
        .options=${[
      { name: "— none —", value: "", selected: this.value === void 0 || this.value === null },
      ...this._rows.map((t) => ({
        name: c(this, l, y).call(this, t),
        value: String(t.id),
        selected: t.id === this.value
      }))
    ]}
      ></uui-select>
      <p class="hint">Stores the slider's id, which is what the page's view component takes.</p>
      ${x}
    ` : o`<uui-loader></uui-loader>`;
  }
};
p = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
w = async function() {
  try {
    const t = await A(this, p).call(this, "/umbraco/api/slider/GetSliders");
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
  const e = t.name;
  return typeof e == "string" && e.trim() ? e : `#${t.id}`;
};
g = function(t) {
  const e = t.target.value, r = e === "" ? void 0 : Number(e);
  r !== this.value && (this.value = r, this.dispatchEvent(new C()));
};
a.styles = S`
    :host { display: block; }
    uui-select { width: 100%; max-width: 460px; }
    .hint { margin: 6px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin: 6px 0 0; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
  `;
s([
  f({ type: Number })
], a.prototype, "value", 2);
s([
  f({ type: Boolean })
], a.prototype, "readonly", 2);
s([
  u()
], a.prototype, "_rows", 2);
s([
  u()
], a.prototype, "_loaded", 2);
s([
  u()
], a.prototype, "_failed", 2);
a = s([
  E("slider-picker")
], a);
const D = a;
export {
  a as SliderPickerElement,
  D as default
};
