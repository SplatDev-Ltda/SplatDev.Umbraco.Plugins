import { html, css, customElement, property, state, when } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { UmbPropertyEditorUiElement, UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";

interface FormItem {
  unique: string;
  name: string;
}

interface ThemeOption {
  name: string;
  value: string;
}

interface FormDetailsValue {
  formId: string | null;
  theme: string | null;
  redirectToPageId: string | null;
}

const elementName = "splatdev-form-details-picker-property-editor";

@customElement(elementName)
export class FormDetailsPickerPropertyEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
  @property({ type: Object })
  get value(): FormDetailsValue {
    return this.#value;
  }
  set value(v: FormDetailsValue) {
    this.#value = v ? { ...v } : { formId: null, theme: null, redirectToPageId: null };
  }

  #value: FormDetailsValue = { formId: null, theme: null, redirectToPageId: null };

  @state()
  private _formsState: "loading" | "error" | "empty" | "ready" = "loading";
  @state()
  private _themesState: "loading" | "error" | "empty" | "ready" = "loading";
  @state()
  private _errorMessage = "";

  @state()
  private _forms: FormItem[] = [];
  @state()
  private _themes: ThemeOption[] = [];

  @state()
  private _includeThemePicker = false;
  @state()
  private _includeRedirectPicker = false;

  set config(config: UmbPropertyEditorConfigCollection | undefined) {
    this._includeThemePicker = config?.getValueByAlias("includeThemePicker") ?? false;
    this._includeRedirectPicker = config?.getValueByAlias("includeRedirectPicker") ?? false;
  }

  override async connectedCallback() {
    super.connectedCallback();
    await Promise.all([this.#loadForms(), this.#loadThemes()]);
  }

  async #loadForms() {
    this._formsState = "loading";
    try {
      const response = await fetch("/umbraco/backoffice/umbracoforms/forms/getall");
      if (!response.ok) {
        this._formsState = "error";
        this._errorMessage = response.status >= 400 && response.status < 500
          ? "Form data unavailable."
          : "Server error loading forms.";
        return;
      }
      const data: FormItem[] = await response.json();
      this._forms = data.filter((f: any) => !f.isFolder);
      this._formsState = this._forms.length > 0 ? "ready" : "empty";
    } catch {
      this._formsState = "error";
      this._errorMessage = "Unable to load forms.";
    }
  }

  async #loadThemes() {
    this._themesState = "loading";
    try {
      const response = await fetch("/umbraco/backoffice/umbracoforms/themes/getall");
      if (!response.ok) {
        this._themesState = "error";
        return;
      }
      const data: string[] = await response.json();
      this._themes = data.map((t) => ({ name: t, value: t }));
      this._themesState = this._themes.length > 0 ? "ready" : "empty";
    } catch {
      this._themesState = "error";
    }
  }

  #onFormChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.#value.formId = select.value || null;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("property-value-change"));
  }

  #onThemeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.#value.theme = select.value || null;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("property-value-change"));
  }

  #onRedirectChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.#value.redirectToPageId = input.value || null;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("property-value-change"));
  }

  #renderFormsSection() {
    switch (this._formsState) {
      case "loading": return html`<uui-loader-bar></uui-loader-bar>`;
      case "error": return html`<uui-badge look="danger">${this._errorMessage}</uui-badge>`;
      case "empty": return html`<p><em>No forms available.</em></p>`;
      case "ready":
        return html`
          <uui-select
            @change=${this.#onFormChange}
            .options=${[
              { name: "— Select a form —", value: "", selected: !this.#value.formId },
              ...this._forms.map((f) => ({ name: f.name, value: f.unique, selected: f.unique === this.#value.formId })),
            ]}
          ></uui-select>`;
    }
  }

  #renderThemesSection() {
    switch (this._themesState) {
      case "loading": return html`<uui-loader-bar></uui-loader-bar>`;
      case "error": return html`<uui-badge look="danger">Theme data unavailable.</uui-badge>`;
      case "empty": return html`<p><em>No themes available.</em></p>`;
      case "ready":
        return html`
          <uui-select
            @change=${this.#onThemeChange}
            .options=${[
              { name: "— Select a theme —", value: "", selected: !this.#value.theme },
              ...this._themes.map((t) => ({ ...t, selected: t.value === this.#value.theme })),
            ]}
          ></uui-select>`;
    }
  }

  render() {
    return html`
      <umb-property-layout alias="form" label="Form">
        ${this.#renderFormsSection()}
      </umb-property-layout>

      ${when(this._includeThemePicker, () => html`
        <umb-property-layout alias="theme" label="Theme">
          ${this.#renderThemesSection()}
        </umb-property-layout>
      `)}

      ${when(this._includeRedirectPicker, () => html`
        <umb-property-layout alias="redirect" label="Redirect to Page">
          <uui-input
            .value=${this.#value.redirectToPageId ?? ""}
            @change=${this.#onRedirectChange}
            placeholder="Enter page GUID"
          ></uui-input>
        </umb-property-layout>
      `)}
    `;
  }

  static override styles = [
    css`
      :host { display: block; width: 100%; }
      uui-select { width: 100%; }
      uui-input { width: 100%; }
    `,
  ];
}

export default FormDetailsPickerPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: FormDetailsPickerPropertyEditorElement;
  }
}
