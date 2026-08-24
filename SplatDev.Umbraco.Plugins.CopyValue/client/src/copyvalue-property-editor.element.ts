import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";

type PropertyEditorConfig = {
  getValueByAlias: <T = unknown>(alias: string) => T | undefined;
};

type DatasetContext = {
  propertyValueByAlias: (alias: string) => Promise<unknown> | unknown;
};

/**
 * A button on a property that fills it from one or more other properties on the same
 * item.
 *
 * The plugin is named for this and has never shipped it. Its package.manifest carries
 * `"propertyEditors": []` — an empty array — and its umbraco-package.json registers only
 * a dashboard, so on Umbraco 13 and 17 alike there was no editor to choose when creating
 * a data type. What existed was the dashboard for copying values between two content
 * *nodes*, which is a different job: this one copies between properties of the item you
 * are editing, without saving or leaving the page.
 *
 * The value is stored by Umbraco's own textbox schema, so a property using this can be
 * switched to a plain textbox without migrating anything.
 */
@customElement("copyvalue-property-editor")
export class CopyValuePropertyEditorElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    uui-input { flex: 1 1 260px; }
    .hint {
      margin: 6px 0 0;
      font-size: 0.83rem;
      color: var(--uui-color-text-alt, #6b7280);
    }
    .preview {
      margin: 8px 0 0;
      padding: 8px 10px;
      border-radius: 3px;
      background: var(--uui-color-surface-alt, #f6f8fa);
      font-size: 0.86rem;
      word-break: break-word;
    }
    .preview.empty { color: var(--uui-color-text-alt, #6b7280); font-style: italic; }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6);
      padding: 1px 5px;
      border-radius: 3px;
    }
    .warn {
      margin: 8px 0 0;
      padding: 8px 10px;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
      font-size: 0.86rem;
      border-radius: 3px;
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  @state() private _sources: string[] = [];
  @state() private _separator = " ";
  @state() private _buttonLabel = "Copy from";
  @state() private _overwrite = false;
  @state() private _preview = "";
  @state() private _missing: string[] = [];

  #dataset?: DatasetContext;
  readonly #values = new Map<string, unknown>();

  constructor() {
    super();
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (context) => {
      this.#dataset = context as unknown as DatasetContext;
      void this.#refreshPreview();
    });
  }

  @property({ attribute: false })
  set config(config: PropertyEditorConfig | undefined) {
    if (!config) return;

    // "from" is the key the Umbraco 7/8 plugin used for its source list. Reading only
    // "sourceAliases" meant a data type carried over from those versions arrived with no
    // sources at all, and the editor reported "No source properties are set" on a data
    // type that plainly had them. The old "to" key has no equivalent: that plugin copied
    // between two other properties, where this one writes into its own.
    const raw =
      config.getValueByAlias<string>("sourceAliases") ??
      config.getValueByAlias<string>("from") ??
      "";
    this._sources = raw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    this._separator = config.getValueByAlias<string>("separator") ?? " ";
    this._buttonLabel = config.getValueByAlias<string>("buttonLabel") || "Copy from";
    this._overwrite = config.getValueByAlias<boolean>("overwrite") ?? false;

    void this.#refreshPreview();
  }

  /**
   * Watches the source properties so the button can say what it will produce.
   *
   * Showing the result before the click is the point: "copy" with no preview is a
   * button you have to press to find out what it does, and undoing it means
   * remembering what was there before.
   *
   * `propertyValueByAlias` resolves to an *observable* of the value, not to the value.
   * Awaiting it once therefore handed back the observable object, which reduced to no
   * text at all — so every configured source read as empty and the button stayed
   * disabled on a document whose source property was plainly filled in. Subscribing
   * also keeps the preview honest while the other property is being typed into.
   */
  async #refreshPreview(): Promise<void> {
    if (!this.#dataset || this._sources.length === 0) {
      this.#values.clear();
      this.#recompute();
      return;
    }

    for (const alias of this._sources) {
      try {
        const source = await this.#dataset.propertyValueByAlias(alias);
        if (source && typeof (source as { subscribe?: unknown }).subscribe === "function") {
          this.observe(
            source as Parameters<typeof this.observe>[0],
            (value: unknown) => {
              this.#values.set(alias, value);
              this.#recompute();
            },
            `splatdev-copyvalue-${alias}`,
          );
        } else {
          this.#values.set(alias, source);
        }
      } catch {
        this.#values.set(alias, undefined);
      }
    }

    this.#recompute();
  }

  /** Rebuilds the preview from the latest value seen for each source. */
  #recompute(): void {
    const parts: string[] = [];
    const missing: string[] = [];

    for (const alias of this._sources) {
      const text = this.#asText(this.#values.get(alias));
      if (text) parts.push(text);
      else missing.push(alias);
    }

    this._preview = parts.join(this._separator);
    this._missing = missing;
  }

  /** Reduces a property value to text, since a source may be a picker or a number. */
  #asText(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map((v) => this.#asText(v)).filter(Boolean).join(this._separator);
    if (typeof value === "object") {
      const o = value as Record<string, unknown>;
      // Common shapes: a named item, or something carrying its own value.
      for (const key of ["name", "value", "url", "mediaKey"]) {
        if (typeof o[key] === "string") return (o[key] as string).trim();
      }
    }
    return "";
  }

  async #copy(): Promise<void> {
    if (this.readonly) return;
    await this.#refreshPreview();

    if (!this._preview) return;

    // Overwriting is the destructive direction, so it is opt-in per data type and
    // confirmed when it would actually discard something.
    if (this.value && !this._overwrite) {
      const ok = window.confirm(
        `Replace what is already here?\n\nCurrent: ${this.value}\nNew: ${this._preview}`,
      );
      if (!ok) return;
    }

    this.value = this._preview;
    this.dispatchEvent(new UmbChangeEvent());
  }

  #onInput(e: Event): void {
    this.value = (e.target as HTMLInputElement).value;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    const configured = this._sources.length > 0;

    return html`
      <div class="row">
        <uui-input
          label="Value"
          .value=${this.value ?? ""}
          ?readonly=${this.readonly}
          @input=${this.#onInput}
        ></uui-input>
        <uui-button
          look="secondary"
          label=${this._buttonLabel}
          ?disabled=${this.readonly || !configured || !this._preview}
          @click=${this.#copy}
          >${this._buttonLabel}</uui-button
        >
      </div>

      ${!configured
        ? html`<div class="warn">
            No source properties are set. Add them to this data type's
            <code>sourceAliases</code> — a comma-separated list of property aliases on the
            same item — and this button will fill the field from them.
          </div>`
        : html`
            <p class="hint">
              Copies from ${this._sources.map((a, i) => html`${i ? ", " : ""}<code>${a}</code>`)}.
            </p>
            ${this._preview
              ? html`<div class="preview">${this._preview}</div>`
              : html`<div class="preview empty">
                  Nothing to copy yet — ${this._sources.length === 1 ? "that property is" : "those properties are"} empty.
                </div>`}
            ${this._missing.length > 0 && this._preview
              ? html`<p class="hint">
                  Skipped ${this._missing.map((a, i) => html`${i ? ", " : ""}<code>${a}</code>`)} —
                  empty or not on this item.
                </p>`
              : nothing}
          `}
    `;
  }
}

export default CopyValuePropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "copyvalue-property-editor": CopyValuePropertyEditorElement;
  }
}
