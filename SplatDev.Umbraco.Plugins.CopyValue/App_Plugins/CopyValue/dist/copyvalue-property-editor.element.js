import { LitElement as E, html as p, nothing as C, css as A, property as v, state as h, customElement as k } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as g } from "@umbraco-cms/backoffice/event";
import { UMB_PROPERTY_DATASET_CONTEXT as B } from "@umbraco-cms/backoffice/property";
var V = Object.defineProperty, L = Object.getOwnPropertyDescriptor, b = (t) => {
  throw TypeError(t);
}, o = (t, e, r, a) => {
  for (var s = a > 1 ? void 0 : a ? L(e, r) : e, d = t.length - 1, f; d >= 0; d--)
    (f = t[d]) && (s = (a ? f(e, r, s) : f(s)) || s);
  return a && s && V(e, r, s), s;
}, y = (t, e, r) => e.has(t) || b("Cannot " + r), m = (t, e, r) => (y(t, e, "read from private field"), e.get(t)), w = (t, e, r) => e.has(t) ? b("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), S = (t, e, r, a) => (y(t, e, "write to private field"), e.set(t, r), r), l = (t, e, r) => (y(t, e, "access private method"), r), u, n, c, _, x, $;
let i = class extends P(E) {
  constructor() {
    super(), w(this, n), this.value = "", this.readonly = !1, this._sources = [], this._separator = " ", this._buttonLabel = "Copy from", this._overwrite = !1, this._preview = "", this._missing = [], w(this, u), this.consumeContext(B, (t) => {
      S(this, u, t), l(this, n, c).call(this);
    });
  }
  set config(t) {
    if (!t) return;
    const e = t.getValueByAlias("sourceAliases") ?? "";
    this._sources = e.split(",").map((r) => r.trim()).filter(Boolean), this._separator = t.getValueByAlias("separator") ?? " ", this._buttonLabel = t.getValueByAlias("buttonLabel") || "Copy from", this._overwrite = t.getValueByAlias("overwrite") ?? !1, l(this, n, c).call(this);
  }
  render() {
    const t = this._sources.length > 0;
    return p`
      <div class="row">
        <uui-input
          label="Value"
          .value=${this.value ?? ""}
          ?readonly=${this.readonly}
          @input=${l(this, n, $)}
        ></uui-input>
        <uui-button
          look="secondary"
          label=${this._buttonLabel}
          ?disabled=${this.readonly || !t || !this._preview}
          @click=${l(this, n, x)}
          >${this._buttonLabel}</uui-button
        >
      </div>

      ${t ? p`
            <p class="hint">
              Copies from ${this._sources.map((e, r) => p`${r ? ", " : ""}<code>${e}</code>`)}.
            </p>
            ${this._preview ? p`<div class="preview">${this._preview}</div>` : p`<div class="preview empty">
                  Nothing to copy yet — ${this._sources.length === 1 ? "that property is" : "those properties are"} empty.
                </div>`}
            ${this._missing.length > 0 && this._preview ? p`<p class="hint">
                  Skipped ${this._missing.map((e, r) => p`${r ? ", " : ""}<code>${e}</code>`)} —
                  empty or not on this item.
                </p>` : C}
          ` : p`<div class="warn">
            No source properties are set. Add them to this data type's
            <code>sourceAliases</code> — a comma-separated list of property aliases on the
            same item — and this button will fill the field from them.
          </div>`}
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
c = async function() {
  if (!m(this, u) || this._sources.length === 0) {
    this._preview = "", this._missing = [];
    return;
  }
  const t = [], e = [];
  for (const r of this._sources) {
    let a;
    try {
      a = await m(this, u).propertyValueByAlias(r);
    } catch {
      a = void 0;
    }
    const s = l(this, n, _).call(this, a);
    s ? t.push(s) : e.push(r);
  }
  this._preview = t.join(this._separator), this._missing = e;
};
_ = function(t) {
  if (t == null) return "";
  if (typeof t == "string") return t.trim();
  if (typeof t == "number" || typeof t == "boolean") return String(t);
  if (Array.isArray(t)) return t.map((e) => l(this, n, _).call(this, e)).filter(Boolean).join(this._separator);
  if (typeof t == "object") {
    const e = t;
    for (const r of ["name", "value", "url", "mediaKey"])
      if (typeof e[r] == "string") return e[r].trim();
  }
  return "";
};
x = async function() {
  this.readonly || (await l(this, n, c).call(this), this._preview && (this.value && !this._overwrite && !window.confirm(
    `Replace what is already here?

Current: ${this.value}
New: ${this._preview}`
  ) || (this.value = this._preview, this.dispatchEvent(new g()))));
};
$ = function(t) {
  this.value = t.target.value, this.dispatchEvent(new g());
};
i.styles = A`
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
o([
  v({ type: String })
], i.prototype, "value", 2);
o([
  v({ type: Boolean })
], i.prototype, "readonly", 2);
o([
  h()
], i.prototype, "_sources", 2);
o([
  h()
], i.prototype, "_separator", 2);
o([
  h()
], i.prototype, "_buttonLabel", 2);
o([
  h()
], i.prototype, "_overwrite", 2);
o([
  h()
], i.prototype, "_preview", 2);
o([
  h()
], i.prototype, "_missing", 2);
o([
  v({ attribute: !1 })
], i.prototype, "config", 1);
i = o([
  k("copyvalue-property-editor")
], i);
const z = i;
export {
  i as CopyValuePropertyEditorElement,
  z as default
};
