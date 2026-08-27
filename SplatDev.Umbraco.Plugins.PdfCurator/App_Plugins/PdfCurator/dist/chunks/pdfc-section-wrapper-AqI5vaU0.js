var g = (r) => {
  throw TypeError(r);
};
var C = (r, a, e) => a.has(r) || g("Cannot " + e);
var b = (r, a, e) => a.has(r) ? g("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(r) : a.set(r, e);
var _ = (r, a, e) => (C(r, a, "access private method"), e);
import { css as x, LitElement as L, html as h, state as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as A } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as B } from "@umbraco-cms/backoffice/notification";
const $ = "/_content/PdfCurator.Web/pdfc.js", k = `
:host {
  display: block;
  padding: var(--uui-size-layout-1, 24px);
}
uui-box {
  margin-bottom: var(--uui-size-space-5, 16px);
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--uui-size-space-10, 48px);
  text-align: center;
  color: var(--uui-color-text-alt, #6b7280);
}
.loading-state uui-loader-circle {
  margin-bottom: var(--uui-size-space-4, 12px);
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--uui-size-space-10, 48px);
  text-align: center;
}
.error-state p {
  color: var(--uui-color-danger, #ef4444);
  margin: var(--uui-size-space-3, 8px) 0 0;
}
`, w = "/umbraco/pdfcurator/api/v1";
function z(r, a = (...e) => fetch(...e)) {
  let e = null, n = null;
  const s = r.consumeContext.bind(r), t = new Promise((o) => {
    s(A, async (i) => {
      var u;
      try {
        e = await ((u = i == null ? void 0 : i.getLatestToken) == null ? void 0 : u.call(i)) ?? null;
      } catch {
        e = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return s(B, (o) => {
    n = o;
  }), async (o, i = {}) => {
    await t;
    const u = new Headers(i.headers);
    e && !u.has("Authorization") && u.set("Authorization", `Bearer ${e}`);
    const d = await a(o, { ...i, credentials: "same-origin", headers: u });
    if (!d.ok) {
      const m = d.status === 401 || d.status === 403, T = m ? "Not authorised" : "Could not load data", p = m ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${d.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${d.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${d.status} from ${String(o)} — ${p}`), n == null || n.peek("danger", { data: { headline: T, message: p } });
    }
    return d;
  };
}
var N = Object.defineProperty, v = (r, a, e, n) => {
  for (var s = void 0, t = r.length - 1, o; t >= 0; t--)
    (o = r[t]) && (s = o(a, e, s) || s);
  return s && N(a, e, s), s;
};
const U = x([k]);
var c, E;
const f = class f extends P(L) {
  constructor() {
    super(...arguments);
    b(this, c);
    this._bundleLoaded = !1, this._loadError = null, this._reportedMissing = !1;
  }
  connectedCallback() {
    super.connectedCallback(), _(this, c, E).call(this), this._loadPdfcBundle();
  }
  async _loadPdfcBundle() {
    if (customElements.get(this.componentTag)) {
      this._bundleLoaded = !0;
      return;
    }
    try {
      await import($), this._bundleLoaded = !0;
    } catch (e) {
      this._loadError = e instanceof Error ? e.message : "Failed to load PdfCurator components";
    }
  }
  render() {
    return this._loadError ? h`
        <uui-box headline="${this.headline}">
          <div class="error-state">
            <uui-icon
              name="icon-alert"
              style="font-size:3rem;color:var(--uui-color-danger)"
            ></uui-icon>
            <p>
              Failed to load PdfCurator components. Please rebuild the
              project and ensure PdfCurator.Web is installed.
            </p>
          </div>
        </uui-box>
      ` : this._bundleLoaded ? h`
      <uui-box headline="${this.headline}">
        <div id="host"></div>
      </uui-box>
    ` : h`
        <uui-box headline="${this.headline}">
          <div class="loading-state">
            <uui-loader-circle></uui-loader-circle>
            <p>Loading PdfCurator components…</p>
          </div>
        </uui-box>
      `;
  }
  updated(e) {
    var t, o;
    if (super.updated(e), !this._bundleLoaded || this._loadError) return;
    const n = (t = this.shadowRoot) == null ? void 0 : t.querySelector("#host");
    if (!n) return;
    if (!customElements.get(this.componentTag)) {
      this._reportedMissing || (this._reportedMissing = !0, this._loadError = `The PdfCurator bundle loaded but did not define <${this.componentTag}>.`);
      return;
    }
    if (((o = n.firstElementChild) == null ? void 0 : o.tagName.toLowerCase()) === this.componentTag) return;
    const s = document.createElement(this.componentTag);
    s.apiBase = w, n.replaceChildren(s);
  }
};
c = new WeakSet(), /**
 * Routes the PdfCurator components' own fetches through an authorised one.
 *
 * The components ship in PdfCurator.Web's bundle and call plain fetch, which on Umbraco
 * 17 carries no Authorization header - the cookie alone is not enough, so every call to a
 * BackOfficeAccess endpoint would answer 401. The bundle cannot be changed from here, so
 * requests to this plugin's API prefix are delegated to createAuthFetch instead. Anything
 * else is left exactly as it was.
 */
E = function() {
  const e = window;
  if (e.__pdfcAuthBridge) return;
  e.__pdfcAuthBridge = !0;
  const n = window.fetch.bind(window), s = z(this, n);
  window.fetch = (t, o) => (typeof t == "string" ? t : t instanceof URL ? t.toString() : t.url).startsWith(w) ? s(t, o) : n(t, o);
}, f.styles = U;
let l = f;
v([
  y()
], l.prototype, "_bundleLoaded");
v([
  y()
], l.prototype, "_loadError");
export {
  l as P
};
//# sourceMappingURL=pdfc-section-wrapper-AqI5vaU0.js.map
