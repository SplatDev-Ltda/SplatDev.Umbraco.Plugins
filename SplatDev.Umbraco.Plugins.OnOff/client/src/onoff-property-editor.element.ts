import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

type PropertyEditorConfig = {
  getValueByAlias: <T = unknown>(alias: string) => T | undefined;
};

/**
 * A labelled on/off switch for a boolean property.
 *
 * The plugin has always shipped this switch — markup, styling and an Angular controller
 * — but never registered it as a property editor anywhere. On Umbraco 13 the
 * `[DataEditor]` attribute pointed at a view whose classes no stylesheet defined, so it
 * rendered unstyled; on Umbraco 17 the attribute is compiled out and nothing replaced
 * it, so there was no editor at all.
 *
 * The value is stored by Umbraco's own `Umbraco.TrueFalse` schema rather than a bespoke
 * one, so this is purely a different face on a boolean the CMS already understands, and
 * a property using it can be switched to the built-in toggle without a data migration.
 */
@customElement("onoff-property-editor")
export class OnOffPropertyEditorElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; }

    .switch {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 96px;
      height: 34px;
      border-radius: 999px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      background: var(--uui-color-surface-alt, #f1f2f0);
      cursor: pointer;
      padding: 0;
      overflow: hidden;
      transition: background 160ms ease, border-color 160ms ease;
      font: inherit;
      color: inherit;
    }
    .switch:focus-visible {
      outline: 2px solid var(--uui-color-focus, #3b82f6);
      outline-offset: 2px;
    }
    .switch[aria-checked="true"] {
      background: var(--uui-color-positive, #2f9e44);
      border-color: var(--uui-color-positive, #2f9e44);
    }
    .switch[disabled] { opacity: 0.55; cursor: not-allowed; }

    .label {
      flex: 1;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-align: center;
      transition: color 160ms ease;
      color: var(--uui-color-text-alt, #6b7280);
      padding-inline: 26px 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .switch[aria-checked="true"] .label {
      color: var(--uui-color-selected-contrast, #fff);
      padding-inline: 8px 26px;
    }

    .knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--uui-color-surface, #fff);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
      transition: transform 160ms ease;
    }
    .switch[aria-checked="true"] .knob { transform: translateX(62px); }

    @media (prefers-reduced-motion: reduce) {
      .switch, .label, .knob { transition: none; }
    }

    .readonly-note {
      display: block;
      margin-top: 6px;
      font-size: 0.8rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
  `;

  @property({ type: Boolean, reflect: false })
  value = false;

  @property({ type: Boolean })
  readonly = false;

  @state() private _onText = "On";
  @state() private _offText = "Off";

  /**
   * Accepts the labels under both spellings.
   *
   * The Angular editor this replaces used onText/offText, and existing data types are
   * configured with those names; Umbraco's own toggle uses labelOn/labelOff. Reading
   * both means a data type configured against the old editor keeps its labels.
   */
  @property({ attribute: false })
  set config(config: PropertyEditorConfig | undefined) {
    if (!config) return;
    this._onText =
      config.getValueByAlias<string>("onText") ??
      config.getValueByAlias<string>("labelOn") ??
      "On";
    this._offText =
      config.getValueByAlias<string>("offText") ??
      config.getValueByAlias<string>("labelOff") ??
      "Off";
  }

  #toggle(): void {
    if (this.readonly) return;
    this.value = !this.value;
    this.dispatchEvent(new UmbChangeEvent());
  }

  #onKeydown(e: KeyboardEvent): void {
    // A button already handles Enter and Space, but a switch should also respond to the
    // arrow keys that assistive technology sends for this role.
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = e.key === "ArrowRight";
      if (next !== this.value) this.#toggle();
    }
  }

  override render() {
    const on = !!this.value;
    return html`
      <button
        type="button"
        class="switch"
        role="switch"
        aria-checked=${on ? "true" : "false"}
        ?disabled=${this.readonly}
        @click=${this.#toggle}
        @keydown=${this.#onKeydown}
      >
        <span class="label">${on ? this._onText : this._offText}</span>
        <span class="knob"></span>
      </button>
      ${this.readonly ? html`<span class="readonly-note">Read only.</span>` : nothing}
    `;
  }
}

export default OnOffPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "onoff-property-editor": OnOffPropertyEditorElement;
  }
}
