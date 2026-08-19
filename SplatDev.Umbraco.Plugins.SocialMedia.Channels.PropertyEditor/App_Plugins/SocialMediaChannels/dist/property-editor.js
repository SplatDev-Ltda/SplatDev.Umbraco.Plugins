import { customElement as G, LitElement as q, property as N, html as h, css as H } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as J } from "@umbraco-cms/backoffice/element-api";
var K = Object.create, k = Object.defineProperty, Q = Object.getOwnPropertyDescriptor, O = (e, a) => (a = Symbol[e]) ? a : Symbol.for("Symbol." + e), g = (e) => {
  throw TypeError(e);
}, V = (e, a, t) => a in e ? k(e, a, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[a] = t, P = (e, a) => k(e, "name", { value: a, configurable: !0 }), W = (e) => [, , , K((e == null ? void 0 : e[O("metadata")]) ?? null)], F = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"], _ = (e) => e !== void 0 && typeof e != "function" ? g("Function expected") : e, X = (e, a, t, r, s) => ({ kind: F[e], name: a, metadata: r, addInitializer: (l) => t._ ? g("Already initialized") : s.push(_(l || null)) }), Y = (e, a) => V(a, O("metadata"), e[3]), f = (e, a, t, r) => {
  for (var s = 0, l = e[a >> 1], c = l && l.length; s < c; s++) a & 1 ? l[s].call(t) : r = l[s].call(t, r);
  return r;
}, I = (e, a, t, r, s, l) => {
  var c, o, z, m, b, i = a & 7, y = !!(a & 8), d = !!(a & 16), C = i > 3 ? e.length + 1 : i ? y ? 1 : 2 : 0, D = F[i + 5], E = i > 3 && (e[C - 1] = []), j = e[C] || (e[C] = []), u = i && (!d && !y && (s = s.prototype), i < 5 && (i > 3 || !d) && Q(i < 4 ? s : { get [t]() {
    return x(this, l);
  }, set [t](n) {
    return M(this, l, n);
  } }, t));
  i ? d && i < 4 && P(l, (i > 2 ? "set " : i > 1 ? "get " : "") + t) : P(s, t);
  for (var $ = r.length - 1; $ >= 0; $--)
    m = X(i, t, z = {}, e[3], j), i && (m.static = y, m.private = d, b = m.access = { has: d ? (n) => Z(s, n) : (n) => t in n }, i ^ 3 && (b.get = d ? (n) => (i ^ 1 ? x : ee)(n, s, i ^ 4 ? l : u.get) : (n) => n[t]), i > 2 && (b.set = d ? (n, S) => M(n, s, S, i ^ 4 ? l : u.set) : (n, S) => n[t] = S)), o = (0, r[$])(i ? i < 4 ? d ? l : u[D] : i > 4 ? void 0 : { get: u.get, set: u.set } : s, m), z._ = 1, i ^ 4 || o === void 0 ? _(o) && (i > 4 ? E.unshift(o) : i ? d ? l = o : u[D] = o : s = o) : typeof o != "object" || o === null ? g("Object expected") : (_(c = o.get) && (u.get = c), _(c = o.set) && (u.set = c), _(c = o.init) && E.unshift(c));
  return i || Y(e, s), u && k(s, t, u), d ? i ^ 4 ? l : u : s;
}, T = (e, a, t) => a.has(e) || g("Cannot " + t), Z = (e, a) => Object(a) !== a ? g('Cannot use the "in" operator on this value') : e.has(a), x = (e, a, t) => (T(e, a, "read from private field"), t ? t.call(e) : a.get(e)), M = (e, a, t, r) => (T(e, a, "write to private field"), r ? r.call(e, t) : a.set(e, t), t), ee = (e, a, t) => (T(e, a, "access private method"), t), L, A, w, R, p;
const U = ["facebook", "twitter", "youtube", "rss", "instagram", "linkedin"], B = [
  { Name: "Circle", Folder: "circle", Bg: "#fff", Thumbnail: "/App_Plugins/SocialMediaChannels/themes/circle-social.jpg", Theme: { Id: "Circle", Description: "Circle Icons Set by IC Design", CreateDate: "2012-01-02", CreatedBy: "IC Design", Reference: "", ShowLabels: !0, Channels: U.map((e) => ({ Id: e, Name: e[0].toUpperCase() + e.slice(1), Image: `${e}.png`, Url: "" })) } },
  { Name: "Flat", Folder: "flat", Bg: "#fff", Thumbnail: "/App_Plugins/SocialMediaChannels/themes/flat.jpg", Theme: { Id: "Flat", Description: "A simple flat social icon set", CreateDate: "2012-01-02", CreatedBy: "SplatDev", Reference: "", ShowLabels: !0, Channels: U.map((e) => ({ Id: e, Name: e[0].toUpperCase() + e.slice(1), Image: `${e}.png`, Url: "" })) } }
];
R = [G("splatdev-social-media-channels-property-editor")];
class v extends (w = J(q), A = [N({ attribute: !1 })], L = [N({ type: Boolean })], w) {
  constructor() {
    super(...arguments), this.value = f(p, 8, this, null), f(p, 11, this), this.readonly = f(p, 12, this, !1), f(p, 15, this);
  }
  emit(a) {
    this.value = a, this.dispatchEvent(new CustomEvent("change", { bubbles: !0, composed: !0 }));
  }
  select(a) {
    const t = B.find((r) => r.Name === a);
    this.emit(t ? structuredClone(t) : null);
  }
  updateTheme(a) {
    if (!this.value) return;
    const t = structuredClone(this.value);
    t.Theme = a(t.Theme), this.emit(t);
  }
  render() {
    const a = this.value;
    return h`<div class="editor">
      <uui-select label="Choose theme" .value=${(a == null ? void 0 : a.Name) ?? ""} ?disabled=${this.readonly}
        @change=${(t) => this.select(t.target.value)}>
        <uui-option value="">Default</uui-option>
        ${B.map((t) => h`<uui-option value=${t.Name}>${t.Name}</uui-option>`)}
      </uui-select>
      ${a ? h`
        <uui-checkbox label="Show labels" .checked=${a.Theme.ShowLabels} ?disabled=${this.readonly}
          @change=${(t) => this.updateTheme((r) => ({ ...r, ShowLabels: t.target.checked }))}>Show labels</uui-checkbox>
        <div class="details"><strong>${a.Theme.Id}</strong> — ${a.Theme.Description}</div>
        <div class="swatches" aria-label="Background colour">
          ${["#fff", "#f2f2f2", "#000"].map((t) => h`<button class="swatch" title=${t} style="background:${t}" ?disabled=${this.readonly}
            @click=${() => this.emit({ ...a, Bg: t })}></button>`)}
        </div>
        <div class="channels">
          ${a.Theme.Channels.map((t, r) => h`<div class="channel">
            <span>${t.Name}</span>
            <uui-input label=${`${t.Name} profile URL`} .value=${t.Url} ?disabled=${this.readonly}
              @input=${(s) => this.updateTheme((l) => ({ ...l, Channels: l.Channels.map((c, o) => o === r ? { ...c, Url: s.target.value } : c) }))}></uui-input>
          </div>`)}
        </div>` : h`<p class="details">Select a theme to configure social profile links.</p>`}
    </div>`;
  }
}
p = W(w);
I(p, 5, "value", A, v);
I(p, 5, "readonly", L, v);
v = I(p, 0, "SocialMediaChannelsPropertyEditor", R, v);
v.styles = H`
    :host { display: block; }
    .editor { display: grid; gap: var(--uui-size-space-4); }
    .channels { display: grid; gap: var(--uui-size-space-2); }
    .channel { display: flex; align-items: center; gap: var(--uui-size-space-2); }
    .channel uui-input { flex: 1; }
    .details { color: var(--uui-color-text-alt); font-size: var(--uui-type-small-size); }
    .swatches { display: flex; gap: var(--uui-size-space-2); }
    .swatch { width: 2rem; height: 2rem; border: 1px solid var(--uui-color-border); border-radius: 50%; cursor: pointer; }
  `;
f(p, 1, v);
export {
  v as SocialMediaChannelsPropertyEditor
};
