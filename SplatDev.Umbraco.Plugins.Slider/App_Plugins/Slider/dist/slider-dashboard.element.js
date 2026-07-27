import { LitElement as p, html as o, css as c, state as u, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var f = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, n = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? _(t, r) : t, a = e.length - 1, d; a >= 0; a--)
    (d = e[a]) && (s = (i ? d(t, r, s) : d(s)) || s);
  return i && s && f(t, r, s), s;
};
let l = class extends b(p) {
  constructor() {
    super(...arguments), this._sliders = [], this._loading = !0;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSliders();
  }
  async _loadSliders() {
    try {
      const e = await fetch("/umbraco/api/slider/GetSliders");
      this._sliders = await e.json();
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return this._loading ? o`<uui-loader></uui-loader>` : o`
      <uui-box headline="Slider Manager">
        ${this._sliders.map((e) => o`
          <uui-box headline=${e.name}>
            <p>Effect: ${e.effect} | Autoplay: ${e.autoplay ? "Yes" : "No"} (${e.autoplayDelay}ms)</p>
            <ul class="slide-list">
              ${(e.slides ?? []).sort((t, r) => t.sortOrder - r.sortOrder).map((t) => o`<li><strong>${t.title}</strong>${t.subtitle ? ` - ${t.subtitle}` : ""}</li>`)}
            </ul>
          </uui-box>
        `)}
      </uui-box>
    `;
  }
};
l.styles = c`
    :host { display: block; padding: 1rem; }
    .slide-list { list-style: none; padding: 0; margin: 0; }
    .slide-list li { padding: 0.25rem 0; border-bottom: 1px solid var(--uui-color-border); }
  `;
n([
  u()
], l.prototype, "_sliders", 2);
n([
  u()
], l.prototype, "_loading", 2);
l = n([
  m("slider-dashboard")
], l);
const y = l;
export {
  l as SliderDashboardElement,
  y as default
};
