import { html, css, customElement, property, state, repeat } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { UmbPropertyEditorUiElement, UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";

interface FormItem {
  unique: string;
  name: string;
  path: string;
  isFolder: boolean;
}

const elementName = "splatdev-form-picker-single-property-editor";

@customElement(elementName)
export class FormPickerSinglePropertyEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
  @property({ type: String })
  value = "";

  @state()
  private _state: "loading" | "error" | "empty" | "ready" = "loading";

  @state()
  private _errorMessage = "";

  @state()
  private _forms: FormItem[] = [];

  @state()
  private _selectedName = "";

  set config(config: UmbPropertyEditorConfigCollection | undefined) {
    this._allowedFolders = config?.getValueByAlias("allowedFolders") ?? [];
    this._allowedForms = config?.getValueByAlias("allowedForms") ?? [];
  }

  private _allowedFolders: string[] = [];
  private _allowedForms: string[] = [];

  override async connectedCallback() {
    super.connectedCallback();
    await this.#loadForms();
  }

  async #loadForms() {
    this._state = "loading";
    this._errorMessage = "";
    try {
      const response = await fetch("/umbraco/backoffice/umbracoforms/forms/getall");
      if (!response.ok) {
        this._state = "error";
        this._errorMessage = response.status >= 400 && response.status < 500
          ? "Form data is not available. Please check your configuration."
          : "Failed to load forms. Server error.";
        return;
      }
      const data: FormItem[] = await response.json();
      const filtered = data.filter((f) => !f.isFolder);
      this._forms = filtered;
      if (this.value) {
        const selected = filtered.find((f) => f.unique === this.value);
        this._selectedName = selected?.name ?? "";
      }
      this._state = this._forms.length > 0 ? "ready" : "empty";
    } catch {
      this._state = "error";
      this._errorMessage = "Unable to connect.";
    }
  }

  #onChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.value = select.value;
    this._selectedName = select.selectedOptions[0]?.text ?? "";
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
        return html`<p><em>No forms available.</em></p>`;
      case "ready":
        return html`
          <uui-select
            @change=${this.#onChange}
            .options=${[
              { name: "— Select a form —", value: "", selected: !this.value },
              ...this._forms.map((f) => ({
                name: f.name,
                value: f.unique,
                selected: f.unique === this.value,
              })),
            ]}
          ></uui-select>
        `;
    }
  }

  static override styles = [
    css`
      :host { display: block; width: 100%; }
      uui-select { width: 100%; }
    `,
  ];
}

export default FormPickerSinglePropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: FormPickerSinglePropertyEditorElement;
  }
}
