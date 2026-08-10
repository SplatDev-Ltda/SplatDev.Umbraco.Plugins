var g = (a) => {
  throw TypeError(a);
};
var m = (a, e, r) => e.has(a) || g("Cannot " + r);
var u = (a, e, r) => (m(a, e, "read from private field"), r ? r.call(a) : e.get(a)), c = (a, e, r) => e.has(a) ? g("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(a) : e.set(a, r), p = (a, e, r, t) => (m(a, e, "write to private field"), t ? t.call(a, r) : e.set(a, r), r), o = (a, e, r) => (m(a, e, "access private method"), r);
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { css as z } from "@umbraco-cms/backoffice/external/lit";
const b = "/umbraco/whatsapp/api/v1";
var l, n, f, i, v, d, h;
class S {
  constructor(e) {
    c(this, i);
    c(this, l);
    c(this, n, null);
    c(this, f);
    p(this, l, e), p(this, f, new Promise((r) => {
      u(this, l).consumeContext(x, async (t) => {
        var s;
        try {
          p(this, n, await ((s = t == null ? void 0 : t.getLatestToken) == null ? void 0 : s.call(t)) ?? null);
        } catch {
          p(this, n, null);
        }
        r();
      }), setTimeout(r, 3e3);
    }));
  }
  getStatus() {
    return o(this, i, d).call(this, "/status");
  }
  getConversations() {
    return o(this, i, d).call(this, "/conversations");
  }
  getThread(e) {
    return o(this, i, d).call(this, `/conversations/${e}/messages`);
  }
  markRead(e) {
    return o(this, i, h).call(this, `/conversations/${e}/read`);
  }
  getTemplates() {
    return o(this, i, d).call(this, "/templates");
  }
  sendText(e, r) {
    return o(this, i, h).call(this, "/send/text", { to: e, body: r });
  }
  sendTemplate(e, r, t, s) {
    return o(this, i, h).call(this, "/send/template", {
      to: e,
      templateName: r,
      language: t,
      variables: s
    });
  }
}
l = new WeakMap(), n = new WeakMap(), f = new WeakMap(), i = new WeakSet(), v = async function(e, r = {}) {
  await u(this, f);
  const t = new Headers(r.headers);
  return t.set("Accept", "application/json"), u(this, n) && t.set("Authorization", `Bearer ${u(this, n)}`), fetch(`${b}${e}`, {
    ...r,
    credentials: "same-origin",
    headers: t
  });
}, d = async function(e) {
  const r = await o(this, i, v).call(this, e);
  if (!r.ok)
    throw new Error(await w(r));
  return await r.json();
}, h = async function(e, r) {
  const t = new Headers();
  r !== void 0 && t.set("Content-Type", "application/json");
  const s = await o(this, i, v).call(this, e, {
    method: "POST",
    headers: t,
    body: r === void 0 ? void 0 : JSON.stringify(r)
  });
  if (!s.ok)
    throw new Error(await w(s));
  return s.status === 204 ? void 0 : await s.json();
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
const $ = z`
  :host {
    display: block;
    padding: var(--uui-size-layout-1, 24px);
    color: var(--uui-color-text);
    font-family: var(--uui-font-family, inherit);
  }

  .head {
    margin-bottom: var(--uui-size-space-5, 16px);
  }

  .head h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 4px;
  }

  .head p {
    margin: 0;
    color: var(--uui-color-text-alt);
    font-size: 0.875rem;
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
  }

  .error {
    background: var(--uui-color-danger);
    color: var(--uui-color-selected-contrast, #fff);
    border-radius: var(--uui-border-radius, 3px);
    padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    font-size: 0.85rem;
    margin-bottom: var(--uui-size-space-4, 12px);
    overflow-wrap: anywhere;
  }

  .ok {
    background: var(--uui-color-positive);
    color: var(--uui-color-selected-contrast, #fff);
    border-radius: var(--uui-border-radius, 3px);
    padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    font-size: 0.85rem;
    margin-bottom: var(--uui-size-space-4, 12px);
    overflow-wrap: anywhere;
  }

  .warn {
    background: var(--uui-color-warning);
    color: var(--uui-color-warning-contrast, #000);
    border-radius: var(--uui-border-radius, 3px);
    padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    font-size: 0.85rem;
    margin-bottom: var(--uui-size-space-4, 12px);
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
  S as W,
  $ as s
};
//# sourceMappingURL=shared-styles-NOSfU0-v.js.map
