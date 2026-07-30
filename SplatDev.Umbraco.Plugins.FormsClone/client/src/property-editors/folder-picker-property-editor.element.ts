import { html, css, customElement, property, state, repeat } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";

interface FolderItem {
  unique: string;
  name: string;
}

const elementName = "splatdev-folder-picker-property-editor";

@customElement(elementName)
export class FolderPickerPropertyEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
  @property({ type: Array })
  value: string[] = [];

  @state()
  private _state: "loading" | "error" | "empty" | "ready" = "loading";

  @state()
  private _errorMessage = "";

  @state()
  private _folders: FolderItem[] = [];

  @state()
  private _selected: FolderItem[] = [];

  override async connectedCallback() {
    super.connectedCallback();
    await this.#loadFolders();
  }

  async #loadFolders() {
    this._state = "loading";
    this._errorMessage = "";
    try {
      const response = await fetch("/umbraco/backoffice/umbracoforms/folders/getall");
      if (!response.ok) {
        this._state = "error";
        this._errorMessage = response.status >= 400 && response.status < 500
          ? "Folder data is not available."
          : "Failed to load folders. Server error.";
        return;
      }
      const data: FolderItem[] = await response.json();
      this._folders = data;
      this._state = this._folders.length > 0 ? "ready" : "empty";
    } catch {
      this._state = "error";
      this._errorMessage = "Unable to connect.";
    }
  }

  #toggleFolder(folder: FolderItem) {
    const idx = this._selected.findIndex((s) => s.unique === folder.unique);
    if (idx >= 0) {
      this._selected = this._selected.filter((s) => s.unique !== folder.unique);
    } else {
      this._selected = [...this._selected, folder];
    }
    this.value = this._selected.map((s) => s.unique);
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
        return html`<p><em>No folders available.</em></p>`;
      case "ready":
        return html`
          <div class="folder-list">
            ${repeat(
              this._folders,
              (f) => f.unique,
              (f) => {
                const isSelected = this._selected.some((s) => s.unique === f.unique);
                return html`
                  <uui-checkbox
                    .value=${f.unique}
                    .checked=${isSelected}
                    @change=${() => this.#toggleFolder(f)}
                  >
                    <uui-icon name="icon-folder"></uui-icon> ${f.name}
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
      .folder-list { display: flex; flex-direction: column; gap: 4px; }
    `,
  ];
}

export default FolderPickerPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: FolderPickerPropertyEditorElement;
  }
}
