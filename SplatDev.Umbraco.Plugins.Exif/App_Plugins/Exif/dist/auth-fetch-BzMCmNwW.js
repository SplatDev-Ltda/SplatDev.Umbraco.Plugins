import { UMB_AUTH_CONTEXT as d } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as m } from "@umbraco-cms/backoffice/notification";
function T(r) {
  let n = null, o = null;
  const u = r.consumeContext.bind(r), l = new Promise((t) => {
    u(d, async (e) => {
      var a;
      try {
        n = await ((a = e == null ? void 0 : e.getLatestToken) == null ? void 0 : a.call(e)) ?? null;
      } catch {
        n = null;
      }
      t();
    }), setTimeout(t, 3e3);
  });
  return u(m, (t) => {
    o = t;
  }), async (t, e = {}) => {
    await l;
    const a = new Headers(e.headers);
    n && !a.has("Authorization") && a.set("Authorization", `Bearer ${n}`);
    const s = await fetch(t, { ...e, credentials: "same-origin", headers: a });
    if (!s.ok) {
      const i = s.status === 401 || s.status === 403, c = i ? "Not authorised" : "Could not load data", h = i ? `The backoffice token was ${n ? "sent but rejected" : "not available"} (${s.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${s.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${s.status} from ${String(t)} — ${h}`), o == null || o.peek("danger", { data: { headline: c, message: h } });
    }
    return s;
  };
}
export {
  T as c
};
