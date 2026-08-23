import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

import { createAuthFetch } from "./auth-fetch";

interface Row {
  id: number;
  [key: string]: unknown;
}

/**
 * Choose which survey a page shows.
 *
 * The plugin's view component takes a numeric survey id, so putting a survey on a page meant
 * knowing that id and hardcoding it in a template. A content editor could not choose one.
 *
 * The value stored is the numeric id, which is what the view component takes.
 */
@customElement("surveys-picker")
export class SurveysPickerElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; }
    uui-select { width: 100%; max-width: 460px; }
    .hint { margin: 6px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin: 6px 0 0; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
  `;

  // Stored as a number: the schema behind this is Umbraco.Integer, and the view
  // component takes an int. An empty selection is undefined rather than "".
  @property({ type: Number })
  value?: number;

  @property({ type: Boolean })
  readonly = false;

  @state() private _rows: Row[] = [];
  @state() private _loaded = false;
  @state() private _failed = false;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    try {
      const response = await this.#fetch("/umbraco/api/surveys/GetAll");
      if (response.ok) {
        const data = await response.json();
        this._rows = Array.isArray(data) ? data : (data?.items ?? []);
      } else {
        this._failed = true;
      }
    } catch {
      this._failed = true;
    } finally {
      this._loaded = true;
    }
  }

  #labelOf(row: Row): string {
    const label = row.title;
    return typeof label === "string" && label.trim() ? label : `#${row.id}`;
  }

  #onChange(e: Event): void {
    const raw = (e.target as HTMLSelectElement).value;
    const next = raw === "" ? undefined : Number(raw);
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    if (!this._loaded) return html`<uui-loader></uui-loader>`;

    if (this._failed) {
      return html`<div class="warn">The list could not be loaded. See the browser console.</div>`;
    }

    if (this._rows.length === 0) {
      return html`<div class="warn">
        There are no surveys yet. Create one on the Surveys dashboard, then choose it here.
      </div>`;
    }

    return html`
      <uui-select
        label="Survey"
        ?disabled=${this.readonly}
        .value=${this.value === undefined || this.value === null ? "" : String(this.value)}
        @change=${this.#onChange}
        .options=${[
          { name: "— none —", value: "", selected: this.value === undefined || this.value === null },
          ...this._rows.map((row) => ({
            name: this.#labelOf(row),
            value: String(row.id),
            selected: row.id === this.value,
          })),
        ]}
      ></uui-select>
      <p class="hint">Stores the survey's id, which is what the page's view component takes.</p>
      ${nothing}
    `;
  }
}

export default SurveysPickerElement;

declare global {
  interface HTMLElementTagNameMap {
    "surveys-picker": SurveysPickerElement;
  }
}
