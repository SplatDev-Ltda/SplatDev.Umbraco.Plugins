var w = (t) => {
  throw TypeError(t);
};
var g = (t, e, r) => e.has(t) || w("Cannot " + r);
var u = (t, e, r) => (g(t, e, "read from private field"), r ? r.call(t) : e.get(t)), l = (t, e, r) => e.has(t) ? w("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), c = (t, e, r, a) => (g(t, e, "write to private field"), a ? a.call(t, r) : e.set(t, r), r), i = (t, e, r) => (g(t, e, "access private method"), r);
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { css as b } from "@umbraco-cms/backoffice/external/lit";
const y = "/umbraco/whatsapp/api/v1";
var h, n, m, o, f, d, p;
class A {
  constructor(e) {
    l(this, o);
    l(this, h);
    l(this, n, null);
    l(this, m);
    c(this, h, e), c(this, m, new Promise((r) => {
      u(this, h).consumeContext(x, async (a) => {
        var s;
        try {
          c(this, n, await ((s = a == null ? void 0 : a.getLatestToken) == null ? void 0 : s.call(a)) ?? null);
        } catch {
          c(this, n, null);
        }
        r();
      }), setTimeout(r, 3e3);
    }));
  }
  getStatus() {
    return i(this, o, d).call(this, "/status");
  }
  getConversations() {
    return i(this, o, d).call(this, "/conversations");
  }
  getThread(e) {
    return i(this, o, d).call(this, `/conversations/${e}/messages`);
  }
  markRead(e) {
    return i(this, o, p).call(this, `/conversations/${e}/read`);
  }
  /**
   * Tells the server someone is watching the inbox, which suppresses the
   * unattended-message email. Failures are swallowed: a missed heartbeat should send an
   * extra email, never break the UI.
   */
  async heartbeat() {
    try {
      await i(this, o, p).call(this, "/heartbeat");
    } catch {
    }
  }
  getTemplates() {
    return i(this, o, d).call(this, "/templates");
  }
  sendText(e, r) {
    return i(this, o, p).call(this, "/send/text", { to: e, body: r });
  }
  sendTemplate(e, r, a, s) {
    return i(this, o, p).call(this, "/send/template", {
      to: e,
      templateName: r,
      language: a,
      variables: s
    });
  }
}
h = new WeakMap(), n = new WeakMap(), m = new WeakMap(), o = new WeakSet(), f = async function(e, r = {}) {
  await u(this, m);
  const a = new Headers(r.headers);
  return a.set("Accept", "application/json"), u(this, n) && a.set("Authorization", `Bearer ${u(this, n)}`), fetch(`${y}${e}`, {
    ...r,
    credentials: "same-origin",
    headers: a
  });
}, d = async function(e) {
  const r = await i(this, o, f).call(this, e);
  if (!r.ok)
    throw new Error(await v(r));
  return await r.json();
}, p = async function(e, r) {
  const a = new Headers();
  r !== void 0 && a.set("Content-Type", "application/json");
  const s = await i(this, o, f).call(this, e, {
    method: "POST",
    headers: a,
    body: r === void 0 ? void 0 : JSON.stringify(r)
  });
  if (!s.ok)
    throw new Error(await v(s));
  return s.status === 204 ? void 0 : await s.json();
};
async function v(t) {
  try {
    const e = await t.json();
    if (e != null && e.error)
      return e.code ? `${e.error} (code ${e.code})` : String(e.error);
  } catch {
  }
  return t.status === 401 || t.status === 403 ? "Not authorised. Sign in to the backoffice again." : `Request failed: HTTP ${t.status}`;
}
const S = b`
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
     white text tends to glare. */
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
  A as W,
  S as s
};
//# sourceMappingURL=shared-styles-CFbg5_yF.js.map
