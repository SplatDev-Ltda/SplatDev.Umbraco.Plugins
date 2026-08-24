import { LitElement as v, html as i, css as _, property as f, state as y, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as g } from "@umbraco-cms/backoffice/event";
var x = Object.defineProperty, E = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, s = (e, t, a, o) => {
  for (var l = o > 1 ? void 0 : o ? E(t, a) : t, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (l = (o ? d(t, a, l) : d(l)) || l);
  return o && l && x(t, a, l), l;
}, w = (e, t, a) => t.has(e) || h("Cannot " + a), k = (e, t, a) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), c = (e, t, a) => (w(e, t, "access private method"), a), n, p;
let r = class extends b(v) {
  constructor() {
    super(...arguments), k(this, n), this.value = "", this.readonly = !1, this._default = null;
  }
  set config(e) {
    if (!e) return;
    const t = e.getValueByAlias("dValue");
    this._default = t ?? null, c(this, n, p).call(this);
  }
  connectedCallback() {
    super.connectedCallback(), c(this, n, p).call(this);
  }
  render() {
    return this._default === null ? i`<span class="unset">
        No default is set on this data type. Set <strong>Default Value</strong> in its
        settings and it will be applied to this property.
      </span>` : i`
      <div class="value">${this.value || this._default}</div>
      <span class="note">
        ${this.value && this.value !== this._default ? i`Set on this page. The data type's default is <code>${this._default}</code>.` : i`From the data type's default.`}
      </span>
    `;
  }
};
n = /* @__PURE__ */ new WeakSet();
p = function() {
  this.readonly || this._default === null || this._default === "" || this.value !== void 0 && this.value !== null && this.value !== "" || (this.value = this._default, this.dispatchEvent(new g()));
};
r.styles = _`
    :host { display: block; }
    .value {
      padding: 8px 10px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 3px;
      background: var(--uui-color-surface-alt, #f6f6f7);
      font-family: var(--uui-font-monospace, monospace);
      word-break: break-word;
    }
    .note {
      display: block;
      margin-top: 6px;
      font-size: 0.82rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .unset {
      display: block;
      padding: 8px 10px;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
      font-size: 0.85rem;
      border-radius: 3px;
    }
  `;
s([
  f({ type: String })
], r.prototype, "value", 2);
s([
  f({ type: Boolean })
], r.prototype, "readonly", 2);
s([
  y()
], r.prototype, "_default", 2);
s([
  f({ attribute: !1 })
], r.prototype, "config", 1);
r = s([
  m("defaultvalue-property-editor")
], r);
const V = r;
export {
  r as DefaultValuePropertyEditorElement,
  V as default
};
