import { LitElement as k, html as n, nothing as b, css as x, property as f, state as u, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as C } from "@umbraco-cms/backoffice/event";
import { c as S } from "./chunks/auth-fetch-BzMCmNwW.js";
var $ = Object.defineProperty, A = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, s = (t, e, a, o) => {
  for (var r = o > 1 ? void 0 : o ? A(e, a) : e, c = t.length - 1, h; c >= 0; c--)
    (h = t[c]) && (r = (o ? h(e, a, r) : h(r)) || r);
  return o && r && $(e, a, r), r;
}, m = (t, e, a) => e.has(t) || _("Cannot " + a), O = (t, e, a) => (m(t, e, "read from private field"), a ? a.call(t) : e.get(t)), v = (t, e, a) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), d = (t, e, a) => (m(t, e, "access private method"), a), p, l, w, y, g;
let i = class extends E(k) {
  constructor() {
    super(...arguments), v(this, l), v(this, p, S(this)), this.readonly = !1, this._rows = [], this._loaded = !1, this._failed = !1;
  }
  connectedCallback() {
    super.connectedCallback(), d(this, l, w).call(this);
  }
  render() {
    return this._loaded ? this._failed ? n`<div class="warn">The list could not be loaded. See the browser console.</div>` : this._rows.length === 0 ? n`<div class="warn">
        There are no polls yet. Create one on the Quick Poll dashboard, then choose it here.
      </div>` : n`
      <uui-select
        label="Poll"
        ?disabled=${this.readonly}
        .value=${this.value === void 0 || this.value === null ? "" : String(this.value)}
        @change=${d(this, l, g)}
        .options=${[
      { name: "— none —", value: "", selected: this.value === void 0 || this.value === null },
      ...this._rows.map((t) => ({
        name: d(this, l, y).call(this, t),
        value: String(t.id),
        selected: t.id === this.value
      }))
    ]}
      ></uui-select>
      <p class="hint">Stores the poll's id, which is what the page's view component takes.</p>
      ${b}
    ` : n`<uui-loader></uui-loader>`;
  }
};
p = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
w = async function() {
  try {
    const t = await O(this, p).call(this, "/umbraco/api/quickpoll/GetAll");
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
  const e = t.question;
  return typeof e == "string" && e.trim() ? e : `#${t.id}`;
};
g = function(t) {
  const e = t.target.value, a = e === "" ? void 0 : Number(e);
  a !== this.value && (this.value = a, this.dispatchEvent(new C()));
};
i.styles = x`
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
], i.prototype, "value", 2);
s([
  f({ type: Boolean })
], i.prototype, "readonly", 2);
s([
  u()
], i.prototype, "_rows", 2);
s([
  u()
], i.prototype, "_loaded", 2);
s([
  u()
], i.prototype, "_failed", 2);
i = s([
  P("quickpoll-picker")
], i);
const W = i;
export {
  i as QuickPollPickerElement,
  W as default
};
