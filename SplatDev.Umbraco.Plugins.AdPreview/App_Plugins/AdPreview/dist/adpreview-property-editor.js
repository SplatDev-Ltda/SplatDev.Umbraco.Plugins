import { css as P, property as x, state as A, customElement as O, LitElement as U, html as u } from "@umbraco-cms/backoffice/external/lit";
var L = Object.defineProperty, R = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, v = (e, t, r, h) => {
  for (var d = h > 1 ? void 0 : h ? R(t, r) : t, g = e.length - 1, m; g >= 0; g--)
    (m = e[g]) && (d = (h ? m(t, r, d) : m(d)) || d);
  return h && d && L(t, r, d), d;
}, y = (e, t, r) => t.has(e) || _("Cannot " + r), i = (e, t, r) => (y(e, t, "read from private field"), r ? r.call(e) : t.get(e)), b = (e, t, r) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), f = (e, t, r, h) => (y(e, t, "write to private field"), t.set(e, r), r), l = (e, t, r) => (y(e, t, "access private method"), r), a, o, s, k, $, w, E, S, C, n;
const c = () => ({ img: "", title: "", description: "", url: "", tooltip: "", referrer: "", css: "", overlay: !1 }), D = /* @__PURE__ */ new Set(["ad-theme-dark", "ad-theme-light", "ad-compact", "ad-bordered"]);
let p = class extends U {
  constructor() {
    super(...arguments), b(this, s), this.readonly = !1, b(this, a, c()), this.editing = !1, b(this, o, c());
  }
  get value() {
    return i(this, a);
  }
  set value(e) {
    const t = i(this, a);
    f(this, a, typeof e == "string" ? l(this, s, k).call(this, e) : { ...c(), ...e ?? {} }), this.requestUpdate("value", t);
  }
  render() {
    if (this.editing) return u`<section class="editor" aria-label="Edit ad"><h3>Edit ad</h3><label>Image URL<input .value=${i(this, o).img} @input=${(t) => l(this, s, n).call(this, "img", t)} placeholder="https://example.com/ad.jpg" /></label><label>Title<input .value=${i(this, o).title} @input=${(t) => l(this, s, n).call(this, "title", t)} /></label><label>URL<input .value=${i(this, o).url} @input=${(t) => l(this, s, n).call(this, "url", t)} /></label><label>Description<textarea @input=${(t) => l(this, s, n).call(this, "description", t)}>${i(this, o).description}</textarea></label><label>Tooltip<input .value=${i(this, o).tooltip} @input=${(t) => l(this, s, n).call(this, "tooltip", t)} /></label><label>Referrer<input .value=${i(this, o).referrer} @input=${(t) => l(this, s, n).call(this, "referrer", t)} /></label><label>CSS class <small>Allowed: ad-theme-dark, ad-theme-light, ad-compact, ad-bordered</small><input .value=${i(this, o).css} @input=${(t) => l(this, s, n).call(this, "css", t)} /></label><label class="check"><input type="checkbox" .checked=${i(this, o).overlay} @change=${(t) => l(this, s, n).call(this, "overlay", t)} /> Overlay title and description</label><footer><uui-button look="secondary" @click=${l(this, s, E)}>Cancel</uui-button><uui-button look="primary" @click=${l(this, s, S)}>Save</uui-button></footer></section>`;
    const e = l(this, s, $).call(this, i(this, a).css);
    return u`<section class="preview" aria-label="Ad Preview"><a href=${i(this, a).url || "#"} target="_blank" rel="noopener" title=${i(this, a).tooltip} @click=${(t) => !i(this, a).url && t.preventDefault()}><div class="image ${e}">${i(this, a).img ? u`<img src=${i(this, a).img} alt=${i(this, a).title} />` : u`<span>Enter an image URL to preview the ad</span>`}${i(this, a).overlay ? u`<div class="overlay"><strong>${i(this, a).title}</strong><span>${i(this, a).description}</span></div>` : ""}</div></a><footer><uui-button look="secondary" ?disabled=${this.readonly} @click=${l(this, s, w)}>Edit ad</uui-button><uui-button look="secondary" ?disabled=${this.readonly} @click=${l(this, s, C)}>Remove</uui-button></footer></section>`;
  }
};
a = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
k = function(e) {
  try {
    return { ...c(), ...JSON.parse(e) };
  } catch {
    return c();
  }
};
$ = function(e) {
  return e.split(/\s+/).filter((t) => D.has(t)).join(" ");
};
w = function() {
  this.readonly || (f(this, o, { ...i(this, a) }), this.editing = !0);
};
E = function() {
  this.editing = !1;
};
S = function() {
  this.readonly || (f(this, a, { ...i(this, o), css: l(this, s, $).call(this, i(this, o).css) }), this.editing = !1, this.requestUpdate(), this.dispatchEvent(new CustomEvent("property-value-change", { bubbles: !0, composed: !0, detail: { value: i(this, a) } })));
};
C = function() {
  this.readonly || (f(this, a, c()), this.editing = !1, this.requestUpdate(), this.dispatchEvent(new CustomEvent("property-value-change", { bubbles: !0, composed: !0, detail: { value: i(this, a) } })));
};
n = function(e, t) {
  const r = t.target;
  f(this, o, { ...i(this, o), [e]: r.type === "checkbox" ? r.checked : r.value });
};
p.styles = P`:host{display:block}.preview,.editor{padding:var(--uui-size-space-4);border:1px solid var(--uui-color-border);border-radius:var(--uui-border-radius)}.image{position:relative;min-height:120px;background:var(--uui-color-surface-alt);display:grid;place-items:center;overflow:hidden}.image img{display:block;max-width:100%;max-height:320px}.ad-compact{min-height:80px}.ad-bordered{border:2px solid var(--uui-color-border)}.ad-theme-dark{background:#20242a;color:#fff}.ad-theme-light{background:#f5f7fa}.overlay{position:absolute;inset:auto 0 0;padding:12px;color:#fff;background:#0009;display:flex;flex-direction:column}.editor{display:grid;gap:12px}.editor h3{margin:0}.editor label{display:grid;gap:4px;font-weight:600}.editor small{font-weight:400;color:var(--uui-color-text-alt)}.editor input,.editor textarea{font:inherit;padding:8px;border:1px solid var(--uui-color-border);border-radius:4px}.editor textarea{min-height:70px}.check{display:flex!important;grid-template-columns:auto 1fr;align-items:center}.editor footer,.preview footer{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}`;
v([
  x({ attribute: !1 })
], p.prototype, "value", 1);
v([
  x({ type: Boolean, reflect: !0 })
], p.prototype, "readonly", 2);
v([
  A()
], p.prototype, "editing", 2);
p = v([
  O("splatdev-adpreview-property-editor")
], p);
export {
  p as AdPreviewPropertyEditorElement
};
//# sourceMappingURL=adpreview-property-editor.js.map
