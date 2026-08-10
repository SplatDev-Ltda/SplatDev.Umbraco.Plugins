import { LitElement as M, nothing as h, html as o, css as E, state as d, customElement as k } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as W } from "@umbraco-cms/backoffice/element-api";
import { W as C, s as I } from "./chunks/shared-styles-NOSfU0-v.js";
var P = Object.defineProperty, z = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, n = (e, t, s, l) => {
  for (var a = l > 1 ? void 0 : l ? z(t, s) : t, v = e.length - 1, m; v >= 0; v--)
    (m = e[v]) && (a = (l ? m(t, s, a) : m(a)) || a);
  return l && a && P(t, s, a), a;
}, y = (e, t, s) => t.has(e) || b("Cannot " + s), c = (e, t, s) => (y(e, t, "read from private field"), s ? s.call(e) : t.get(e)), f = (e, t, s) => t.has(e) ? b("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), u = (e, t, s) => (y(e, t, "access private method"), s), p, r, $, _, g, x, w, S, T;
let i = class extends W(M) {
  constructor() {
    super(...arguments), f(this, r), f(this, p, new C(this)), this._mode = "template", this._to = "", this._body = "", this._templates = [], this._selectedIndex = 0, this._variables = [], this._error = "", this._success = "", this._sending = !1, this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), u(this, r, $).call(this);
  }
  render() {
    return o`
      <div class="head">
        <h1>Send a message</h1>
        <p>Send an approved template, or a free-form message inside the 24-hour window.</p>
      </div>

      ${this._error ? o`<div class="error">${this._error}</div>` : h}
      ${this._success ? o`<div class="ok">${this._success}</div>` : h}

      <uui-box headline="Compose">
        <div class="modes">
          <uui-button
            look=${this._mode === "template" ? "primary" : "secondary"}
            label="Template message"
            @click=${() => {
      this._mode = "template";
    }}
          >Template</uui-button>
          <uui-button
            look=${this._mode === "text" ? "primary" : "secondary"}
            label="Free-form message"
            @click=${() => {
      this._mode = "text";
    }}
          >Free-form</uui-button>
        </div>

        <div class="field">
          <label>Recipient</label>
          <uui-input
            label="Recipient phone number"
            placeholder="+1 702 555 0100"
            .value=${this._to}
            @input=${(e) => {
      this._to = e.target.value;
    }}
          ></uui-input>
          <p class="hint">
            Include the country code. Spaces, dashes and a leading + are fine.
          </p>
        </div>

        ${this._mode === "template" ? u(this, r, S).call(this) : u(this, r, T).call(this)}

        <uui-button
          look="primary"
          color="positive"
          label="Send message"
          ?disabled=${this._sending || !this._to.trim()}
          @click=${() => void u(this, r, w).call(this)}
        >${this._sending ? "Sending…" : "Send"}</uui-button>
      </uui-box>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
$ = async function() {
  this._loading = !0;
  try {
    const e = await c(this, p).getTemplates();
    this._templates = e.filter((t) => t.isUsable), u(this, r, g).call(this);
  } catch (e) {
    this._error = e instanceof Error ? e.message : String(e);
  } finally {
    this._loading = !1;
  }
};
_ = function() {
  return this._templates[this._selectedIndex];
};
g = function() {
  var t;
  const e = ((t = c(this, r, _)) == null ? void 0 : t.variableCount) ?? 0;
  this._variables = Array.from({ length: e }, (s, l) => this._variables[l] ?? "");
};
x = function() {
  const e = c(this, r, _);
  if (!(e != null && e.bodyText)) return h;
  const t = e.bodyText.replace(/\{\{(\d+)\}\}/g, (s, l) => {
    const a = this._variables[Number(l) - 1];
    return a != null && a.trim() ? a : s;
  });
  return o`
      <div class="field">
        <label>Preview</label>
        <div class="preview">${t}</div>
      </div>
    `;
};
w = async function() {
  const e = this._to.trim();
  if (!(!e || this._sending)) {
    this._sending = !0, this._error = "", this._success = "";
    try {
      if (this._mode === "template") {
        const t = c(this, r, _);
        if (!t) {
          this._error = "Select a template first.";
          return;
        }
        const s = await c(this, p).sendTemplate(
          e,
          t.name,
          t.language,
          this._variables.length ? this._variables : void 0
        );
        this._success = `Template sent. Message id ${s.messageId}`;
      } else {
        const t = this._body.trim();
        if (!t) {
          this._error = "Enter a message.";
          return;
        }
        const s = await c(this, p).sendText(e, t);
        this._success = `Message sent. Message id ${s.messageId}`, this._body = "";
      }
    } catch (t) {
      this._error = t instanceof Error ? t.message : String(t);
    } finally {
      this._sending = !1;
    }
  }
};
S = function() {
  return this._loading ? o`<uui-loader></uui-loader>` : this._templates.length === 0 ? o`
        <div class="warn">
          No approved templates found. Create and get one approved in Meta Business Manager,
          then refresh.
        </div>
      ` : o`
      <div class="field">
        <label for="tpl">Template</label>
        <select
          id="tpl"
          @change=${(e) => {
    this._selectedIndex = e.target.selectedIndex, u(this, r, g).call(this);
  }}
        >
          ${this._templates.map(
    (e, t) => o`
              <option value=${t} ?selected=${t === this._selectedIndex}>
                ${e.name} (${e.language}) · ${e.category}
              </option>
            `
  )}
        </select>
      </div>

      ${this._variables.length > 0 ? o`
            <div class="field">
              <label>Variables</label>
              <div class="var-grid">
                ${this._variables.map(
    (e, t) => o`
                    <uui-input
                      label=${`Variable ${t + 1}`}
                      placeholder=${`{{${t + 1}}}`}
                      .value=${e}
                      @input=${(s) => {
      const l = [...this._variables];
      l[t] = s.target.value, this._variables = l;
    }}
                    ></uui-input>
                  `
  )}
              </div>
            </div>
          ` : h}
      ${u(this, r, x).call(this)}
    `;
};
T = function() {
  return o`
      <div class="warn">
        Free-form messages only reach people who messaged you in the last 24 hours.
        Outside that window WhatsApp rejects the send — use a template instead.
      </div>
      <div class="field">
        <label>Message</label>
        <uui-textarea
          label="Message"
          placeholder="Write your message…"
          .value=${this._body}
          @input=${(e) => {
    this._body = e.target.value;
  }}
        ></uui-textarea>
      </div>
    `;
};
i.styles = [
  I,
  E`
      uui-box {
        max-width: 640px;
      }

      .preview {
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        padding: var(--uui-size-space-4, 12px);
        font-size: 0.875rem;
        line-height: 1.5;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .modes {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        margin-bottom: var(--uui-size-space-4, 12px);
      }

      .var-grid {
        display: grid;
        gap: var(--uui-size-space-3, 8px);
      }

      select {
        font: inherit;
        color: inherit;
        padding: 6px 8px;
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        background: var(--uui-color-surface);
        width: 100%;
      }
    `
];
n([
  d()
], i.prototype, "_mode", 2);
n([
  d()
], i.prototype, "_to", 2);
n([
  d()
], i.prototype, "_body", 2);
n([
  d()
], i.prototype, "_templates", 2);
n([
  d()
], i.prototype, "_selectedIndex", 2);
n([
  d()
], i.prototype, "_variables", 2);
n([
  d()
], i.prototype, "_error", 2);
n([
  d()
], i.prototype, "_success", 2);
n([
  d()
], i.prototype, "_sending", 2);
n([
  d()
], i.prototype, "_loading", 2);
i = n([
  k("wa-send")
], i);
const V = i;
export {
  i as WaSendElement,
  V as default
};
//# sourceMappingURL=wa-send.element.js.map
