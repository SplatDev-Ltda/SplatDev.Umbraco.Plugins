import { LitElement as b, html as n, unsafeCSS as p, css as w, property as f, state as m, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as E } from "@umbraco-cms/backoffice/event";
var k = Object.defineProperty, O = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, o = (t, e, i, l) => {
  for (var a = l > 1 ? void 0 : l ? O(e, i) : e, d = t.length - 1, h; d >= 0; d--)
    (h = t[d]) && (a = (l ? h(e, i, a) : h(a)) || a);
  return l && a && k(e, i, a), a;
}, g = (t, e, i) => e.has(t) || _("Cannot " + i), v = (t, e, i) => (g(t, e, "read from private field"), i ? i.call(t) : e.get(t)), P = (t, e, i) => e.has(t) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), c = (t, e, i) => (g(t, e, "access private method"), i), s, x, y, u;
const S = "#39d38b", z = "#7c8510", N = "#d42054";
let r = class extends C(b) {
  constructor() {
    super(...arguments), P(this, s), this.value = "", this.readonly = !1, this._limit = 0, this._showCountdown = !0, this._threshold = 100;
  }
  set config(t) {
    if (!t) return;
    const e = t.getValueByAlias("limit") ?? t.getValueByAlias("maxChars") ?? 0;
    this._limit = Number(e) || 0, this._showCountdown = t.getValueByAlias("showCountdown") ?? !0, this._threshold = Number(t.getValueByAlias("textareaThreshold") ?? 100);
  }
  render() {
    if (this._limit <= 0)
      return n`
        <input class="field" .value=${this.value ?? ""} ?disabled=${this.readonly} @input=${c(this, s, u)} />
        <span class="unset">
          No limit is set on this data type. Set <strong>Number of Characters</strong> in its
          settings and the counter will appear.
        </span>
      `;
    const t = v(this, s, x), i = this._threshold > 0 && this._limit >= this._threshold ? n`<textarea
          class="field"
          rows="10"
          maxlength=${this._limit}
          .value=${this.value ?? ""}
          ?disabled=${this.readonly}
          @input=${c(this, s, u)}
        ></textarea>` : n`<input
          class="field"
          type="text"
          maxlength=${this._limit}
          .value=${this.value ?? ""}
          ?disabled=${this.readonly}
          @input=${c(this, s, u)}
        />`;
    return this._showCountdown ? n`
      ${i}
      <div class="counter" data-state=${t} role="status" aria-live="polite">
        <uui-icon name=${t === "full" ? "icon-stop-hand" : t === "warning" ? "icon-alert" : "icon-thumb-up"}></uui-icon>
        ${t === "full" ? n`<span>Only ${this._limit} characters allowed!</span>` : n`<span>You have ${v(this, s, y)} characters left</span>`}
      </div>
    ` : i;
  }
};
s = /* @__PURE__ */ new WeakSet();
x = function() {
  var e;
  const t = ((e = this.value) == null ? void 0 : e.length) ?? 0;
  return this._limit > 0 && t >= this._limit ? "full" : this._limit > 0 && t > this._limit / 2 ? "warning" : "ok";
};
y = function() {
  var t;
  return Math.max(0, this._limit - (((t = this.value) == null ? void 0 : t.length) ?? 0));
};
u = function(t) {
  const e = t.target, i = this._limit > 0 ? e.value.slice(0, this._limit) : e.value;
  i !== e.value && (e.value = i), i !== this.value && (this.value = i, this.dispatchEvent(new E()));
};
r.styles = w`
    :host { display: block; }

    .field {
      width: 100%;
      box-sizing: border-box;
      display: block;
      font: inherit;
      padding: 6px 8px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 3px 3px 0 0;
      background: var(--uui-color-surface, #fff);
      color: inherit;
    }
    .field:focus-visible {
      outline: 2px solid var(--uui-color-focus, #3b82f6);
      outline-offset: -2px;
    }
    textarea.field { resize: vertical; min-height: 8lh; }

    .counter {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      width: 100%;
      box-sizing: border-box;
      padding: 5px 10px;
      font-size: 0.85rem;
      font-weight: 400;
      color: #fff;
      opacity: 0.85;
      border-radius: 0 0 4px 4px;
      /* The original eased between the three colours; keep that, but respect a
         reduced-motion preference. */
      transition: background 0.4s ease-in-out;
    }
    @media (prefers-reduced-motion: reduce) {
      .counter { transition: none; }
    }

    .counter[data-state="ok"]      { background: ${p(S)}; }
    .counter[data-state="warning"] { background: ${p(z)}; }
    .counter[data-state="full"]    { background: ${p(N)}; font-weight: 700; opacity: 1; }

    .counter uui-icon { font-size: 1rem; }

    .unset {
      display: block;
      margin-top: 6px;
      padding: 8px 10px;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
      font-size: 0.85rem;
      border-radius: 3px;
    }
  `;
o([
  f({ type: String })
], r.prototype, "value", 2);
o([
  f({ type: Boolean })
], r.prototype, "readonly", 2);
o([
  m()
], r.prototype, "_limit", 2);
o([
  m()
], r.prototype, "_showCountdown", 2);
o([
  m()
], r.prototype, "_threshold", 2);
o([
  f({ attribute: !1 })
], r.prototype, "config", 1);
r = o([
  $("charlimit-property-editor")
], r);
const V = r;
export {
  r as CharLimitPropertyEditorElement,
  V as default
};
//# sourceMappingURL=charlimit-property-editor.element.js.map
