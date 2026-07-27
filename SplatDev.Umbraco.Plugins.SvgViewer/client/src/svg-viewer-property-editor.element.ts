import { LitElement, html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { unsafeHTML } from "@umbraco-cms/backoffice/external/lit";

@customElement("svg-viewer-property-editor")
export class SvgViewerPropertyEditor
  extends UmbElementMixin(LitElement)
  implements UmbPropertyEditorUiElement
{
  static styles = css`
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

  @property()
  value?: string;

  @property({ type: Boolean })
  readonly?: boolean;

  render() {
    if (!this.value || this.value.trim() === "") {
      return html`
        <div class="svg-container">
          <span class="empty-label">No SVG content</span>
        </div>
      `;
    }

    return html`
      <div class="svg-container">
        ${unsafeHTML(this.value)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-viewer-property-editor": SvgViewerPropertyEditor;
  }
}

export default SvgViewerPropertyEditor;
