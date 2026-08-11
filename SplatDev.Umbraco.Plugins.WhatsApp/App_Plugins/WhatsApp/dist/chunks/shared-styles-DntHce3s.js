var v = (a) => {
  throw TypeError(a);
};
var f = (a, e, t) => e.has(a) || v("Cannot " + t);
var l = (a, e, t) => (f(a, e, "read from private field"), t ? t.call(a) : e.get(a)), d = (a, e, t) => e.has(a) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(a) : e.set(a, t), h = (a, e, t, o) => (f(a, e, "write to private field"), o ? o.call(a, t) : e.set(a, t), t), i = (a, e, t) => (f(a, e, "access private method"), t);
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { css as b } from "@umbraco-cms/backoffice/external/lit";
const y = "/umbraco/whatsapp/api/v1";
var m, s, g, r, p, u, c;
class C {
  constructor(e) {
    d(this, r);
    d(this, m);
    d(this, s, null);
    d(this, g);
    h(this, m, e), h(this, g, new Promise((t) => {
      l(this, m).consumeContext(x, async (o) => {
        var n;
        try {
          h(this, s, await ((n = o == null ? void 0 : o.getLatestToken) == null ? void 0 : n.call(o)) ?? null);
        } catch {
          h(this, s, null);
        }
        t();
      }), setTimeout(t, 3e3);
    }));
  }
  getStatus() {
    return i(this, r, u).call(this, "/status");
  }
  getConversations() {
    return i(this, r, u).call(this, "/conversations");
  }
  getThread(e) {
    return i(this, r, u).call(this, `/conversations/${e}/messages`);
  }
  markRead(e) {
    return i(this, r, c).call(this, `/conversations/${e}/read`);
  }
  /**
   * Tells the server someone is watching the inbox, which suppresses the
   * unattended-message email. Failures are swallowed: a missed heartbeat should send an
   * extra email, never break the UI.
   */
  async heartbeat() {
    try {
      await i(this, r, c).call(this, "/heartbeat");
    } catch {
    }
  }
  getTemplates() {
    return i(this, r, u).call(this, "/templates");
  }
  sendText(e, t) {
    return i(this, r, c).call(this, "/send/text", { to: e, body: t });
  }
  sendTemplate(e, t, o, n) {
    return i(this, r, c).call(this, "/send/template", {
      to: e,
      templateName: t,
      language: o,
      variables: n
    });
  }
  async getContacts(e) {
    const t = e != null && e.trim() ? `?search=${encodeURIComponent(e.trim())}` : "";
    return i(this, r, u).call(this, `/contacts${t}`);
  }
  /**
   * Returns null when the number has no contact yet. That is the normal state for every
   * new conversation, so the API answers 204 and this maps it to null rather than throwing.
   */
  async getContactByWaId(e) {
    const t = await i(this, r, p).call(this, `/contacts/by-wa-id/${encodeURIComponent(e)}`);
    if (t.status === 204) return null;
    if (!t.ok) throw new Error(await w(t));
    return await t.json();
  }
  async saveContact(e) {
    return i(this, r, c).call(this, "/contacts", e);
  }
  async deleteContact(e) {
    const t = await i(this, r, p).call(this, `/contacts/${e}`, { method: "DELETE" });
    if (!t.ok) throw new Error(await w(t));
  }
}
m = new WeakMap(), s = new WeakMap(), g = new WeakMap(), r = new WeakSet(), p = async function(e, t = {}) {
  await l(this, g);
  const o = new Headers(t.headers);
  return o.set("Accept", "application/json"), l(this, s) && o.set("Authorization", `Bearer ${l(this, s)}`), fetch(`${y}${e}`, {
    ...t,
    credentials: "same-origin",
    headers: o
  });
}, u = async function(e) {
  const t = await i(this, r, p).call(this, e);
  if (!t.ok)
    throw new Error(await w(t));
  return await t.json();
}, c = async function(e, t) {
  const o = new Headers();
  t !== void 0 && o.set("Content-Type", "application/json");
  const n = await i(this, r, p).call(this, e, {
    method: "POST",
    headers: o,
    body: t === void 0 ? void 0 : JSON.stringify(t)
  });
  if (!n.ok)
    throw new Error(await w(n));
  return n.status === 204 ? void 0 : await n.json();
};
async function w(a) {
  try {
    const e = await a.json();
    if (e != null && e.error)
      return e.code ? `${e.error} (code ${e.code})` : String(e.error);
  } catch {
  }
  return a.status === 401 || a.status === 403 ? "Not authorised. Sign in to the backoffice again." : `Request failed: HTTP ${a.status}`;
}
const $ = b`
  :host {
    display: block;
    /* Fluid gutter: tight on a narrow split-view, generous on a wide monitor. */
    padding: clamp(16px, 2.5vw, 28px);
    color: var(--uui-color-text);
    font-family: var(--uui-font-family, inherit);

    /* Layered elevation. A single flat drop shadow is the giveaway of unconsidered UI;
       three low-alpha layers read as real depth and stay subtle on dark backgrounds. */
    --wa-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.04),
      0 8px 20px rgba(0, 0, 0, 0.05);
    --wa-radius: var(--uui-border-radius, 3px);

    /* Hairline that adapts to the theme instead of a hardcoded grey. */
    --wa-hairline: color-mix(in srgb, var(--uui-color-border) 70%, transparent);

    --wa-ease: cubic-bezier(0.2, 0, 0, 1);
  }

  .head {
    margin-bottom: var(--uui-size-space-5, 16px);
    /* Constrain prose to a comfortable measure rather than the full viewport. */
    max-width: 68ch;
  }

  .head h1 {
    /* Fluid, with tighter tracking as it scales up. */
    font-size: clamp(1.15rem, 1rem + 0.6vw, 1.45rem);
    font-weight: 600;
    letter-spacing: -0.015em;
    margin: 0 0 4px;
    text-wrap: balance;
  }

  .head p {
    margin: 0;
    color: var(--uui-color-text-alt);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Every interactive element gets a designed focus ring — never the browser default,
     never outline:none. Keyboard users are first-class. */
  :where(button, a, [tabindex], input, textarea, select):focus-visible {
    outline: 2px solid var(--uui-color-focus);
    outline-offset: 2px;
    border-radius: var(--wa-radius);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-3, 8px);
    flex-wrap: wrap;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-2, 4px);
    margin-bottom: var(--uui-size-space-4, 12px);
  }

  .field label {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .hint {
    color: var(--uui-color-text-alt);
    font-size: 0.8rem;
    margin: 0;
  }

  .empty {
    padding: var(--uui-size-space-6, 24px);
    text-align: center;
    color: var(--uui-color-text-alt);
    font-size: 0.875rem;
    line-height: 1.55;
    max-width: 44ch;
    margin-inline: auto;
    text-wrap: pretty;
  }

  /* Status banners share a shape; only the accent differs. Using a tinted surface with a
     coloured leading edge keeps them legible in dark mode, where a saturated fill with
     white text tends to glare.

     These are flex containers, so put the message in a single <span>. Passing bare text
     with an inline <strong>/<code> in it makes each of those a separate flex item, and
     the inline one gets squeezed into its own narrow column mid-sentence. */
  .error,
  .ok,
  .warn {
    border-radius: var(--wa-radius);
    padding: var(--uui-size-space-4, 12px) var(--uui-size-space-5, 16px);
    font-size: 0.85rem;
    line-height: 1.5;
    margin-bottom: var(--uui-size-space-4, 12px);
    overflow-wrap: anywhere;
    border-left: 3px solid currentColor;
    display: flex;
    gap: var(--uui-size-space-3, 8px);
    align-items: flex-start;
  }

  /* 12% tint keeps AA body contrast against the inherited text colour in both themes,
     rather than relying on a contrast token that only holds in one. */
  .error {
    background: color-mix(in srgb, var(--uui-color-danger) 12%, var(--uui-color-surface));
    color: var(--uui-color-danger-emphasis, var(--uui-color-text));
  }

  .ok {
    background: color-mix(in srgb, var(--uui-color-positive) 12%, var(--uui-color-surface));
    color: var(--uui-color-positive-emphasis, var(--uui-color-text));
  }

  .warn {
    background: color-mix(in srgb, var(--uui-color-warning) 18%, var(--uui-color-surface));
    color: var(--uui-color-text);
  }

  /* The message body inside a banner should read as normal text, not tinted. */
  .error > span,
  .ok > span,
  .warn > span {
    color: var(--uui-color-text);
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8rem;
    background: var(--uui-color-surface-alt);
    padding: 1px 5px;
    border-radius: 3px;
    overflow-wrap: anywhere;
  }

  /* Wide content must scroll inside its own box, never the page. */
  .scroll-x {
    overflow-x: auto;
  }
`;
export {
  C as W,
  $ as s
};
//# sourceMappingURL=shared-styles-DntHce3s.js.map
