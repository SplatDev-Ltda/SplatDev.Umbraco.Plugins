var C = (e) => {
  throw TypeError(e);
};
var E = (e, t, a) => t.has(e) || C("Cannot " + a);
var y = (e, t, a) => (E(e, t, "read from private field"), a ? a.call(e) : t.get(e)), x = (e, t, a) => t.has(e) ? C("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), $ = (e, t, a, i) => (E(e, t, "write to private field"), i ? i.call(e, a) : t.set(e, a), a), d = (e, t, a) => (E(e, t, "access private method"), a);
import { LitElement as M, nothing as g, html as s, css as D, state as v, customElement as G } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as L } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as I } from "@umbraco-cms/backoffice/auth";
const j = "/umbraco/nuget-catalog/api/v1";
async function B(e) {
  try {
    const t = await e.json();
    if (t != null && t.message) return t.message;
  } catch {
  }
  return `${e.status} ${e.statusText}`;
}
var k, w, P, o, H, p;
class W {
  constructor(t) {
    x(this, o);
    x(this, k);
    x(this, w, null);
    x(this, P);
    $(this, k, t), $(this, P, new Promise((a) => {
      y(this, k).consumeContext(I, async (i) => {
        var n;
        try {
          $(this, w, await ((n = i == null ? void 0 : i.getLatestToken) == null ? void 0 : n.call(i)) ?? null);
        } catch {
          $(this, w, null);
        }
        a();
      }), setTimeout(a, 3e3);
    }));
  }
  getPackages() {
    return d(this, o, p).call(this, "/packages", "GET");
  }
  refresh() {
    return d(this, o, p).call(this, "/refresh", "POST");
  }
  addPackage(t) {
    return d(this, o, p).call(this, "/packages", "POST", { urlOrId: t });
  }
  removePackage(t) {
    return d(this, o, p).call(this, `/packages/${encodeURIComponent(t)}`, "DELETE");
  }
  hide(t) {
    return d(this, o, p).call(this, `/hidden/${encodeURIComponent(t)}`, "POST");
  }
  unhide(t) {
    return d(this, o, p).call(this, `/hidden/${encodeURIComponent(t)}`, "DELETE");
  }
  addOwner(t) {
    return d(this, o, p).call(this, "/owners", "POST", { owner: t });
  }
  removeOwner(t) {
    return d(this, o, p).call(this, `/owners/${encodeURIComponent(t)}`, "DELETE");
  }
}
k = new WeakMap(), w = new WeakMap(), P = new WeakMap(), o = new WeakSet(), H = async function(t, a = {}) {
  await y(this, P);
  const i = new Headers(a.headers);
  return i.set("Accept", "application/json"), y(this, w) && i.set("Authorization", `Bearer ${y(this, w)}`), fetch(`${j}${t}`, { ...a, credentials: "same-origin", headers: i });
}, p = async function(t, a, i) {
  const n = new Headers();
  i !== void 0 && n.set("Content-Type", "application/json");
  const m = await d(this, o, H).call(this, t, {
    method: a,
    headers: n,
    body: i === void 0 ? void 0 : JSON.stringify(i)
  });
  if (!m.ok) throw new Error(await B(m));
  if (m.status === 204) return;
  const _ = await m.text();
  return _ ? JSON.parse(_) : void 0;
};
var J = Object.defineProperty, F = Object.getOwnPropertyDescriptor, S = (e) => {
  throw TypeError(e);
}, b = (e, t, a, i) => {
  for (var n = i > 1 ? void 0 : i ? F(t, a) : t, m = e.length - 1, _; m >= 0; m--)
    (_ = e[m]) && (n = (i ? _(t, a, n) : _(n)) || n);
  return i && n && J(t, a, n), n;
}, N = (e, t, a) => t.has(e) || S("Cannot " + a), h = (e, t, a) => (N(e, t, "read from private field"), a ? a.call(e) : t.get(e)), T = (e, t, a) => t.has(e) ? S("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), l = (e, t, a) => (N(e, t, "access private method"), a), u, r, z, f, R, O, U, A;
function X(e) {
  if (!e) return "never";
  const t = Math.max(0, (Date.now() - new Date(e).getTime()) / 1e3);
  if (t < 60) return "just now";
  const a = Math.round(t / 60);
  if (a < 60) return `${a}m ago`;
  const i = Math.round(a / 60);
  return i < 24 ? `${i}h ago` : `${Math.round(i / 24)}d ago`;
}
const q = new Intl.NumberFormat();
let c = class extends L(M) {
  constructor() {
    super(...arguments), T(this, r), T(this, u, new W(this)), this._tab = "packages", this._loading = !0, this._busy = !1, this._error = "", this._showHidden = !1, this._newPackage = "", this._newOwner = "";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, r, z).call(this);
  }
  render() {
    const e = this._data;
    return s`
      <div class="head">
        <div>
          <h1>NuGet Catalog</h1>
          <p class="sub">
            Packages published to nuget.org, with downloads and the latest version.
          </p>
        </div>
        <div class="actions">
          <span class="sub">refreshed ${X(e == null ? void 0 : e.refreshedUtc)}</span>
          <uui-button
            look="secondary"
            label="Refresh from nuget.org"
            ?disabled=${this._busy || this._loading}
            @click=${() => void l(this, r, z).call(this, !0)}
          >${this._busy ? "Refreshing…" : "Refresh"}</uui-button>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button
          class="tab"
          role="tab"
          aria-selected=${this._tab === "packages"}
          @click=${() => {
      this._tab = "packages";
    }}
        >Packages${e ? ` (${e.packages.length})` : ""}</button>
        <button
          class="tab"
          role="tab"
          aria-selected=${this._tab === "manage"}
          @click=${() => {
      this._tab = "manage";
    }}
        >Manage</button>
      </div>

      ${e != null && e.warning ? s`<div class="warn-banner"><span>${e.warning}</span></div>` : g}
      ${this._error ? s`<div class="error">${this._error}</div>` : g}

      ${this._loading ? s`<uui-loader></uui-loader>` : this._tab === "packages" ? l(this, r, U).call(this) : l(this, r, A).call(this)}
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
z = async function(e = !1) {
  e ? this._busy = !0 : this._loading = !0, this._error = "";
  try {
    this._data = e ? await h(this, u).refresh() : await h(this, u).getPackages();
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._loading = !1, this._busy = !1;
  }
};
f = async function(e) {
  this._busy = !0, this._error = "";
  try {
    await e(), this._data = await h(this, u).getPackages();
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._busy = !1;
  }
};
R = function(e) {
  return s`
      <tr class=${e.isHidden ? "hidden" : ""}>
        <td>
          <a class="pkg" href=${e.nuGetUrl} target="_blank" rel="noopener noreferrer">${e.id}</a>
          ${e.isExplicit ? s`<span class="pill added">added</span>` : g}
          ${e.isDeprecated ? s`<span class="pill warn">deprecated</span>` : g}
          ${e.vulnerabilityCount > 0 ? s`<span class="pill danger">${e.vulnerabilityCount} vuln</span>` : g}
        </td>
        <td class="ver">${e.version ?? "—"}</td>
        <td class="num">${q.format(e.totalDownloads)}</td>
        <td class="summary" title=${e.fullSummary ?? ""}>${e.summary}</td>
        <td class="num">
          <uui-button
            look="secondary"
            compact
            label=${e.isHidden ? `Show ${e.id}` : `Hide ${e.id}`}
            ?disabled=${this._busy}
            @click=${() => void l(this, r, f).call(this, () => e.isHidden ? h(this, u).unhide(e.id) : h(this, u).hide(e.id))}
          >${e.isHidden ? "Show" : "Hide"}</uui-button>
        </td>
      </tr>
    `;
};
O = function(e) {
  return s`
      <div class="scroll-x">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Latest</th>
              <th class="num">Downloads</th>
              <th>Summary</th>
              <th class="num"></th>
            </tr>
          </thead>
          <tbody>
            ${e.map((t) => l(this, r, R).call(this, t))}
          </tbody>
        </table>
      </div>
    `;
};
U = function() {
  const e = this._data;
  if (!e) return g;
  const t = e.hidden.length;
  return e.packages.length === 0 && t === 0 ? s`
        <div class="empty">
          Nothing to show yet. Add a NuGet owner account or a specific package on the
          <strong>Manage</strong> tab.
        </div>
      ` : s`
      ${l(this, r, O).call(this, e.packages)}
      ${t > 0 ? s`
            <div class="field" style="margin-top:16px">
              <uui-button
                look="secondary"
                label="Toggle hidden packages"
                @click=${() => {
    this._showHidden = !this._showHidden;
  }}
              >${this._showHidden ? "Hide" : "Show"} hidden (${t})</uui-button>
            </div>
            ${this._showHidden ? l(this, r, O).call(this, e.hidden) : g}
          ` : g}
    `;
};
A = function() {
  const e = this._data;
  return e ? s`
      <uui-box headline="Owner accounts">
        <p class="sub" style="margin-top:0">
          Every package published under these nuget.org accounts is listed.
        </p>
        <div class="field">
          <uui-input
            label="Owner account"
            placeholder="splatdev"
            .value=${this._newOwner}
            @input=${(t) => {
    this._newOwner = t.target.value;
  }}
          ></uui-input>
          <uui-button
            look="primary"
            label="Add owner"
            ?disabled=${this._busy || !this._newOwner.trim()}
            @click=${() => void l(this, r, f).call(this, async () => {
    await h(this, u).addOwner(this._newOwner.trim()), this._newOwner = "";
  })}
          >Add</uui-button>
        </div>
        <div class="chips">
          ${e.owners.length === 0 ? s`<span class="sub">None yet.</span>` : e.owners.map(
    (t) => s`
                  <span class="chip">
                    ${t}
                    <uui-button
                      look="secondary"
                      compact
                      label="Remove ${t}"
                      ?disabled=${this._busy}
                      @click=${() => void l(this, r, f).call(this, () => h(this, u).removeOwner(t))}
                    >×</uui-button>
                  </span>
                `
  )}
        </div>
      </uui-box>

      <uui-box headline="Specific packages">
        <p class="sub" style="margin-top:0">
          Paste a nuget.org URL or type a package id. Useful for packages outside your
          owner accounts.
        </p>
        <div class="field">
          <uui-input
            label="Package URL or id"
            placeholder="https://www.nuget.org/packages/Umbraco.Cms"
            .value=${this._newPackage}
            @input=${(t) => {
    this._newPackage = t.target.value;
  }}
          ></uui-input>
          <uui-button
            look="primary"
            label="Add package"
            ?disabled=${this._busy || !this._newPackage.trim()}
            @click=${() => void l(this, r, f).call(this, async () => {
    await h(this, u).addPackage(this._newPackage.trim()), this._newPackage = "";
  })}
          >Add</uui-button>
        </div>
        <div class="chips">
          ${e.added.length === 0 ? s`<span class="sub">None yet.</span>` : e.added.map(
    (t) => s`
                  <span class="chip">
                    ${t}
                    <uui-button
                      look="secondary"
                      compact
                      label="Remove ${t}"
                      ?disabled=${this._busy}
                      @click=${() => void l(this, r, f).call(this, () => h(this, u).removePackage(t))}
                    >×</uui-button>
                  </span>
                `
  )}
        </div>
      </uui-box>

      <uui-box headline="Hidden packages">
        <p class="sub" style="margin-top:0">
          Hidden packages stay out of the list but keep refreshing, so restoring one never
          shows stale numbers.
        </p>
        ${e.hidden.length === 0 ? s`<span class="sub">Nothing hidden.</span>` : s`<div class="chips">
              ${e.hidden.map(
    (t) => s`
                  <span class="chip">
                    ${t.id}
                    <uui-button
                      look="secondary"
                      compact
                      label="Restore ${t.id}"
                      ?disabled=${this._busy}
                      @click=${() => void l(this, r, f).call(this, () => h(this, u).unhide(t.id))}
                    >restore</uui-button>
                  </span>
                `
  )}
            </div>`}
      </uui-box>
    ` : g;
};
c.styles = D`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      --nc-hairline: color-mix(in srgb, var(--uui-color-border) 60%, transparent);
    }

    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--uui-size-space-4, 12px);
      flex-wrap: wrap;
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      line-height: 1.2;
    }

    .sub {
      margin: 4px 0 0;
      color: var(--uui-color-text-alt);
      font-size: 0.875rem;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 8px);
      flex-wrap: wrap;
    }

    .tabs {
      display: flex;
      gap: var(--uui-size-space-4, 12px);
      border-bottom: 1px solid var(--nc-hairline);
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .tab {
      appearance: none;
      background: none;
      border: 0;
      border-bottom: 2px solid transparent;
      color: var(--uui-color-text-alt);
      font: inherit;
      font-weight: 600;
      padding: 8px 2px;
      cursor: pointer;
    }

    .tab[aria-selected="true"] {
      color: var(--uui-color-text);
      border-bottom-color: var(--uui-color-selected, #3544b1);
    }

    .tab:focus-visible {
      outline: 2px solid var(--uui-color-focus);
      outline-offset: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      min-width: 640px;
    }

    th,
    td {
      text-align: left;
      padding: var(--uui-size-space-3, 8px);
      border-bottom: 1px solid var(--nc-hairline);
      vertical-align: middle;
    }

    th {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: var(--uui-color-text-alt);
      font-weight: 600;
      white-space: nowrap;
    }

    td.num,
    th.num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .pkg {
      font-weight: 600;
      text-decoration: none;
      color: inherit;
      overflow-wrap: anywhere;
    }

    .pkg:hover {
      text-decoration: underline;
    }

    .summary {
      color: var(--uui-color-text-alt);
      overflow-wrap: anywhere;
    }

    .ver {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .pill {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      white-space: nowrap;
      margin-left: 6px;
    }

    .pill.added {
      background: var(--uui-color-surface-alt);
      color: var(--uui-color-text-alt);
    }

    .pill.warn {
      background: var(--uui-color-warning);
      color: var(--uui-color-warning-contrast, #000);
    }

    .pill.danger {
      background: var(--uui-color-danger);
      color: var(--uui-color-selected-contrast, #fff);
    }

    tr.hidden td {
      opacity: 0.55;
    }

    .empty,
    .warn-banner {
      padding: var(--uui-size-space-5, 16px);
      border-radius: var(--uui-border-radius, 3px);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .empty {
      text-align: center;
      color: var(--uui-color-text-alt);
    }

    .warn-banner {
      display: flex;
      gap: var(--uui-size-space-3, 8px);
      background: color-mix(in srgb, var(--uui-color-warning) 18%, var(--uui-color-surface));
      border-left: 3px solid var(--uui-color-warning);
      margin-bottom: var(--uui-size-space-4, 12px);
    }

    .scroll-x {
      overflow-x: auto;
    }

    .field {
      display: flex;
      gap: var(--uui-size-space-3, 8px);
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: var(--uui-size-space-4, 12px);
    }

    .field uui-input {
      flex: 1;
      min-width: 260px;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-2, 6px);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 6px 3px 10px;
      border: 1px solid var(--nc-hairline);
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .error {
      color: var(--uui-color-danger);
      font-size: 0.875rem;
      margin-bottom: var(--uui-size-space-4, 12px);
    }
  `;
b([
  v()
], c.prototype, "_data", 2);
b([
  v()
], c.prototype, "_tab", 2);
b([
  v()
], c.prototype, "_loading", 2);
b([
  v()
], c.prototype, "_busy", 2);
b([
  v()
], c.prototype, "_error", 2);
b([
  v()
], c.prototype, "_showHidden", 2);
b([
  v()
], c.prototype, "_newPackage", 2);
b([
  v()
], c.prototype, "_newOwner", 2);
c = b([
  G("nuget-catalog")
], c);
const Z = c;
export {
  c as NuGetCatalogElement,
  Z as default
};
//# sourceMappingURL=nuget-catalog.element.js.map
