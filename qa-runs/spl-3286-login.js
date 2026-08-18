import { property as p, customElement as P, ifDefined as Le, html as l, css as A, when as Pe, nothing as R, query as ft, state as m, queryAssignedElements as sr, unsafeHTML as nr, until as ur } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as x } from "@umbraco-cms/backoffice/lit-element";
import { umbExtensionsRegistry as ge, UmbAppEntryPointExtensionInitializer as lr } from "@umbraco-cms/backoffice/extension-registry";
import { umbLocalizationRegistry as et } from "@umbraco-cms/backoffice/localization";
import { UmbRepositoryBase as dr } from "@umbraco-cms/backoffice/repository";
import { UmbLocalizationController as cr } from "@umbraco-cms/backoffice/localization-api";
import { isProblemDetailsLike as hr } from "@umbraco-cms/backoffice/resources";
import { UmbContextBase as pr, UmbControllerBase as mr } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as fr } from "@umbraco-cms/backoffice/context-api";
import { UmbBundleExtensionInitializer as gr, UmbServerExtensionRegistrator as wr } from "@umbraco-cms/backoffice/extension-api";
import { UUIIconRegistryEssential as vr } from "@umbraco-cms/backoffice/external/uui";
import { UmbServerConnection as br, UmbServerContext as yr } from "@umbraco-cms/backoffice/server";
const _r = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, r) => typeof r == "bigint" ? r.toString() : r
  )
}, Cr = ({
  onRequest: t,
  onSseError: e,
  onSseEvent: r,
  responseTransformer: o,
  responseValidator: a,
  sseDefaultRetryDelay: s,
  sseMaxRetryAttempts: i,
  sseMaxRetryDelay: n,
  sseSleepFn: d,
  url: c,
  ...u
}) => {
  let f;
  const te = d ?? ((h) => new Promise((v) => setTimeout(v, h)));
  return { stream: async function* () {
    let h = s ?? 3e3, v = 0;
    const q = u.signal ?? new AbortController().signal;
    for (; !q.aborted; ) {
      v++;
      const re = u.headers instanceof Headers ? u.headers : new Headers(u.headers);
      f !== void 0 && re.set("Last-Event-ID", f);
      try {
        const B = {
          redirect: "follow",
          ...u,
          body: u.serializedBody,
          headers: re,
          signal: q
        };
        let $ = new Request(c, B);
        t && ($ = await t(c, B));
        const b = await (u.fetch ?? globalThis.fetch)($);
        if (!b.ok)
          throw new Error(
            `SSE failed: ${b.status} ${b.statusText}`
          );
        if (!b.body) throw new Error("No body in SSE response");
        const z = b.body.pipeThrough(new TextDecoderStream()).getReader();
        let Ie = "";
        const Ze = () => {
          try {
            z.cancel();
          } catch {
          }
        };
        q.addEventListener("abort", Ze);
        try {
          for (; ; ) {
            const { done: rr, value: ar } = await z.read();
            if (rr) break;
            Ie += ar;
            const Qe = Ie.split(`

`);
            Ie = Qe.pop() ?? "";
            for (const or of Qe) {
              const ir = or.split(`
`), me = [];
              let Xe;
              for (const y of ir)
                if (y.startsWith("data:"))
                  me.push(y.replace(/^data:\s*/, ""));
                else if (y.startsWith("event:"))
                  Xe = y.replace(/^event:\s*/, "");
                else if (y.startsWith("id:"))
                  f = y.replace(/^id:\s*/, "");
                else if (y.startsWith("retry:")) {
                  const Ke = Number.parseInt(
                    y.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Ke) || (h = Ke);
                }
              let W, Ye = !1;
              if (me.length) {
                const y = me.join(`
`);
                try {
                  W = JSON.parse(y), Ye = !0;
                } catch {
                  W = y;
                }
              }
              Ye && (a && await a(W), o && (W = await o(W))), r?.({
                data: W,
                event: Xe,
                id: f,
                retry: h
              }), me.length && (yield W);
            }
          }
        } finally {
          q.removeEventListener("abort", Ze), z.releaseLock();
        }
        break;
      } catch (B) {
        if (e?.(B), i !== void 0 && v >= i)
          break;
        const $ = Math.min(
          h * 2 ** (v - 1),
          n ?? 3e4
        );
        await te($);
      }
    }
  }() };
}, Pr = (t) => {
  switch (t) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, xr = (t) => {
  switch (t) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, $r = (t) => {
  switch (t) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, gt = ({
  allowReserved: t,
  explode: e,
  name: r,
  style: o,
  value: a
}) => {
  if (!e) {
    const n = (t ? a : a.map((d) => encodeURIComponent(d))).join(xr(o));
    switch (o) {
      case "label":
        return `.${n}`;
      case "matrix":
        return `;${r}=${n}`;
      case "simple":
        return n;
      default:
        return `${r}=${n}`;
    }
  }
  const s = Pr(o), i = a.map((n) => o === "label" || o === "simple" ? t ? n : encodeURIComponent(n) : $e({
    allowReserved: t,
    name: r,
    value: n
  })).join(s);
  return o === "label" || o === "matrix" ? s + i : i;
}, $e = ({
  allowReserved: t,
  name: e,
  value: r
}) => {
  if (r == null)
    return "";
  if (typeof r == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${e}=${t ? r : encodeURIComponent(r)}`;
}, wt = ({
  allowReserved: t,
  explode: e,
  name: r,
  style: o,
  value: a,
  valueOnly: s
}) => {
  if (a instanceof Date)
    return s ? a.toISOString() : `${r}=${a.toISOString()}`;
  if (o !== "deepObject" && !e) {
    let d = [];
    Object.entries(a).forEach(([u, f]) => {
      d = [
        ...d,
        u,
        t ? f : encodeURIComponent(f)
      ];
    });
    const c = d.join(",");
    switch (o) {
      case "form":
        return `${r}=${c}`;
      case "label":
        return `.${c}`;
      case "matrix":
        return `;${r}=${c}`;
      default:
        return c;
    }
  }
  const i = $r(o), n = Object.entries(a).map(
    ([d, c]) => $e({
      allowReserved: t,
      name: o === "deepObject" ? `${r}[${d}]` : d,
      value: c
    })
  ).join(i);
  return o === "label" || o === "matrix" ? i + n : n;
}, zr = /\{[^{}]+\}/g, Er = ({ path: t, url: e }) => {
  let r = e;
  const o = e.match(zr);
  if (o)
    for (const a of o) {
      let s = !1, i = a.substring(1, a.length - 1), n = "simple";
      i.endsWith("*") && (s = !0, i = i.substring(0, i.length - 1)), i.startsWith(".") ? (i = i.substring(1), n = "label") : i.startsWith(";") && (i = i.substring(1), n = "matrix");
      const d = t[i];
      if (d == null)
        continue;
      if (Array.isArray(d)) {
        r = r.replace(
          a,
          gt({ explode: s, name: i, style: n, value: d })
        );
        continue;
      }
      if (typeof d == "object") {
        r = r.replace(
          a,
          wt({
            explode: s,
            name: i,
            style: n,
            value: d,
            valueOnly: !0
          })
        );
        continue;
      }
      if (n === "matrix") {
        r = r.replace(
          a,
          `;${$e({
            name: i,
            value: d
          })}`
        );
        continue;
      }
      const c = encodeURIComponent(
        n === "label" ? `.${d}` : d
      );
      r = r.replace(a, c);
    }
  return r;
}, kr = ({
  baseUrl: t,
  path: e,
  query: r,
  querySerializer: o,
  url: a
}) => {
  const s = a.startsWith("/") ? a : `/${a}`;
  let i = (t ?? "") + s;
  e && (i = Er({ path: e, url: i }));
  let n = r ? o(r) : "";
  return n.startsWith("?") && (n = n.substring(1)), n && (i += `?${n}`), i;
};
function Sr(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const Ir = async (t, e) => {
  const r = typeof e == "function" ? await e(t) : e;
  if (r)
    return t.scheme === "bearer" ? `Bearer ${r}` : t.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, vt = ({
  allowReserved: t,
  array: e,
  object: r
} = {}) => (a) => {
  const s = [];
  if (a && typeof a == "object")
    for (const i in a) {
      const n = a[i];
      if (n != null)
        if (Array.isArray(n)) {
          const d = gt({
            allowReserved: t,
            explode: !0,
            name: i,
            style: "form",
            value: n,
            ...e
          });
          d && s.push(d);
        } else if (typeof n == "object") {
          const d = wt({
            allowReserved: t,
            explode: !0,
            name: i,
            style: "deepObject",
            value: n,
            ...r
          });
          d && s.push(d);
        } else {
          const d = $e({
            allowReserved: t,
            name: i,
            value: n
          });
          d && s.push(d);
        }
    }
  return s.join("&");
}, Lr = (t) => {
  if (!t)
    return "stream";
  const e = t.split(";")[0]?.trim();
  if (e) {
    if (e.startsWith("application/json") || e.endsWith("+json"))
      return "json";
    if (e === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some(
      (r) => e.startsWith(r)
    ))
      return "blob";
    if (e.startsWith("text/"))
      return "text";
  }
}, Or = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, Tr = async ({
  security: t,
  ...e
}) => {
  for (const r of t) {
    if (Or(e, r.name))
      continue;
    const o = await Ir(r, e.auth);
    if (!o)
      continue;
    const a = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        e.query || (e.query = {}), e.query[a] = o;
        break;
      case "cookie":
        e.headers.append("Cookie", `${a}=${o}`);
        break;
      default:
        e.headers.set(a, o);
        break;
    }
  }
}, tt = (t) => kr({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : vt(t.querySerializer),
  url: t.url
}), rt = (t, e) => {
  const r = { ...t, ...e };
  return r.baseUrl?.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = bt(t.headers, e.headers), r;
}, Ur = (t) => {
  const e = [];
  return t.forEach((r, o) => {
    e.push([o, r]);
  }), e;
}, bt = (...t) => {
  const e = new Headers();
  for (const r of t) {
    if (!r)
      continue;
    const o = r instanceof Headers ? Ur(r) : Object.entries(r);
    for (const [a, s] of o)
      if (s === null)
        e.delete(a);
      else if (Array.isArray(s))
        for (const i of s)
          e.append(a, i);
      else s !== void 0 && e.set(
        a,
        typeof s == "object" ? JSON.stringify(s) : s
      );
  }
  return e;
};
class Oe {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(e) {
    const r = this.getInterceptorIndex(e);
    this.fns[r] && (this.fns[r] = null);
  }
  exists(e) {
    const r = this.getInterceptorIndex(e);
    return !!this.fns[r];
  }
  getInterceptorIndex(e) {
    return typeof e == "number" ? this.fns[e] ? e : -1 : this.fns.indexOf(e);
  }
  update(e, r) {
    const o = this.getInterceptorIndex(e);
    return this.fns[o] ? (this.fns[o] = r, e) : !1;
  }
  use(e) {
    return this.fns.push(e), this.fns.length - 1;
  }
}
const Dr = () => ({
  error: new Oe(),
  request: new Oe(),
  response: new Oe()
}), Mr = vt({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), Ar = {
  "Content-Type": "application/json"
}, yt = (t = {}) => ({
  ..._r,
  headers: Ar,
  parseAs: "auto",
  querySerializer: Mr,
  ...t
}), qr = (t = {}) => {
  let e = rt(yt(), t);
  const r = () => ({ ...e }), o = (c) => (e = rt(e, c), r()), a = Dr(), s = async (c) => {
    const u = {
      ...e,
      ...c,
      fetch: c.fetch ?? e.fetch ?? globalThis.fetch,
      headers: bt(e.headers, c.headers),
      serializedBody: void 0
    };
    u.security && await Tr({
      ...u,
      security: u.security
    }), u.requestValidator && await u.requestValidator(u), u.body !== void 0 && u.bodySerializer && (u.serializedBody = u.bodySerializer(u.body)), (u.body === void 0 || u.serializedBody === "") && u.headers.delete("Content-Type");
    const f = tt(u);
    return { opts: u, url: f };
  }, i = async (c) => {
    const { opts: u, url: f } = await s(c), te = {
      redirect: "follow",
      ...u,
      body: Sr(u)
    };
    let S = new Request(f, te);
    for (const g of a.request.fns)
      g && (S = await g(S, u));
    const pe = u.fetch;
    let h = await pe(S);
    for (const g of a.response.fns)
      g && (h = await g(h, S, u));
    const v = {
      request: S,
      response: h
    };
    if (h.ok) {
      const g = (u.parseAs === "auto" ? Lr(h.headers.get("Content-Type")) : u.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let z;
        switch (g) {
          case "arrayBuffer":
          case "blob":
          case "text":
            z = await h[g]();
            break;
          case "formData":
            z = new FormData();
            break;
          case "stream":
            z = h.body;
            break;
          default:
            z = {};
            break;
        }
        return u.responseStyle === "data" ? z : {
          data: z,
          ...v
        };
      }
      let b;
      switch (g) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          b = await h[g]();
          break;
        case "stream":
          return u.responseStyle === "data" ? h.body : {
            data: h.body,
            ...v
          };
      }
      return g === "json" && (u.responseValidator && await u.responseValidator(b), u.responseTransformer && (b = await u.responseTransformer(b))), u.responseStyle === "data" ? b : {
        data: b,
        ...v
      };
    }
    const q = await h.text();
    let re;
    try {
      re = JSON.parse(q);
    } catch {
    }
    const B = re ?? q;
    let $ = B;
    for (const g of a.error.fns)
      g && ($ = await g(B, h, S, u));
    if ($ = $ || {}, u.throwOnError)
      throw $;
    return u.responseStyle === "data" ? void 0 : {
      error: $,
      ...v
    };
  }, n = (c) => (u) => i({ ...u, method: c }), d = (c) => async (u) => {
    const { opts: f, url: te } = await s(u);
    return Cr({
      ...f,
      body: f.body,
      headers: f.headers,
      method: c,
      onRequest: async (S, pe) => {
        let h = new Request(S, pe);
        for (const v of a.request.fns)
          v && (h = await v(h, f));
        return h;
      },
      url: te
    });
  };
  return {
    buildUrl: tt,
    connect: n("CONNECT"),
    delete: n("DELETE"),
    get: n("GET"),
    getConfig: r,
    head: n("HEAD"),
    interceptors: a,
    options: n("OPTIONS"),
    patch: n("PATCH"),
    post: n("POST"),
    put: n("PUT"),
    request: i,
    setConfig: o,
    sse: {
      connect: d("CONNECT"),
      delete: d("DELETE"),
      get: d("GET"),
      head: d("HEAD"),
      options: d("OPTIONS"),
      patch: d("PATCH"),
      post: d("POST"),
      put: d("PUT"),
      trace: d("TRACE")
    },
    trace: n("TRACE")
  };
}, he = qr(yt()), Br = (t) => (t?.client ?? he).post({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/management/api/v1/security/forgot-password",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t?.headers
  }
}), Wr = (t) => (t?.client ?? he).post({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/management/api/v1/security/forgot-password/reset",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t?.headers
  }
}), Fr = (t) => (t?.client ?? he).post({
  url: "/umbraco/management/api/v1/security/forgot-password/verify",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t?.headers
  }
}), Rr = (t) => (t?.client ?? he).post({
  url: "/umbraco/management/api/v1/user/invite/create-password",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t?.headers
  }
}), Vr = (t) => (t?.client ?? he).post({
  url: "/umbraco/management/api/v1/user/invite/verify",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t?.headers
  }
});
class jr extends dr {
  #e = new cr(this);
  async login(e) {
    try {
      const r = new Request("/umbraco/management/api/v1/security/back-office/login", {
        method: "POST",
        body: JSON.stringify({
          username: e.username,
          password: e.password
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }), o = await fetch(r);
      if (!o.ok) {
        if (o.status === 402) {
          const a = await o.json();
          return {
            status: o.status,
            twoFactorView: a.twoFactorLoginView ?? "",
            twoFactorProviders: a.enabledTwoFactorProviderNames ?? []
          };
        }
        return {
          status: o.status,
          error: await this.#r(o)
        };
      }
      return {
        status: o.status,
        data: {
          username: e.username
        }
      };
    } catch (r) {
      return {
        status: 500,
        error: r instanceof Error ? r.message : this.#e.term("auth_receivedErrorFromServer")
      };
    }
  }
  async validateMfaCode(e, r) {
    try {
      const o = new Request("/umbraco/management/api/v1/security/back-office/verify-2fa", {
        method: "POST",
        body: JSON.stringify({
          code: e,
          provider: r
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }), a = await fetch(o);
      return a.ok ? {} : {
        error: a.status === 400 ? this.#e.term("auth_mfaInvalidCode") : await this.#r(a)
      };
    } catch (o) {
      return {
        error: o instanceof Error ? o.message : this.#e.term("auth_receivedErrorFromServer")
      };
    }
  }
  async resetPassword(e) {
    const { error: r } = await Br({
      body: {
        email: e
      }
    });
    return r ? {
      error: this.#t(r, "Could not reset the password")
    } : {};
  }
  async validatePasswordResetCode(e, r) {
    const { data: o, error: a } = await Fr({
      body: {
        user: {
          id: e
        },
        resetCode: r
      }
    });
    return a || !o ? {
      error: this.#t(a, "Could not validate the password reset code")
    } : o;
  }
  async newPassword(e, r, o) {
    const { error: a } = await Wr({
      body: {
        password: e,
        resetCode: r,
        user: {
          id: o
        }
      }
    });
    return a ? {
      error: this.#t(a, "Could not reset the password")
    } : {};
  }
  async validateInviteCode(e, r) {
    const { data: o, error: a } = await Vr({
      body: {
        token: e,
        user: {
          id: r
        }
      }
    });
    return a || !o ? {
      error: this.#t(a, "Could not validate the invite code")
    } : o;
  }
  async newInvitedUserPassword(e, r, o) {
    const { error: a } = await Rr({
      body: {
        password: e,
        token: r,
        user: {
          id: o
        }
      }
    });
    return a ? {
      error: this.#t(a, "Could not create a password for the invited user")
    } : {};
  }
  #t(e, r) {
    if (hr(e))
      return e.detail ?? e.title ?? void 0;
    if (!(e instanceof Error))
      return r ?? "An unknown error occurred.";
    if (e.name !== "CancelError")
      return e.message;
  }
  async #r(e) {
    switch (e.status) {
      case 400:
      case 401:
        return this.#e.term("auth_userFailedLogin");
      case 402:
        return this.#e.term("auth_mfaText");
      case 403:
        return this.#e.term("auth_userLockedOut");
      default:
        return this.#e.term("auth_receivedErrorFromServer");
    }
  }
}
class Nr extends pr {
  constructor() {
    super(...arguments), this.supportsPersistLogin = !1, this.twoFactorView = "", this.isMfaEnabled = !1, this.mfaProviders = [], this.#e = new jr(this), this.#t = "";
  }
  #e;
  #t;
  set returnPath(e) {
    this.#t = e;
  }
  /**
   * Gets the return path from the query string.
   *
   * It will first look for a `ReturnUrl` parameter, then a `returnPath` parameter, and finally the `returnPath` property.
   *
   * @returns The return path from the query string.
   */
  get returnPath() {
    const e = new URLSearchParams(window.location.search);
    let r = e.get("ReturnUrl") ?? e.get("returnPath") ?? this.#t;
    if (!r)
      return "";
    const o = new URL(r, window.location.origin);
    return o.origin !== window.location.origin ? "" : o.toString();
  }
  login(e) {
    return this.#e.login(e);
  }
  resetPassword(e) {
    return this.#e.resetPassword(e);
  }
  validatePasswordResetCode(e, r) {
    return this.#e.validatePasswordResetCode(e, r);
  }
  newPassword(e, r, o) {
    return this.#e.newPassword(e, r, o);
  }
  newInvitedUserPassword(e, r, o) {
    return this.#e.newInvitedUserPassword(e, r, o);
  }
  validateInviteCode(e, r) {
    return this.#e.validateInviteCode(e, r);
  }
  validateMfaCode(e, r) {
    return this.#e.validateMfaCode(e, r);
  }
}
const j = new fr("UmbAuthContext");
class Hr extends mr {
  constructor(e) {
    super(e), new gr(e, ge), new vr().attach(e), e.classList.add("uui-text"), e.classList.add("uui-font");
  }
  async register(e) {
    const r = window.location.origin, o = new br(e, r);
    new yr(this, {
      backofficePath: "/umbraco",
      serverUrl: r,
      serverConnection: o
    }), await new wr(this, ge).registerPublicExtensions().catch((a) => {
      console.error("Failed to register public extensions for the slim backoffice.", a);
    }), new lr(e, ge);
  }
}
const Gr = ".errormessage{color:var(--uui-color-invalid-standalone);display:none;margin-top:var(--uui-size-1)}.errormessage.active{display:block}uui-form-layout-item{margin-top:var(--uui-size-space-4);margin-bottom:var(--uui-size-space-4)}input{font-family:inherit;font-size:inherit}input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px var(--uui-color-surface) inset}#username-input{width:100%;height:var(--input-height);box-sizing:border-box;display:block;border:1px solid var(--uui-color-border);border-radius:var(--uui-border-radius);background-color:var(--uui-color-surface);padding:var(--uui-size-1, 3px) var(--uui-size-space-4, 9px)}#username-input:focus-within{border-color:var(--uui-input-border-color-focus, var(--uui-color-border-emphasis, #a1a1a1));outline:calc(2px * var(--uui-show-focus-outline, 1)) solid var(--uui-color-focus)}#username-input:hover:not(:focus-within){border-color:var(--uui-input-border-color-hover, var(--uui-color-border-standalone, #c2c2c2))}#password-show-toggle{color:var(--uui-color-default-standalone);display:inline-flex;justify-content:center;align-items:center;vertical-align:middle;min-width:24px;min-height:24px;border-color:transparent;background-color:transparent;padding:0;transition-property:color;transition-duration:.1s;transition-timing-function:linear}#password-show-toggle:hover{color:var(--uui-color-default-emphasis);cursor:pointer}#password-input-span{display:inline-flex;width:100%;align-items:center;flex-wrap:nowrap;position:relative;vertical-align:middle;column-gap:0;height:var(--input-height);box-sizing:border-box;border:1px solid var(--uui-color-border);border-radius:var(--uui-border-radius);background-color:var(--uui-color-surface);padding:var(--uui-size-1, 3px) var(--uui-size-space-4, 9px)}#password-input{flex-grow:1;align-self:stretch;min-width:0;display:block;border-style:none;padding:0;outline-style:none}#password-input-span:focus-within{border-color:var(--uui-input-border-color-focus, var(--uui-color-border-emphasis, #a1a1a1));outline:calc(2px * var(--uui-show-focus-outline, 1)) solid var(--uui-color-focus)}#password-input-span:hover:not(:focus-within){border-color:var(--uui-input-border-color-hover, var(--uui-color-border-standalone, #c2c2c2))}#password-input::-ms-reveal{display:none}", at = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">\r
	<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>\r
	<circle cx="12" cy="12" r="3"></circle>\r
</svg>`, Jr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">\r
	<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>\r
	<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>\r
	<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>\r
    <line x1="2" x2="22" y1="2" y2="22"></line>\r
</svg>`, Zr = [
  {
    name: "Auth Bundle",
    alias: "Umb.Auth.Bundle",
    type: "bundle",
    js: () => import("./manifests-Bs7kpaFX.js")
  }
];
var Qr = Object.defineProperty, Xr = Object.getOwnPropertyDescriptor, _t = (t) => {
  throw TypeError(t);
}, T = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? Xr(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && Qr(e, r, a), a;
}, Ct = (t, e, r) => e.has(t) || _t("Cannot " + r), Te = (t, e, r) => (Ct(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ot = (t, e, r) => e.has(t) ? _t("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), it = (t, e, r) => (Ct(t, e, "access private method"), r), oe, we, Pt, xt;
const st = (t) => {
  const e = document.createElement("input");
  return e.type = t.type, e.name = t.name, e.autocomplete = t.autocomplete, e.id = t.id, e.required = !0, e.inputMode = t.inputmode, e.setAttribute("aria-errormessage", t.errorId), e.autofocus = t.autofocus || !1, e.className = "input", e;
}, nt = (t) => {
  const e = document.createElement("label"), r = document.createElement("umb-localize");
  return r.key = t.localizeAlias, r.innerHTML = t.localizeFallback, e.htmlFor = t.forId, e.appendChild(r), e;
}, $t = (t) => {
  const e = document.createElement("div");
  return e.className = "errormessage", e.id = t, e.role = "alert", e;
}, Yr = (t) => {
  const e = document.createElement("button");
  return e.id = t.id, e.ariaLabel = t.ariaLabelShowPassword, e.name = t.name, e.type = "button", e.innerHTML = at, e.onclick = () => {
    const r = document.getElementById("password-input");
    r.type === "password" ? (r.type = "text", e.ariaLabel = t.ariaLabelHidePassword, e.innerHTML = Jr) : (r.type = "password", e.ariaLabel = t.ariaLabelShowPassword, e.innerHTML = at), r.focus();
  }, e;
}, Kr = (t) => {
  const e = document.createElement("span");
  return e.id = "password-show-toggle-span", e.appendChild(t), e;
}, ea = (t, e, r) => {
  const o = document.createElement("uui-form-layout-item"), a = e.getAttribute("aria-errormessage") || e.id + "-error";
  o.appendChild(t), o.appendChild(e);
  const s = $t(a);
  return o.appendChild(s), e.oninput = () => Q(e, s, r), e.onblur = () => Q(e, s, r), e.oninvalid = () => Q(e, s, r), o;
}, ta = (t, e, r, o) => {
  const a = document.createElement("uui-form-layout-item"), s = e.getAttribute("aria-errormessage") || e.id + "-error";
  a.appendChild(t);
  const i = document.createElement("span");
  i.id = "password-input-span", i.appendChild(e), i.appendChild(r), a.appendChild(i);
  const n = $t(s);
  return a.appendChild(n), e.oninput = () => Q(e, n, o), e.onblur = () => Q(e, n, o), e.oninvalid = () => Q(e, n, o), a;
}, Q = (t, e, r = "") => {
  if (e.innerHTML = "", t.validity.valid)
    t.removeAttribute("aria-invalid"), e.classList.remove("active"), e.ariaLive = "off";
  else {
    t.setAttribute("aria-invalid", "true");
    const o = document.createElement("umb-localize");
    o.innerHTML = t.validationMessage, o.key = r, e.appendChild(o), e.classList.add("active"), e.ariaLive = "assertive";
  }
};
let k = class extends x {
  constructor() {
    super(), ot(this, we), this.disableLocalLogin = !1, this.usernameIsEmail = !1, this.allowPasswordReset = !1, this.allowUserInvite = !1, ot(this, oe, new Nr(this, j)), this.addEventListener("umb-login-flow", (t) => {
      if (t instanceof CustomEvent && (this.flow = t.detail.flow || void 0, typeof t.detail.status < "u")) {
        const e = new URLSearchParams(window.location.search);
        t.detail.status === null ? e.delete("status") : e.set("status", t.detail.status);
        const r = window.location.pathname + "?" + e.toString();
        window.history.pushState(null, "", r);
      }
      this.requestUpdate();
    });
  }
  set returnPath(t) {
    Te(this, oe).returnPath = t;
  }
  get returnPath() {
    return Te(this, oe).returnPath;
  }
  connectedCallback() {
    super.connectedCallback(), this.lang && et.loadLanguage(this.lang), this.observe(et.currentLanguage, (t) => {
      t && (this.lang = t);
    });
  }
  async firstUpdated() {
    await new Hr(this).register(this), ge.registerMany(Zr), await it(this, we, Pt).call(this), it(this, we, xt).call(this);
  }
  render() {
    return l`
			<umb-auth-layout
				background-image=${Le(this.backgroundImage)}
				logo-image=${Le(this.logoImage)}
				logo-image-alternative=${Le(this.logoImageAlternative)}>
				${this._renderFlowAndStatus()}
			</umb-auth-layout>
		`;
  }
  _renderFlowAndStatus() {
    if (this.disableLocalLogin)
      return l`
				<umb-error-layout no-back-link>
					<umb-localize key="auth_localLoginDisabled"
						>Unfortunately, it is not possible to log in directly. It has been disabled by a login
						provider.</umb-localize
					>
				</umb-error-layout>
			`;
    const t = new URLSearchParams(window.location.search);
    let e = this.flow || t.get("flow")?.toLowerCase();
    const r = t.get("status");
    if (r === "resetCodeExpired")
      return l` <umb-error-layout message=${this.localize.term("auth_resetCodeExpired")}> </umb-error-layout>`;
    if (e === "invite-user" && r === "false")
      return l` <umb-error-layout message=${this.localize.term("auth_userInviteExpiredMessage")}>
			</umb-error-layout>`;
    switch (e && e === "mfa" && !Te(this, oe).isMfaEnabled && (e = void 0), e) {
      case "mfa":
        return l` <umb-mfa-page></umb-mfa-page>`;
      case "reset":
        return l` <umb-reset-password-page></umb-reset-password-page>`;
      case "reset-password":
        return l` <umb-new-password-page></umb-new-password-page>`;
      case "invite-user":
        return l` <umb-invite-page></umb-invite-page>`;
      default:
        return l`
					<umb-login-page ?allow-password-reset=${this.allowPasswordReset} ?username-is-email=${this.usernameIsEmail}>
						<slot></slot>
					</umb-login-page>
				`;
    }
  }
};
oe = /* @__PURE__ */ new WeakMap();
we = /* @__PURE__ */ new WeakSet();
Pt = async function() {
  return new Promise((t, e) => {
    let r = 0;
    const o = 40, a = setInterval(() => {
      if (r > o) {
        clearInterval(a), e("Localization not available");
        return;
      }
      if (this.localize.term("auth_showPassword") !== "auth_showPassword") {
        clearInterval(a), t();
        return;
      }
      r++;
    }, 50);
  });
};
xt = function() {
  const t = st({
    id: "username-input",
    type: "text",
    name: "username",
    autocomplete: "username",
    errorId: "username-input-error",
    inputmode: this.usernameIsEmail ? "email" : "",
    autofocus: !0
  }), e = st({
    id: "password-input",
    type: "password",
    name: "password",
    autocomplete: "current-password",
    errorId: "password-input-error",
    inputmode: ""
  }), r = Yr({
    id: "password-show-toggle",
    name: "password-show-toggle",
    ariaLabelShowPassword: this.localize.term("auth_showPassword"),
    ariaLabelHidePassword: this.localize.term("auth_hidePassword")
  }), o = Kr(r), a = nt({
    forId: "username-input",
    localizeAlias: this.usernameIsEmail ? "auth_email" : "auth_username",
    localizeFallback: this.usernameIsEmail ? "Email" : "Username"
  }), s = nt({
    forId: "password-input",
    localizeAlias: "auth_password",
    localizeFallback: "Password"
  }), i = ea(
    a,
    t,
    this.usernameIsEmail ? "auth_requiredEmailValidationMessage" : "auth_requiredUsernameValidationMessage"
  ), n = ta(
    s,
    e,
    o,
    "auth_requiredPasswordValidationMessage"
  ), d = document.createElement("style");
  d.innerHTML = Gr, document.head.appendChild(d);
  const c = document.createElement("form");
  c.id = "umb-login-form", c.name = "login-form", c.spellcheck = !1, c.setAttribute("novalidate", ""), c.appendChild(i), c.appendChild(n), this.insertAdjacentElement("beforeend", c);
};
T([
  p({ type: Boolean, attribute: "disable-local-login" })
], k.prototype, "disableLocalLogin", 2);
T([
  p({ attribute: "background-image" })
], k.prototype, "backgroundImage", 2);
T([
  p({ attribute: "logo-image" })
], k.prototype, "logoImage", 2);
T([
  p({ attribute: "logo-image-alternative" })
], k.prototype, "logoImageAlternative", 2);
T([
  p({ type: Boolean, attribute: "username-is-email" })
], k.prototype, "usernameIsEmail", 2);
T([
  p({ type: Boolean, attribute: "allow-password-reset" })
], k.prototype, "allowPasswordReset", 2);
T([
  p({ type: Boolean, attribute: "allow-user-invite" })
], k.prototype, "allowUserInvite", 2);
T([
  p({ attribute: "return-url" })
], k.prototype, "returnPath", 1);
k = T([
  P("umb-auth")
], k);
var ra = Object.defineProperty, aa = Object.getOwnPropertyDescriptor, zt = (t) => {
  throw TypeError(t);
}, ze = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? aa(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && ra(e, r, a), a;
}, oa = (t, e, r) => e.has(t) || zt("Cannot " + r), ia = (t, e, r) => e.has(t) ? zt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), ut = (t, e, r) => (oa(t, e, "access private method"), r), ve, Et, kt;
let X = class extends x {
  constructor() {
    super(...arguments), ia(this, ve);
  }
  updated(t) {
    super.updated(t), t.has("backgroundImage") && (this.style.setProperty("--logo-alternative-display", this.backgroundImage ? "none" : "unset"), this.style.setProperty("--image", `url('${this.backgroundImage}') no-repeat center center/cover`));
  }
  render() {
    return l`
			<div id=${this.backgroundImage ? "main" : "main-no-image"}>
				${ut(this, ve, Et).call(this)} ${ut(this, ve, kt).call(this)}
			</div>
			${Pe(
      this.logoImageAlternative,
      (t) => l`<img id="logo-on-background" src=${t} alt="logo" aria-hidden="true" />`
    )}
		`;
  }
};
ve = /* @__PURE__ */ new WeakSet();
Et = function() {
  return this.backgroundImage ? l`
			<div id="image-container">
				<div id="image">
					<svg
						id="curve-top"
						width="1746"
						height="1374"
						viewBox="0 0 1746 1374"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M8 1C61.5 722.5 206.5 1366.5 1745.5 1366.5" stroke="currentColor" stroke-width="15" />
					</svg>
					<svg
						id="curve-bottom"
						width="1364"
						height="552"
						viewBox="0 0 1364 552"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M1 8C387 24 1109 11 1357 548" stroke="currentColor" stroke-width="15" />
					</svg>

					${Pe(
    this.logoImage,
    (t) => l`<img id="logo-on-image" src=${t} alt="logo" aria-hidden="true" />`
  )}
				</div>
			</div>
		` : R;
};
kt = function() {
  return l`
			<div id="content-container">
				<div id="content">
					<slot></slot>
				</div>
			</div>
		`;
};
X.styles = [
  A`
			:host {
				--uui-color-interactive: var(--umb-login-primary-color, #283a97);
				--uui-button-border-radius: var(--umb-login-button-border-radius, 45px);
				--uui-color-default: var(--uui-color-interactive);
				--uui-button-height: 42px;
				--uui-select-height: 38px;

				--input-height: 40px;
				--header-font-size: var(--umb-login-header-font-size, 3rem);
				--header-secondary-font-size: var(--umb-login-header-secondary-font-size, 2.4rem);
				--curves-color: var(--umb-login-curves-color, #f5c1bc);
				--curves-display: var(--umb-login-curves-display, inline);

				display: block;
				background: var(--umb-login-background, #f4f4f4);
				color: var(--umb-login-text-color, #000);
			}

			#main-no-image,
			#main {
				max-width: 1920px;
				display: flex;
				justify-content: center;
				height: 100vh;
				padding: 8px;
				box-sizing: border-box;
				margin: 0 auto;
			}

			#image-container {
				display: var(--umb-login-image-display, none);
				width: 100%;
			}

			#content-container {
				background: var(--umb-login-content-background, none);
				display: var(--umb-login-content-display, flex);
				width: var(--umb-login-content-width, 100%);
				height: var(--umb-login-content-height, 100%);
				box-sizing: border-box;
				overflow: auto;
				border-radius: var(--umb-login-content-border-radius, 0);
			}

			#content {
				max-width: 360px;
				margin: auto;
				width: 100%;
			}

			#image {
				background: var(--umb-login-image, var(--image));
				width: 100%;
				height: 100%;
				border-radius: var(--umb-login-image-border-radius, 38px);
				position: relative;
				overflow: hidden;
				color: var(--curves-color);
			}

			#image svg {
				position: absolute;
				width: 45%;
				height: fit-content;
				display: var(--curves-display);
			}

			#curve-top {
				top: -9%;
				right: -9%;
			}

			#curve-bottom {
				bottom: -0.5%;
				left: -0.1%;
			}

			#logo-on-image,
			#logo-on-background {
				position: absolute;
				display: var(--umb-logo-display, block);
				top: var(--umb-logo-top, 24px);
				left: var(--umb-logo-left, 24px);
				width: var(--umb-logo-width, auto);
				height: var(--umb-logo-height, 55px);
			}

			@media only screen and (min-width: 900px) {
				:host {
					--header-font-size: var(--umb-login-header-font-size-large, 4rem);
				}

				#main {
					padding: 32px;
					padding-right: 0;
					align-items: var(--umb-login-align-items, unset);
				}

				#image-container {
					display: var(--umb-login-image-display, block);
				}

				#content-container {
					display: var(--umb-login-content-display, flex);
					padding: 16px;
				}

				#logo-on-background {
					display: var(--logo-alternative-display);
				}
			}
		`
];
ze([
  p({ attribute: "background-image" })
], X.prototype, "backgroundImage", 2);
ze([
  p({ attribute: "logo-image" })
], X.prototype, "logoImage", 2);
ze([
  p({ attribute: "logo-image-alternative" })
], X.prototype, "logoImageAlternative", 2);
X = ze([
  P("umb-auth-layout")
], X);
var sa = Object.defineProperty, na = Object.getOwnPropertyDescriptor, Fe = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? na(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && sa(e, r, a), a;
};
let ue = class extends x {
  constructor() {
    super(...arguments), this.header = "", this.message = "";
  }
  render() {
    return l`
      <header id="header">
        <h1>${this.header}</h1>
        <span>${this.message}</span>
      </header>

      <umb-back-to-login-button></umb-back-to-login-button>

      <slot></slot>
    `;
  }
};
ue.styles = [
  A`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-layout-1);
      }

      #header {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-5);
      }

      #header span {
        color: var(--uui-color-text-alt); /* TODO Change to uui color when uui gets a muted text variable */
        font-size: 14px;
      }

      #header h1 {
        margin: 0;
        font-weight: 400;
        font-size: var(--header-secondary-font-size);
        color: var(--uui-color-interactive);
        line-height: 1.2;
      }

      uui-button {
        width: 100%;
        margin-top: var(--uui-size-space-5);
        --uui-button-padding-top-factor: 1.5;
        --uui-button-padding-bottom-factor: 1.5;
      }
    `
];
Fe([
  p({ type: String })
], ue.prototype, "header", 2);
Fe([
  p({ type: String })
], ue.prototype, "message", 2);
ue = Fe([
  P("umb-confirmation-layout")
], ue);
var ua = Object.defineProperty, la = Object.getOwnPropertyDescriptor, Ee = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? la(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && ua(e, r, a), a;
};
let Y = class extends x {
  constructor() {
    super(...arguments), this.header = "", this.message = "", this.noBackLink = !1;
  }
  render() {
    return l`
      <header id="header">
        <h1>${this.header?.length ? this.header : l`<umb-localize key="auth_friendlyGreeting">Hi there</umb-localize>`}</h1>
        <span>${this.message}</span>
      </header>
      <slot></slot>
      ${this.noBackLink ? "" : l`<umb-back-to-login-button></umb-back-to-login-button>`}
    `;
  }
};
Y.styles = [
  A`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-layout-1);
      }

      #header {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-5);
      }

      #header span {
        color: var(--uui-color-text-alt); /* TODO Change to uui color when uui gets a muted text variable */
        font-size: 14px;
      }

      #header h1 {
        margin: 0;
        font-weight: 400;
        font-size: var(--header-secondary-font-size);
        color: var(--uui-color-interactive);
        line-height: 1.2;
      }

      ::slotted(uui-button) {
        width: 100%;
        margin-top: var(--uui-size-space-5);
        --uui-button-padding-top-factor: 1.5;
        --uui-button-padding-bottom-factor: 1.5;
      }
    `
];
Ee([
  p({ type: String })
], Y.prototype, "header", 2);
Ee([
  p({ type: String })
], Y.prototype, "message", 2);
Ee([
  p({ type: Boolean, attribute: "no-back-link" })
], Y.prototype, "noBackLink", 2);
Y = Ee([
  P("umb-error-layout")
], Y);
var da = Object.defineProperty, ca = Object.getOwnPropertyDescriptor, St = (t) => {
  throw TypeError(t);
}, U = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? ca(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && da(e, r, a), a;
}, It = (t, e, r) => e.has(t) || St("Cannot " + r), G = (t, e, r) => (It(t, e, "read from private field"), r ? r.call(t) : e.get(t)), Ue = (t, e, r) => e.has(t) ? St("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), lt = (t, e, r) => (It(t, e, "access private method"), r), be, J, ye, Lt, Ot;
let C = class extends x {
  constructor() {
    super(), Ue(this, ye), this.state = void 0, this.error = "", this.userId = "", this.isInvite = !1, this._passwordPattern = "", Ue(this, be, (t) => {
      t.target.setCustomValidity("");
    }), Ue(this, J, (t) => {
      const e = t.currentTarget;
      if (e.validity?.patternMismatch) {
        const r = this.localize.term("login_invalidPasswordMessage") ?? "The password is not strong enough.";
        e.setCustomValidity(r);
      }
    }), this.consumeContext(j, (t) => {
      let e = "";
      this._passwordConfiguration = t?.passwordConfiguration, this._passwordConfiguration?.requireDigit && (e += "(?=.*\\d)"), this._passwordConfiguration?.requireLowercase && (e += "(?=.*[a-z])"), this._passwordConfiguration?.requireUppercase && (e += "(?=.*[A-Z])"), this._passwordConfiguration?.requireNonLetterOrDigit && (e += "(?=.*\\W)"), e += `.{${this._passwordConfiguration?.minimumPasswordLength ?? 10},}`, this._passwordPattern = e;
    });
  }
  firstUpdated(t) {
    super.firstUpdated(t), !(!this.passwordElement || !this.confirmPasswordElement) && (this.passwordElement.addEventListener("invalid", G(this, J)), this.confirmPasswordElement.addEventListener("invalid", G(this, J)));
  }
  disconnectedCallback() {
    this.passwordElement?.removeEventListener("invalid", G(this, J)), this.confirmPasswordElement?.removeEventListener("invalid", G(this, J)), super.disconnectedCallback();
  }
  renderHeader() {
    return this.isInvite ? l`
        <h1>Hi!</h1>
        <span>
          <umb-localize key="auth_userInviteWelcomeMessage">
            Welcome to Umbraco! Just need to get your password setup and then you're good to go
          </umb-localize>
        </span>
      ` : l`
        <h1>
          <umb-localize key="auth_newPassword">New password</umb-localize>
        </h1>
        <span>
            <umb-localize key="auth_setPasswordInstruction">Please provide a new password.</umb-localize>
        </span>
      `;
  }
  render() {
    return l`
      <uui-form>
        <form id="LoginForm" name="login" @submit=${lt(this, ye, Lt)}>
          <header id="header">${this.renderHeader()}</header>
          <uui-form-layout-item>
            <uui-label id="passwordLabel" for="password" slot="label" required>
              <umb-localize key="auth_newPassword">New password</umb-localize>
            </uui-label>
            <uui-input-password
              type="password"
              id="password"
              name="password"
              autocomplete="new-password"
              pattern="${this._passwordPattern}"
              @input=${G(this, be)}
              .minlength=${this._passwordConfiguration?.minimumPasswordLength}
              .minlengthMessage=${this.localize.term("auth_passwordMinLength", this._passwordConfiguration?.minimumPasswordLength ?? 10)}
              .label=${this.localize.term("auth_newPassword")}
              required
              required-message=${this.localize.term("auth_passwordIsBlank")}>
            </uui-input-password>
          </uui-form-layout-item>

          <uui-form-layout-item>
            <uui-label id="confirmPasswordLabel" for="confirmPassword" slot="label" required>
              <umb-localize key="auth_confirmNewPassword">Confirm new password</umb-localize>
            </uui-label>
            <uui-input-password
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autocomplete="new-password"
              pattern="${this._passwordPattern}"
              @input=${G(this, be)}
              .minlength=${this._passwordConfiguration?.minimumPasswordLength}
              .minlengthMessage=${this.localize.term("auth_passwordMinLength", this._passwordConfiguration?.minimumPasswordLength ?? 10)}
              .label=${this.localize.term("auth_confirmNewPassword")}
              required
              required-message=${this.localize.term("auth_required")}></uui-input-password>
          </uui-form-layout-item>

          ${lt(this, ye, Ot).call(this)}

          <uui-button
            type="submit"
            label=${this.localize.term("auth_continue")}
            look="primary"
            color="default"
            .state=${this.state}></uui-button>
        </form>
      </uui-form>

      <umb-back-to-login-button style="margin-top: var(--uui-size-space-6)"></umb-back-to-login-button>
    `;
  }
};
be = /* @__PURE__ */ new WeakMap();
J = /* @__PURE__ */ new WeakMap();
ye = /* @__PURE__ */ new WeakSet();
Lt = function(t) {
  if (t.preventDefault(), !this._passwordConfiguration) return;
  const e = t.target;
  if (this.passwordElement.setCustomValidity(""), this.confirmPasswordElement.setCustomValidity(""), !e || !e.checkValidity()) return;
  const r = new FormData(e), o = r.get("password"), a = r.get("confirmPassword");
  let s = !1;
  if (this._passwordConfiguration.minimumPasswordLength > 0 && o.length < this._passwordConfiguration.minimumPasswordLength && (s = !0), this._passwordConfiguration.requireNonLetterOrDigit && (/\W/.test(o) || (s = !0)), this._passwordConfiguration.requireDigit && (/\d/.test(o) || (s = !0)), this._passwordConfiguration.requireLowercase && (/[a-z]/.test(o) || (s = !0)), this._passwordConfiguration.requireUppercase && (/[A-Z]/.test(o) || (s = !0)), s) {
    const i = this.localize.term(
      "auth_errorInPasswordFormat",
      this._passwordConfiguration.minimumPasswordLength,
      this._passwordConfiguration.requireNonLetterOrDigit ? 1 : 0
    ) ?? "The password does not meet the minimum requirements!";
    this.passwordElement.setCustomValidity(i);
    return;
  }
  if (o !== a) {
    const i = this.localize.term(
      "auth_passwordMismatch"
    ) ?? "The confirmed password doesn't match the new password!";
    this.confirmPasswordElement.setCustomValidity(i);
    return;
  }
  this.dispatchEvent(new CustomEvent("submit", { detail: { password: o } }));
};
Ot = function() {
  return !this.error || this.state !== "failed" ? R : l`<span class="text-danger">${this.error}</span>`;
};
C.styles = [
  A`
      #header {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-5);
      }

      #header span {
        color: var(--uui-color-text-alt); /* TODO Change to uui color when uui gets a muted text variable */
        font-size: 14px;
      }

      #header h1 {
        margin: 0;
        font-weight: 400;
        font-size: var(--header-secondary-font-size);
        color: var(--uui-color-interactive);
        line-height: 1.2;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-5);
      }

      uui-form-layout-item {
        margin: 0;
      }

      uui-input-password {
        width: 100%;
        height: var(--input-height);
        border-radius: var(--uui-border-radius);
      }

      uui-button {
        width: 100%;
        margin-top: var(--uui-size-space-5);
        --uui-button-padding-top-factor: 1.5;
        --uui-button-padding-bottom-factor: 1.5;
      }

      .text-danger {
        color: var(--uui-color-danger-standalone);
      }
    `
];
U([
  ft("#password")
], C.prototype, "passwordElement", 2);
U([
  ft("#confirmPassword")
], C.prototype, "confirmPasswordElement", 2);
U([
  p()
], C.prototype, "state", 2);
U([
  p()
], C.prototype, "error", 2);
U([
  p()
], C.prototype, "userId", 2);
U([
  p({ type: Boolean, attribute: "is-invite" })
], C.prototype, "isInvite", 2);
U([
  m()
], C.prototype, "_passwordConfiguration", 2);
U([
  m()
], C.prototype, "_passwordPattern", 2);
C = U([
  P("umb-new-password-layout")
], C);
var ha = Object.defineProperty, pa = Object.getOwnPropertyDescriptor, Tt = (t) => {
  throw TypeError(t);
}, ke = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? pa(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && ha(e, r, a), a;
}, Re = (t, e, r) => e.has(t) || Tt("Cannot " + r), _ = (t, e, r) => (Re(t, e, "read from private field"), r ? r.call(t) : e.get(t)), fe = (t, e, r) => e.has(t) ? Tt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), Me = (t, e, r, o) => (Re(t, e, "write to private field"), e.set(t, r), r), dt = (t, e, r) => (Re(t, e, "access private method"), r), le, K, L, _e, Ut, Dt;
let de = class extends x {
  constructor() {
    super(), fe(this, _e), fe(this, le, ""), fe(this, K, ""), this.state = void 0, this.error = "", this.loading = !0, fe(this, L), this.consumeContext(j, (t) => {
      Me(this, L, t), dt(this, _e, Ut).call(this);
    });
  }
  render() {
    return this.loading ? l`<uui-loader-bar></uui-loader-bar>` : this.error ? l`
          <umb-error-layout
            header=${this.localize.term("auth_error")}
            message=${this.error ?? this.localize.term("auth_defaultError")}>
          </umb-error-layout>` : l`
        <umb-new-password-layout
          @submit=${dt(this, _e, Dt)}
          is-invite
          .userId=${_(this, K)}
          .state=${this.state}
          .error=${this.error}></umb-new-password-layout>`;
  }
};
le = /* @__PURE__ */ new WeakMap();
K = /* @__PURE__ */ new WeakMap();
L = /* @__PURE__ */ new WeakMap();
_e = /* @__PURE__ */ new WeakSet();
Ut = async function() {
  const t = new URLSearchParams(window.location.search), e = t.get("inviteCode"), r = t.get("userId");
  if (!e || !r) {
    this.error = "The invite has expired or is invalid", this.loading = !1;
    return;
  }
  if (!_(this, L)) return;
  Me(this, le, e), Me(this, K, r);
  const o = await _(this, L).validateInviteCode(_(this, le), _(this, K));
  if (o.error) {
    this.error = o.error, this.loading = !1;
    return;
  }
  if (!o.passwordConfiguration) {
    this.error = "There is no password configuration for the invite code. Please contact the administrator.", this.loading = !1;
    return;
  }
  _(this, L).passwordConfiguration = o.passwordConfiguration, this.loading = !1;
};
Dt = async function(t) {
  t.preventDefault();
  const e = t.detail.password;
  if (!e || !_(this, L)) return;
  this.state = "waiting";
  const r = await _(this, L).newInvitedUserPassword(e, _(this, le), _(this, K));
  if (r.error) {
    this.error = r.error, this.state = "failed";
    return;
  }
  this.state = "success", window.location.href = _(this, L).returnPath;
};
ke([
  m()
], de.prototype, "state", 2);
ke([
  m()
], de.prototype, "error", 2);
ke([
  m()
], de.prototype, "loading", 2);
de = ke([
  P("umb-invite-page")
], de);
var ma = Object.defineProperty, fa = Object.getOwnPropertyDescriptor, Mt = (t) => {
  throw TypeError(t);
}, N = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? fa(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && ma(e, r, a), a;
}, Ve = (t, e, r) => e.has(t) || Mt("Cannot " + r), w = (t, e, r) => (Ve(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ae = (t, e, r) => e.has(t) ? Mt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), At = (t, e, r, o) => (Ve(t, e, "write to private field"), e.set(t, r), r), De = (t, e, r) => (Ve(t, e, "access private method"), r), F, I, Z, qt, je, Bt, xe, Wt, Ft;
let O = class extends x {
  constructor() {
    super(), ae(this, Z), this.usernameIsEmail = !1, this.allowPasswordReset = !1, this._loginError = "", this.supportPersistLogin = !1, ae(this, F), ae(this, I), ae(this, je, async (t) => {
      if (t.preventDefault(), this._loginError = "", this._loginState = void 0, !w(this, I)) return;
      const e = t.target;
      if (!e || !e?.checkValidity())
        return;
      const r = new FormData(e), o = r.get("username"), a = r.get("password"), s = r.has("persist");
      if (!o || !a)
        return;
      this._loginState = "waiting";
      const i = await w(this, I).login({
        username: o,
        password: a,
        persist: s
      });
      if (this._loginError = i.error || "", this._loginState = i.error ? "failed" : "success", i.status === 402) {
        w(this, I).isMfaEnabled = !0, i.twoFactorView && (w(this, I).twoFactorView = i.twoFactorView), i.twoFactorProviders && (w(this, I).mfaProviders = i.twoFactorProviders), this.dispatchEvent(new CustomEvent("umb-login-flow", { composed: !0, detail: { flow: "mfa" } }));
        return;
      }
      if (i.error)
        return;
      const n = w(this, I).returnPath;
      n && (location.href = n);
    }), ae(this, xe, () => {
      w(this, F)?.requestSubmit();
    }), this.consumeContext(j, (t) => {
      At(this, I, t), this.supportPersistLogin = t?.supportsPersistLogin ?? !1;
    });
  }
  render() {
    return l`
			<header id="header">
				<h1 id="greeting">
					<umb-localize .key=${w(this, Z, Bt)}></umb-localize>
				</h1>
				<slot name="subheadline"></slot>
			</header>
			<slot @slotchange=${De(this, Z, qt)}></slot>
			<div id="secondary-actions">
				${Pe(
      this.supportPersistLogin,
      () => l` <uui-form-layout-item>
							<uui-checkbox name="persist" .label=${this.localize.term("auth_rememberMe")}>
								<umb-localize key="auth_rememberMe">Remember me</umb-localize>
							</uui-checkbox>
						</uui-form-layout-item>`
    )}
				${Pe(
      this.allowPasswordReset,
      () => l` <uui-button type="button" id="forgot-password" @click=${De(this, Z, Ft)} compact>
							<umb-localize key="auth_forgottenPassword">Forgotten password?</umb-localize>
						</uui-button>`
    )}
			</div>
			<uui-button
				@click=${w(this, xe)}
				type="submit"
				id="umb-login-button"
				look="primary"
				.label=${this.localize.term("auth_login")}
				color="default"
				.state=${this._loginState}></uui-button>

			${De(this, Z, Wt).call(this)}
		`;
  }
};
F = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
Z = /* @__PURE__ */ new WeakSet();
qt = async function() {
  At(this, F, this.slottedElements?.find((t) => t.id === "umb-login-form")), w(this, F) && (w(this, F).addEventListener("keypress", (t) => {
    t.key === "Enter" && w(this, xe).call(this);
  }), w(this, F).onsubmit = w(this, je));
};
je = /* @__PURE__ */ new WeakMap();
Bt = function() {
  return [
    "auth_greeting0",
    "auth_greeting1",
    "auth_greeting2",
    "auth_greeting3",
    "auth_greeting4",
    "auth_greeting5",
    "auth_greeting6"
  ][(/* @__PURE__ */ new Date()).getDay()];
};
xe = /* @__PURE__ */ new WeakMap();
Wt = function() {
  return !this._loginError || this._loginState !== "failed" ? R : l`<span class="text-error text-danger">${this._loginError}</span>`;
};
Ft = function() {
  this.dispatchEvent(new CustomEvent("umb-login-flow", { composed: !0, detail: { flow: "reset" } }));
};
O.styles = [
  A`
			:host {
				display: flex;
				flex-direction: column;
			}

			#header {
				text-align: center;
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-5);
			}

			#header span {
				color: var(--uui-color-text-alt); /* TODO Change to uui color when uui gets a muted text variable */
				font-size: 14px;
			}

			#greeting {
				color: var(--uui-color-default);
				text-align: center;
				font-weight: 400;
				font-size: var(--header-font-size);
				margin: 0 0 var(--uui-size-layout-1);
				line-height: 1.2;
			}

			#umb-login-button {
				margin-top: var(--uui-size-space-4);
				width: 100%;
			}

			#forgot-password {
				--uui-button-height: 100%;
				--uui-button-background-color-hover: transparent;
				margin-top: calc(-0.5 * var(--uui-size-space-2));
				margin-left: auto;
				margin-bottom: var(--uui-size-space-3);
			}

			#forgot-password:hover {
				color: var(--uui-color-interactive-emphasis);
			}

			.text-error {
				margin-top: var(--uui-size-space-4);
			}

			.text-danger {
				color: var(--uui-color-danger-standalone);
			}

			#secondary-actions {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
		`
];
N([
  p({ type: Boolean, attribute: "username-is-email" })
], O.prototype, "usernameIsEmail", 2);
N([
  sr({ flatten: !0 })
], O.prototype, "slottedElements", 2);
N([
  p({ type: Boolean, attribute: "allow-password-reset" })
], O.prototype, "allowPasswordReset", 2);
N([
  m()
], O.prototype, "_loginState", 2);
N([
  m()
], O.prototype, "_loginError", 2);
N([
  m()
], O.prototype, "supportPersistLogin", 2);
O = N([
  P("umb-login-page")
], O);
async function ga(t) {
  if (t.endsWith(".html"))
    return fetch(t).then((r) => r.text());
  const e = await import(
    /* @vite-ignore */
    t
  );
  if (!e.default) throw new Error("No default export found");
  return new e.default();
}
function wa(t) {
  return typeof t == "string" ? l`${nr(t)}` : t;
}
var va = Object.defineProperty, ba = Object.getOwnPropertyDescriptor, Rt = (t) => {
  throw TypeError(t);
}, Se = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? ba(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && va(e, r, a), a;
}, Ne = (t, e, r) => e.has(t) || Rt("Cannot " + r), V = (t, e, r) => (Ne(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ct = (t, e, r) => e.has(t) ? Rt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), ya = (t, e, r, o) => (Ne(t, e, "write to private field"), e.set(t, r), r), ht = (t, e, r) => (Ne(t, e, "access private method"), r), E, Ce, Vt, jt;
let ee = class extends x {
  constructor() {
    super(), ct(this, Ce), this.providers = [], this.error = null, ct(this, E), this.consumeContext(j, (t) => {
      ya(this, E, t), ht(this, Ce, Vt).call(this);
    });
  }
  renderDefaultView() {
    return l`
      <uui-form>
        <form id="LoginForm" @submit=${ht(this, Ce, jt)} novalidate>
          <header id="header">
            <h1>
              <umb-localize key="auth_mfaTitle">One last step</umb-localize>
            </h1>

            <p>
              <umb-localize key="auth_mfaText">
                You have enabled 2-factor authentication and must verify your identity.
              </umb-localize>
            </p>
          </header>

          <!-- if there's only one provider active, it will skip this step! -->
          ${this.providers.length > 1 ? l`
              <uui-form-layout-item>
                <uui-label id="providerLabel" for="provider" slot="label" required>
                  <umb-localize key="auth_mfaMultipleText">Please choose a 2-factor provider</umb-localize>
                </uui-label>
                <uui-select label=${this.localize.term("auth_mfaMultipleText")} id="provider" name="provider" .options=${this.providers} aria-required="true" required></uui-select>
              </uui-form-layout-item>
            ` : R}

          <uui-form-layout-item>
            <uui-label id="mfacodeLabel" for="mfacode" slot="label" required>
              <umb-localize key="auth_mfaCodeInput">Verification code</umb-localize>
            </uui-label>

            <uui-input
              autofocus
              id="mfacode"
              type="text"
              name="token"
              inputmode="numeric"
              autocomplete="one-time-code"
              placeholder=${this.localize.term("auth_mfaCodeInputHelp")}
              aria-required="true"
              required
              required-message=${this.localize.term("auth_mfaCodeInputHelp")}
              label=${this.localize.term("auth_mfaCodeInput")}
              style="width:100%;">
            </uui-input>
          </uui-form-layout-item>

          ${this.error ? l` <span class="text-danger">${this.error}</span> ` : R}

          <uui-button
            .state=${this.buttonState}
            button-style="success"
            look="primary"
            color="default"
            label=${this.localize.term("auth_validate")}
            type="submit"></uui-button>
        </form>
      </uui-form>

      <umb-back-to-login-button style="margin-top: var(--uui-size-space-6)"></umb-back-to-login-button>
    `;
  }
  async renderCustomView() {
    const t = V(this, E)?.twoFactorView;
    if (!t) return R;
    try {
      const e = await ga(t);
      return typeof e == "object" && (e.providers = this.providers.map((r) => r.value), e.returnPath = V(this, E)?.returnPath ?? ""), wa(e);
    } catch (e) {
      const r = e instanceof Error ? e.message : "Unknown error";
      return console.group("[MFA login] Failed to load custom view"), console.log("Element reference", this), console.log("Custom view", t), console.error("Failed to load custom view:", e), console.groupEnd(), l`<span class="text-danger">${r}</span>`;
    }
  }
  render() {
    return V(this, E)?.twoFactorView ? ur(this.renderCustomView(), l`
          <uui-loader-bar></uui-loader-bar>`) : this.renderDefaultView();
  }
};
E = /* @__PURE__ */ new WeakMap();
Ce = /* @__PURE__ */ new WeakSet();
Vt = function() {
  this.providers = V(this, E)?.mfaProviders.map((t) => ({ name: t, value: t, selected: !1 })) ?? [], this.providers.length ? this.providers[0].selected = !0 : this.error = "Error: No providers available";
};
jt = async function(t) {
  if (t.preventDefault(), !V(this, E)) return;
  this.error = null;
  const e = t.target;
  if (!e) return;
  const r = e.elements.namedItem("mfacode");
  if (r && (r.error = !1, r.errorMessage = "", r.setCustomValidity("")), !e.checkValidity()) return;
  const o = new FormData(e);
  let a = o.get("provider");
  if (!a) {
    if (!this.providers.length) {
      this.error = "No providers available";
      return;
    }
    a = this.providers[0].value;
  }
  if (!a) {
    this.error = "No provider selected";
    return;
  }
  const s = o.get("token");
  this.buttonState = "waiting";
  const i = await V(this, E).validateMfaCode(s, a);
  if (i.error) {
    r ? (r.error = !0, r.errorMessage = i.error) : this.error = i.error, this.buttonState = "failed";
    return;
  }
  this.buttonState = "success";
  const n = V(this, E).returnPath;
  n && (location.href = n);
};
ee.styles = [
  A`
      #header {
        text-align: center;
      }

      #header h1 {
        font-weight: 400;
        font-size: var(--header-secondary-font-size);
        color: var(--uui-color-interactive);
        line-height: 1.2;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-layout-2);
      }

      #provider {
        width: 100%;
      }

      uui-form-layout-item {
        margin: 0;
      }

      uui-input,
      uui-input-password {
        width: 100%;
        height: var(--input-height);
        border-radius: var(--uui-border-radius);
      }

      uui-input {
        width: 100%;
      }

      uui-button {
        width: 100%;
        --uui-button-padding-top-factor: 1.5;
        --uui-button-padding-bottom-factor: 1.5;
      }

      .text-danger {
        color: var(--uui-color-danger-standalone);
      }
    `
];
Se([
  m()
], ee.prototype, "providers", 2);
Se([
  m()
], ee.prototype, "buttonState", 2);
Se([
  m()
], ee.prototype, "error", 2);
ee = Se([
  P("umb-mfa-page")
], ee);
var _a = Object.defineProperty, Ca = Object.getOwnPropertyDescriptor, Nt = (t) => {
  throw TypeError(t);
}, H = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? Ca(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && _a(e, r, a), a;
}, He = (t, e, r) => e.has(t) || Nt("Cannot " + r), ie = (t, e, r) => (He(t, e, "read from private field"), e.get(t)), pt = (t, e, r) => e.has(t) ? Nt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), Pa = (t, e, r, o) => (He(t, e, "write to private field"), e.set(t, r), r), Ae = (t, e, r) => (He(t, e, "access private method"), r), D, se, Ht, Gt, Jt;
let M = class extends x {
  constructor() {
    super(), pt(this, se), this.state = void 0, this.page = "new", this.error = "", this.userId = "", this.resetCode = "", this.loading = !0, pt(this, D), this.consumeContext(j, (t) => {
      Pa(this, D, t), Ae(this, se, Ht).call(this);
    });
  }
  render() {
    return this.loading ? l`<uui-loader-bar></uui-loader-bar>` : Ae(this, se, Jt).call(this);
  }
};
D = /* @__PURE__ */ new WeakMap();
se = /* @__PURE__ */ new WeakSet();
Ht = async function() {
  const t = new URLSearchParams(window.location.search), e = t.get("resetCode"), r = t.get("userId");
  if (!r || !e) {
    this.page = "error", this.loading = !1;
    return;
  }
  if (!ie(this, D)) return;
  this.resetCode = e, this.userId = r;
  const o = await ie(this, D).validatePasswordResetCode(this.userId, this.resetCode);
  if (o.error) {
    this.page = "error", this.error = o.error, this.loading = !1;
    return;
  }
  if (!o.passwordConfiguration) {
    this.page = "error", this.error = "Password configuration is missing", this.loading = !1;
    return;
  }
  ie(this, D).passwordConfiguration = o.passwordConfiguration, this.loading = !1;
};
Gt = async function(t) {
  if (t.preventDefault(), this.error = "", !ie(this, D)) return;
  const e = t.detail.password;
  this.state = "waiting";
  const r = await ie(this, D).newPassword(e, this.resetCode, this.userId);
  if (r.error) {
    this.state = "failed", this.error = r.error;
    return;
  }
  this.state = "success", this.page = "done";
};
Jt = function() {
  switch (this.page) {
    case "new":
      return l`
          <umb-new-password-layout
            @submit=${Ae(this, se, Gt)}
            .userId=${this.userId}
            .state=${this.state}
            .error=${this.error}></umb-new-password-layout>`;
    case "error":
      return l`
          <umb-error-layout
            header=${this.localize.term("auth_error")}
            message=${this.error ?? this.localize.term("auth_defaultError")}>
          </umb-error-layout>`;
    case "done":
      return l`
          <umb-confirmation-layout
            header=${this.localize.term("auth_success")}
            message=${this.localize.term("auth_setPasswordConfirmation")}>
          </umb-confirmation-layout>`;
  }
};
H([
  m()
], M.prototype, "state", 2);
H([
  m()
], M.prototype, "page", 2);
H([
  m()
], M.prototype, "error", 2);
H([
  m()
], M.prototype, "userId", 2);
H([
  m()
], M.prototype, "resetCode", 2);
H([
  m()
], M.prototype, "loading", 2);
M = H([
  P("umb-new-password-page")
], M);
var xa = Object.defineProperty, $a = Object.getOwnPropertyDescriptor, Zt = (t) => {
  throw TypeError(t);
}, Ge = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? $a(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = (o ? i(e, r, a) : i(a)) || a);
  return o && a && xa(e, r, a), a;
}, Qt = (t, e, r) => e.has(t) || Zt("Cannot " + r), za = (t, e, r) => (Qt(t, e, "read from private field"), r ? r.call(t) : e.get(t)), mt = (t, e, r) => e.has(t) ? Zt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), qe = (t, e, r) => (Qt(t, e, "access private method"), r), Je, ne, Xt, Yt, Kt;
let ce = class extends x {
  constructor() {
    super(...arguments), mt(this, ne), this.resetCallState = void 0, this.error = "", mt(this, Je, async (t) => {
      t.preventDefault();
      const e = t.target;
      if (!e || !e.checkValidity()) return;
      const o = new FormData(e).get("email");
      this.resetCallState = "waiting";
      const a = await this.getContext(j);
      if (!a) {
        this.resetCallState = "failed", this.error = "Authentication context not available.";
        return;
      }
      const s = await a.resetPassword(o);
      this.resetCallState = s.error ? "failed" : "success", this.error = s.error || "";
    });
  }
  render() {
    return this.resetCallState === "success" ? qe(this, ne, Kt).call(this) : qe(this, ne, Xt).call(this);
  }
};
Je = /* @__PURE__ */ new WeakMap();
ne = /* @__PURE__ */ new WeakSet();
Xt = function() {
  return l`
			<uui-form>
				<form id="LoginForm" name="login" @submit="${za(this, Je)}">
					<header id="header">
						<h1>
							<umb-localize key="auth_forgottenPassword">Forgotten password?</umb-localize>
						</h1>
						<span>
							<umb-localize key="auth_forgottenPasswordInstruction">
								An email will be sent to the address specified with a link to reset your password
							</umb-localize>
						</span>
					</header>

					<uui-form-layout-item>
						<uui-label for="email" slot="label" required>
							<umb-localize key="auth_email">Email</umb-localize>
						</uui-label>
						<uui-input
							type="email"
							id="email"
							name="email"
							.label=${this.localize.term("auth_email")}
							required
							required-message=${this.localize.term("auth_required")}>
						</uui-input>
					</uui-form-layout-item>

					${qe(this, ne, Yt).call(this)}

					<uui-button
						type="submit"
						.label=${this.localize.term("auth_submit")}
						look="primary"
						color="default"
						.state=${this.resetCallState}></uui-button>
				</form>
			</uui-form>

			<umb-back-to-login-button style="margin-top: var(--uui-size-space-6)"></umb-back-to-login-button>
		`;
};
Yt = function() {
  return !this.error || this.resetCallState !== "failed" ? R : l`<span class="text-danger">${this.error}</span>`;
};
Kt = function() {
  return l`
			<umb-confirmation-layout
				header=${this.localize.term("auth_forgottenPassword")}
				message=${this.localize.term("auth_requestPasswordResetConfirmation")}>
			</umb-confirmation-layout>
		`;
};
ce.styles = [
  A`
			#header {
				text-align: center;
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-5);
			}

			#header span {
				color: var(--uui-color-text-alt); /* TODO Change to uui color when uui gets a muted text variable */
				font-size: 14px;
			}

			#header h1 {
				margin: 0;
				font-weight: 400;
				font-size: var(--header-secondary-font-size);
				color: var(--uui-color-interactive);
				line-height: 1.2;
			}

			form {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-layout-2);
			}

			uui-form-layout-item {
				margin: 0;
			}

			uui-input,
			uui-input-password {
				width: 100%;
				height: var(--input-height);
				border-radius: var(--uui-border-radius);
			}

			uui-input {
				width: 100%;
			}

			uui-button {
				width: 100%;
				--uui-button-padding-top-factor: 1.5;
				--uui-button-padding-bottom-factor: 1.5;
			}

			#resend {
				display: inline-flex;
				font-size: 14px;
				align-self: center;
				gap: var(--uui-size-space-1);
			}

			#resend a {
				color: var(--uui-color-selected);
				font-weight: 600;
				text-decoration: none;
			}

			#resend a:hover {
				color: var(--uui-color-interactive-emphasis);
			}
		`
];
Ge([
  m()
], ce.prototype, "resetCallState", 2);
Ge([
  m()
], ce.prototype, "error", 2);
ce = Ge([
  P("umb-reset-password-page")
], ce);
var Ea = Object.getOwnPropertyDescriptor, er = (t) => {
  throw TypeError(t);
}, ka = (t, e, r, o) => {
  for (var a = o > 1 ? void 0 : o ? Ea(e, r) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (a = i(a) || a);
  return a;
}, Sa = (t, e, r) => e.has(t) || er("Cannot " + r), Ia = (t, e, r) => e.has(t) ? er("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), La = (t, e, r) => (Sa(t, e, "access private method"), r), Be, tr;
let We = class extends x {
  constructor() {
    super(...arguments), Ia(this, Be);
  }
  render() {
    return l`
			<uui-button type="button" @click=${La(this, Be, tr)} compact>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"></path>
				</svg>
				<span><umb-localize key="auth_returnToLogin">Return to login form</umb-localize></span>
			</uui-button>
		`;
  }
};
Be = /* @__PURE__ */ new WeakSet();
tr = function() {
  this.dispatchEvent(new CustomEvent("umb-login-flow", { composed: !0, detail: { flow: "login", status: null } }));
};
We.styles = [
  A`
			:host {
				display: flex;
				align-items: center;
				justify-content: center;
			}
			uui-button {
				--uui-button-height: auto;
				--uui-button-background-color-hover: transparent;
			}
			uui-button svg {
				width: 1rem;
			}
		`
];
We = ka([
  P("umb-back-to-login-button")
], We);
export {
  j as UMB_AUTH_CONTEXT,
  Nr as UmbAuthContext,
  X as UmbAuthLayoutElement,
  Hr as UmbSlimBackofficeController
};
//# sourceMappingURL=login.js.map
