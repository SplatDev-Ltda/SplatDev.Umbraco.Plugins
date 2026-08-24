import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

type PropertyEditorConfig = {
  getValueByAlias: <T = unknown>(alias: string) => T | undefined;
};

/**
 * Stamps a value configured on the data type onto the property.
 *
 * This is the editor the Umbraco 7/8 plugin was, restored. Version 2.x replaced the
 * plugin with a rules engine and shipped no editor, so a document type carried over from
 * those versions had properties bound to an editor that no longer existed. The rules
 * engine is unchanged and remains the way to apply defaults across many properties; this
 * is the per-property version.
 */
@customElement("defaultvalue-property-editor")
export class DefaultValuePropertyEditorElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; }
    .value {
      padding: 8px 10px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 3px;
      background: var(--uui-color-surface-alt, #f6f6f7);
      font-family: var(--uui-font-monospace, monospace);
      word-break: break-word;
    }
    .note {
      display: block;
      margin-top: 6px;
      font-size: 0.82rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .unset {
      display: block;
      padding: 8px 10px;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
      font-size: 0.85rem;
      border-radius: 3px;
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  @state() private _default: string | null = null;

  @property({ attribute: false })
  set config(config: PropertyEditorConfig | undefined) {
    if (!config) return;
    const configured = config.getValueByAlias<string>("dValue");
    this._default = configured ?? null;
    this.#applyDefault();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#applyDefault();
  }

  /**
   * The original overwrote the property value on every load. That loses an edit made
   * anywhere else, so the default is only applied when the property is actually empty.
   */
  #applyDefault(): void {
    if (this.readonly) return;
    if (this._default === null || this._default === "") return;
    if (this.value !== undefined && this.value !== null && this.value !== "") return;

    this.value = this._default;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    if (this._default === null) {
      return html`<span class="unset">
        No default is set on this data type. Set <strong>Default Value</strong> in its
        settings and it will be applied to this property.
      </span>`;
    }

    return html`
      <div class="value">${this.value || this._default}</div>
      <span class="note">
        ${this.value && this.value !== this._default
          ? html`Set on this page. The data type's default is <code>${this._default}</code>.`
          : html`From the data type's default.`}
      </span>
    `;
  }
}

export default DefaultValuePropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "defaultvalue-property-editor": DefaultValuePropertyEditorElement;
  }
}
