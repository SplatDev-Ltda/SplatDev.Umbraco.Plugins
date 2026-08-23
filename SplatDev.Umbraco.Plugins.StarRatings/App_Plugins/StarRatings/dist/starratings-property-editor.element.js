import { LitElement as w, html as l, nothing as E, css as C, property as P, state as u, customElement as R } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as T } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_DATASET_CONTEXT as $ } from "@umbraco-cms/backoffice/property";
import { c as b } from "./chunks/auth-fetch-BzMCmNwW.js";
var S = Object.defineProperty, O = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, p = (t, a, e, n) => {
  for (var r = n > 1 ? void 0 : n ? O(a, e) : a, i = t.length - 1, o; i >= 0; i--)
    (o = t[i]) && (r = (n ? o(a, e, r) : o(r)) || r);
  return n && r && S(a, e, r), r;
}, m = (t, a, e) => a.has(t) || g("Cannot " + e), M = (t, a, e) => (m(t, a, "read from private field"), e ? e.call(t) : a.get(t)), _ = (t, a, e) => a.has(t) ? g("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(t) : a.set(t, e), c = (t, a, e) => (m(t, a, "access private method"), e), f, h, v, d;
let s = class extends T(w) {
  constructor() {
    super(), _(this, h), _(this, f, b(this)), this.value = "", this._node = null, this._rating = null, this._loaded = !1, this.consumeContext($, (t) => {
      var e;
      const a = (e = t == null ? void 0 : t.getUnique) == null ? void 0 : e.call(t);
      a && (this._node = a), c(this, h, d).call(this);
    });
  }
  connectedCallback() {
    super.connectedCallback(), c(this, h, d).call(this);
  }
  render() {
    var n, r, i, o;
    if (!this._node) return l`<p class="hint">This page has not been saved yet, so nothing has rated it.</p>`;
    if (!this._loaded) return l`<uui-loader></uui-loader>`;
    const t = ((n = this._rating) == null ? void 0 : n.average) ?? ((r = this._rating) == null ? void 0 : r.averageRating) ?? 0, a = ((i = this._rating) == null ? void 0 : i.count) ?? ((o = this._rating) == null ? void 0 : o.totalRatings) ?? 0;
    if (!a)
      return l`<p class="hint">No ratings yet for this page.</p>`;
    const e = Math.round(t);
    return l`
      <div class="row">
        <span class="stars" aria-label="${t.toFixed(1)} out of 5">
          ${[1, 2, 3, 4, 5].map((y) => l`<span class=${y <= e ? "" : "off"}>★</span>`)}
        </span>
        <span class="num">${t.toFixed(1)}</span>
        <span>from ${a} rating${a === 1 ? "" : "s"}</span>
      </div>
      <p class="hint">
        These come from visitors, so they are shown here rather than edited — changing them
        by hand would make the average say something that is not true.
      </p>
      ${E}
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakSet();
v = function() {
  const t = window.location.pathname.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return t ? t[0] : null;
};
d = async function() {
  if (this._node ?? (this._node = c(this, h, v).call(this)), !!this._node)
    try {
      const t = await M(this, f).call(this, `/umbraco/api/starratings/GetRating?contentKey=${encodeURIComponent(this._node)}`);
      t.ok && (this._rating = await t.json());
    } catch {
      this._rating = null;
    } finally {
      this._loaded = !0;
    }
};
s.styles = C`
    :host { display: block; }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .stars { font-size: 1.35rem; letter-spacing: 2px; color: #d8a012; line-height: 1; }
    .stars .off { color: var(--uui-color-border, #d1d5db); }
    .num { font-variant-numeric: tabular-nums; font-weight: 700; }
    .hint { margin: 8px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
  `;
p([
  P({ type: String })
], s.prototype, "value", 2);
p([
  u()
], s.prototype, "_node", 2);
p([
  u()
], s.prototype, "_rating", 2);
p([
  u()
], s.prototype, "_loaded", 2);
s = p([
  R("starratings-property-editor")
], s);
const F = s;
export {
  s as StarRatingsPropertyEditorElement,
  F as default
};
