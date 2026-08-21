import { LitElement as b, html as o, nothing as _, css as y, state as v, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as S } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as T } from "@umbraco-cms/backoffice/notification";
function x(a) {
  let t = null, e = null;
  const l = a.consumeContext.bind(a), s = new Promise((r) => {
    l(S, async (i) => {
      var n;
      try {
        t = await ((n = i == null ? void 0 : i.getLatestToken) == null ? void 0 : n.call(i)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return l(T, (r) => {
    e = r;
  }), async (r, i = {}) => {
    await s;
    const n = new Headers(i.headers);
    t && !n.has("Authorization") && n.set("Authorization", `Bearer ${t}`);
    const d = await fetch(r, { ...i, credentials: "same-origin", headers: n });
    if (!d.ok) {
      const h = d.status === 401 || d.status === 403, g = h ? "Not authorised" : "Could not load data", m = h ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${d.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${d.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${d.status} from ${String(r)} — ${m}`), e == null || e.peek("danger", { data: { headline: g, message: m } });
    }
    return d;
  };
}
var C = Object.defineProperty, A = Object.getOwnPropertyDescriptor, f = (a) => {
  throw TypeError(a);
}, p = (a, t, e, l) => {
  for (var s = l > 1 ? void 0 : l ? A(t, e) : t, r = a.length - 1, i; r >= 0; r--)
    (i = a[r]) && (s = (l ? i(t, e, s) : i(s)) || s);
  return l && s && C(t, e, s), s;
}, E = (a, t, e) => t.has(a) || f("Cannot " + e), O = (a, t, e) => (E(a, t, "read from private field"), e ? e.call(a) : t.get(a)), k = (a, t, e) => t.has(a) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, e), c;
let u = class extends $(b) {
  constructor() {
    super(...arguments), k(this, c, x(this)), this._sliders = [], this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSliders();
  }
  async _loadSliders() {
    try {
      const a = await O(this, c).call(this, "/umbraco/api/slider/GetSliders");
      this._sliders = await a.json();
    } finally {
      this._loading = !1;
    }
  }
  _getTotalSlides() {
    return this._sliders.reduce((a, t) => {
      var e;
      return a + (((e = t.slides) == null ? void 0 : e.length) ?? 0);
    }, 0);
  }
  render() {
    if (this._loading)
      return o`<uui-loader-bar></uui-loader-bar>`;
    if (!this._sliders.length)
      return o`
        <uui-box headline="Slider Manager">
          <div class="empty-state">
            <p>No sliders found. Create a slider from the Developer section.</p>
          </div>
        </uui-box>
      `;
    const a = this._getTotalSlides(), t = this._sliders.filter((e) => e.autoplay).length;
    return o`
      <div class="stats">
        <div class="stat-card">
          <div class="value">${this._sliders.length}</div>
          <div class="label">Sliders</div>
        </div>
        <div class="stat-card">
          <div class="value">${a}</div>
          <div class="label">Slides</div>
        </div>
        <div class="stat-card">
          <div class="value">${t}</div>
          <div class="label">Autoplay</div>
        </div>
      </div>

      <uui-box headline="Slider Manager">
        ${this._sliders.map(
      (e) => {
        var l;
        return o`
            <uui-box class="slider-card" headline=${e.name}>
              <div class="slider-meta">
                <span>Effect: ${e.effect}</span>
                <span>Autoplay: ${e.autoplay ? `Yes (${e.autoplayDelay}ms)` : "No"}</span>
                <span>Loop: ${e.loop ? "Yes" : "No"}</span>
                <span>Slides: ${(e.slides ?? []).length}</span>
              </div>
              ${(l = e.slides) != null && l.length ? o`
                    <ul class="slide-list">
                      ${[...e.slides ?? []].sort((s, r) => s.sortOrder - r.sortOrder).map(
          (s) => o`
                            <li>
                              <strong>${s.title}</strong>
                              ${s.subtitle ? o` — ${s.subtitle}` : _}
                            </li>
                          `
        )}
                    </ul>
                  ` : o`<p style="color:var(--uui-color-text-alt);">No slides in this slider.</p>`}
            </uui-box>
          `;
      }
    )}
      </uui-box>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
u.styles = y`
    :host {
      display: block;
      padding: 1rem;
    }

    .slide-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .slide-list li {
      padding: 0.25rem 0;
      border-bottom: 1px solid var(--uui-color-border);
    }

    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      flex: 1;
      padding: 1rem;
      background: var(--uui-color-surface-alt);
      border-radius: var(--uui-border-radius);
      text-align: center;
    }

    .stat-card .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--uui-color-interactive);
    }

    .stat-card .label {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
      margin-top: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--uui-color-text-alt);
    }

    .slider-card {
      margin-bottom: 1rem;
    }

    .slider-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: var(--uui-color-text-alt);
      margin-bottom: 0.75rem;
    }

    .slider-meta span {
      background: var(--uui-color-surface-alt);
      padding: 0.125rem 0.5rem;
      border-radius: var(--uui-border-radius);
    }
  `;
p([
  v()
], u.prototype, "_sliders", 2);
p([
  v()
], u.prototype, "_loading", 2);
u = p([
  w("slider-dashboard")
], u);
const P = u;
export {
  u as SliderDashboardElement,
  P as default
};
