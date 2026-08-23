import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

type PropertyEditorConfig = {
  getValueByAlias: <T = unknown>(alias: string) => T | undefined;
};

/**
 * A text area that enforces a character limit and counts down to it.
 *
 * On Umbraco 13 this plugin has always worked: a [DataEditor] with a view that sets
 * maxlength and shows the remaining count. On Umbraco 17 the manifest registered the
 * schema and no UI for it, and the schema's defaultPropertyEditorUiAlias pointed at
 * Umb.PropertyEditorUi.TextBox — so a property using Character Limit rendered as an
 * ordinary text box with no limit and no counter. The plugin's whole purpose did nothing
 * there, quietly, while continuing to work on 13.
 *
 * Behaviour is kept the same as the Umbraco 13 view rather than improved on, so a site
 * upgrading does not find the field behaving differently: same maxChars, same countdown,
 * same wording.
 */
@customElement("charlimit-property-editor")
export class CharLimitPropertyEditorElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; }
    uui-textarea { width: 100%; }
    .count {
      display: block;
      margin-top: 5px;
      font-size: 0.82rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .count.low { color: var(--uui-color-warning-standalone, #b26a00); }
    .count.over { color: var(--uui-color-danger, #d42054); font-weight: 700; }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  @state() private _maxChars?: number;
  @state() private _showCountdown = true;

  @property({ attribute: false })
  set config(config: PropertyEditorConfig | undefined) {
    if (!config) return;

    // The Umbraco 13 configuration editor stores these as strings, so a data type carried
    // over from 13 hands us "200" rather than 200.
    const max = config.getValueByAlias<number | string>("maxChars");
    const parsed = typeof max === "string" ? parseInt(max, 10) : max;
    this._maxChars = Number.isFinite(parsed) && (parsed as number) > 0 ? (parsed as number) : undefined;

    const countdown = config.getValueByAlias<boolean | string>("showCountdown");
    this._showCountdown = countdown === undefined ? true : countdown === true || countdown === "1";
  }

  #onInput(e: Event): void {
    const next = (e.target as HTMLInputElement).value;
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    const length = (this.value ?? "").length;
    const remaining = this._maxChars === undefined ? undefined : this._maxChars - length;

    return html`
      <uui-textarea
        label="Text"
        .value=${this.value ?? ""}
        maxlength=${this._maxChars ?? nothing}
        ?readonly=${this.readonly}
        @input=${this.#onInput}
      ></uui-textarea>

      ${this._showCountdown && remaining !== undefined
        ? html`<span class="count ${remaining < 0 ? "over" : remaining <= 10 ? "low" : ""}">
            ${remaining} characters remaining
          </span>`
        : nothing}
    `;
  }
}

export default CharLimitPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "charlimit-property-editor": CharLimitPropertyEditorElement;
  }
}
