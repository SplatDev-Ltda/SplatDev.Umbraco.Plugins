import { html, css, customElement, property, state, repeat } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { UmbPropertyEditorUiElement, UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";

interface FormItem {
  unique: string;
  name: string;
  path: string;
  isFolder: boolean;
}

const elementName = "splatdev-form-picker-multiple-property-editor";

@customElement(elementName)
export class FormPickerMultiplePropertyEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
  @property({ type: Array })
  value: string[] = [];

  @state()
  private _state: "loading" | "error" | "empty" | "ready" = "loading";

  @state()
  private _errorMessage = "";

  @state()
  private _forms: FormItem[] = [];

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
      this._forms = data.filter((f) => !f.isFolder);
      this._state = this._forms.length > 0 ? "ready" : "empty";
    } catch {
      this._state = "error";
      this._errorMessage = "Unable to connect.";
    }
  }

  #toggleForm(form: FormItem) {
    const idx = this.value.indexOf(form.unique);
    if (idx >= 0) {
      this.value = this.value.filter((id) => id !== form.unique);
    } else {
      this.value = [...this.value, form.unique];
    }
    this.dispatchEvent(new CustomEvent("property-value-change"));
    this.requestUpdate();
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
          <div class="form-list">
            ${repeat(
              this._forms,
              (f) => f.unique,
              (f) => {
                const isSelected = this.value.includes(f.unique);
                return html`
                  <uui-checkbox
                    .value=${f.unique}
                    .checked=${isSelected}
                    @change=${() => this.#toggleForm(f)}
                  >
                    <uui-icon name="icon-umb-contour"></uui-icon> ${f.name}
                  </uui-checkbox>
                `;
              }
            )}
          </div>
        `;
    }
  }

  static override styles = [
    css`
      :host { display: block; width: 100%; }
      .form-list { display: flex; flex-direction: column; gap: 4px; }
    `,
  ];
}

export default FormPickerMultiplePropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: FormPickerMultiplePropertyEditorElement;
  }
}
