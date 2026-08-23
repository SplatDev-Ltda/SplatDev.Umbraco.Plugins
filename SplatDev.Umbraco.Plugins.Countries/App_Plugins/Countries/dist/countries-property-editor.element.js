var R = Object.create;
var O = Object.defineProperty;
var W = Object.getOwnPropertyDescriptor;
var F = (t, a) => (a = Symbol[t]) ? a : Symbol.for("Symbol." + t), g = (t) => {
  throw TypeError(t);
};
var Y = (t, a, e) => a in t ? O(t, a, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[a] = e;
var q = (t, a) => O(t, "name", { value: a, configurable: !0 });
var H = (t) => [, , , R((t == null ? void 0 : t[F("metadata")]) ?? null)], L = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"], w = (t) => t !== void 0 && typeof t != "function" ? g("Function expected") : t, Z = (t, a, e, i, o) => ({ kind: L[t], name: a, metadata: i, addInitializer: (n) => e._ ? g("Already initialized") : o.push(w(n || null)) }), E = (t, a) => Y(a, F("metadata"), t[3]), U = (t, a, e, i) => {
  for (var o = 0, n = t[a >> 1], l = n && n.length; o < l; o++) a & 1 ? n[o].call(e) : i = n[o].call(e, i);
  return i;
}, z = (t, a, e, i, o, n) => {
  var l, r, c, f, v, s = a & 7, x = !!(a & 8), d = !!(a & 16), C = s > 3 ? t.length + 1 : s ? x ? 1 : 2 : 0, M = L[s + 5], j = s > 3 && (t[C - 1] = []), Q = t[C] || (t[C] = []), h = s && (!d && !x && (o = o.prototype), s < 5 && (s > 3 || !d) && W(s < 4 ? o : { get [e]() {
    return $(this, n);
  }, set [e](u) {
    return k(this, n, u);
  } }, e));
  s ? d && s < 4 && q(n, (s > 2 ? "set " : s > 1 ? "get " : "") + e) : q(o, e);
  for (var A = i.length - 1; A >= 0; A--)
    f = Z(s, e, c = {}, t[3], Q), s && (f.static = x, f.private = d, v = f.access = { has: d ? (u) => P(o, u) : (u) => e in u }, s ^ 3 && (v.get = d ? (u) => (s ^ 1 ? $ : b)(u, o, s ^ 4 ? n : h.get) : (u) => u[e]), s > 2 && (v.set = d ? (u, N) => k(u, o, N, s ^ 4 ? n : h.set) : (u, N) => u[e] = N)), r = (0, i[A])(s ? s < 4 ? d ? n : h[M] : s > 4 ? void 0 : { get: h.get, set: h.set } : o, f), c._ = 1, s ^ 4 || r === void 0 ? w(r) && (s > 4 ? j.unshift(r) : s ? d ? n = r : h[M] = r : o = r) : typeof r != "object" || r === null ? g("Object expected") : (w(l = r.get) && (h.get = l), w(l = r.set) && (h.set = l), w(l = r.init) && j.unshift(l));
  return s || E(t, o), h && O(o, e, h), d ? s ^ 4 ? n : h : o;
};
var B = (t, a, e) => a.has(t) || g("Cannot " + e), P = (t, a) => Object(a) !== a ? g('Cannot use the "in" operator on this value') : t.has(a), $ = (t, a, e) => (B(t, a, "read from private field"), e ? e.call(t) : a.get(t)), I = (t, a, e) => a.has(t) ? g("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(t) : a.set(t, e), k = (t, a, e, i) => (B(t, a, "write to private field"), i ? i.call(t, e) : a.set(t, e), e), b = (t, a, e) => (B(t, a, "access private method"), e);
import { LitElement as ee, css as te, property as ae, html as T, nothing as se, customElement as ie } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as ne } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as oe } from "@umbraco-cms/backoffice/event";
import { UMB_AUTH_CONTEXT as re } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as le } from "@umbraco-cms/backoffice/notification";
function ue(t) {
  let a = null, e = null;
  const i = t.consumeContext.bind(t), o = new Promise((n) => {
    i(re, async (l) => {
      var r;
      try {
        a = await ((r = l == null ? void 0 : l.getLatestToken) == null ? void 0 : r.call(l)) ?? null;
      } catch {
        a = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return i(le, (n) => {
    e = n;
  }), async (n, l = {}) => {
    await o;
    const r = new Headers(l.headers);
    a && !r.has("Authorization") && r.set("Authorization", `Bearer ${a}`);
    const c = await fetch(n, { ...l, credentials: "same-origin", headers: r });
    if (!c.ok) {
      const f = c.status === 401 || c.status === 403, v = f ? "Not authorised" : "Could not load data", s = f ? `The backoffice token was ${a ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(n)} — ${s}`), e == null || e.peek("danger", { data: { headline: v, message: s } });
    }
    return c;
  };
}
var X, D, G, _, y, m, J, S, K;
G = [ie("countries-property-editor")];
let p = class p extends (D = ne(ee), X = [ae({ attribute: !1 })], D) {
  constructor() {
    super(...arguments);
    U(y, 5, this);
    I(this, m);
    I(this, _);
    this.value = "", this.readonly = !1, k(this, _, ue(this)), this._countries = [], this._loaded = !1, this._failed = !1, this._store = "alpha2";
  }
  set config(e) {
    if (!e) return;
    const i = e.getValueByAlias("storeValue");
    (i === "alpha3" || i === "name" || i === "numeric" || i === "alpha2") && (this._store = i);
  }
  connectedCallback() {
    super.connectedCallback(), b(this, m, J).call(this);
  }
  render() {
    return this._loaded ? this._failed || this._countries.length === 0 ? T`
        <div class="warn">
          The country list is empty. It is filled by this plugin's migration on start-up —
          if it stayed empty, check the log for the countries migration.
        </div>
        ${this.value ? T`<p class="hint">Currently holding <code>${this.value}</code>.</p>` : se}
      ` : T`
      <uui-select
        label="Country"
        ?disabled=${this.readonly}
        .value=${this.value ?? ""}
        @change=${b(this, m, K)}
        .options=${[
      { name: "— none —", value: "", selected: !this.value },
      ...this._countries.map((e) => ({
        name: e.name,
        value: b(this, m, S).call(this, e),
        selected: b(this, m, S).call(this, e) === this.value
      }))
    ]}
      ></uui-select>
      <p class="hint">
        Stores the ${this._store === "name" ? "country name" : this._store === "numeric" ? "numeric code" : `${this._store === "alpha3" ? "three" : "two"}-letter code`}.
      </p>
    ` : T`<uui-loader></uui-loader>`;
  }
};
y = H(D), _ = new WeakMap(), m = new WeakSet(), J = async function() {
  try {
    const e = await $(this, _).call(this, "/umbraco/api/countries/GetCountries");
    e.ok ? this._countries = await e.json() : this._failed = !0;
  } catch {
    this._failed = !0;
  } finally {
    this._loaded = !0;
  }
}, S = function(e) {
  switch (this._store) {
    case "alpha3":
      return e.alpha3Code;
    case "name":
      return e.name;
    case "numeric":
      return String(e.numCode);
    default:
      return e.alpha2Code;
  }
}, K = function(e) {
  const i = e.target.value;
  i !== this.value && (this.value = i, this.dispatchEvent(new oe()));
}, z(y, 3, "config", X, p), p = z(y, 0, "CountriesPropertyEditorElement", G, p), p.styles = te`
    :host { display: block; }
    uui-select { width: 100%; max-width: 420px; }
    .hint { margin: 6px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin: 6px 0 0; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px;
    }
  `, U(y, 1, p);
let V = p;
export {
  V as CountriesPropertyEditorElement,
  V as default
};
