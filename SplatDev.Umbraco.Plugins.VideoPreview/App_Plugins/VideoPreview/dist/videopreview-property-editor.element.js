import { LitElement as T, nothing as u, html as d, css as C, property as b, state as m, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as U } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as I } from "@umbraco-cms/backoffice/event";
import { UMB_AUTH_CONTEXT as A } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as O } from "@umbraco-cms/backoffice/notification";
function V(e) {
  let t = null, i = null;
  const s = e.consumeContext.bind(e), a = new Promise((r) => {
    s(A, async (o) => {
      var h;
      try {
        t = await ((h = o == null ? void 0 : o.getLatestToken) == null ? void 0 : h.call(o)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return s(O, (r) => {
    i = r;
  }), async (r, o = {}) => {
    await a;
    const h = new Headers(o.headers);
    t && !h.has("Authorization") && h.set("Authorization", `Bearer ${t}`);
    const l = await fetch(r, { ...o, credentials: "same-origin", headers: h });
    if (!l.ok) {
      const w = l.status === 401 || l.status === 403, E = w ? "Not authorised" : "Could not load data", g = w ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(r)} — ${g}`), i == null || i.peek("danger", { data: { headline: E, message: g } });
    }
    return l;
  };
}
var z = Object.defineProperty, M = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, c = (e, t, i, s) => {
  for (var a = s > 1 ? void 0 : s ? M(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (a = (s ? o(t, i, a) : o(a)) || a);
  return s && a && z(t, i, a), a;
}, k = (e, t, i) => t.has(e) || $("Cannot " + i), N = (e, t, i) => (k(e, t, "read from private field"), i ? i.call(e) : t.get(e)), y = (e, t, i) => t.has(e) ? $("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), v = (e, t, i) => (k(e, t, "access private method"), i), _, p, f, x;
let n = class extends U(T) {
  constructor() {
    super(...arguments), y(this, p), y(this, _, V(this)), this.value = "", this.readonly = !1, this._info = null, this._checking = !1, this._unresolved = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.value && v(this, p, f).call(this, this.value);
  }
  render() {
    var e;
    return d`
      <uui-input
        label="Video URL"
        placeholder="https://www.youtube.com/watch?v=…"
        .value=${this.value ?? ""}
        ?readonly=${this.readonly}
        @input=${v(this, p, x)}
        @change=${() => v(this, p, f).call(this, this.value)}
        @blur=${() => v(this, p, f).call(this, this.value)}
      ></uui-input>

      ${this._checking ? d`<p class="hint">Checking…</p>` : u}

      ${(e = this._info) != null && e.thumbnailUrl ? d`
            <div class="preview">
              <img src=${this._info.thumbnailUrl} alt=${this._info.title || "Video thumbnail"} loading="lazy" />
              <div class="meta">
                ${this._info.title ? d`<div><strong>${this._info.title}</strong></div>` : u}
                ${this._info.provider ? d`<div>Provider: ${this._info.provider}</div>` : u}
                ${this._info.videoId ? d`<div>Id: <code>${this._info.videoId}</code></div>` : u}
              </div>
            </div>
          ` : u}

      ${this._unresolved && this.value ? d`<div class="warn">
            That URL did not resolve to a video. This plugin understands YouTube, Vimeo
            and Dailymotion links — the page will show no thumbnail for anything else.
          </div>` : u}
    `;
  }
};
_ = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
f = async function(e) {
  const t = e.trim();
  if (!t) {
    this._info = null, this._unresolved = !1;
    return;
  }
  this._checking = !0, this._unresolved = !1;
  try {
    const i = await N(this, _).call(this, `/umbraco/api/videopreview/GetVideoInfo?url=${encodeURIComponent(t)}`);
    i.ok ? this._info = await i.json() : (this._info = null, this._unresolved = !0);
  } catch {
    this._info = null, this._unresolved = !0;
  } finally {
    this._checking = !1;
  }
};
x = function(e) {
  this.value = e.target.value, this.dispatchEvent(new I());
};
n.styles = C`
    :host { display: block; }
    uui-input { width: 100%; }
    .preview { margin-top: 10px; display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
    img {
      width: 200px; max-width: 100%; border-radius: 4px;
      border: 1px solid var(--uui-color-border, #e5e7eb);
    }
    .meta { font-size: 0.86rem; }
    .meta div { margin-bottom: 3px; }
    .hint { margin: 6px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin-top: 8px; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px;
    }
  `;
c([
  b({ type: String })
], n.prototype, "value", 2);
c([
  b({ type: Boolean })
], n.prototype, "readonly", 2);
c([
  m()
], n.prototype, "_info", 2);
c([
  m()
], n.prototype, "_checking", 2);
c([
  m()
], n.prototype, "_unresolved", 2);
n = c([
  P("videopreview-property-editor")
], n);
const W = n;
export {
  n as VideoPreviewPropertyEditorElement,
  W as default
};
