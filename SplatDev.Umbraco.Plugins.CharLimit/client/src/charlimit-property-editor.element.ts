import { LitElement, html, css, nothing, unsafeCSS } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

type PropertyEditorConfig = {
  getValueByAlias: <T = unknown>(alias: string) => T | undefined;
};

/** The three states the counter bar moves through, from the Umbraco 7/8 plugin. */
const GREEN = "#39d38b";
const OLIVE = "#7c8510";
const CRIMSON = "#d42054";

/**
 * A character-limited field whose counter changes colour as it fills.
 *
 * Umbraco 17 can cap a textbox on its own, so a plugin that only does that has no reason
 * to exist. What this one has always been is the *visual* version: a counter bar under the
 * field that runs green while there is room, olive past halfway, and crimson once the
 * limit is reached — with a matching icon and the remaining count spelled out.
 *
 * The port had lost all of that, along with the plugin's `limit` prevalue, its
 * `icon-stop-hand` identity and its three translations. This restores them.
 */
@customElement("charlimit-property-editor")
export class CharLimitPropertyEditorElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; }

    .field {
      width: 100%;
      box-sizing: border-box;
      display: block;
      font: inherit;
      padding: 6px 8px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 3px 3px 0 0;
      background: var(--uui-color-surface, #fff);
      color: inherit;
    }
    .field:focus-visible {
      outline: 2px solid var(--uui-color-focus, #3b82f6);
      outline-offset: -2px;
    }
    textarea.field { resize: vertical; min-height: 8lh; }

    .counter {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      width: 100%;
      box-sizing: border-box;
      padding: 5px 10px;
      font-size: 0.85rem;
      font-weight: 400;
      color: #fff;
      opacity: 0.85;
      border-radius: 0 0 4px 4px;
      /* The original eased between the three colours; keep that, but respect a
         reduced-motion preference. */
      transition: background 0.4s ease-in-out;
    }
    @media (prefers-reduced-motion: reduce) {
      .counter { transition: none; }
    }

    .counter[data-state="ok"]      { background: ${unsafeCSS(GREEN)}; }
    .counter[data-state="warning"] { background: ${unsafeCSS(OLIVE)}; }
    .counter[data-state="full"]    { background: ${unsafeCSS(CRIMSON)}; font-weight: 700; opacity: 1; }

    .counter uui-icon { font-size: 1rem; }

    .unset {
      display: block;
      margin-top: 6px;
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

  @state() private _limit = 0;
  @state() private _showCountdown = true;
  @state() private _threshold = 100;

  @property({ attribute: false })
  set config(config: PropertyEditorConfig | undefined) {
    if (!config) return;

    // "limit" is the Umbraco 7/8 key. A data type carried over from those versions has it,
    // and reading only "maxChars" silently fell back to a default — the field looked
    // configured and was not.
    const limit =
      config.getValueByAlias<number>("limit") ??
      config.getValueByAlias<number>("maxChars") ??
      0;

    this._limit = Number(limit) || 0;
    this._showCountdown = config.getValueByAlias<boolean>("showCountdown") ?? true;
    this._threshold = Number(config.getValueByAlias<number>("textareaThreshold") ?? 100);
  }

  /** Where the value sits against its limit. */
  get #state(): "ok" | "warning" | "full" {
    const used = this.value?.length ?? 0;
    if (this._limit > 0 && used >= this._limit) return "full";
    if (this._limit > 0 && used > this._limit / 2) return "warning";
    return "ok";
  }

  get #remaining(): number {
    return Math.max(0, this._limit - (this.value?.length ?? 0));
  }

  #onInput(e: Event): void {
    const input = e.target as HTMLInputElement | HTMLTextAreaElement;
    // maxlength stops typing, but not a paste on every browser, so the value is clamped
    // here too rather than trusting the control.
    const next = this._limit > 0 ? input.value.slice(0, this._limit) : input.value;
    if (next !== input.value) input.value = next;
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    if (this._limit <= 0) {
      return html`
        <input class="field" .value=${this.value ?? ""} ?disabled=${this.readonly} @input=${this.#onInput} />
        <span class="unset">
          No limit is set on this data type. Set <strong>Number of Characters</strong> in its
          settings and the counter will appear.
        </span>
      `;
    }

    const state = this.#state;
    const multiline = this._threshold > 0 && this._limit >= this._threshold;

    const field = multiline
      ? html`<textarea
          class="field"
          rows="10"
          maxlength=${this._limit}
          .value=${this.value ?? ""}
          ?disabled=${this.readonly}
          @input=${this.#onInput}
        ></textarea>`
      : html`<input
          class="field"
          type="text"
          maxlength=${this._limit}
          .value=${this.value ?? ""}
          ?disabled=${this.readonly}
          @input=${this.#onInput}
        />`;

    if (!this._showCountdown) return field;

    const icon =
      state === "full" ? "icon-stop-hand" : state === "warning" ? "icon-alert" : "icon-thumb-up";

    return html`
      ${field}
      <div class="counter" data-state=${state} role="status" aria-live="polite">
        <uui-icon name=${icon}></uui-icon>
        ${state === "full"
          ? html`<span>Only ${this._limit} characters allowed!</span>`
          : html`<span>You have ${this.#remaining} characters left</span>`}
      </div>
    `;
  }
}

export default CharLimitPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "charlimit-property-editor": CharLimitPropertyEditorElement;
  }
}
