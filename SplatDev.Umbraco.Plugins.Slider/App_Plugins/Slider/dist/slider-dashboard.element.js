import { LitElement as v, html as o, nothing as h, css as m, state as c, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as _ } from "@umbraco-cms/backoffice/auth";
function b(t) {
  let a = null;
  const e = new Promise((r) => {
    t.consumeContext(_, async (s) => {
      var i;
      try {
        a = await ((i = s == null ? void 0 : s.getLatestToken) == null ? void 0 : i.call(s)) ?? null;
      } catch {
        a = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, s = {}) => {
    await e;
    const i = new Headers(s.headers);
    a && !i.has("Authorization") && i.set("Authorization", `Bearer ${a}`);
    const l = await fetch(r, { ...s, credentials: "same-origin", headers: i });
    return (l.status === 401 || l.status === 403) && console.error(
      `[SplatDev] ${l.status} from ${String(r)} — the backoffice token was ${a ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), l;
  };
}
var y = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, p = (t) => {
  throw TypeError(t);
}, u = (t, a, e, r) => {
  for (var s = r > 1 ? void 0 : r ? $(a, e) : a, i = t.length - 1, l; i >= 0; i--)
    (l = t[i]) && (s = (r ? l(a, e, s) : l(s)) || s);
  return r && s && y(a, e, s), s;
}, S = (t, a, e) => a.has(t) || p("Cannot " + e), w = (t, a, e) => (S(t, a, "read from private field"), e ? e.call(t) : a.get(t)), x = (t, a, e) => a.has(t) ? p("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(t) : a.set(t, e), n;
let d = class extends g(v) {
  constructor() {
    super(...arguments), x(this, n, b(this)), this._sliders = [], this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSliders();
  }
  async _loadSliders() {
    try {
      const t = await w(this, n).call(this, "/umbraco/api/slider/GetSliders");
      this._sliders = await t.json();
    } finally {
      this._loading = !1;
    }
  }
  _getTotalSlides() {
    return this._sliders.reduce((t, a) => {
      var e;
      return t + (((e = a.slides) == null ? void 0 : e.length) ?? 0);
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
    const t = this._getTotalSlides(), a = this._sliders.filter((e) => e.autoplay).length;
    return o`
      <div class="stats">
        <div class="stat-card">
          <div class="value">${this._sliders.length}</div>
          <div class="label">Sliders</div>
        </div>
        <div class="stat-card">
          <div class="value">${t}</div>
          <div class="label">Slides</div>
        </div>
        <div class="stat-card">
          <div class="value">${a}</div>
          <div class="label">Autoplay</div>
        </div>
      </div>

      <uui-box headline="Slider Manager">
        ${this._sliders.map(
      (e) => {
        var r;
        return o`
            <uui-box class="slider-card" headline=${e.name}>
              <div class="slider-meta">
                <span>Effect: ${e.effect}</span>
                <span>Autoplay: ${e.autoplay ? `Yes (${e.autoplayDelay}ms)` : "No"}</span>
                <span>Loop: ${e.loop ? "Yes" : "No"}</span>
                <span>Slides: ${(e.slides ?? []).length}</span>
              </div>
              ${(r = e.slides) != null && r.length ? o`
                    <ul class="slide-list">
                      ${[...e.slides ?? []].sort((s, i) => s.sortOrder - i.sortOrder).map(
          (s) => o`
                            <li>
                              <strong>${s.title}</strong>
                              ${s.subtitle ? o` — ${s.subtitle}` : h}
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
n = /* @__PURE__ */ new WeakMap();
d.styles = m`
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
u([
  c()
], d.prototype, "_sliders", 2);
u([
  c()
], d.prototype, "_loading", 2);
d = u([
  f("slider-dashboard")
], d);
const k = d;
export {
  d as SliderDashboardElement,
  k as default
};
