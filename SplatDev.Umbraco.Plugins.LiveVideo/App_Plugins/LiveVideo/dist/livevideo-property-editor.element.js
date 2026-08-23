import { LitElement as E, nothing as T, html as m, css as k, property as g, state as v, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent as O } from "@umbraco-cms/backoffice/event";
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as L } from "@umbraco-cms/backoffice/notification";
function S(e) {
  let t = null, a = null;
  const n = e.consumeContext.bind(e), r = new Promise((i) => {
    n(U, async (s) => {
      var p;
      try {
        t = await ((p = s == null ? void 0 : s.getLatestToken) == null ? void 0 : p.call(s)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return n(L, (i) => {
    a = i;
  }), async (i, s = {}) => {
    await r;
    const p = new Headers(s.headers);
    t && !p.has("Authorization") && p.set("Authorization", `Bearer ${t}`);
    const h = await fetch(i, { ...s, credentials: "same-origin", headers: p });
    if (!h.ok) {
      const w = h.status === 401 || h.status === 403, C = w ? "Not authorised" : "Could not load data", y = w ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${h.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${h.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${h.status} from ${String(i)} — ${y}`), a == null || a.peek("danger", { data: { headline: C, message: y } });
    }
    return h;
  };
}
var I = Object.defineProperty, M = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, d = (e, t, a, n) => {
  for (var r = n > 1 ? void 0 : n ? M(t, a) : t, i = e.length - 1, s; i >= 0; i--)
    (s = e[i]) && (r = (n ? s(t, a, r) : s(r)) || r);
  return n && r && I(t, a, r), r;
}, x = (e, t, a) => t.has(e) || $("Cannot " + a), N = (e, t, a) => (x(e, t, "read from private field"), a ? a.call(e) : t.get(e)), b = (e, t, a) => t.has(e) ? $("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), c = (e, t, a) => (x(e, t, "access private method"), a), _, o, f, u;
const z = ["youtube", "twitch"];
let l = class extends A(E) {
  constructor() {
    super(...arguments), b(this, o), b(this, _, S(this)), this.value = "", this.readonly = !1, this._platform = "youtube", this._channel = "", this._resolved = null, this._failed = !1;
  }
  connectedCallback() {
    super.connectedCallback();
    const [e, ...t] = (this.value ?? "").split(":");
    t.length && (this._platform = e, this._channel = t.join(":"), c(this, o, u).call(this));
  }
  render() {
    return m`
      <div class="row">
        <div>
          <span class="label">Platform</span>
          <uui-select
            label="Platform"
            ?disabled=${this.readonly}
            .value=${this._platform}
            @change=${(e) => {
      this._platform = e.target.value, c(this, o, f).call(this), c(this, o, u).call(this);
    }}
            .options=${z.map((e) => ({ name: e, value: e, selected: e === this._platform }))}
          ></uui-select>
        </div>
        <div style="flex:1 1 240px">
          <span class="label">Channel</span>
          <uui-input
            label="Channel"
            placeholder="channel id or handle"
            ?readonly=${this.readonly}
            .value=${this._channel}
            @input=${(e) => this._channel = e.target.value}
            @change=${() => {
      c(this, o, f).call(this), c(this, o, u).call(this);
    }}
            @blur=${() => {
      c(this, o, f).call(this), c(this, o, u).call(this);
    }}
          ></uui-input>
        </div>
      </div>

      ${this._resolved ? m`<div class="embed">
            <iframe
              src=${this._resolved}
              width="360"
              height="203"
              frameborder="0"
              allowfullscreen
              title="Live stream preview"
            ></iframe>
          </div>` : T}

      ${this._failed && this._channel ? m`<div class="warn">
            No embed came back for that channel on ${this._platform}. The page will show
            nothing until it resolves.
          </div>` : m`<p class="hint">Stored as <code>platform:channel</code>.</p>`}
    `;
  }
};
_ = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
f = function() {
  const e = this._channel.trim() ? `${this._platform}:${this._channel.trim()}` : "";
  e !== this.value && (this.value = e, this.dispatchEvent(new O()));
};
u = async function() {
  const e = this._channel.trim();
  if (!e) {
    this._resolved = null, this._failed = !1;
    return;
  }
  try {
    const t = await N(this, _).call(this, `/umbraco/api/livevideo/GetEmbed?platform=${encodeURIComponent(this._platform)}&channelId=${encodeURIComponent(e)}`);
    if (t.ok) {
      const a = await t.json();
      this._resolved = (a == null ? void 0 : a.embedUrl) ?? (a == null ? void 0 : a.url) ?? (a == null ? void 0 : a.embed) ?? null, this._failed = this._resolved === null;
    } else
      this._resolved = null, this._failed = !0;
  } catch {
    this._resolved = null, this._failed = !0;
  }
};
l.styles = k`
    :host { display: block; }
    .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    uui-select { min-width: 150px; }
    uui-input { flex: 1 1 240px; }
    .label {
      display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 5px;
    }
    .embed { margin-top: 10px; }
    .embed iframe, .embed ::slotted(iframe) { max-width: 100%; }
    .hint { margin: 7px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin-top: 8px; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
  `;
d([
  g({ type: String })
], l.prototype, "value", 2);
d([
  g({ type: Boolean })
], l.prototype, "readonly", 2);
d([
  v()
], l.prototype, "_platform", 2);
d([
  v()
], l.prototype, "_channel", 2);
d([
  v()
], l.prototype, "_resolved", 2);
d([
  v()
], l.prototype, "_failed", 2);
l = d([
  P("livevideo-property-editor")
], l);
const W = l;
export {
  l as LiveVideoPropertyEditorElement,
  W as default
};
