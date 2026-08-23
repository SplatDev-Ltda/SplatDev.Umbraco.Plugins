import { LitElement as b, html as n, nothing as x, css as P, property as f, state as u, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as C } from "@umbraco-cms/backoffice/event";
import { c as A } from "./chunks/auth-fetch-BzMCmNwW.js";
var G = Object.defineProperty, S = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, s = (t, e, a, l) => {
  for (var i = l > 1 ? void 0 : l ? S(e, a) : e, h = t.length - 1, c; h >= 0; h--)
    (c = t[h]) && (i = (l ? c(e, a, i) : c(i)) || i);
  return l && i && G(e, a, i), i;
}, m = (t, e, a) => e.has(t) || _("Cannot " + a), $ = (t, e, a) => (m(t, e, "read from private field"), a ? a.call(t) : e.get(t)), v = (t, e, a) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), d = (t, e, a) => (m(t, e, "access private method"), a), p, o, y, w, g;
let r = class extends k(b) {
  constructor() {
    super(...arguments), v(this, o), v(this, p, A(this)), this.readonly = !1, this._rows = [], this._loaded = !1, this._failed = !1;
  }
  connectedCallback() {
    super.connectedCallback(), d(this, o, y).call(this);
  }
  render() {
    return this._loaded ? this._failed ? n`<div class="warn">The list could not be loaded. See the browser console.</div>` : this._rows.length === 0 ? n`<div class="warn">
        There are no albums yet. Create one on the Photo Gallery dashboard, then choose it here.
      </div>` : n`
      <uui-select
        label="Album"
        ?disabled=${this.readonly}
        .value=${this.value === void 0 || this.value === null ? "" : String(this.value)}
        @change=${d(this, o, g)}
        .options=${[
      { name: "— none —", value: "", selected: this.value === void 0 || this.value === null },
      ...this._rows.map((t) => ({
        name: d(this, o, w).call(this, t),
        value: String(t.id),
        selected: t.id === this.value
      }))
    ]}
      ></uui-select>
      <p class="hint">Stores the album's id, which is what the page's view component takes.</p>
      ${x}
    ` : n`<uui-loader></uui-loader>`;
  }
};
p = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
y = async function() {
  try {
    const t = await $(this, p).call(this, "/umbraco/api/photogallery/GetAlbums");
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
w = function(t) {
  const e = t.title;
  return typeof e == "string" && e.trim() ? e : `#${t.id}`;
};
g = function(t) {
  const e = t.target.value, a = e === "" ? void 0 : Number(e);
  a !== this.value && (this.value = a, this.dispatchEvent(new C()));
};
r.styles = P`
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
], r.prototype, "value", 2);
s([
  f({ type: Boolean })
], r.prototype, "readonly", 2);
s([
  u()
], r.prototype, "_rows", 2);
s([
  u()
], r.prototype, "_loaded", 2);
s([
  u()
], r.prototype, "_failed", 2);
r = s([
  E("photogallery-picker")
], r);
const z = r;
export {
  r as PhotoGalleryPickerElement,
  z as default
};
