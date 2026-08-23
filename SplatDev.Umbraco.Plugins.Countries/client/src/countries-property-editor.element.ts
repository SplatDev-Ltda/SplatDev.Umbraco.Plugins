import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

import { createAuthFetch } from "./auth-fetch";

type PropertyEditorConfig = {
  getValueByAlias: <T = unknown>(alias: string) => T | undefined;
};

interface Country {
  numCode: number;
  alpha2Code: string;
  alpha3Code: string;
  name: string;
  nationality: string;
}

/**
 * Choose a country from the list this plugin ships.
 *
 * The plugin created a countries table and gave nobody a way to use it — no controller,
 * no UI, no data type. Editors typed country names by hand, which is how a site ends up
 * with "USA", "U.S.A." and "United States" in the same field.
 *
 * Which code gets stored is configurable, because it depends on what consumes it: an
 * address form usually wants the two-letter code, a report often wants the name.
 */
@customElement("countries-property-editor")
export class CountriesPropertyEditorElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; }
    uui-select { width: 100%; max-width: 420px; }
    .hint { margin: 6px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin: 6px 0 0; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px;
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  readonly #fetch = createAuthFetch(this);

  @state() private _countries: Country[] = [];
  @state() private _loaded = false;
  @state() private _failed = false;
  @state() private _store: "alpha2" | "alpha3" | "name" | "numeric" = "alpha2";

  @property({ attribute: false })
  set config(config: PropertyEditorConfig | undefined) {
    if (!config) return;
    const store = config.getValueByAlias<string>("storeValue");
    if (store === "alpha3" || store === "name" || store === "numeric" || store === "alpha2") {
      this._store = store;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    try {
      const response = await this.#fetch("/umbraco/api/countries/GetCountries");
      if (response.ok) {
        this._countries = await response.json();
      } else {
        this._failed = true;
      }
    } catch {
      this._failed = true;
    } finally {
      this._loaded = true;
    }
  }

  #valueOf(c: Country): string {
    switch (this._store) {
      case "alpha3": return c.alpha3Code;
      case "name": return c.name;
      case "numeric": return String(c.numCode);
      default: return c.alpha2Code;
    }
  }

  #onChange(e: Event): void {
    const next = (e.target as HTMLSelectElement).value;
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    if (!this._loaded) return html`<uui-loader></uui-loader>`;

    if (this._failed || this._countries.length === 0) {
      return html`
        <div class="warn">
          The country list is empty. It is filled by this plugin's migration on start-up —
          if it stayed empty, check the log for the countries migration.
        </div>
        ${this.value ? html`<p class="hint">Currently holding <code>${this.value}</code>.</p>` : nothing}
      `;
    }

    return html`
      <uui-select
        label="Country"
        ?disabled=${this.readonly}
        .value=${this.value ?? ""}
        @change=${this.#onChange}
        .options=${[
          { name: "— none —", value: "", selected: !this.value },
          ...this._countries.map((c) => ({
            name: c.name,
            value: this.#valueOf(c),
            selected: this.#valueOf(c) === this.value,
          })),
        ]}
      ></uui-select>
      <p class="hint">
        Stores the ${this._store === "name" ? "country name" : this._store === "numeric" ? "numeric code" : `${this._store === "alpha3" ? "three" : "two"}-letter code`}.
      </p>
    `;
  }
}

export default CountriesPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "countries-property-editor": CountriesPropertyEditorElement;
  }
}
