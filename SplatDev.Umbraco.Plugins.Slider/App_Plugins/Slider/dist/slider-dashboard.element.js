import { LitElement as c, html as r, nothing as p, css as m, state as u, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, h = Object.getOwnPropertyDescriptor, n = (t, a, e, l) => {
  for (var s = l > 1 ? void 0 : l ? h(a, e) : a, o = t.length - 1, d; o >= 0; o--)
    (d = t[o]) && (s = (l ? d(a, e, s) : d(s)) || s);
  return l && s && g(a, e, s), s;
};
let i = class extends b(c) {
  constructor() {
    super(...arguments), this._sliders = [], this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSliders();
  }
  async _loadSliders() {
    try {
      const t = await fetch("/umbraco/api/slider/GetSliders");
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
      return r`<uui-loader-bar></uui-loader-bar>`;
    if (!this._sliders.length)
      return r`
        <uui-box headline="Slider Manager">
          <div class="empty-state">
            <p>No sliders found. Create a slider from the Developer section.</p>
          </div>
        </uui-box>
      `;
    const t = this._getTotalSlides(), a = this._sliders.filter((e) => e.autoplay).length;
    return r`
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
        var l;
        return r`
            <uui-box class="slider-card" headline=${e.name}>
              <div class="slider-meta">
                <span>Effect: ${e.effect}</span>
                <span>Autoplay: ${e.autoplay ? `Yes (${e.autoplayDelay}ms)` : "No"}</span>
                <span>Loop: ${e.loop ? "Yes" : "No"}</span>
                <span>Slides: ${(e.slides ?? []).length}</span>
              </div>
              ${(l = e.slides) != null && l.length ? r`
                    <ul class="slide-list">
                      ${[...e.slides ?? []].sort((s, o) => s.sortOrder - o.sortOrder).map(
          (s) => r`
                            <li>
                              <strong>${s.title}</strong>
                              ${s.subtitle ? r` — ${s.subtitle}` : p}
                            </li>
                          `
        )}
                    </ul>
                  ` : r`<p style="color:var(--uui-color-text-alt);">No slides in this slider.</p>`}
            </uui-box>
          `;
      }
    )}
      </uui-box>
    `;
  }
};
i.styles = m`
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
n([
  u()
], i.prototype, "_sliders", 2);
n([
  u()
], i.prototype, "_loading", 2);
i = n([
  v("slider-dashboard")
], i);
const x = i;
export {
  i as SliderDashboardElement,
  x as default
};
