import { LitElement as y, nothing as b, html as u, css as m, property as f, state as h, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as _ } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as g } from "@umbraco-cms/backoffice/event";
var k = Object.defineProperty, O = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, i = (e, t, o, n) => {
  for (var a = n > 1 ? void 0 : n ? O(t, o) : t, l = e.length - 1, p; l >= 0; l--)
    (p = e[l]) && (a = (n ? p(t, o, a) : p(a)) || a);
  return n && a && k(t, o, a), a;
}, E = (e, t, o) => t.has(e) || x("Cannot " + o), T = (e, t, o) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), c = (e, t, o) => (E(e, t, "access private method"), o), s, d, v;
let r = class extends _(y) {
  constructor() {
    super(...arguments), T(this, s), this.value = !1, this.readonly = !1, this._onText = "On", this._offText = "Off";
  }
  set config(e) {
    e && (this._onText = e.getValueByAlias("onText") ?? e.getValueByAlias("labelOn") ?? "On", this._offText = e.getValueByAlias("offText") ?? e.getValueByAlias("labelOff") ?? "Off");
  }
  render() {
    const e = !!this.value;
    return u`
      <button
        type="button"
        class="switch"
        role="switch"
        aria-checked=${e ? "true" : "false"}
        ?disabled=${this.readonly}
        @click=${c(this, s, d)}
        @keydown=${c(this, s, v)}
      >
        <span class="label">${e ? this._onText : this._offText}</span>
        <span class="knob"></span>
      </button>
      ${this.readonly ? u`<span class="readonly-note">Read only.</span>` : b}
    `;
  }
};
s = /* @__PURE__ */ new WeakSet();
d = function() {
  this.readonly || (this.value = !this.value, this.dispatchEvent(new g()));
};
v = function(e) {
  (e.key === "ArrowLeft" || e.key === "ArrowRight") && (e.preventDefault(), e.key === "ArrowRight" !== this.value && c(this, s, d).call(this));
};
r.styles = m`
    :host { display: block; }

    .switch {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 96px;
      height: 34px;
      border-radius: 999px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      background: var(--uui-color-surface-alt, #f1f2f0);
      cursor: pointer;
      padding: 0;
      overflow: hidden;
      transition: background 160ms ease, border-color 160ms ease;
      font: inherit;
      color: inherit;
    }
    .switch:focus-visible {
      outline: 2px solid var(--uui-color-focus, #3b82f6);
      outline-offset: 2px;
    }
    .switch[aria-checked="true"] {
      background: var(--uui-color-positive, #2f9e44);
      border-color: var(--uui-color-positive, #2f9e44);
    }
    .switch[disabled] { opacity: 0.55; cursor: not-allowed; }

    .label {
      flex: 1;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-align: center;
      transition: color 160ms ease;
      color: var(--uui-color-text-alt, #6b7280);
      padding-inline: 26px 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .switch[aria-checked="true"] .label {
      color: var(--uui-color-selected-contrast, #fff);
      padding-inline: 8px 26px;
    }

    .knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--uui-color-surface, #fff);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
      transition: transform 160ms ease;
    }
    .switch[aria-checked="true"] .knob { transform: translateX(62px); }

    @media (prefers-reduced-motion: reduce) {
      .switch, .label, .knob { transition: none; }
    }

    .readonly-note {
      display: block;
      margin-top: 6px;
      font-size: 0.8rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
  `;
i([
  f({ type: Boolean, reflect: !1 })
], r.prototype, "value", 2);
i([
  f({ type: Boolean })
], r.prototype, "readonly", 2);
i([
  h()
], r.prototype, "_onText", 2);
i([
  h()
], r.prototype, "_offText", 2);
i([
  f({ attribute: !1 })
], r.prototype, "config", 1);
r = i([
  w("onoff-property-editor")
], r);
const $ = r;
export {
  r as OnOffPropertyEditorElement,
  $ as default
};
