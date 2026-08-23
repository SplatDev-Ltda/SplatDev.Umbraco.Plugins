import { LitElement as _, nothing as p, html as c, css as y, property as u, state as d, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as C } from "@umbraco-cms/backoffice/event";
var x = Object.defineProperty, g = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, s = (e, t, r, a) => {
  for (var n = a > 1 ? void 0 : a ? g(t, r) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (n = (a ? l(t, r, n) : l(n)) || n);
  return a && n && x(t, r, n), n;
}, E = (e, t, r) => t.has(e) || v("Cannot " + r), b = (e, t, r) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), P = (e, t, r) => (E(e, t, "access private method"), r), h, m;
let o = class extends f(_) {
  constructor() {
    super(...arguments), b(this, h), this.value = "", this.readonly = !1, this._showCountdown = !0;
  }
  set config(e) {
    if (!e) return;
    const t = e.getValueByAlias("maxChars"), r = typeof t == "string" ? parseInt(t, 10) : t;
    this._maxChars = Number.isFinite(r) && r > 0 ? r : void 0;
    const a = e.getValueByAlias("showCountdown");
    this._showCountdown = a === void 0 ? !0 : a === !0 || a === "1";
  }
  render() {
    const e = (this.value ?? "").length, t = this._maxChars === void 0 ? void 0 : this._maxChars - e;
    return c`
      <uui-textarea
        label="Text"
        .value=${this.value ?? ""}
        maxlength=${this._maxChars ?? p}
        ?readonly=${this.readonly}
        @input=${P(this, h, m)}
      ></uui-textarea>

      ${this._showCountdown && t !== void 0 ? c`<span class="count ${t < 0 ? "over" : t <= 10 ? "low" : ""}">
            ${t} characters remaining
          </span>` : p}
    `;
  }
};
h = /* @__PURE__ */ new WeakSet();
m = function(e) {
  const t = e.target.value;
  t !== this.value && (this.value = t, this.dispatchEvent(new C()));
};
o.styles = y`
    :host { display: block; }
    uui-textarea { width: 100%; }
    .count {
      display: block;
      margin-top: 5px;
      font-size: 0.82rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .count.low { color: var(--uui-color-warning-standalone, #b26a00); }
    .count.over { color: var(--uui-color-danger, #d42054); font-weight: 700; }
  `;
s([
  u({ type: String })
], o.prototype, "value", 2);
s([
  u({ type: Boolean })
], o.prototype, "readonly", 2);
s([
  d()
], o.prototype, "_maxChars", 2);
s([
  d()
], o.prototype, "_showCountdown", 2);
s([
  u({ attribute: !1 })
], o.prototype, "config", 1);
o = s([
  w("charlimit-property-editor")
], o);
const A = o;
export {
  o as CharLimitPropertyEditorElement,
  A as default
};
//# sourceMappingURL=charlimit-property-editor.element.js.map
