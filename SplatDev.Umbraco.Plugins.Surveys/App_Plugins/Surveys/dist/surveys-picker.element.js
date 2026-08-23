import { LitElement as b, html as l, nothing as x, css as S, property as f, state as d, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as C } from "@umbraco-cms/backoffice/event";
import { c as P } from "./chunks/auth-fetch-BzMCmNwW.js";
var $ = Object.defineProperty, A = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, i = (t, e, r, o) => {
  for (var s = o > 1 ? void 0 : o ? A(e, r) : e, h = t.length - 1, u; h >= 0; h--)
    (u = t[h]) && (s = (o ? u(e, r, s) : u(s)) || s);
  return o && s && $(e, r, s), s;
}, m = (t, e, r) => e.has(t) || _("Cannot " + r), O = (t, e, r) => (m(t, e, "read from private field"), r ? r.call(t) : e.get(t)), v = (t, e, r) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), c = (t, e, r) => (m(t, e, "access private method"), r), p, n, y, w, g;
let a = class extends k(b) {
  constructor() {
    super(...arguments), v(this, n), v(this, p, P(this)), this.readonly = !1, this._rows = [], this._loaded = !1, this._failed = !1;
  }
  connectedCallback() {
    super.connectedCallback(), c(this, n, y).call(this);
  }
  render() {
    return this._loaded ? this._failed ? l`<div class="warn">The list could not be loaded. See the browser console.</div>` : this._rows.length === 0 ? l`<div class="warn">
        There are no surveys yet. Create one on the Surveys dashboard, then choose it here.
      </div>` : l`
      <uui-select
        label="Survey"
        ?disabled=${this.readonly}
        .value=${this.value === void 0 || this.value === null ? "" : String(this.value)}
        @change=${c(this, n, g)}
        .options=${[
      { name: "— none —", value: "", selected: this.value === void 0 || this.value === null },
      ...this._rows.map((t) => ({
        name: c(this, n, w).call(this, t),
        value: String(t.id),
        selected: t.id === this.value
      }))
    ]}
      ></uui-select>
      <p class="hint">Stores the survey's id, which is what the page's view component takes.</p>
      ${x}
    ` : l`<uui-loader></uui-loader>`;
  }
};
p = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
y = async function() {
  try {
    const t = await O(this, p).call(this, "/umbraco/api/surveys/GetAll");
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
i([
  f({ type: Number })
], a.prototype, "value", 2);
i([
  f({ type: Boolean })
], a.prototype, "readonly", 2);
i([
  d()
], a.prototype, "_rows", 2);
i([
  d()
], a.prototype, "_loaded", 2);
i([
  d()
], a.prototype, "_failed", 2);
a = i([
  E("surveys-picker")
], a);
const D = a;
export {
  a as SurveysPickerElement,
  D as default
};
