import { LitElement as A, html as l, nothing as p, css as z, state as b, customElement as G } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as q } from "@umbraco-cms/backoffice/notification";
function B(e) {
  let t = null, s = null;
  const i = e.consumeContext.bind(e), c = new Promise((r) => {
    i(U, async (n) => {
      var h;
      try {
        t = await ((h = n == null ? void 0 : n.getLatestToken) == null ? void 0 : h.call(n)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return i(q, (r) => {
    s = r;
  }), async (r, n = {}) => {
    await c;
    const h = new Headers(n.headers);
    t && !h.has("Authorization") && h.set("Authorization", `Bearer ${t}`);
    const d = await fetch(r, { ...n, credentials: "same-origin", headers: h });
    if (!d.ok) {
      const $ = d.status === 401 || d.status === 403, O = $ ? "Not authorised" : "Could not load data", w = $ ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${d.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${d.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${d.status} from ${String(r)} — ${w}`), s == null || s.peek("danger", { data: { headline: O, message: w } });
    }
    return d;
  };
}
var D = Object.defineProperty, I = Object.getOwnPropertyDescriptor, S = (e) => {
  throw TypeError(e);
}, g = (e, t, s, i) => {
  for (var c = i > 1 ? void 0 : i ? I(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (c = (i ? n(t, s, c) : n(c)) || c);
  return i && c && D(t, s, c), c;
}, T = (e, t, s) => t.has(e) || S("Cannot " + s), M = (e, t, s) => (T(e, t, "read from private field"), s ? s.call(e) : t.get(e)), k = (e, t, s) => t.has(e) ? S("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), o = (e, t, s) => (T(e, t, "access private method"), s), v, a, E, y, C, x, f, _, N;
const m = "/umbraco/api/membernotifications";
let u = class extends P(A) {
  constructor() {
    super(...arguments), k(this, a), k(this, v, B(this)), this._loading = !0, this._error = null, this._saved = !1, this._groups = [];
  }
  connectedCallback() {
    super.connectedCallback(), o(this, a, E).call(this);
  }
  render() {
    if (this._loading) return l`<uui-loader></uui-loader>`;
    const e = this._settings;
    return l`
      <umb-body-layout headline="Member notifications">
        ${this._error ? l`
          <div class="error">
            <strong>Could not load these settings.</strong>
            <div>${this._error}</div>
          </div>` : p}

        ${e ? l`
          <uui-box headline="General">
            <div class="row">
              <uui-toggle
                label="Raise notifications"
                ?checked=${e.enabled}
                @change=${(t) => {
      e.enabled = t.target.checked, this.requestUpdate();
    }}></uui-toggle>
              <div class="hint">Off means no event writes anything, whatever the rules below say.</div>
            </div>
            <div class="row">
              <uui-label for="retention">Keep notifications for</uui-label>
              <uui-input
                id="retention" type="number" min="0" max="3650"
                .value=${String(e.retentionDays)}
                @change=${(t) => {
      e.retentionDays = Number(t.target.value), this.requestUpdate();
    }}></uui-input>
              <div class="hint">days — 0 keeps them forever. Failed sign-ins accumulate quickly on a public site.</div>
            </div>
          </uui-box>

          ${o(this, a, _).call(this, e, "Member")}
          ${o(this, a, _).call(this, e, "Backoffice user")}

          <div class="actions">
            <uui-button look="primary" label="Save" @click=${() => o(this, a, C).call(this)}></uui-button>
            ${this._saved ? l`<span class="ok">Saved.</span>` : p}
          </div>` : p}
      </umb-body-layout>`;
  }
};
v = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
E = async function() {
  this._loading = !0, this._error = null;
  try {
    const [e, t] = await Promise.all([
      o(this, a, y).call(this, `${m}/Settings`),
      o(this, a, y).call(this, `${m}/MemberGroups`)
    ]);
    this._settings = e, this._groups = t;
  } catch (e) {
    this._error = e instanceof Error ? e.message : String(e);
  } finally {
    this._loading = !1;
  }
};
y = async function(e) {
  const t = await M(this, v).call(this, e);
  if (!t.ok) throw new Error(`${e.replace(m, "")} answered ${t.status}`);
  return await t.json();
};
C = async function() {
  if (this._settings) {
    this._saved = !1;
    try {
      const { enabled: e, retentionDays: t, rules: s } = this._settings, i = await M(this, v).call(this, `${m}/Save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: e, retentionDays: t, rules: s })
      });
      if (!i.ok) throw new Error(`Save answered ${i.status}`);
      this._saved = !0, setTimeout(() => this._saved = !1, 4e3);
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    }
  }
};
x = function(e) {
  var s;
  const t = this._settings;
  return (s = t.rules)[e] ?? (s[e] = { enabled: !1, notifySelf: !1, notifyMemberGroups: [], title: "", body: "" }), t.rules[e];
};
f = function(e, t) {
  Object.assign(o(this, a, x).call(this, e), t), this.requestUpdate();
};
_ = function(e, t) {
  const s = e.events.filter((i) => i.category === t);
  return s.length ? l`
      <uui-box headline="${t} events">
        ${t === "Backoffice user" ? l`<p class="hint boxed">
              These have no member behind them, so they can only be sent to a member group —
              a security team, typically. "Notify the person it happened to" is unavailable
              for this reason rather than merely switched off.
            </p>` : p}

        ${s.map((i) => o(this, a, N).call(this, i))}
      </uui-box>` : p;
};
N = function(e) {
  const t = o(this, a, x).call(this, e.key);
  return l`
      <div class="event ${t.enabled ? "on" : ""}">
        <div class="head">
          <uui-toggle
            label="${e.label}"
            ?checked=${t.enabled}
            @change=${(s) => o(this, a, f).call(this, e.key, { enabled: s.target.checked })}></uui-toggle>
          <span class="hint">${e.description}</span>
        </div>

        ${t.enabled ? l`
          <div class="body">
            <label class="who">
              <input
                type="checkbox"
                .checked=${t.notifySelf}
                ?disabled=${!e.supportsSelf}
                @change=${(s) => o(this, a, f).call(this, e.key, { notifySelf: s.target.checked })} />
              Notify the person it happened to
              ${e.supportsSelf ? p : l`<span class="hint">— not available for backoffice events</span>`}
            </label>

            <div class="groups">
              <div class="hint">Also notify members of:</div>
              ${this._groups.length === 0 ? l`<span class="hint">This site has no member groups.</span>` : this._groups.map((s) => l`
                    <label class="chip">
                      <input
                        type="checkbox"
                        .checked=${t.notifyMemberGroups.includes(s)}
                        @change=${(i) => {
    const r = i.target.checked ? [...t.notifyMemberGroups, s] : t.notifyMemberGroups.filter((n) => n !== s);
    o(this, a, f).call(this, e.key, { notifyMemberGroups: r });
  }} />
                      ${s}
                    </label>`)}
            </div>

            <uui-input
              label="Title"
              .value=${t.title}
              @change=${(s) => o(this, a, f).call(this, e.key, { title: s.target.value })}></uui-input>
            <uui-textarea
              label="Body"
              .value=${t.body}
              @change=${(s) => o(this, a, f).call(this, e.key, { body: s.target.value })}></uui-textarea>
            <div class="hint">Tokens: ${e.tokens.map((s) => l`<code>${s}</code> `)}</div>
          </div>` : p}
      </div>`;
};
u.styles = z`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    uui-box { margin-bottom: 16px; }
    .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    .hint { color: var(--uui-color-text-alt); font-size: 12px; }
    .hint.boxed { border-left: 3px solid var(--uui-color-border); padding-left: 10px; margin: 0 0 12px; }
    .event { border-top: 1px solid var(--uui-color-border); padding: 12px 0; }
    .event:first-of-type { border-top: none; }
    .event .head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
    .event .body { margin: 10px 0 0 8px; display: grid; gap: 10px; max-width: 720px; }
    .who { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .groups { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .chip { display: inline-flex; align-items: center; gap: 5px; font-size: 13px;
            border: 1px solid var(--uui-color-border); border-radius: 12px; padding: 2px 10px; }
    .actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
    .ok { color: var(--uui-color-positive); font-size: 13px; }
    .error { border-left: 4px solid var(--uui-color-danger); background: var(--uui-color-surface-alt);
             padding: 12px 16px; margin-bottom: 16px; }
    code { font-size: 12px; }
  `;
g([
  b()
], u.prototype, "_loading", 2);
g([
  b()
], u.prototype, "_error", 2);
g([
  b()
], u.prototype, "_saved", 2);
g([
  b()
], u.prototype, "_settings", 2);
g([
  b()
], u.prototype, "_groups", 2);
u = g([
  G("membernotifications-settings")
], u);
const L = u;
export {
  u as MemberNotificationsSettingsElement,
  L as default
};
