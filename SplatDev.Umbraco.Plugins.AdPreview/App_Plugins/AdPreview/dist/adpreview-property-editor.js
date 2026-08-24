import { css as A, property as x, state as U, customElement as O, LitElement as L, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as _ } from "@umbraco-cms/backoffice/event";
var R = Object.defineProperty, D = Object.getOwnPropertyDescriptor, k = (e) => {
  throw TypeError(e);
}, v = (e, t, a, p) => {
  for (var d = p > 1 ? void 0 : p ? D(t, a) : t, g = e.length - 1, m; g >= 0; g--)
    (m = e[g]) && (d = (p ? m(t, a, d) : m(d)) || d);
  return p && d && R(t, a, d), d;
}, y = (e, t, a) => t.has(e) || k("Cannot " + a), i = (e, t, a) => (y(e, t, "read from private field"), a ? a.call(e) : t.get(e)), b = (e, t, a) => t.has(e) ? k("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), f = (e, t, a, p) => (y(e, t, "write to private field"), t.set(e, a), a), l = (e, t, a) => (y(e, t, "access private method"), a), r, o, s, w, $, E, S, C, P, n;
const c = () => ({ img: "", title: "", description: "", url: "", tooltip: "", referrer: "", css: "", overlay: !1 }), W = /* @__PURE__ */ new Set(["ad-theme-dark", "ad-theme-light", "ad-compact", "ad-bordered"]);
let h = class extends L {
  constructor() {
    super(...arguments), b(this, s), this.readonly = !1, b(this, r, c()), this.editing = !1, b(this, o, c());
  }
  get value() {
    return i(this, r);
  }
  set value(e) {
    const t = i(this, r);
    f(this, r, typeof e == "string" ? l(this, s, w).call(this, e) : { ...c(), ...e ?? {} }), this.requestUpdate("value", t);
  }
  render() {
    if (this.editing) return u`<section class="editor" aria-label="Edit ad"><h3>Edit ad</h3><label>Image URL<input .value=${i(this, o).img} @input=${(t) => l(this, s, n).call(this, "img", t)} placeholder="https://example.com/ad.jpg" /></label><label>Title<input .value=${i(this, o).title} @input=${(t) => l(this, s, n).call(this, "title", t)} /></label><label>URL<input .value=${i(this, o).url} @input=${(t) => l(this, s, n).call(this, "url", t)} /></label><label>Description<textarea @input=${(t) => l(this, s, n).call(this, "description", t)}>${i(this, o).description}</textarea></label><label>Tooltip<input .value=${i(this, o).tooltip} @input=${(t) => l(this, s, n).call(this, "tooltip", t)} /></label><label>Referrer<input .value=${i(this, o).referrer} @input=${(t) => l(this, s, n).call(this, "referrer", t)} /></label><label>CSS class <small>Allowed: ad-theme-dark, ad-theme-light, ad-compact, ad-bordered</small><input .value=${i(this, o).css} @input=${(t) => l(this, s, n).call(this, "css", t)} /></label><label class="check"><input type="checkbox" .checked=${i(this, o).overlay} @change=${(t) => l(this, s, n).call(this, "overlay", t)} /> Overlay title and description</label><footer><uui-button look="secondary" @click=${l(this, s, S)}>Cancel</uui-button><uui-button look="primary" @click=${l(this, s, C)}>Save</uui-button></footer></section>`;
    const e = l(this, s, $).call(this, i(this, r).css);
    return u`<section class="preview" aria-label="Ad Preview"><a href=${i(this, r).url || "#"} target="_blank" rel="noopener" title=${i(this, r).tooltip} @click=${(t) => !i(this, r).url && t.preventDefault()}><div class="image ${e}">${i(this, r).img ? u`<img src=${i(this, r).img} alt=${i(this, r).title} />` : u`<span>Enter an image URL to preview the ad</span>`}${i(this, r).overlay ? u`<div class="overlay"><strong>${i(this, r).title}</strong><span>${i(this, r).description}</span></div>` : ""}</div></a><footer><uui-button look="secondary" ?disabled=${this.readonly} @click=${l(this, s, E)}>Edit ad</uui-button><uui-button look="secondary" ?disabled=${this.readonly} @click=${l(this, s, P)}>Remove</uui-button></footer></section>`;
  }
};
r = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
w = function(e) {
  try {
    return { ...c(), ...JSON.parse(e) };
  } catch {
    return c();
  }
};
$ = function(e) {
  return e.split(/\s+/).filter((t) => W.has(t)).join(" ");
};
E = function() {
  this.readonly || (f(this, o, { ...i(this, r) }), this.editing = !0);
};
S = function() {
  this.editing = !1;
};
C = function() {
  this.readonly || (f(this, r, { ...i(this, o), css: l(this, s, $).call(this, i(this, o).css) }), this.editing = !1, this.requestUpdate(), this.dispatchEvent(new _()));
};
P = function() {
  this.readonly || (f(this, r, c()), this.editing = !1, this.requestUpdate(), this.dispatchEvent(new _()));
};
n = function(e, t) {
  const a = t.target;
  f(this, o, { ...i(this, o), [e]: a.type === "checkbox" ? a.checked : a.value });
};
h.styles = A`:host{display:block}.preview,.editor{padding:var(--uui-size-space-4);border:1px solid var(--uui-color-border);border-radius:var(--uui-border-radius)}.image{position:relative;min-height:120px;background:var(--uui-color-surface-alt);display:grid;place-items:center;overflow:hidden}.image img{display:block;max-width:100%;max-height:320px}.ad-compact{min-height:80px}.ad-bordered{border:2px solid var(--uui-color-border)}.ad-theme-dark{background:#20242a;color:#fff}.ad-theme-light{background:#f5f7fa}.overlay{position:absolute;inset:auto 0 0;padding:12px;color:#fff;background:#0009;display:flex;flex-direction:column}.editor{display:grid;gap:12px}.editor h3{margin:0}.editor label{display:grid;gap:4px;font-weight:600}.editor small{font-weight:400;color:var(--uui-color-text-alt)}.editor input,.editor textarea{font:inherit;padding:8px;border:1px solid var(--uui-color-border);border-radius:4px}.editor textarea{min-height:70px}.check{display:flex!important;grid-template-columns:auto 1fr;align-items:center}.editor footer,.preview footer{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}`;
v([
  x({ attribute: !1 })
], h.prototype, "value", 1);
v([
  x({ type: Boolean, reflect: !0 })
], h.prototype, "readonly", 2);
v([
  U()
], h.prototype, "editing", 2);
h = v([
  O("splatdev-adpreview-property-editor")
], h);
export {
  h as AdPreviewPropertyEditorElement
};
//# sourceMappingURL=adpreview-property-editor.js.map
