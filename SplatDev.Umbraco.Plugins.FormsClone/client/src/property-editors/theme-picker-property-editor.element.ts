import { html, css, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";

const elementName = "splatdev-theme-picker-property-editor";

@customElement(elementName)
export class ThemePickerPropertyEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
  @property()
  value = "";

  @state()
  private _state: "loading" | "error" | "empty" | "ready" = "loading";

  @state()
  private _errorMessage = "";

  @state()
  private _options: Array<{ name: string; value: string }> = [];

  override async connectedCallback() {
    super.connectedCallback();
    await this.#loadThemes();
  }

  async #loadThemes() {
    this._state = "loading";
    this._errorMessage = "";
    try {
      const response = await fetch("/umbraco/backoffice/umbracoforms/themes/getall");
      if (!response.ok) {
        this._state = "error";
        this._errorMessage = response.status >= 400 && response.status < 500
          ? "Theme data is not available. Please check your configuration."
          : "Failed to load themes. Server error.";
        return;
      }
      const data: string[] = await response.json();
      this._options = data.map((t) => ({ name: t, value: t }));
      this._state = this._options.length > 0 ? "ready" : "empty";
    } catch {
      this._state = "error";
      this._errorMessage = "Unable to connect. Please check your network connection.";
    }
  }

  #onChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.value = select.value;
    this.dispatchEvent(new CustomEvent("property-value-change"));
  }

  render() {
    switch (this._state) {
      case "loading":
        return html`<uui-loader-bar></uui-loader-bar>`;
      case "error":
        return html`<uui-badge look="danger" color="danger">
          <uui-icon name="icon-alert"></uui-icon> ${this._errorMessage}
        </uui-badge>`;
      case "empty":
        return html`<p><em>No themes available.</em></p>`;
      case "ready":
        return html`
          <uui-select
            @change=${this.#onChange}
            .options=${this._options.map((o) => ({
              ...o,
              selected: o.value === this.value,
            }))}
          ></uui-select>`;
    }
  }

  static override styles = [
    css`
      :host { display: block; width: 100%; }
      uui-select { width: 100%; }
    `,
  ];
}

export default ThemePickerPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: ThemePickerPropertyEditorElement;
  }
}
