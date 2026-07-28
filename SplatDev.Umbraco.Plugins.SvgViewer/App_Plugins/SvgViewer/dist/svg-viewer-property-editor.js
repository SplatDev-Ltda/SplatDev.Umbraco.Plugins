import { LitElement as u, html as p, unsafeHTML as c, css as d, property as v, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
var y = Object.defineProperty, g = Object.getOwnPropertyDescriptor, l = (n, t, i, o) => {
  for (var e = o > 1 ? void 0 : o ? g(t, i) : t, s = n.length - 1, a; s >= 0; s--)
    (a = n[s]) && (e = (o ? a(t, i, e) : a(e)) || e);
  return o && e && y(t, i, e), e;
};
let r = class extends f(u) {
  render() {
    return !this.value || this.value.trim() === "" ? p`
        <div class="svg-container">
          <span class="empty-label">No SVG content</span>
        </div>
      ` : p`
      <div class="svg-container">
        ${c(this.value)}
      </div>
    `;
  }
};
r.styles = d`
    :host {
      display: block;
    }
    .svg-container {
      border: 1px dashed var(--uui-color-border);
      border-radius: var(--uui-border-radius, 8px);
      padding: var(--uui-size-space-4, 16px);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
      background: var(--uui-color-surface);
    }
    .svg-container svg {
      max-width: 100%;
      max-height: 100%;
    }
    .empty-label {
      color: var(--uui-color-text-alt);
      font-style: italic;
      font-size: 13px;
    }
  `;
l([
  v()
], r.prototype, "value", 2);
l([
  v({ type: Boolean })
], r.prototype, "readonly", 2);
r = l([
  m("svg-viewer-property-editor")
], r);
const b = r;
export {
  r as SvgViewerPropertyEditor,
  b as default
};
//# sourceMappingURL=svg-viewer-property-editor.js.map
