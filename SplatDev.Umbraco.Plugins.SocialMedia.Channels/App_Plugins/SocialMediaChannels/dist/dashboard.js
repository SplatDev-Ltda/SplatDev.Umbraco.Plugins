import { LitElement as U, nothing as g, html as n, css as W, state as r, customElement as z } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as q } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as L } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as G } from "@umbraco-cms/backoffice/notification";
function R(t) {
  let e = null, i = null;
  const p = t.consumeContext.bind(t), c = new Promise((d) => {
    p(L, async (h) => {
      var f;
      try {
        e = await ((f = h == null ? void 0 : h.getLatestToken) == null ? void 0 : f.call(h)) ?? null;
      } catch {
        e = null;
      }
      d();
    }), setTimeout(d, 3e3);
  });
  return p(G, (d) => {
    i = d;
  }), async (d, h = {}) => {
    await c;
    const f = new Headers(h.headers);
    e && !f.has("Authorization") && f.set("Authorization", `Bearer ${e}`);
    const m = await fetch(d, { ...h, credentials: "same-origin", headers: f });
    if (!m.ok) {
      const x = m.status === 401 || m.status === 403, D = x ? "Not authorised" : "Could not load data", k = x ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${m.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${m.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${m.status} from ${String(d)} — ${k}`), i == null || i.peek("danger", { data: { headline: D, message: k } });
    }
    return m;
  };
}
var F = Object.defineProperty, j = Object.getOwnPropertyDescriptor, S = (t) => {
  throw TypeError(t);
}, l = (t, e, i, p) => {
  for (var c = p > 1 ? void 0 : p ? j(e, i) : e, d = t.length - 1, h; d >= 0; d--)
    (h = t[d]) && (c = (p ? h(e, i, c) : h(c)) || c);
  return p && c && F(e, i, c), c;
}, E = (t, e, i) => e.has(t) || S("Cannot " + i), b = (t, e, i) => (E(t, e, "read from private field"), i ? i.call(t) : e.get(t)), C = (t, e, i) => e.has(t) ? S("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), a = (t, e, i) => (E(t, e, "access private method"), i), u, s, _, w, $, y, P, A, N, M, v, I, O;
const T = ["Facebook", "Instagram", "X", "LinkedIn", "YouTube", "TikTok", "Mastodon"];
let o = class extends q(U) {
  constructor() {
    super(...arguments), C(this, s), this._channels = [], this._posts = [], this._loading = !0, this._busy = "", this._loadError = null, this._message = null, this._newName = "", this._newPlatform = T[0], this._newToken = "", this._postChannelId = null, this._postContent = "", this._postMediaUrl = "", this._postWhen = "", C(this, u, R(this)), this._api = "/umbraco/api/SocialChannelsApi";
  }
  connectedCallback() {
    super.connectedCallback(), a(this, s, w).call(this);
  }
  render() {
    return n`
      <h1>Social channels</h1>
      <p class="description">
        The accounts this site can post to, and the posts queued to them. Access tokens are
        stored on the server and never sent back here.
      </p>

      ${this._loadError ? n`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : g}
      ${this._message ? n`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : g}

      <uui-box headline="Connected channels">
        ${this._loading ? n`<uui-loader></uui-loader>` : this._channels.length === 0 ? n`<p class="empty">No channels connected yet. Add one below.</p>` : n`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Platform</th><th>Status</th><th>Connected</th><th>Token expires</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._channels.map(
      (t) => n`
                        <tr>
                          <td>${t.name}</td>
                          <td>${t.platform}</td>
                          <td>
                            ${a(this, s, O).call(this, t)}
                            ${t.isActive ? g : n`<span class="tag">inactive</span>`}
                          </td>
                          <td class="num">${a(this, s, v).call(this, t.connectedAt)}</td>
                          <td class="num">${a(this, s, v).call(this, t.expiresAt)}</td>
                          <td>
                            <uui-button
                              compact
                              look="secondary"
                              color="danger"
                              label="Disconnect ${t.name}"
                              ?disabled=${this._busy === `remove:${t.id}`}
                              @click=${() => a(this, s, A).call(this, t)}
                              >Disconnect</uui-button
                            >
                          </td>
                        </tr>
                      `
    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      <uui-box headline="Connect a channel">
        <div class="grid">
          <div>
            <span class="field-label">Name</span>
            <uui-input
              placeholder="e.g. Company page"
              .value=${this._newName}
              @input=${(t) => this._newName = t.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Platform</span>
            <uui-select
              .value=${this._newPlatform}
              .options=${T.map((t) => ({ name: t, value: t, selected: t === this._newPlatform }))}
              @change=${(t) => this._newPlatform = t.target.value}
            ></uui-select>
          </div>
          <div>
            <span class="field-label">Access token</span>
            <uui-input
              type="password"
              placeholder="Paste the token"
              .value=${this._newToken}
              @input=${(t) => this._newToken = t.target.value}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          The token is stored server-side and is never returned to this page — the list
          above shows only whether one exists and whether it has expired.
        </p>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Connect channel"
            ?disabled=${this._busy === "add"}
            @click=${a(this, s, P)}
            >${this._busy === "add" ? "Connecting…" : "Connect channel"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Scheduled posts">
        ${this._posts.length === 0 ? n`<p class="empty">Nothing scheduled.</p>` : n`
              <table>
                <thead>
                  <tr><th>Channel</th><th>Content</th><th>Goes out</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  ${this._posts.map(
      (t) => n`
                      <tr>
                        <td>${a(this, s, I).call(this, t.channelId)}</td>
                        <td>${t.content}${t.mediaUrl ? n`<div class="hint">${t.mediaUrl}</div>` : g}</td>
                        <td class="num">${a(this, s, v).call(this, t.scheduledAt)}</td>
                        <td>
                          <span class="tag ${t.status === "failed" ? "bad" : t.status === "published" ? "good" : ""}"
                            >${t.status}</span
                          >
                          ${t.errorMessage ? n`<div class="hint">${t.errorMessage}</div>` : g}
                        </td>
                        <td>
                          <uui-button
                            compact
                            look="secondary"
                            color="danger"
                            label="Remove post"
                            ?disabled=${this._busy === `post:${t.id}`}
                            @click=${() => a(this, s, M).call(this, t)}
                            >Remove</uui-button
                          >
                        </td>
                      </tr>
                    `
    )}
                </tbody>
              </table>
            `}
      </uui-box>

      <uui-box headline="Schedule a post">
        <div class="grid">
          <div>
            <span class="field-label">Channel</span>
            <uui-select
              .options=${this._channels.map((t) => ({
      name: `${t.name} (${t.platform})`,
      value: String(t.id),
      selected: t.id === this._postChannelId
    }))}
              @change=${(t) => this._postChannelId = Number(t.target.value)}
            ></uui-select>
          </div>
          <div>
            <span class="field-label">When</span>
            <uui-input
              type="datetime-local"
              .value=${this._postWhen}
              @input=${(t) => this._postWhen = t.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Media URL (optional)</span>
            <uui-input
              placeholder="https://…"
              .value=${this._postMediaUrl}
              @input=${(t) => this._postMediaUrl = t.target.value}
            ></uui-input>
          </div>
        </div>
        <div style="margin-top:14px;">
          <span class="field-label">Content</span>
          <uui-textarea
            rows="3"
            .value=${this._postContent}
            @input=${(t) => this._postContent = t.target.value}
          ></uui-textarea>
        </div>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Schedule post"
            ?disabled=${this._busy === "schedule" || this._channels.length === 0}
            @click=${a(this, s, N)}
            >${this._busy === "schedule" ? "Scheduling…" : "Schedule post"}</uui-button
          >
          ${this._channels.length === 0 ? n`<span class="hint">Connect a channel before scheduling.</span>` : g}
        </div>
      </uui-box>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
_ = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to manage social channels. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
w = async function() {
  this._loading = !0, await Promise.all([a(this, s, $).call(this), a(this, s, y).call(this)]), this._loading = !1;
};
$ = async function() {
  try {
    const t = await b(this, u).call(this, `${this._api}/GetChannels`);
    a(this, s, _).call(this, t) && (this._channels = await t.json(), this._postChannelId === null && this._channels.length && (this._postChannelId = this._channels[0].id));
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
  }
};
y = async function() {
  try {
    const t = await b(this, u).call(this, `${this._api}/GetPosts`);
    a(this, s, _).call(this, t) && (this._posts = await t.json());
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
  }
};
P = async function() {
  const t = this._newName.trim();
  if (!t) {
    this._message = { ok: !1, text: "Give the channel a name." };
    return;
  }
  if (!this._newToken.trim()) {
    this._message = { ok: !1, text: "An access token is required to post to this channel." };
    return;
  }
  this._busy = "add";
  try {
    const e = await b(this, u).call(this, `${this._api}/AddChannel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: t,
        platform: this._newPlatform,
        accessToken: this._newToken,
        isActive: !0
      })
    });
    a(this, s, _).call(this, e) && (this._message = { ok: !0, text: `Connected ${t}.` }, this._newName = "", this._newToken = "", await a(this, s, $).call(this));
  } catch {
    this._message = { ok: !1, text: "Could not connect that channel." };
  } finally {
    this._busy = "";
  }
};
A = async function(t) {
  this._busy = `remove:${t.id}`;
  try {
    const e = await b(this, u).call(this, `${this._api}/RemoveChannel?id=${t.id}`, {
      method: "DELETE"
    });
    (a(this, s, _).call(this, e) || e.status === 204) && (this._message = { ok: !0, text: `Disconnected ${t.name}.` }, await a(this, s, w).call(this));
  } catch {
    this._message = { ok: !1, text: `Could not disconnect ${t.name}.` };
  } finally {
    this._busy = "";
  }
};
N = async function() {
  if (this._postChannelId === null) {
    this._message = { ok: !1, text: "Connect a channel first." };
    return;
  }
  if (!this._postContent.trim()) {
    this._message = { ok: !1, text: "Write something to post." };
    return;
  }
  if (!this._postWhen) {
    this._message = { ok: !1, text: "Choose when it should go out." };
    return;
  }
  this._busy = "schedule";
  try {
    const t = await b(this, u).call(this, `${this._api}/SchedulePost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: this._postChannelId,
        content: this._postContent,
        mediaUrl: this._postMediaUrl.trim() || null,
        scheduledAt: new Date(this._postWhen).toISOString(),
        status: "pending"
      })
    });
    a(this, s, _).call(this, t) && (this._message = { ok: !0, text: "Post scheduled." }, this._postContent = "", this._postMediaUrl = "", this._postWhen = "", await a(this, s, y).call(this));
  } catch {
    this._message = { ok: !1, text: "Could not schedule that post." };
  } finally {
    this._busy = "";
  }
};
M = async function(t) {
  this._busy = `post:${t.id}`;
  try {
    const e = await b(this, u).call(this, `${this._api}/DeletePost?id=${t.id}`, {
      method: "DELETE"
    });
    (a(this, s, _).call(this, e) || e.status === 204) && (this._message = { ok: !0, text: "Post removed." }, await a(this, s, y).call(this));
  } catch {
    this._message = { ok: !1, text: "Could not remove that post." };
  } finally {
    this._busy = "";
  }
};
v = function(t) {
  if (!t) return "—";
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? t : e.toLocaleString();
};
I = function(t) {
  var e;
  return ((e = this._channels.find((i) => i.id === t)) == null ? void 0 : e.name) ?? `#${t}`;
};
O = function(t) {
  return t.hasAccessToken ? t.tokenExpired ? n`<span class="tag warn">token expired</span>` : n`<span class="tag good">connected</span>` : n`<span class="tag bad">no token</span>`;
};
o.styles = W`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6); margin-right: 4px;
    }
    .tag.warn { background: #fef3c7; color: #92400e; }
    .tag.bad { background: #fee2e2; color: #991b1b; }
    .tag.good { background: #d1fae5; color: #065f46; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }
    uui-input, uui-textarea, uui-select { width: 100%; }

    .msg, .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;
l([
  r()
], o.prototype, "_channels", 2);
l([
  r()
], o.prototype, "_posts", 2);
l([
  r()
], o.prototype, "_loading", 2);
l([
  r()
], o.prototype, "_busy", 2);
l([
  r()
], o.prototype, "_loadError", 2);
l([
  r()
], o.prototype, "_message", 2);
l([
  r()
], o.prototype, "_newName", 2);
l([
  r()
], o.prototype, "_newPlatform", 2);
l([
  r()
], o.prototype, "_newToken", 2);
l([
  r()
], o.prototype, "_postChannelId", 2);
l([
  r()
], o.prototype, "_postContent", 2);
l([
  r()
], o.prototype, "_postMediaUrl", 2);
l([
  r()
], o.prototype, "_postWhen", 2);
o = l([
  z("splatdev-social-channels-dashboard")
], o);
const Y = o;
export {
  o as SplatdevSocialMediaChannelsDashboardElement,
  Y as default
};
