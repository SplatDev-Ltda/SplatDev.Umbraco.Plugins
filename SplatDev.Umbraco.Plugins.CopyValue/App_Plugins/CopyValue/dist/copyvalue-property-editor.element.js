import { LitElement as A, html as p, nothing as k, css as P, property as g, state as c, customElement as B } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as V } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as x } from "@umbraco-cms/backoffice/event";
import { UMB_PROPERTY_DATASET_CONTEXT as L } from "@umbraco-cms/backoffice/property";
var S = Object.defineProperty, T = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, a = (t, e, i, n) => {
  for (var l = n > 1 ? void 0 : n ? T(e, i) : e, v = t.length - 1, y; v >= 0; v--)
    (y = t[v]) && (l = (n ? y(e, i, l) : y(l)) || l);
  return n && l && S(e, i, l), l;
}, b = (t, e, i) => e.has(t) || $("Cannot " + i), h = (t, e, i) => (b(t, e, "read from private field"), e.get(t)), m = (t, e, i) => e.has(t) ? $("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), M = (t, e, i, n) => (b(t, e, "write to private field"), e.set(t, i), i), o = (t, e, i) => (b(t, e, "access private method"), i), f, u, s, _, d, w, E, C;
let r = class extends V(A) {
  constructor() {
    super(), m(this, s), this.value = "", this.readonly = !1, this._sources = [], this._separator = " ", this._buttonLabel = "Copy from", this._overwrite = !1, this._preview = "", this._missing = [], m(this, f), m(this, u, /* @__PURE__ */ new Map()), this.consumeContext(L, (t) => {
      M(this, f, t), o(this, s, _).call(this);
    });
  }
  set config(t) {
    if (!t) return;
    const e = t.getValueByAlias("sourceAliases") ?? "";
    this._sources = e.split(",").map((i) => i.trim()).filter(Boolean), this._separator = t.getValueByAlias("separator") ?? " ", this._buttonLabel = t.getValueByAlias("buttonLabel") || "Copy from", this._overwrite = t.getValueByAlias("overwrite") ?? !1, o(this, s, _).call(this);
  }
  render() {
    const t = this._sources.length > 0;
    return p`
      <div class="row">
        <uui-input
          label="Value"
          .value=${this.value ?? ""}
          ?readonly=${this.readonly}
          @input=${o(this, s, C)}
        ></uui-input>
        <uui-button
          look="secondary"
          label=${this._buttonLabel}
          ?disabled=${this.readonly || !t || !this._preview}
          @click=${o(this, s, E)}
          >${this._buttonLabel}</uui-button
        >
      </div>

      ${t ? p`
            <p class="hint">
              Copies from ${this._sources.map((e, i) => p`${i ? ", " : ""}<code>${e}</code>`)}.
            </p>
            ${this._preview ? p`<div class="preview">${this._preview}</div>` : p`<div class="preview empty">
                  Nothing to copy yet — ${this._sources.length === 1 ? "that property is" : "those properties are"} empty.
                </div>`}
            ${this._missing.length > 0 && this._preview ? p`<p class="hint">
                  Skipped ${this._missing.map((e, i) => p`${i ? ", " : ""}<code>${e}</code>`)} —
                  empty or not on this item.
                </p>` : k}
          ` : p`<div class="warn">
            No source properties are set. Add them to this data type's
            <code>sourceAliases</code> — a comma-separated list of property aliases on the
            same item — and this button will fill the field from them.
          </div>`}
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
_ = async function() {
  if (!h(this, f) || this._sources.length === 0) {
    h(this, u).clear(), o(this, s, d).call(this);
    return;
  }
  for (const t of this._sources)
    try {
      const e = await h(this, f).propertyValueByAlias(t);
      e && typeof e.subscribe == "function" ? this.observe(
        e,
        (i) => {
          h(this, u).set(t, i), o(this, s, d).call(this);
        },
        `splatdev-copyvalue-${t}`
      ) : h(this, u).set(t, e);
    } catch {
      h(this, u).set(t, void 0);
    }
  o(this, s, d).call(this);
};
d = function() {
  const t = [], e = [];
  for (const i of this._sources) {
    const n = o(this, s, w).call(this, h(this, u).get(i));
    n ? t.push(n) : e.push(i);
  }
  this._preview = t.join(this._separator), this._missing = e;
};
w = function(t) {
  if (t == null) return "";
  if (typeof t == "string") return t.trim();
  if (typeof t == "number" || typeof t == "boolean") return String(t);
  if (Array.isArray(t)) return t.map((e) => o(this, s, w).call(this, e)).filter(Boolean).join(this._separator);
  if (typeof t == "object") {
    const e = t;
    for (const i of ["name", "value", "url", "mediaKey"])
      if (typeof e[i] == "string") return e[i].trim();
  }
  return "";
};
E = async function() {
  this.readonly || (await o(this, s, _).call(this), this._preview && (this.value && !this._overwrite && !window.confirm(
    `Replace what is already here?

Current: ${this.value}
New: ${this._preview}`
  ) || (this.value = this._preview, this.dispatchEvent(new x()))));
};
C = function(t) {
  this.value = t.target.value, this.dispatchEvent(new x());
};
r.styles = P`
    :host { display: block; }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    uui-input { flex: 1 1 260px; }
    .hint {
      margin: 6px 0 0;
      font-size: 0.83rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .preview {
      margin: 8px 0 0;
      padding: 8px 10px;
      border-radius: 3px;
      background: var(--uui-color-surface-alt, #f6f8fa);
      font-size: 0.86rem;
      word-break: break-word;
    }
    .preview.empty { color: var(--uui-color-text-alt, #6b7280); font-style: italic; }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6);
      padding: 1px 5px;
      border-radius: 3px;
    }
    .warn {
      margin: 8px 0 0;
      padding: 8px 10px;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
      font-size: 0.86rem;
      border-radius: 3px;
    }
  `;
a([
  g({ type: String })
], r.prototype, "value", 2);
a([
  g({ type: Boolean })
], r.prototype, "readonly", 2);
a([
  c()
], r.prototype, "_sources", 2);
a([
  c()
], r.prototype, "_separator", 2);
a([
  c()
], r.prototype, "_buttonLabel", 2);
a([
  c()
], r.prototype, "_overwrite", 2);
a([
  c()
], r.prototype, "_preview", 2);
a([
  c()
], r.prototype, "_missing", 2);
a([
  g({ attribute: !1 })
], r.prototype, "config", 1);
r = a([
  B("copyvalue-property-editor")
], r);
const D = r;
export {
  r as CopyValuePropertyEditorElement,
  D as default
};
