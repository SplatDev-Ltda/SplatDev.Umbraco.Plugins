import { css as P, property as C, state as S, customElement as O, LitElement as R, html as u } from "@umbraco-cms/backoffice/external/lit";
var A = Object.defineProperty, D = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, m = (t, i, r, d) => {
  for (var p = d > 1 ? void 0 : d ? D(i, r) : i, f = t.length - 1, g; f >= 0; f--)
    (g = t[f]) && (p = (d ? g(i, r, p) : g(p)) || p);
  return d && p && A(i, r, p), p;
}, y = (t, i, r) => i.has(t) || $("Cannot " + r), e = (t, i, r) => (y(t, i, "read from private field"), r ? r.call(t) : i.get(t)), b = (t, i, r) => i.has(t) ? $("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, r), v = (t, i, r, d) => (y(t, i, "write to private field"), i.set(t, r), r), o = (t, i, r) => (y(t, i, "access private method"), r), a, l, s, _, x, k, w, E, n;
const c = () => ({ img: "", title: "", description: "", url: "", tooltip: "", referrer: "", css: "", overlay: !1 });
let h = class extends R {
  constructor() {
    super(...arguments), b(this, s), b(this, a, c()), this.editing = !1, b(this, l, c());
  }
  get value() {
    return e(this, a);
  }
  set value(t) {
    v(this, a, typeof t == "string" ? o(this, s, _).call(this, t) : { ...c(), ...t ?? {} });
  }
  render() {
    return this.editing ? u`<section class="editor" aria-label="Edit ad"><h3>Edit ad</h3><label>Image URL<input value=${e(this, l).img} @input=${(t) => o(this, s, n).call(this, "img", t)} placeholder="https://example.com/ad.jpg" /></label><label>Title<input value=${e(this, l).title} @input=${(t) => o(this, s, n).call(this, "title", t)} /></label><label>URL<input value=${e(this, l).url} @input=${(t) => o(this, s, n).call(this, "url", t)} /></label><label>Description<textarea @input=${(t) => o(this, s, n).call(this, "description", t)}>${e(this, l).description}</textarea></label><label>Tooltip<input value=${e(this, l).tooltip} @input=${(t) => o(this, s, n).call(this, "tooltip", t)} /></label><label>Referrer<input value=${e(this, l).referrer} @input=${(t) => o(this, s, n).call(this, "referrer", t)} /></label><label>CSS class<input value=${e(this, l).css} @input=${(t) => o(this, s, n).call(this, "css", t)} /></label><label class="check"><input type="checkbox" .checked=${e(this, l).overlay} @change=${(t) => o(this, s, n).call(this, "overlay", t)} /> Overlay title and description</label><footer><uui-button look="secondary" @click=${o(this, s, k)}>Cancel</uui-button><uui-button look="primary" @click=${o(this, s, w)}>Save</uui-button></footer></section>` : u`<section class="preview" aria-label="Ad Preview"><a href=${e(this, a).url || "#"} target="_blank" rel="noopener" title=${e(this, a).tooltip} @click=${(t) => !e(this, a).url && t.preventDefault()}><div class="image" style=${e(this, a).css ? `--ad-css:${e(this, a).css}` : ""}>${e(this, a).img ? u`<img src=${e(this, a).img} alt=${e(this, a).title} />` : u`<span>Select media or enter an image URL</span>`}${e(this, a).overlay ? u`<div class="overlay"><strong>${e(this, a).title}</strong><span>${e(this, a).description}</span></div>` : ""}</div></a><footer><uui-button look="secondary" @click=${o(this, s, x)}>Edit ad</uui-button><uui-button look="secondary" @click=${o(this, s, E)}>Remove</uui-button></footer></section>`;
  }
};
a = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
_ = function(t) {
  try {
    return { ...c(), ...JSON.parse(t) };
  } catch {
    return c();
  }
};
x = function() {
  v(this, l, { ...e(this, a) }), this.editing = !0;
};
k = function() {
  this.editing = !1;
};
w = function() {
  v(this, a, { ...e(this, l) }), this.editing = !1, this.dispatchEvent(new CustomEvent("property-value-change", { bubbles: !0, composed: !0 }));
};
E = function() {
  v(this, a, c()), this.editing = !1, this.dispatchEvent(new CustomEvent("property-value-change", { bubbles: !0, composed: !0 }));
};
n = function(t, i) {
  const r = i.target;
  v(this, l, { ...e(this, l), [t]: r.type === "checkbox" ? r.checked : r.value });
};
h.styles = P`:host{display:block}.preview,.editor{padding:var(--uui-size-space-4);border:1px solid var(--uui-color-border);border-radius:var(--uui-border-radius)}.image{position:relative;min-height:120px;background:var(--uui-color-surface-alt);display:grid;place-items:center;overflow:hidden}.image img{display:block;max-width:100%;max-height:320px}.overlay{position:absolute;inset:auto 0 0;padding:12px;color:#fff;background:#0009;display:flex;flex-direction:column}.editor{display:grid;gap:12px}.editor h3{margin:0}.editor label{display:grid;gap:4px;font-weight:600}.editor input,.editor textarea{font:inherit;padding:8px;border:1px solid var(--uui-color-border);border-radius:4px}.editor textarea{min-height:70px}.check{display:flex!important;grid-template-columns:auto 1fr;align-items:center}.editor footer,.preview footer{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}`;
m([
  C({ type: Object })
], h.prototype, "value", 1);
m([
  S()
], h.prototype, "editing", 2);
h = m([
  O("splatdev-adpreview-property-editor")
], h);
export {
  h as AdPreviewPropertyEditorElement
};
//# sourceMappingURL=adpreview-property-editor.js.map
